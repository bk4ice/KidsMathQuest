import { config } from '../config';

const API_BASE_URL = `${config.API_BASE_URL}/api`;

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // 根据 endpoint 决定使用哪个 token
    const isChildEndpoint = 
      endpoint.startsWith('/children/') || 
      endpoint.startsWith('/auth/child-login') || 
      endpoint.startsWith('/auth/child-options');
    
    const token = isChildEndpoint 
      ? localStorage.getItem('child_token') 
      : localStorage.getItem('parent_token');

    const finalToken = token;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (finalToken) {
      headers['Authorization'] = `Bearer ${finalToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        data = null;
      }
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = null;
      }
    }

    if (!response.ok) {
      throw new Error(data?.error?.message || data?.message || `Request failed with status ${response.status}`);
    }

    return data;
  },

  auth: {
    register: (username: string, password: string, email?: string) =>
      api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, email }),
      }),
    
    login: (username: string, password: string) =>
      api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    
    childLogin: (childId: string, password: string) =>
      api.request('/auth/child-login', {
        method: 'POST',
        body: JSON.stringify({ childId, password }),
      }),

    getChildLoginOptions: () =>
      api.request('/auth/child-options'),
  },

  parents: {
    getChildren: () =>
      api.request('/parents/children'),
    
    addChild: (data: any) =>
      api.request('/parents/children', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    updateChild: (id: string, data: any) =>
      api.request(`/parents/children/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    deleteChild: (id: string) =>
      api.request(`/parents/children/${id}`, {
        method: 'DELETE',
      }),
    
    getChildStats: (id: string) =>
      api.request(`/parents/children/${id}/stats`),
    
    getPaperConfigs: (id: string) =>
      api.request(`/parents/children/${id}/paper-configs`),
    
    addPaperConfig: (id: string, data: any) =>
      api.request(`/parents/children/${id}/paper-configs`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    updatePaperConfig: (id: string, configId: string, data: any) =>
      api.request(`/parents/children/${id}/paper-configs/${configId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    deletePaperConfig: (id: string, configId: string) =>
      api.request(`/parents/children/${id}/paper-configs/${configId}`, {
        method: 'DELETE',
      }),
    
    setActivePaperConfig: (id: string, configId: string) =>
      api.request(`/parents/children/${id}/paper-configs/${configId}/set-active`, {
        method: 'POST',
      }),

    resetPaperConfig: (id: string) =>
      api.request(`/parents/children/${id}/paper-configs/reset`, {
        method: 'POST',
      }),

    generatePaper: (id: string, data: any) =>
      api.request(`/parents/children/${id}/generate-paper`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getPaperRecords: (id: string) =>
      api.request(`/parents/children/${id}/papers`),

    getPaperRecordById: (id: string, paperId: string) =>
      api.request(`/parents/children/${id}/papers/${paperId}`),

    deletePaperRecord: (id: string, paperId: string) =>
      api.request(`/parents/children/${id}/papers/${paperId}`, {
        method: 'DELETE',
      }),

    getPracticeConfig: (id: string) =>
      api.request(`/parents/children/${id}/practice-config`),

    updatePracticeConfig: (id: string, data: any) =>
      api.request(`/parents/children/${id}/practice-config`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getPracticeSessionDetail: (childId: string, sessionId: string) =>
      api.request(`/parents/children/${childId}/practice-sessions/${sessionId}`),

    getAIChatHistory: (childId: string) =>
      api.request(`/parents/ai/chat/${childId}/history`),

    sendAIChatMessage: (childId: string, message: string) =>
      api.request('/parents/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ childId, message }),
      }),

    clearAIChatHistory: (childId: string) =>
      api.request(`/parents/ai/chat/${childId}`, {
        method: 'DELETE',
      }),
  },

  children: {
    getTodayPractice: () =>
      api.request('/children/today-practice'),
    
    startPractice: (sessionId: string) =>
      api.request(`/children/practice/${sessionId}/start`, {
        method: 'POST',
      }),
    
    submitAnswer: (sessionId: string, questionInstanceId: string, userAnswer: string, timeSpent?: number) =>
      api.request(`/children/practice/${sessionId}/question/${questionInstanceId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ userAnswer, timeSpent }),
      }),
    
    completePractice: (sessionId: string) =>
      api.request(`/children/practice/${sessionId}/complete`, {
        method: 'POST',
      }),
    
    getWrongQuestions: () =>
      api.request('/children/wrong-questions'),
    
    getBadges: () =>
      api.request('/children/badges'),
    
    getHistory: () =>
      api.request('/children/history'),
    
    getHistoryDetail: (sessionId: string) =>
      api.request(`/children/history/${sessionId}`),
    
    getProfile: () =>
      api.request('/children/profile'),
  },
};
