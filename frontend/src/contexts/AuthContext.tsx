import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { config } from '../config';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  childLogin: (childId: string, password: string) => Promise<void>;
  logout: (isChild: boolean) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const KEYS = {
  PARENT_TOKEN: 'parent_token',
  PARENT_USER: 'parent_user',
  CHILD_TOKEN: 'child_token',
  CHILD_USER: 'child_user',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [parentToken, setParentToken] = useState<string | null>(localStorage.getItem(KEYS.PARENT_TOKEN));
  const [parentUser, setParentUser] = useState<any>(() => {
    const stored = localStorage.getItem(KEYS.PARENT_USER);
    return stored ? JSON.parse(stored) : null;
  });

  const [childToken, setChildToken] = useState<string | null>(localStorage.getItem(KEYS.CHILD_TOKEN));
  const [childUser, setChildUser] = useState<any>(() => {
    const stored = localStorage.getItem(KEYS.CHILD_USER);
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(false);

  // 根据当前路径决定使用哪个身份
  const { user, token } = useMemo(() => {
    const pathname = location.pathname;
    const isChildRoute = pathname.startsWith('/child/') || pathname.startsWith('/practice/') || pathname === '/child-login';
    if (isChildRoute && childToken) {
      return { user: childUser, token: childToken };
    }
    return { user: parentUser, token: parentToken };
  }, [location.pathname, parentToken, parentUser, childToken, childUser]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed');
      }

      const userData = { parentId: data.data.parentId, type: 'parent' };
      setParentToken(data.data.token);
      setParentUser(userData);
      localStorage.setItem(KEYS.PARENT_TOKEN, data.data.token);
      localStorage.setItem(KEYS.PARENT_USER, JSON.stringify(userData));
    } finally {
      setLoading(false);
    }
  };

  const childLogin = async (childId: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/auth/child-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed');
      }

      const userData = { 
        childId: data.data.childId, 
        name: data.data.name, 
        points: data.data.points, 
        level: data.data.level,
        type: 'child'
      };
      setChildToken(data.data.token);
      setChildUser(userData);
      localStorage.setItem(KEYS.CHILD_TOKEN, data.data.token);
      localStorage.setItem(KEYS.CHILD_USER, JSON.stringify(userData));
    } finally {
      setLoading(false);
    }
  };

  const logout = (isChild: boolean) => {
    if (isChild) {
      setChildToken(null);
      setChildUser(null);
      localStorage.removeItem(KEYS.CHILD_TOKEN);
      localStorage.removeItem(KEYS.CHILD_USER);
    } else {
      setParentToken(null);
      setParentUser(null);
      localStorage.removeItem(KEYS.PARENT_TOKEN);
      localStorage.removeItem(KEYS.PARENT_USER);
    }
    
    // 清除旧 key 以确保完全隔离
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        childLogin,
        logout,
        isAuthenticated: !!token,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
