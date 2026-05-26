import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

export const ChildStats: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailSession, setDetailSession] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (id) loadStats(id);
  }, [id]);

  const loadStats = async (childId: string) => {
    try {
      const response = await api.parents.getChildStats(childId);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (sessionId: string) => {
    if (!id) return;
    setDetailLoading(true);
    try {
      const response = await api.parents.getPracticeSessionDetail(id, sessionId);
      setDetailSession(response.data);
    } catch (error) {
      console.error('Failed to load detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailSession(null);
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '未知';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}分${s}秒` : `${s}秒`;
  };

  const getAccuracyColor = (accuracy?: number) => {
    if (!accuracy) return 'text-gray-500';
    if (accuracy >= 90) return 'text-green-500';
    if (accuracy >= 80) return 'text-blue-500';
    if (accuracy >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getAccuracyBgColor = (accuracy?: number) => {
    if (!accuracy) return 'bg-gray-100';
    if (accuracy >= 90) return 'bg-green-100 text-green-700';
    if (accuracy >= 80) return 'bg-blue-100 text-blue-700';
    if (accuracy >= 60) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  if (!stats) {
    return <div className="flex justify-center items-center h-screen">没有数据</div>;
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
        <h1 className="text-2xl font-bold mb-6">学习统计</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 mb-2">总练习次数</p>
            <p className="text-3xl font-bold text-blue-500">{stats.totalSessions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 mb-2">总题目数</p>
            <p className="text-3xl font-bold text-purple-500">{stats.totalQuestions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 mb-2">正确数</p>
            <p className="text-3xl font-bold text-green-500">{stats.totalCorrect}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 mb-2">平均正确率</p>
            <p className={`text-3xl font-bold ${getAccuracyColor(stats.avgAccuracy)}`}>{stats.avgAccuracy.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">最近练习记录</h2>
          {stats.recentSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无练习记录</p>
          ) : (
            <div className="space-y-4">
              {stats.recentSessions.map((session: any) => (
                <div
                  key={session.id}
                  className="border-b pb-4 last:border-0 cursor-pointer hover:bg-gray-50 transition p-2 rounded"
                  onClick={() => loadDetail(session.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{new Date(session.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">
                        {session.completedCount}/{session.targetCount} 题 | 用时: {formatTime(session.totalTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getAccuracyColor(session.accuracy)}`}>{session.accuracy?.toFixed(1)}%</p>
                      <p className="text-sm text-gray-500">正确率</p>
                      <p className="text-xs text-blue-500 mt-1">查看详情</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 详情弹窗 */}
      {detailSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">答题记录详情</h2>
              <button onClick={closeDetail} className="text-gray-500 hover:text-gray-700 text-2xl">
                ×
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-center">加载中...</div>
            ) : (
              <div className="p-4">
                <div className="mb-4 bg-gray-50 rounded p-4">
                  <p className="text-sm text-gray-600">
                    日期: {new Date(detailSession.date).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    用时: {formatTime(detailSession.totalTime)}
                  </p>
                  <p className="text-sm text-gray-600">
                    正确率: <span className={`font-bold ${getAccuracyColor(detailSession.accuracy)}`}>{detailSession.accuracy?.toFixed(1)}%</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    获得积分: {detailSession.pointsEarned || 0}
                  </p>
                </div>

                <h3 className="font-bold mb-3">答题情况</h3>
                <div className="space-y-2">
                  {detailSession.questionInstances?.map((q: any, index: number) => {
                    const attempt = q.questionAttempts?.[0];
                    const isCorrect = attempt?.isCorrect;
                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded border ${
                          isCorrect === true
                            ? 'bg-green-50 border-green-200'
                            : isCorrect === false
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {index + 1}. {q.questionText} ?
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              正确答案: {q.correctAnswer}
                              {attempt && (
                                <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                  {' '}孩子答案: {attempt.userAnswer}
                                </span>
                              )}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              isCorrect === true
                                ? 'bg-green-100 text-green-700'
                                : isCorrect === false
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {isCorrect === true ? '正确' : isCorrect === false ? '错误' : '未作答'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
