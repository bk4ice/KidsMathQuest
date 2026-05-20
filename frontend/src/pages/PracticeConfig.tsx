import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

export const PracticeConfig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dailyFrequency, setDailyFrequency] = useState(1);
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadConfig(id);
  }, [id]);

  const loadConfig = async (childId: string) => {
    try {
      const response = await api.parents.getPracticeConfig(childId);
      const config = response.data;
      if (config) {
        setDailyFrequency(config.dailyFrequency || 1);
        setIsEnabled(config.isEnabled !== undefined ? config.isEnabled : true);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.parents.updatePracticeConfig(id!, {
        dailyFrequency,
        isEnabled
      });
      alert('保存成功！');
    } catch (error: any) {
      alert('保存失败：' + error.message);
    } finally {
      setSaving(false);
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

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">练习配置</h1>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">每日练习频率（次）</label>
              <input
                type="number"
                min="1"
                max="10"
                value={dailyFrequency}
                onChange={(e) => setDailyFrequency(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              />
              <p className="text-sm text-gray-500 mt-1">每天最多练习次数（1-10次）</p>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-700">启用每日练习</span>
              </label>
              <p className="text-sm text-gray-500 mt-1">关闭后将不会自动生成每日练习任务</p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
