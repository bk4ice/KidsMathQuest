import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

export const PaperRecords: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadRecords(id);
  }, [id]);

  const loadRecords = async (childId: string) => {
    try {
      const response = await api.parents.getPaperRecords(childId);
      setRecords(response.data);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleDelete = async (paperId: string) => {
    if (!confirm('确定要删除这份试卷记录吗？此操作不可恢复。')) {
      return;
    }
    try {
      await api.parents.deletePaperRecord(id!, paperId);
      await loadRecords(id!);
    } catch (error: any) {
      alert('删除失败：' + error.message);
    }
  };

  const handleExport = (paperId: string) => {
    navigate(`/children/${id}/papers/${paperId}/print`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={() => navigate(`/dashboard`)} className="text-blue-500 hover:text-blue-700">
            ← 返回
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">每日试卷</h1>

        {records.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">还没有生成试卷</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => {
              const config = JSON.parse(record.configSnapshot);
              const questions = JSON.parse(record.questions);
              return (
                <div key={record.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">{config.paperTitle}</h3>
                      <p className="text-gray-500">
                        日期: {formatDate(record.generatedAt)} | 题目数: {questions.flat().length}
                      </p>
                      <p className="text-sm text-gray-400">
                        步数: {config.step} | 
                        类型: {
                          record.status === 'printed' ? '打印生成' : 
                          record.status === 'practiced' ? '练习快照' : 
                          record.status === 'completed' ? '已完成' : '进行中'
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport(record.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        导出
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        删除
                      </button>
                    </div>
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
