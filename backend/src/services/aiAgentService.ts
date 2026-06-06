import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import prisma from '../config/database';
import { AI_CONFIG, LLMProviderConfig } from '../config/aiConfig';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
  timestamp: string;
  tool_calls?: any[];
}

export interface ChatHistory {
  childId: string;
  lastInteractionAt: string;
  messages: ChatMessage[];
}

export class AIAgentService {
  private openai: OpenAI | null = null;
  private currentProvider: string;
  private currentModel: string = '';
  private extraBody: Record<string, any> = {};

  constructor() {
    this.currentProvider = AI_CONFIG.llm.provider;
    
    // 使用 switch 语句安全地获取 provider 配置
    let providerConfig: LLMProviderConfig;
    switch (this.currentProvider) {
      case 'vllm':
        providerConfig = AI_CONFIG.llm.vllm;
        break;
      case 'openai':
        providerConfig = AI_CONFIG.llm.openai;
        break;
      case 'anthropic':
        providerConfig = AI_CONFIG.llm.anthropic;
        break;
      case 'aliyun':
        providerConfig = AI_CONFIG.llm.aliyun;
        break;
      default:
        console.warn(`Unknown provider: ${this.currentProvider}. AIAgentService will run in mock mode.`);
        return;
    }
    
    if (!providerConfig || !providerConfig.api_key) {
      console.warn(`LLM API Key is not set for provider "${this.currentProvider}". AIAgentService will run in mock mode or fail when making requests.`);
      return;
    }

    // 初始化 OpenAI 客户端（支持自定义 base_url）
    const openaiConfig: any = {
      apiKey: providerConfig.api_key
    };
    
    if (providerConfig.base_url) {
      openaiConfig.baseURL = providerConfig.base_url;
    }

    this.openai = new OpenAI(openaiConfig);
    this.currentModel = providerConfig.model;
    
    // 如果是 aliyun 提供商，设置 extra_body 参数（禁用思考模式）
    if (this.currentProvider === 'aliyun' && providerConfig.extra_body) {
      this.extraBody = providerConfig.extra_body;
      console.log('[AI Agent] Aliyun provider detected, extra_body config:', this.extraBody);
    }
    
    console.log(`[AI Agent] Initialized with provider: ${this.currentProvider}, model: ${this.currentModel}`);
  }

  /**
   * 初始化本地存储目录
   */
  private ensureStorageDir() {
    if (!fs.existsSync(AI_CONFIG.chatStorageDir)) {
      fs.mkdirSync(AI_CONFIG.chatStorageDir, { recursive: true });
    }
  }

  /**
   * 获取本地聊天记录文件路径
   */
  private getFilePath(childId: string): string {
    return path.join(AI_CONFIG.chatStorageDir, `chat_${childId}.json`);
  }

  /**
   * 加载聊天记录，并自动修剪过期和超限的数据
   */
  public loadChatHistory(childId: string): ChatHistory {
    this.ensureStorageDir();
    const filePath = this.getFilePath(childId);

    let history: ChatHistory = {
      childId,
      lastInteractionAt: new Date().toISOString(),
      messages: []
    };

    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        history = JSON.parse(fileContent);
      } catch (error) {
        console.error(`Failed to load chat history for child ${childId}:`, error);
      }
    }

    // 运行清理算法
    history.messages = this.pruneMessages(history.messages);
    return history;
  }

  /**
   * 保存聊天记录，在保存前进行修剪
   */
  public saveChatHistory(childId: string, history: ChatHistory) {
    this.ensureStorageDir();
    const filePath = this.getFilePath(childId);

    history.lastInteractionAt = new Date().toISOString();
    history.messages = this.pruneMessages(history.messages);

    try {
      fs.writeFileSync(filePath, JSON.stringify(history, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to save chat history for child ${childId}:`, error);
    }
  }

  /**
   * 清除指定孩子的聊天历史
   */
  public clearChatHistory(childId: string) {
    const filePath = this.getFilePath(childId);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Failed to delete chat history file for child ${childId}:`, error);
      }
    }
  }

  /**
   * 清理算法：修剪过期消息和超限消息对
   */
  private pruneMessages(messages: ChatMessage[]): ChatMessage[] {
    if (messages.length === 0) return [];

    const now = Date.now();
    const retentionMs = AI_CONFIG.retentionDays * 24 * 3600 * 1000;

    // 1. 过滤过期消息（早于 N 天前的消息）
    let pruned = messages.filter((msg) => {
      const msgTime = new Date(msg.timestamp).getTime();
      return now - msgTime <= retentionMs;
    });

    // 2. 统计并修剪轮数（user + assistant 对话轮数不超过 maxChatRounds）
    // 找出所有 user 消息的索引
    const userIndices: number[] = [];
    pruned.forEach((msg, idx) => {
      if (msg.role === 'user') {
        userIndices.push(idx);
      }
    });

    if (userIndices.length > AI_CONFIG.maxChatRounds) {
      // 找到需要保留的第一个 user 消息的位置
      const keepStartIndex = userIndices[userIndices.length - AI_CONFIG.maxChatRounds];
      // 只保留 keepStartIndex 及其之后的所有消息
      pruned = pruned.slice(keepStartIndex);
    }

    return pruned;
  }

  /**
   * 运行多轮 Agent 对话，包含 Tool 自动识别与调用逻辑
   */
  public async chat(
    parentId: string,
    childId: string | null,
    userMessageContent: string
  ): Promise<string> {
    if (!this.openai) {
      console.log('[AI Agent] OpenAI API Key not configured. Running in Mock Mode for end-to-end flow validation...');
      return await this.chatMock(parentId, childId, userMessageContent);
    }

    // 1. 加载或初始化当前儿童的对话历史（如果未指定 childId，可使用临时上下文或专门的虚拟 ID）
    const targetChildId = childId || 'general_parent_chat';
    const history = this.loadChatHistory(targetChildId);

    // 2. 将家长的最新输入加入历史
    history.messages.push({
      role: 'user',
      content: userMessageContent,
      timestamp: new Date().toISOString()
    });

    // 3. 构建 OpenAI 调用上下文，包括 System Prompt
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: this.getSystemPrompt(),
      timestamp: new Date().toISOString()
    };

    // 我们只需要给 OpenAI 传递 role, content, name, tool_call_id, tool_calls 等 API 接受的字段
    const formatForAPI = (msg: ChatMessage) => {
      const apiMsg: any = {
        role: msg.role,
        content: msg.content || ''
      };
      if (msg.name) apiMsg.name = msg.name;
      if (msg.tool_call_id) apiMsg.tool_call_id = msg.tool_call_id;
      if (msg.tool_calls) apiMsg.tool_calls = msg.tool_calls;
      return apiMsg;
    };

    const apiMessages = [
      formatForAPI(systemPrompt),
      ...history.messages.map(formatForAPI)
    ];

    // 4. 定义可用的 Tool 工具箱定义
    const tools = this.getToolsDefinition();

    try {
      let runLoop = true;
      let assistantResponseText = '';
      let loopCount = 0;

      // 防止死循环，最大允许 Tool 链式调用 8 次
      while (runLoop && loopCount < 8) {
        loopCount++;
        console.log(`[AI Agent Loop] Sending request to OpenAI, messages count: ${apiMessages.length}`);
        
        const response = await this.openai.chat.completions.create({
          model: this.currentModel,
          messages: apiMessages,
          tools: tools,
          tool_choice: 'auto',
          temperature: 0.4,
          ...this.extraBody
        });

        const choice = response.choices[0];
        const message = choice.message;

        // 如果 OpenAI 返回了普通文本内容，记录之
        if (message.content) {
          assistantResponseText = message.content;
        }

        // 保存本次助手消息进入上下文（可能包含 tool_calls）
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: message.content || '',
          timestamp: new Date().toISOString()
        };
        if (message.tool_calls) {
          aiMsg.tool_calls = message.tool_calls;
        }

        // 将助理回复推入历史队列
        history.messages.push(aiMsg);
        apiMessages.push(formatForAPI(aiMsg));

        // 检查是否有 Tool Call 需要执行
        if (message.tool_calls && message.tool_calls.length > 0) {
          console.log(`[AI Agent Loop] OpenAI requested ${message.tool_calls.length} tool call(s)`);
          
          for (const toolCall of message.tool_calls) {
            const name = (toolCall as any).function.name;
            const args = JSON.parse((toolCall as any).function.arguments);
            
            console.log(`[AI Agent Tool] Executing tool: ${name} with args:`, args);
            
            let resultString = '';
            try {
              const result = await this.executeTool(name, args, parentId, targetChildId);
              resultString = JSON.stringify(result);
            } catch (err: any) {
              console.error(`[AI Agent Tool Error] Failed to execute tool ${name}:`, err);
              resultString = JSON.stringify({ error: err.message || 'Tool execution failed' });
            }

            // 将 Tool 执行结果写入上下文，以让 OpenAI 继续分析
            const toolResponseMsg: ChatMessage = {
              role: 'tool',
              name,
              tool_call_id: toolCall.id,
              content: resultString,
              timestamp: new Date().toISOString()
            };

            history.messages.push(toolResponseMsg);
            apiMessages.push(formatForAPI(toolResponseMsg));
          }
        } else {
          // 没有 Tool Call 了，说明对话输出完成
          runLoop = false;
        }
      }

      // 5. 保存更新后的历史记录
      this.saveChatHistory(targetChildId, history);

      return assistantResponseText;
    } catch (error: any) {
      console.error('[AI Agent Error] Error in agent chat logic:', error);
      throw error;
    }
  }

  /**
   * 运行多轮 Agent 流式对话
   */
  public async chatStream(
    parentId: string,
    childId: string | null,
    userMessageContent: string,
    onChunk: (chunk: { type: 'content' | 'tool_call' | 'tool_result' | 'done', text?: string, tool?: string, result?: any }) => void
  ): Promise<string> {
    if (!this.openai) {
      console.log('[AI Agent] OpenAI API Key not configured. Running in Mock Stream Mode...');
      return await this.chatStreamMock(parentId, childId, userMessageContent, onChunk);
    }

    const targetChildId = childId || 'general_parent_chat';
    const history = this.loadChatHistory(targetChildId);

    history.messages.push({
      role: 'user',
      content: userMessageContent,
      timestamp: new Date().toISOString()
    });

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: this.getSystemPrompt(),
      timestamp: new Date().toISOString()
    };

    const formatForAPI = (msg: ChatMessage) => {
      const apiMsg: any = {
        role: msg.role,
        content: msg.content || ''
      };
      if (msg.name) apiMsg.name = msg.name;
      if (msg.tool_call_id) apiMsg.tool_call_id = msg.tool_call_id;
      if (msg.tool_calls) apiMsg.tool_calls = msg.tool_calls;
      return apiMsg;
    };

    const apiMessages = [
      formatForAPI(systemPrompt),
      ...history.messages.map(formatForAPI)
    ];

    const tools = this.getToolsDefinition();

    try {
      let runLoop = true;
      let assistantResponseText = '';
      let loopCount = 0;

      while (runLoop && loopCount < 8) {
        loopCount++;
        console.log(`[AI Agent Stream Loop] Sending request to OpenAI, messages count: ${apiMessages.length}`);
        
        const stream = await this.openai.chat.completions.create({
          model: this.currentModel,
          messages: apiMessages,
          tools: tools,
          tool_choice: 'auto',
          temperature: 0.4,
          stream: true,
          ...this.extraBody
        }) as any;

        let chunkToolCalls: any[] = [];
        let currentAssistantContent = '';

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta;
          if (!delta) continue;

          if (delta.content) {
            currentAssistantContent += delta.content;
            assistantResponseText += delta.content;
            onChunk({ type: 'content', text: delta.content });
          }

          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              const index = tc.index;
              if (!chunkToolCalls[index]) {
                chunkToolCalls[index] = {
                  id: tc.id || '',
                  type: tc.type || 'function',
                  function: {
                    name: tc.function?.name || '',
                    arguments: tc.function?.arguments || ''
                  }
                };
              } else {
                if (tc.id) chunkToolCalls[index].id = tc.id;
                if (tc.type) chunkToolCalls[index].type = tc.type;
                if (tc.function?.name) chunkToolCalls[index].function.name += tc.function.name;
                if (tc.function?.arguments) chunkToolCalls[index].function.arguments += tc.function.arguments;
              }
            }
          }
        }

        const validToolCalls = chunkToolCalls.filter(tc => tc && tc.function && tc.function.name);

        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: currentAssistantContent,
          timestamp: new Date().toISOString()
        };
        if (validToolCalls.length > 0) {
          aiMsg.tool_calls = validToolCalls;
        }

        history.messages.push(aiMsg);
        apiMessages.push(formatForAPI(aiMsg));

        if (validToolCalls.length > 0) {
          console.log(`[AI Agent Stream Loop] Executing ${validToolCalls.length} tool calls...`);
          
          for (const toolCall of validToolCalls) {
            const name = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            
            onChunk({ type: 'tool_call', tool: name, result: args });
            
            let resultString = '';
            try {
              const result = await this.executeTool(name, args, parentId, targetChildId);
              resultString = JSON.stringify(result);
            } catch (err: any) {
              console.error(`[AI Agent Stream Tool Error] Failed to execute tool ${name}:`, err);
              resultString = JSON.stringify({ error: err.message || 'Tool execution failed' });
            }

            onChunk({ type: 'tool_result', tool: name, result: JSON.parse(resultString) });

            const toolResponseMsg: ChatMessage = {
              role: 'tool',
              name,
              tool_call_id: toolCall.id,
              content: resultString,
              timestamp: new Date().toISOString()
            };

            history.messages.push(toolResponseMsg);
            apiMessages.push(formatForAPI(toolResponseMsg));
          }
        } else {
          runLoop = false;
        }
      }

      this.saveChatHistory(targetChildId, history);
      onChunk({ type: 'done' });
      return assistantResponseText;
    } catch (error: any) {
      console.error('[AI Agent Stream Error] Error in stream chat logic:', error);
      throw error;
    }
  }

  /**
   * Mock 模式下的多轮 Agent 对话，模拟 OpenAI 执行与本地工具调用，用于无 API Key 的测试验证
   */
  private async chatMock(
    parentId: string,
    childId: string | null,
    userMessageContent: string
  ): Promise<string> {
    const targetChildId = childId || 'general_parent_chat';
    const history = this.loadChatHistory(targetChildId);

    // 记录用户消息
    history.messages.push({
      role: 'user',
      content: userMessageContent,
      timestamp: new Date().toISOString()
    });

    let assistantResponseText = '';

    // 匹配多轮对话场景
    if (userMessageContent.includes('你好') || userMessageContent.includes('分析我的孩子')) {
      // 模拟调用 list_children
      const children = await this.executeTool('list_children', {}, parentId, targetChildId);
      console.log('[AI Agent Mock] list_children returned:', children);

      assistantResponseText = `你好哩！我是数学探险岛的「岛主AI导师」- 狸学长（Dr. Tanuki）哩啦！我看到您名下关联了宝贝哩（如 ${children[0]?.name || '乐乐'}）。要不要狸学长帮您调阅并分析一下他最近的航海练习表现哩？`;
    } else if (userMessageContent.includes('分析乐乐') || userMessageContent.includes('分析')) {
      // 模拟调用 get_child_diagnostics 和 get_recent_practice_sessions
      const diagnostics = await this.executeTool('get_child_diagnostics', { childId: targetChildId }, parentId, targetChildId);
      const sessions = await this.executeTool('get_recent_practice_sessions', { childId: targetChildId, limit: 3 }, parentId, targetChildId);
      
      console.log('[AI Agent Mock] get_child_diagnostics returned:', diagnostics);
      console.log('[AI Agent Mock] get_recent_practice_sessions returned:', sessions);

      const level = diagnostics.stats.level;
      const points = diagnostics.stats.points;
      const totalSessions = diagnostics.stats.totalSessions;
      const accuracy = diagnostics.stats.averageAccuracy || 80;
      const wrongCount = diagnostics.wrongQuestions.length;

      assistantResponseText = `收到哩！狸学长已经成功调阅并分析了宝贝的航海日志啦。宝贝当前等级为 ${level} 级，总积分为 ${points}。近期一共完成了 ${totalSessions} 次练习，平均正确率为 ${accuracy}%。
      
在错题本中，宝贝积累了 ${wrongCount} 种高频错题。我特别发现宝贝在「两位数退位减法」上经常忘记向十位借位（例如，遇到 32-17 容易错答成 25 哩）。
      
狸学长建议为他量身定制一个专门的『退位减法强化特训』练习试卷，包含 20 道专门设计有退位借位的题目，进行重点突破。要不要狸学长现在直接在后台为您新建这个专属配置哩啦？`;
    } else if (userMessageContent.includes('生成') || userMessageContent.includes('新建') || userMessageContent.includes('好的') || userMessageContent.includes('确认') || userMessageContent.includes('同意')) {
      // 模拟调用 create_suggested_config 自动为数据库创建 PaperConfig
      const mockConfigData = {
        step: 1,
        formulaList: JSON.stringify([{ sign: '-', min: 11, max: 99 }]),
        resultMinValue: 0,
        resultMaxValue: 100,
        numberOfFormulas: 20,
        enableBrackets: false,
        carry: 1,
        abdication: 1,
        remainder: 1,
        numberMode: 'integer'
      };

      const result = await this.executeTool('create_suggested_config', {
        childId: targetChildId,
        suggestedTitle: '退位减法强化特训',
        config: mockConfigData
      }, parentId, targetChildId);

      console.log('[AI Agent Mock] create_suggested_config returned:', result);

      assistantResponseText = `好哩！狸学长已经调用了魔法工具，成功为宝贝在后台新建了专属试卷配置「[AI推荐] 退位减法强化特训」哩啦！
      
为了保证宝贝当前学习进度的稳定性，该推荐配置目前是「未激活且非默认」状态哩。您可以随时登录家长端，进入试卷配置列表进行审查。确认无误后点击「激活」或者直接「生成试卷」打印成 A4 纸张给孩子练习哩啦！乐乐加油哩！`;
    } else {
      assistantResponseText = `收到哩！只要跟狸学长说『帮我分析乐乐』或者『确认生成配置』，我就会帮您处理哩啦！`;
    }

    // 记录助手消息
    history.messages.push({
      role: 'assistant',
      content: assistantResponseText,
      timestamp: new Date().toISOString()
    });

    // 保存聊天历史
    this.saveChatHistory(targetChildId, history);

    return assistantResponseText;
  }

  /**
   * Mock 模式下的流式对话输出，模拟等间隔输出字符
   */
  private async chatStreamMock(
    parentId: string,
    childId: string | null,
    userMessageContent: string,
    onChunk: (chunk: { type: 'content' | 'tool_call' | 'tool_result' | 'done', text?: string, tool?: string, result?: any }) => void
  ): Promise<string> {
    const targetChildId = childId || 'general_parent_chat';
    const history = this.loadChatHistory(targetChildId);

    history.messages.push({
      role: 'user',
      content: userMessageContent,
      timestamp: new Date().toISOString()
    });

    let assistantResponseText = '';

    // 1. 模拟延迟并识别指令
    if (userMessageContent.includes('你好') || userMessageContent.includes('分析我的孩子')) {
      onChunk({ type: 'tool_call', tool: 'list_children', result: {} });
      await new Promise(resolve => setTimeout(resolve, 600));
      const children = await this.executeTool('list_children', {}, parentId, targetChildId);
      onChunk({ type: 'tool_result', tool: 'list_children', result: children });
      await new Promise(resolve => setTimeout(resolve, 400));

      assistantResponseText = `你好哩！我是数学探险岛的「岛主AI导师」- 狸学长（Dr. Tanuki）哩啦！我看到您名下关联了宝贝哩（如 ${children[0]?.name || '乐乐'}）。要不要狸学长帮您调阅并分析一下他最近的航海练习表现哩？`;
    } else if (userMessageContent.includes('分析乐乐') || userMessageContent.includes('分析')) {
      onChunk({ type: 'tool_call', tool: 'get_child_diagnostics', result: { childId: targetChildId } });
      await new Promise(resolve => setTimeout(resolve, 500));
      const diagnostics = await this.executeTool('get_child_diagnostics', { childId: targetChildId }, parentId, targetChildId);
      onChunk({ type: 'tool_result', tool: 'get_child_diagnostics', result: diagnostics });
      await new Promise(resolve => setTimeout(resolve, 300));

      onChunk({ type: 'tool_call', tool: 'get_recent_practice_sessions', result: { childId: targetChildId, limit: 3 } });
      await new Promise(resolve => setTimeout(resolve, 500));
      const sessions = await this.executeTool('get_recent_practice_sessions', { childId: targetChildId, limit: 3 }, parentId, targetChildId);
      onChunk({ type: 'tool_result', tool: 'get_recent_practice_sessions', result: sessions });
      await new Promise(resolve => setTimeout(resolve, 300));

      const level = diagnostics.stats.level;
      const points = diagnostics.stats.points;
      const totalSessions = diagnostics.stats.totalSessions;
      const accuracy = diagnostics.stats.averageAccuracy || 80;
      const wrongCount = diagnostics.wrongQuestions.length;

      assistantResponseText = `收到哩！狸学长已经成功调阅并分析了宝贝的航海日志啦。宝贝当前等级为 ${level} 级，总积分为 ${points}。近期一共完成了 ${totalSessions} 次练习，平均正确率为 ${accuracy}%。
      
在错题本中，宝贝积累了 ${wrongCount} 种高频错题。我特别发现宝贝在「两位数退位减法」上经常忘记向十位借位（例如，遇到 32-17 容易错答成 25 哩）。
      
狸学长建议为他量身定制一个专门的『退位减法强化特训』练习试卷，包含 20 道专门设计有退位借位的题目，进行重点突破。要不要狸学长现在直接在后台为您新建这个专属配置哩啦？`;
    } else if (userMessageContent.includes('生成') || userMessageContent.includes('新建') || userMessageContent.includes('好的') || userMessageContent.includes('确认') || userMessageContent.includes('同意')) {
      const mockConfigData = {
        step: 1,
        formulaList: JSON.stringify([{ sign: '-', min: 11, max: 99 }]),
        resultMinValue: 0,
        resultMaxValue: 100,
        numberOfFormulas: 20,
        enableBrackets: false,
        carry: 1,
        abdication: 1,
        remainder: 1,
        numberMode: 'integer'
      };

      onChunk({ type: 'tool_call', tool: 'create_suggested_config', result: { childId: targetChildId, suggestedTitle: '退位减法强化特训', config: mockConfigData } });
      await new Promise(resolve => setTimeout(resolve, 800));
      const result = await this.executeTool('create_suggested_config', {
        childId: targetChildId,
        suggestedTitle: '退位减法强化特训',
        config: mockConfigData
      }, parentId, targetChildId);
      onChunk({ type: 'tool_result', tool: 'create_suggested_config', result });
      await new Promise(resolve => setTimeout(resolve, 400));

      assistantResponseText = `好哩！狸学长已经调用了魔法工具，成功为宝贝在后台新建了专属试卷配置「[AI推荐] 退位减法强化特训」哩啦！
      
为了保证宝贝当前学习进度的稳定性，该推荐配置目前是「未激活且非默认」状态哩。您可以随时登录家长端，进入试卷配置列表进行审查。确认无误后点击「激活」或者直接「生成试卷」打印成 A4 纸张给孩子练习哩啦！乐乐加油哩！`;
    } else {
      assistantResponseText = `收到哩！只要跟狸学长说『帮我分析乐乐』或者『确认生成配置』，我就会帮您处理哩啦！`;
    }

    const chunkSize = 2;
    for (let i = 0; i < assistantResponseText.length; i += chunkSize) {
      const charChunk = assistantResponseText.slice(i, i + chunkSize);
      onChunk({ type: 'content', text: charChunk });
      await new Promise(resolve => setTimeout(resolve, 25));
    }

    history.messages.push({
      role: 'assistant',
      content: assistantResponseText,
      timestamp: new Date().toISOString()
    });
    this.saveChatHistory(targetChildId, history);

    onChunk({ type: 'done' });
    return assistantResponseText;
  }

  /**
   * System Prompt 设计
   */
  private getSystemPrompt(): string {
    return `你是由「KidsMathQuest」数学探险岛派出的「岛主AI导师」- 狸学长（Dr. Tanuki）。你是一位顶级的儿童数学认知科学家，拥有极高的亲和力和数据敏感度。你说话带着微微的岛屿口调（温暖、风趣，常用“哩”、“哩啦”等修饰语，但不过度，保持专业性）。

# 核心职责
你的任务是与家长友好互动，通过调取孩子的学习数据来提供：
1. **答题质量诊断**：分析孩子的速度、准确率，诊断薄弱知识点（如加减法进退位混淆、小数精度对齐等问题）。
2. **辅导建议**：针对弱项提供实用的线下辅导小游戏或训练建议。
3. **定制试卷推荐**：为孩子专属推荐全新的练习试卷配置。

# 极其重要的出题原则
1. **安全第一，永不覆盖**：当你需要推荐试卷配置时，在得到家长的口头或打字确认同意后（例如“好的”、“一键应用”、“帮我新建吧”等），你必须调用 \`create_suggested_config\` 工具。这个工具会**安全地在后台新建**一个配置，名字以 \`[AI推荐]\` 开头，并且默认为**未激活**。你必须告知家长“已经为您创建好哩，您可以随时到配置页面审查并选择启用它哩啦！”。绝不能直接更改或覆盖孩子当前原有的默认或活动配置。
2. **参数精度约束**：生成 \`PaperConfig\` 的 parameters 时，需要确保：
   - 如果是加减法，需要控制 range 以免出现负数。
   - 如果是除法，需要设置 \`remainder\` (1 表示整除，允许除尽；对于整除练习，保证商也是整数)，避免分母为0。
   - 对于小数模式，需要设置 \`numberMode\` 为 "decimal" 并指定 \`decimalPlaces\`（1到3）。

# 交互指南
- 当家长说话模糊（例如：“帮我分析下孩子”），而你的账户下拥有多个孩子时，先调用 \`list_children\` 获取儿童列表，再向家长确认需要分析哪一个哩。
- 确认目标儿童后，调用 \`get_child_diagnostics\` 和 \`get_recent_practice_sessions\` 进行综合评估。
- 分析完数据后，结合乐乐或悠悠（孩子真实姓名）的现状，扮演温暖的狸学长，先提供诊断，再提供出题方案，并询问家长是否要为你直接创建这个特训配置哩。
- 得到确认答复后，调用 \`create_suggested_config\` 生成配置，并在回复中温柔地告知成功。`;
  }

  /**
   * OpenAI Tool Definitions
   */
  private getToolsDefinition(): any[] {
    return [
      {
        type: 'function',
        function: {
          name: 'list_children',
          description: '列出当前家长账户下的所有儿童基本信息（包括儿童ID、姓名、年级、当前等级与积分）',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_child_diagnostics',
          description: '获取指定儿童的历史练习统计概要和错题本中近期高频错误的题目算式、错答、正解及出现次数',
          parameters: {
            type: 'object',
            properties: {
              childId: {
                type: 'string',
                description: '儿童的唯一标识 ID'
              }
            },
            required: ['childId']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_recent_practice_sessions',
          description: '获取指定儿童最近几场练习的明细流水（正确率、用时、正确题数、总题数），以便分析状态起伏',
          parameters: {
            type: 'object',
            properties: {
              childId: {
                type: 'string',
                description: '儿童的唯一标识 ID'
              },
              limit: {
                type: 'number',
                description: '查询最近几条记录，默认 5 条'
              }
            },
            required: ['childId']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_current_configs',
          description: '获取指定儿童当前已有的试卷配置列表，了解目前的练习配置级别，避免推荐重复配置',
          parameters: {
            type: 'object',
            properties: {
              childId: {
                type: 'string',
                description: '儿童的唯一标识 ID'
              }
            },
            required: ['childId']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_suggested_config',
          description: '在家长同意后，安全地为孩子在后台新建一份专属的试卷配置记录（带 [AI推荐] 前缀，默认不覆盖也不激活，由家长后续自主激活）',
          parameters: {
            type: 'object',
            properties: {
              childId: {
                type: 'string',
                description: '儿童的唯一标识 ID'
              },
              suggestedTitle: {
                type: 'string',
                description: '推荐的试卷专属标题，例如 "退位减法强化训练"'
              },
              config: {
                type: 'object',
                description: '推荐的试卷详细配置。必须包含：step (1,2或3), formulaList (JSON string), resultMinValue, resultMaxValue, numberOfFormulas, carry (0或1), abdication (0或1), remainder (0或1), numberMode ("integer"或"decimal"), decimalPlaces (若为小数可选 1,2,3)',
                properties: {
                  step: { type: 'number', description: '步数（1：一步运算，2：两步，3：三步）' },
                  formulaList: { type: 'string', description: '公式类型与数值范围定义列表的 JSON 字符串（例如："[{\\"sign\\":\\"+\\",\\"min\\":1,\\"max\\":99}]"）' },
                  resultMinValue: { type: 'number', description: '结果最小值范围约束' },
                  resultMaxValue: { type: 'number', description: '结果最大值范围约束' },
                  numberOfFormulas: { type: 'number', description: '生成的题目数量，推荐 10-30 道' },
                  enableBrackets: { type: 'boolean', description: '是否启用括号（仅两步/三步运算有效，默认 false）' },
                  carry: { type: 'number', description: '进位规则，0：不进位，1：随机进位' },
                  abdication: { type: 'number', description: '退位规则，0：不退位，1：随机退位' },
                  remainder: { type: 'number', description: '余数规则，0：有余数，1：结果整除' },
                  numberMode: { type: 'string', description: '运算模式："integer" (整数) 或 "decimal" (小数)' },
                  decimalPlaces: { type: 'number', description: '当为小数模式时的小数位数（可选 1, 2, 3）' }
                },
                required: ['step', 'formulaList', 'resultMinValue', 'resultMaxValue', 'numberOfFormulas', 'carry', 'abdication', 'remainder', 'numberMode']
              }
            },
            required: ['childId', 'suggestedTitle', 'config']
          }
        }
      }
    ];
  }

  /**
   * 拦截并执行 OpenAI 发起的 Tool 请求，配合 Prisma 读写
   */
  private async executeTool(
    name: string,
    args: any,
    parentId: string,
    chatChildId: string
  ): Promise<any> {
    switch (name) {
      case 'list_children': {
        const children = await prisma.child.findMany({
          where: { parentId },
          select: { id: true, name: true, grade: true, points: true, level: true }
        });
        return children;
      }

      case 'get_child_diagnostics': {
        const childId = args.childId;
        // 权限校验
        const child = await prisma.child.findFirst({ where: { id: childId, parentId } });
        if (!child) throw new Error('Child not found or unauthorized');

        // 1. 获取概要统计
        const statsSummary = await prisma.practiceSession.aggregate({
          where: { childId, status: 'completed' },
          _count: { id: true },
          _avg: { accuracy: true, totalTime: true }
        });

        // 2. 错题获取逻辑 (仿照 childService.ts 中的机制)
        const attempts = await prisma.questionAttempt.findMany({
          where: { isCorrect: false },
          include: {
            questionInstance: {
              include: { practiceSession: true }
            }
          },
          orderBy: { submittedAt: 'desc' }
        });

        // 过滤属于该孩子的错题
        const childWrongAttempts = attempts.filter(
          (a: any) => a.questionInstance.practiceSession.childId === childId
        );

        // 聚合相同错题出现的次数，并且记录最近的错误作答
        const wrongQuestionsMap: Record<string, { formula: string, correctAnswer: string, wrongAnswers: Set<string>, count: number }> = {};
        for (const attempt of childWrongAttempts) {
          const formula = attempt.questionInstance.questionText;
          const correctAnswer = attempt.questionInstance.correctAnswer;
          const userAnswer = attempt.userAnswer;

          if (!wrongQuestionsMap[formula]) {
            wrongQuestionsMap[formula] = {
              formula,
              correctAnswer,
              wrongAnswers: new Set([userAnswer]),
              count: 1
            };
          } else {
            wrongQuestionsMap[formula].count += 1;
            wrongQuestionsMap[formula].wrongAnswers.add(userAnswer);
          }
        }

        const wrongQuestions = Object.values(wrongQuestionsMap)
          .map((item) => ({
            formula: item.formula,
            correctAnswer: item.correctAnswer,
            wrongAnswer: Array.from(item.wrongAnswers)[0], // 取其中一个代表错答
            count: item.count
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10); // 取前 10 个最频错题

        return {
          stats: {
            totalSessions: statsSummary._count.id || 0,
            averageAccuracy: statsSummary._avg.accuracy ? parseFloat(statsSummary._avg.accuracy.toFixed(1)) : null,
            averageSecondsPerQuestion: statsSummary._avg.totalTime ? parseFloat(statsSummary._avg.totalTime.toFixed(1)) : null,
            level: child.level,
            points: child.points,
            streakDays: child.streakDays
          },
          wrongQuestions
        };
      }

      case 'get_recent_practice_sessions': {
        const childId = args.childId;
        const limit = args.limit || 5;

        // 权限校验
        const child = await prisma.child.findFirst({ where: { id: childId, parentId } });
        if (!child) throw new Error('Child not found or unauthorized');

        const sessions = await prisma.practiceSession.findMany({
          where: { childId, status: 'completed' },
          orderBy: { date: 'desc' },
          take: limit,
          select: {
            date: true,
            accuracy: true,
            totalTime: true,
            correctCount: true,
            targetCount: true
          }
        });

        return sessions;
      }

      case 'get_current_configs': {
        const childId = args.childId;
        // 权限校验
        const child = await prisma.child.findFirst({
          where: { id: childId, parentId },
          include: { practiceConfigs: true }
        });
        if (!child) throw new Error('Child not found or unauthorized');

        const practiceConfig = child.practiceConfigs[0];
        if (!practiceConfig) return [];

        const configs = await prisma.paperConfig.findMany({
          where: { practiceConfigId: practiceConfig.id },
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            configName: true,
            step: true,
            numberOfFormulas: true,
            isDefault: true,
            isActive: true,
            numberMode: true,
            decimalPlaces: true
          }
        });

        return configs;
      }

      case 'create_suggested_config': {
        const childId = args.childId;
        const suggestedTitle = args.suggestedTitle;
        const configData = args.config;

        // 权限校验并加载 PracticeConfig
        const child = await prisma.child.findFirst({
          where: { id: childId, parentId },
          include: { practiceConfigs: true }
        });
        if (!child) throw new Error('Child not found or unauthorized');

        let practiceConfig = child.practiceConfigs[0];
        if (!practiceConfig) {
          practiceConfig = await prisma.practiceConfig.create({
            data: { childId }
          });
        }

        // 保证在创建配置时，强制采用 [AI推荐] 前缀，并且一律为非活动和非默认，等待家长启用
        const createdConfig = await prisma.paperConfig.create({
          data: {
            practiceConfigId: practiceConfig.id,
            configName: `[AI推荐] ${suggestedTitle}`,
            step: configData.step,
            formulaList: configData.formulaList,
            resultMinValue: configData.resultMinValue,
            resultMaxValue: configData.resultMaxValue,
            numberOfFormulas: configData.numberOfFormulas,
            enableBrackets: configData.enableBrackets || false,
            carry: configData.carry,
            abdication: configData.abdication,
            remainder: configData.remainder,
            numberMode: configData.numberMode,
            decimalPlaces: configData.decimalPlaces || null,
            isDefault: false,
            isActive: false
          }
        });

        return {
          status: 'success',
          configId: createdConfig.id,
          message: `已成功在系统后台为您生成全新试卷配置「[AI推荐] ${suggestedTitle}」哩啦！家长可以随时到配置页面查看并确认激活。`
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
