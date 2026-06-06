import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { config } from '../config';
import { Button, Card, Input, Typewriter } from '../components/ui';
import { Icon } from '../components/ui/Icon';
import { ArrowLeft, Send, Trash2, Sparkles, TrendingUp, AlertTriangle, Check, Award, BookOpen, Plus, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  name?: string;
  tool_calls?: any[];
}

type DefaultAvatar = {
  emoji: string;
  accent: string;
};

const DEFAULT_AVATARS: DefaultAvatar[] = [
  { emoji: '🐰', accent: '#f4b16f' },
  { emoji: '🐻', accent: '#d08a42' },
  { emoji: '🐱', accent: '#ec7b95' },
  { emoji: '🐦', accent: '#69a8ff' },
];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const getDefaultAvatar = (seed: string) => {
  const index = hashString(seed) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index];
};

export const AiMentor: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recommendedConfigs, setRecommendedConfigs] = useState<any[]>([]);
  const [aiConfigError, setAIConfigError] = useState<boolean>(false);
  
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. 加载所有儿童基本信息
  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const response = await api.parents.getChildren();
      setChildren(response.data);
      
      // 检查 URL query 里是否有 childId
      const urlChildId = searchParams.get('childId');
      if (urlChildId && response.data.some((c: any) => c.id === urlChildId)) {
        setSelectedChildId(urlChildId);
      } else {
        setSelectedChildId('general');
      }
    } catch (error) {
      console.error('Failed to load children:', error);
    }
  };

  // 2. 当选择的儿童改变时，加载聊天历史与推荐试卷
  useEffect(() => {
    loadHistoryAndConfigs();
    // 同步更新 URL query
    if (selectedChildId && selectedChildId !== 'general') {
      setSearchParams({ childId: selectedChildId });
    } else {
      setSearchParams({});
    }
  }, [selectedChildId]);

  const loadHistoryAndConfigs = async () => {
    setHistoryLoading(true);
    try {
      // 获取聊天历史
      const chatResponse = await api.parents.getAIChatHistory(selectedChildId);
      setMessages(chatResponse.data?.messages || []);
      
      // 获取孩子的推荐配置（仅当选择了具体孩子时）
      if (selectedChildId !== 'general') {
        const configsResponse = await api.parents.getPaperConfigs(selectedChildId);
        // 过滤出带 [AI推荐] 前缀的配置
        const aiConfigs = (configsResponse.data || []).filter((cfg: any) => 
          cfg.configName.includes('[AI推荐]') || cfg.configName.includes('AI推荐')
        );
        setRecommendedConfigs(aiConfigs);
      } else {
        setRecommendedConfigs([]);
      }
    } catch (error: any) {
      console.error('Failed to load history or configs:', error);
      // 检查是否是 AI 未配置的错误
      if (error.response?.status === 503) {
        setAIConfigError(true);
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadRecommendedConfigs = async () => {
    try {
      if (selectedChildId !== 'general') {
        const configsResponse = await api.parents.getPaperConfigs(selectedChildId);
        const aiConfigs = (configsResponse.data || []).filter((cfg: any) => 
          cfg.configName.includes('[AI推荐]') || cfg.configName.includes('AI推荐')
        );
        setRecommendedConfigs(aiConfigs);
      }
    } catch (error) {
      console.error('Failed to load recommended configs:', error);
    }
  };

  // 3. 自动滚动到最新消息
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // 4. 发送消息（流式 SSE 版本）
  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputValue;
    if (!messageText.trim() || loading) return;

    if (!textToSend) {
      setInputValue('');
    }

    // 乐观添加用户消息
    const userMsg: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setStatusText('狸学长正在准备翻开航海日志哩啦...');

    try {
      const url = `${config.API_BASE_URL}/api/parents/ai/chat`;
      const token = localStorage.getItem('parent_token');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ childId: selectedChildId, message: messageText })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // 检查是否是 AI 未配置的错误
        if (response.status === 503) {
          setAIConfigError(true);
          throw new Error(errorData.error?.message || 'AI 导师功能未配置');
        }
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported.');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let assistantReply = '';
      let hasAddedAssistantMessage = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;

          const lines = part.split('\n');
          let event = '';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              event = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataStr = line.slice(5).trim();
            }
          }

          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              
              if (event === 'content' && data.text) {
                assistantReply += data.text;
                setStatusText(''); // 既然已经开始出字了，清空提示状态

                setMessages(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant' && hasAddedAssistantMessage) {
                    last.content = assistantReply;
                  } else {
                    updated.push({
                      role: 'assistant',
                      content: assistantReply,
                      timestamp: new Date().toISOString()
                    });
                    hasAddedAssistantMessage = true;
                  }
                  return updated;
                });
              } else if (event === 'tool_call') {
                const toolName = data.tool;
                if (toolName === 'list_children') {
                  setStatusText('狸学长正在翻看航海日志里的孩子们哩啦...');
                } else if (toolName === 'get_child_diagnostics') {
                  setStatusText('狸学长正在认真诊断宝贝的错题和成长曲线哩啦...');
                } else if (toolName === 'get_recent_practice_sessions') {
                  setStatusText('狸学长正在调阅宝贝最近几天的练习成绩哩啦...');
                } else if (toolName === 'get_current_configs') {
                  setStatusText('狸学长正在查看现在的试卷配置哩啦...');
                } else if (toolName === 'create_suggested_config') {
                  setStatusText('狸学长正在根据宝贝的薄弱点，施展魔法量身定制专属试卷配置哩啦...');
                }
              } else if (event === 'error') {
                throw new Error(data.message || 'Stream error');
              }
            } catch (err) {
              console.error('Failed to parse SSE event data:', err);
            }
          }
        }
      }

      // 对话圆满结束，仅刷新推荐试卷列表（不刷新消息历史，避免重新渲染）
      if (selectedChildId !== 'general') {
        setTimeout(() => {
          loadRecommendedConfigs();
        }, 500);
      }
    } catch (error: any) {
      console.error('Failed to send AI message:', error);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `狸学长脑电波连接失败哩啦：${error.message || '未知错误'}。请检查网络或者确认 API Key 是否已配置哩！`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  // 5. 新建对话（清除当前对话并重新开始）
  const handleNewConversation = async () => {
    if (!confirm('确定要开始一段新的对话吗哩？当前对话将被清除。')) return;
    
    try {
      await api.parents.clearAIChatHistory(selectedChildId);
      setMessages([]);
      setInputValue('');
    } catch (error: any) {
      alert(`新建对话失败：${error.message}`);
    }
  };

  // 5.6 删除 AI 推荐配置
  const handleDeleteConfig = async (configId: string, configName: string) => {
    if (!confirm(`确定要删除狸学长推荐的「${configName}」配置吗哩？此操作不可恢复。`)) return;
    
    try {
      await api.parents.deletePaperConfig(selectedChildId, configId);
      // 重新加载配置列表
      loadHistoryAndConfigs();
    } catch (error: any) {
      alert(`删除失败：${error.message}`);
    }
  };

  // 6. 预设提示句
  const suggestions = selectedChildId === 'general' 
    ? [
        { label: '👋 狸学长，你好哩啦！', text: '你好，狸学长！' },
        { label: '📊 帮我列出所有孩子的信息哩', text: '列出我的孩子们，并帮我分析他们。' }
      ]
    : [
        { label: '📈 诊断宝贝练习表现', text: `帮我深度诊断和分析一下 ${children.find(c => c.id === selectedChildId)?.name || '孩子'} 最近的练习表现哩啦。` },
        { label: '🔍 调阅错题分析', text: `我想看看 ${children.find(c => c.id === selectedChildId)?.name || '孩子'} 最近有哪些高频错题哩？` },
        { label: '🍃 为他定制专属口算强化卷', text: `帮我针对 ${children.find(c => c.id === selectedChildId)?.name || '孩子'} 目前的问题推荐并定制一份最新的试卷配置哩。` }
      ];

  return (
    <div className="min-h-screen animal-home-bg font-sans flex flex-col text-[#725d42] relative">
      {/* 顶部导航 */}
      <nav className="bg-white border-b-4 border-[#e8dfc7] sticky top-0 z-10 px-4 py-3 flex items-center justify-between shadow-[0_4px_10px_rgba(107,92,67,0.12)]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full hover:bg-[#f7f3df] transition-colors border-2 border-transparent active:border-[#c4b89e]"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Icon name="leaf" size={32} className="animate-bounce" />
            <div>
              <h1 className="text-xl font-bold tracking-wide text-[#794f27]">
                狸学长 AI 导师 <span className="text-xs bg-[#19c8b9] text-white px-2 py-0.5 rounded-full ml-1 font-normal">Dr. Tanuki</span>
              </h1>
              <p className="text-xs text-[#9f927d]">温和、聪明且充满爱心的动森探险导师哩啦！</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-1.5 text-xs font-bold text-[#19c8b9] bg-white border-2 border-[#19c8b9] hover:bg-[#19c8b9]/5 px-3 py-1.5 rounded-full shadow-[0_3px_0_0_#11a89b] active:translate-y-[2px] active:shadow-[0_1px_0_0_#11a89b] transition-all"
          >
            <Plus size={13} />
            新建对话
          </button>
        </div>
      </nav>

      {/* 主体内容 */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden h-[calc(100vh-76px)]">
        
        {/* 左侧/上部：导航 & 宝贝选择 */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="bg-white border-4 border-[#e8dfc7] p-5 flex flex-col gap-4">
            <h3 className="font-bold text-lg text-[#794f27] flex items-center gap-1.5 border-b-2 border-[#f0e8d8] pb-2">
              <Icon name="trophy" size={20} />
              探险航海日志
            </h3>
            
            <p className="text-xs text-[#9f927d] leading-relaxed">
              选择需要诊断的宝贝，狸学长将立刻翻阅该宝贝的本地练习日志和错题本，为您提供专业的指导哩啦！
            </p>

            <div className="flex flex-col gap-2.5 mt-2">
              <button
                onClick={() => setSelectedChildId('general')}
                className={`flex items-center gap-3 w-full p-3 rounded-2xl border-3 text-left font-bold transition-all ${
                  selectedChildId === 'general'
                    ? 'bg-[#e6f9f6] border-[#19c8b9] text-[#11a89b] shadow-[0_4px_0_0_#3dd4c6]'
                    : 'bg-[#f8f8f0] border-[#c4b89e] text-[#725d42] hover:bg-[#f0e8d8] shadow-[0_4px_0_0_#d4c9b4]'
                } active:translate-y-[1px]`}
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shadow-inner border border-teal-200">
                  <Icon name="leaf" size={20} />
                </div>
                <div>
                  <div className="text-sm">综合咨询/多娃诊断</div>
                  <span className="text-[10px] text-opacity-80 block font-normal">多角色切换与通用建议</span>
                </div>
              </button>

              {children.map((child) => {
                const isSelected = selectedChildId === child.id;
                const defaultAvatar = getDefaultAvatar(child.id);
                let avatarUrl = child.avatarUrl;
                if (avatarUrl && (avatarUrl.includes('localhost') || avatarUrl.includes('127.0.0.1'))) {
                  const uploadsIndex = avatarUrl.indexOf('/uploads/');
                  if (uploadsIndex !== -1) {
                    avatarUrl = avatarUrl.substring(uploadsIndex);
                  }
                }
                const finalAvatarUrl = avatarUrl 
                  ? (avatarUrl.startsWith('http') ? avatarUrl : `${config.API_BASE_URL}${avatarUrl}`)
                  : null;
                
                return (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`flex items-center gap-3 w-full p-3 rounded-2xl border-3 text-left font-bold transition-all ${
                      isSelected
                        ? 'bg-[#fbf4db] border-[#ffcc00] text-[#794f27] shadow-[0_4px_0_0_#e0b800]'
                        : 'bg-[#f8f8f0] border-[#c4b89e] text-[#725d42] hover:bg-[#f0e8d8] shadow-[0_4px_0_0_#d4c9b4]'
                    } active:translate-y-[1px]`}
                  >
                    <div className="w-10 h-10 rounded-full shadow-inner border border-pink-200 overflow-hidden flex-shrink-0">
                      {finalAvatarUrl ? (
                        <img src={finalAvatarUrl} alt={child.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl" style={{ backgroundColor: `${defaultAvatar.accent}20` }}>
                          {defaultAvatar.emoji}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{child.name}</div>
                      <span className="text-[10px] text-[#9f927d] block font-normal">
                        等级: {child.level} 级 | 积分: {child.points}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* AI 推荐的配置展示卡 */}
          {selectedChildId !== 'general' && (
            <Card className="bg-white border-4 border-[#e8dfc7] p-5 flex flex-col gap-3 flex-1 overflow-y-auto">
              <h3 className="font-bold text-base text-[#794f27] flex items-center gap-1.5 border-b-2 border-[#f0e8d8] pb-1.5">
                <Icon name="sparkle" size={18} />
                狸学长推荐配置
              </h3>
              
              {recommendedConfigs.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#9f927d] flex-1 flex flex-col justify-center items-center gap-2 bg-[#f8f8f0] rounded-xl border border-dashed border-[#c4b89e]">
                  <div className="flex gap-1">
                    <Icon name="leaf" size={24} />
                    <Icon name="critterpedia" size={24} />
                  </div>
                  <span>暂无有效的 [AI推荐] 配置</span>
                  <span className="text-[10px] text-opacity-80 scale-95">对话中同意出题后，即可在这看到哩！</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[220px] lg:max-h-none">
                  {recommendedConfigs.map((cfg) => (
                    <div 
                      key={cfg.id}
                      className="bg-[#e6f9f6] border-2 border-[#19c8b9] p-3 rounded-xl shadow-[0_3px_0_0_#3dd4c6] flex flex-col gap-1.5 relative"
                    >
                      <button
                        onClick={() => handleDeleteConfig(cfg.id, cfg.configName.replace('[AI推荐] ', ''))}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 hover:bg-red-50 text-[#e05a5a] hover:text-red-600 border border-[#19c8b9] flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95"
                        title="删除此配置"
                      >
                        <X size={12} />
                      </button>
                      
                      <div className="flex justify-between items-start gap-1 pr-6">
                        <span className="font-bold text-xs truncate max-w-[130px] text-[#11a89b]">
                          {cfg.configName.replace('[AI推荐] ', '')}
                        </span>
                        <span className="text-[10px] bg-[#19c8b9] text-white px-1.5 py-0.2 rounded font-semibold whitespace-nowrap">
                          {cfg.numberOfFormulas} 题
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-[#725d42] space-y-0.5">
                        <p>🔹 运算步数: {cfg.step} 步</p>
                        <p>🔹 进位/退位: {cfg.carry ? '包含' : '无'} | {cfg.abdication ? '包含' : '无'}</p>
                      </div>

                      <Button
                        type="success"
                        size="small"
                        className="w-full text-xs mt-1.5 py-1"
                        onClick={() => navigate(`/children/${selectedChildId}/paper-config`)}
                      >
                        去审查并激活
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* 右侧：对话主区域 */}
        <div className="lg:col-span-3 flex flex-col bg-white border-4 border-[#e8dfc7] rounded-[30px] shadow-[0_6px_16px_rgba(107,92,67,0.1)] overflow-hidden h-full">
          
          {/* AI 配置错误提示 */}
          {aiConfigError && (
            <div className="bg-[#fff3cd] border-4 border-[#ffc107] p-4 m-4 rounded-2xl">
              <div className="flex items-start gap-3">
                <Icon name="sparkle" size={24} className="text-[#ffc107] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-[#856404] mb-1">AI 导师功能未配置</h4>
                  <p className="text-xs text-[#856404] leading-relaxed">
                    请在环境变量中配置 AI_PROVIDER 和对应的 API_KEY 后使用此功能。参考项目根目录的 .env.example 文件。
                  </p>
                </div>
                <button
                  onClick={() => setAIConfigError(false)}
                  className="text-[#856404] hover:text-[#5a3a00] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
          
          {/* 对话消息区 */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[radial-gradient(#f0e8d8_1px,transparent_1px)] [background-size:16px_16px]">
            {historyLoading ? (
              <div className="flex flex-col justify-center items-center h-full gap-2">
                <Icon name="sparkle" size={32} className="animate-spin" />
                <div className="text-sm font-bold text-[#9f927d]">正在认真阅读航海日志中哩啦...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center p-6 space-y-4">
                <div className="flex gap-2 animate-bounce">
                  <Icon name="leaf" size={48} />
                  <Icon name="sparkle" size={48} />
                </div>
                <h4 className="font-black text-lg text-[#794f27]">狸学长上线哩！</h4>
                <p className="text-xs leading-relaxed text-[#9f927d]">
                  我是「数学探险岛」的岛主AI导师哩！不管你想诊断宝贝的计算准确率、查看历史成长，还是需要狸学长直接施加计算魔法为您量身定制高频错题特训试卷，我都在这里准备好啦哩！
                </p>
                <div className="bg-[#f8f8f0] p-3 rounded-2xl border-2 border-dashed border-[#c4b89e] text-[10px] text-left leading-relaxed">
                  💡 <strong>提示：</strong> 可以试着点击下面的「快速指令」发送给狸学长，我会调用工具查询真实数据库给您详细反馈哩！
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, index) => {
                  const isAI = msg.role === 'assistant';
                  
                  // 跳过 tool 角色或没有任何 content 的消息，保持聊天界面干净
                  if (msg.role === 'tool' || msg.role === 'system' || (!msg.content && msg.tool_calls)) return null;

                  return (
                    <div 
                      key={index}
                      className={`flex gap-3.5 max-w-full ${isAI ? 'justify-start' : 'justify-end'}`}
                    >
                      {/* AI 头像 */}
                      {isAI && (
                        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#fbf4db] border-2 border-[#e8dfc7] flex items-center justify-center shadow-md select-none">
                          <Icon name="leaf" size={24} />
                        </div>
                      )}

                      {/* 消息气泡 */}
                      <div className={`max-w-[80%] flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
                        {/* 气泡名称 & 时间 */}
                        <div className="flex items-center gap-1.5 text-[10px] text-[#9f927d] mb-1 px-1">
                          <span className="font-bold">{isAI ? '狸学长' : '家长'}</span>
                          <span>•</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* 气泡主体 */}
                        <div 
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed border-2.5 font-medium whitespace-pre-wrap break-words shadow-[0_3px_0_0_rgba(107,92,67,0.15)] ${
                            isAI 
                              ? 'bg-[#fdfcf7] text-[#725d42] border-[#e8dfc7] rounded-tl-none' 
                              : 'bg-[#19c8b9] text-white border-[#19c8b9] shadow-[0_3px_0_0_#11a89b] rounded-tr-none'
                          }`}
                        >
                          {isAI ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => <h1 className="text-lg font-bold text-[#725d42] mb-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-bold text-[#725d42] mb-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-bold text-[#725d42] mb-1">{children}</h3>,
                                p: ({ children }) => <p className="mb-2">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-[#725d42]">{children}</li>,
                                code: ({ className, children }) => {
                                  const isInline = !className;
                                  return isInline 
                                    ? <code className="bg-[#e8dfc7] px-1.5 py-0.5 rounded text-xs font-mono text-[#5a4a35]">{children}</code>
                                    : <code className="block bg-[#e8dfc7] p-2 rounded text-xs font-mono text-[#5a4a35] overflow-x-auto">{children}</code>;
                                },
                                strong: ({ children }) => <strong className="font-bold text-[#5a4a35]">{children}</strong>,
                                blockquote: ({ children }) => <blockquote className="border-l-4 border-[#19c8b9] pl-3 italic text-[#725d42] my-2">{children}</blockquote>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          ) : (
                            msg.content
                          )}
                        </div>
                      </div>

                      {/* 用户头像 */}
                      {!isAI && (
                        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#e6f9f6] border-2 border-[#19c8b9] flex items-center justify-center shadow-md select-none">
                          <Icon name="leaf" size={24} />
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* AI 正在思考/加载中的占位气泡 */}
                {loading && statusText && (
                  <div className="flex gap-3.5 justify-start">
                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#fbf4db] border-2 border-[#e8dfc7] flex items-center justify-center shadow-md select-none animate-bounce">
                      <Icon name="leaf" size={24} />
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#9f927d] mb-1 px-1">
                        <span className="font-bold">狸学长</span>
                        <span>•</span>
                        <span>思考中...</span>
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-tl-none text-sm bg-[#fdfcf7] text-[#9f927d] border-2.5 border-[#e8dfc7] border-dashed shadow-[0_3px_0_0_rgba(107,92,67,0.05)]">
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#19c8b9] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#19c8b9]"></span>
                          </span>
                          <span>{statusText}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* 快速指令/建议区域 */}
          <div className="px-4 py-2 border-t border-[#f0e8d8] bg-[#fdfcf7] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none select-none">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(s.text)}
                disabled={loading || historyLoading}
                className="flex items-center gap-1 text-xs font-bold text-[#725d42] bg-[#f7f3df] hover:bg-[#ece8dc] border-2 border-[#c4b89e] shadow-[0_2.5px_0_0_#d4c9b4] active:translate-y-[1px] active:shadow-[0_1px_0_0_#d4c9b4] px-3 py-1.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* 底部输入框区域 */}
          <div className="p-4 bg-white border-t-4 border-[#e8dfc7] flex gap-3.5 items-center">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(s => e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder={loading ? '狸学长正在奋笔疾书哩啦...' : '输入向狸学长咨询的内容，比如“分析我的孩子”哩...'}
              disabled={loading || historyLoading}
              className="flex-1"
            />
            
            <Button
              type="primary"
              disabled={!inputValue.trim() || loading || historyLoading}
              onClick={() => handleSendMessage()}
              className="px-6 flex-shrink-0"
            >
              <Send size={16} className="mr-1.5 inline" />
              发送哩
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
