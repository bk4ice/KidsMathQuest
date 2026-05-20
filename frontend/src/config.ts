const API_BASE_URL = (import.meta.env as any).VITE_API_BASE_URL || 'http://localhost:5000';

export const config = {
  API_BASE_URL,
};
