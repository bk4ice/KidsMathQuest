// API_BASE_URL 配置优先级：
// 1. 环境变量 VITE_API_BASE_URL（最高优先级）
// 2. 生产环境默认使用空字符串（通过相对路径配合 nginx 代理）
// 3. 开发环境默认使用 http://localhost:5000
const API_BASE_URL = (import.meta.env as any).VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:5000');

export const config = {
  API_BASE_URL,
};
