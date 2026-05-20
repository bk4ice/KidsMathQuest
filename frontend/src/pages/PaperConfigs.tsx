import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

export const PaperConfigs: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadConfigs(id);
  }, [id]);

  const loadConfigs = async (childId: string) => {
    try {
      const response = await api.parents.getPaperConfigs(childId);
      setConfigs(response.data);
    } catch (error) {
      console.error('Failed to load configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (configId: string) => {
    if (!id) return;
    try {
      await api.parents.setActivePaperConfig(id, configId);
      loadConfigs(id);
    } catch (error) {
      console.error('Failed to set active config:', error);
    }
  };

  const handleDelete = async (configId: string) => {
    if (!id) return;
    if (!confirm('确定要删除这个配置吗？')) return;
    try {
      await api.parents.deletePaperConfig(id, configId);
      loadConfigs(id);
    } catch (error) {
      console.error('Failed to delete config:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={() => navigate('/dashboard')} className="text-blue-500 hover:text-blue-700">
            ← 返回
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">试卷配置</h1>
          <button
            onClick={() => navigate(`/children/${id}/configs/new`)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            添加配置
          </button>
        </div>

        {configs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">还没有配置，点击上方按钮添加</p>
          </div>
        ) : (
          <div className="space-y-4">
            {configs.map((config) => (
              <div key={config.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">{config.configName}</h3>
                    <p className="text-gray-500">
                      步数: {config.step} | 题目数: {config.numberOfFormulas}
                    </p>
                    <p className="text-sm text-gray-400">
                      结果范围: {config.resultMinValue} - {config.resultMaxValue}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {config.isActive && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        活跃
                      </span>
                    )}
                    <button
                      onClick={() => handleSetActive(config.id)}
                      disabled={config.isActive}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {config.isActive ? '已激活' : '激活'}
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
