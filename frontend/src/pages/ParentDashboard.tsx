import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { config } from '../config';

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

export const ParentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const response = await api.parents.getChildren();
      setChildren(response.data);
    } catch (error) {
      console.error('Failed to load children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(false);
    window.location.href = '/login';
  };

  const handleDeleteChild = async (childId: string) => {
    if (!confirm('确定要删除这个孩子吗？此操作不可恢复。')) {
      return;
    }

    try {
      await api.parents.deleteChild(childId);
      await loadChildren();
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">KidsMathQuest - 家长管理</h1>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
            退出登录
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">我的孩子</h2>
          <button
            onClick={() => navigate('/children/new')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            添加孩子
          </button>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">还没有添加孩子，点击上方按钮添加</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => {
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
                <div key={child.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    {finalAvatarUrl ? (
                      <img src={finalAvatarUrl} alt={child.name} className="w-16 h-16 rounded-full mr-4 object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mr-4" style={{ backgroundColor: `${defaultAvatar.accent}20` }}>
                        {defaultAvatar.emoji}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{child.name}</h3>
                      <p className="text-gray-500">年级: {child.grade}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-500">积分</p>
                      <p className="text-xl font-bold text-blue-500">{child.points}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">等级</p>
                      <p className="text-xl font-bold text-purple-500">{child.level}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/children/${child.id}/stats`)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
                    >
                      查看成绩
                    </button>
                    <button
                      onClick={() => navigate(`/children/${child.id}/practice-config`)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
                    >
                      练习配置
                    </button>
                    <button
                      onClick={() => navigate(`/children/${child.id}/paper-config`)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
                    >
                      试卷配置
                    </button>
                    <button
                      onClick={() => navigate(`/children/${child.id}/papers`)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
                    >
                      历史试卷
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => navigate(`/children/${child.id}/edit`)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteChild(child.id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                    >
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
