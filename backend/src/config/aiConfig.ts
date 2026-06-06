import path from 'path';

export interface LLMProviderConfig {
  base_url?: string;
  api_key: string;
  model: string;
  extra_body?: Record<string, any>;
}

interface LLMConfig {
  provider: 'vllm' | 'openai' | 'anthropic' | 'aliyun';
  vllm: LLMProviderConfig;
  openai: LLMProviderConfig;
  anthropic: LLMProviderConfig;
  aliyun: LLMProviderConfig;
}

export const AI_CONFIG = {
  // 对话保存期限（天），默认 14 天
  retentionDays: parseInt(process.env.AI_CHAT_RETENTION_DAYS || "14", 10),
  // 最大保留的消息轮数（防止单个文件过大导致上下文和 Token 消耗超限）
  maxChatRounds: parseInt(process.env.AI_CHAT_MAX_ROUNDS || "20", 10),
  // 本地存储绝对路径
  chatStorageDir: path.resolve(__dirname, '../../data/ai_chats'),
  
  // LLM 提供商配置
  llm: {
    provider: (process.env.AI_PROVIDER || 'openai') as 'vllm' | 'openai' | 'anthropic' | 'aliyun',
    vllm: {
      base_url: process.env.AI_VLLM_BASE_URL || '',
      api_key: process.env.AI_VLLM_API_KEY || '',
      model: process.env.AI_VLLM_MODEL || ''
    },
    openai: {
      base_url: process.env.AI_OPENAI_BASE_URL || 'https://api.openai.com/v1',
      api_key: process.env.OPENAI_API_KEY || '',
      model: process.env.AI_OPENAI_MODEL || 'gpt-4o-mini'
    },
    anthropic: {
      base_url: process.env.AI_ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
      api_key: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.AI_ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'
    },
    aliyun: {
      base_url: process.env.AI_ALIYUN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      api_key: process.env.AI_ALIYUN_API_KEY || '',
      model: process.env.AI_ALIYUN_MODEL || 'qwen3.6-plus',
      extra_body: {
        enable_thinking: false // Qwen3.x 默认开启思考模式，需要显式关闭
      }
    }
  } as LLMConfig
};

// 检查 AI 功能是否可用
export const isAIEnabled = (): boolean => {
  const provider = AI_CONFIG.llm.provider;
  const config = AI_CONFIG.llm[provider];
  
  // 检查是否配置了 API Key
  if (!config.api_key || config.api_key === '' || config.api_key.startsWith('your_')) {
    return false;
  }
  
  // vLLM 还需要检查 base_url
  if (provider === 'vllm' && (!config.base_url || config.base_url === '' || config.base_url.startsWith('your_'))) {
    return false;
  }
  
  return true;
};

