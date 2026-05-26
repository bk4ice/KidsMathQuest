import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronLeft } from 'lucide-react';
import { Button, Card, Typewriter, Table, Modal, Icon } from '../components/ui';

export const ChildHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailSession, setDetailSession] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await api.children.getHistory();
      setHistory(response.data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (sessionId: string) => {
    if (!sessionId) {
      console.error('Invalid session ID:', sessionId);
      return;
    }
    setDetailLoading(true);
    setIsModalOpen(true);
    try {
      const response = await api.children.getHistoryDetail(sessionId);
      setDetailSession(response.data);
    } catch (error) {
      console.error('Failed to load detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailSession(null);
    setIsModalOpen(false);
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '未知';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}分${s}秒` : `${s}秒`;
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      width: 150,
      render: (value: string) => (
        <span 
          className="text-lg font-black text-[#794f27] px-4 py-1 bg-white/50 rounded-full border-2 border-[#f0e8d8] shadow-sm"
          style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}
        >
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: '完成题数',
      dataIndex: 'completedCount',
      width: 120,
      render: (value: number, record: any) => (
        <span className="text-base font-bold text-[#725d42]">{value} / {record.targetCount}</span>
      ),
    },
    {
      title: '用时',
      dataIndex: 'totalTime',
      width: 120,
      render: (value: number) => (
        <span className="text-sm text-[#8a7b66]">{formatTime(value)}</span>
      ),
    },
    {
      title: '正确率',
      dataIndex: 'accuracy',
      width: 100,
      render: (value: number) => (
        <div className="flex items-center gap-1.5">
           <div className={`h-2.5 w-2.5 rounded-full ${value >= 90 ? 'bg-[#6fba2c]' : value >= 70 ? 'bg-[#f5c31c]' : 'bg-[#e05a5a]'}`} />
           <span className="text-base font-black text-[#794f27]">{value?.toFixed(1)}%</span>
        </div>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Button
          type="default"
          size="small"
          className="!rounded-[50px] flex items-center"
          onClick={() => loadDetail(record.id)}
        >
          <Icon name="eye" size={16} className="mr-1" />
          详情
        </Button>
      ),
    },
  ];

  const tableData = history.map((session) => ({
    key: session.id,
    id: session.id,
    date: session.date,
    completedCount: session.completedCount,
    targetCount: session.targetCount,
    totalTime: session.totalTime,
    accuracy: session.accuracy,
  }));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f0]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#19c8b9] border-t-transparent"></div>
          <p className="font-bold text-[#794f27]">加载练习历史中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kmq-responsive-page relative min-h-screen overflow-hidden bg-cover bg-center px-4 py-8" style={{ backgroundImage: 'url(/common-bg.png)' }}>
      <style>{`
        @keyframes npc-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .npc-float {
          animation: npc-float 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* 退出按钮 */}
      <div className="absolute top-4 left-4 z-20 sm:top-8 sm:left-8">
        <Button 
          type="default" 
          size="small" 
          onClick={() => navigate('/child/dashboard')}
          className="!rounded-full !w-12 !h-12 !p-0 !bg-white/80"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="kmq-compact-shell relative w-full max-w-5xl mx-auto pt-16">
        {/* 装饰叶子 */}
        <div className="kmq-compact-hide-landscape absolute -top-4 -right-8 w-32 h-32 text-[#6fba2c]/20 rotate-12 pointer-events-none">
           <Icon name="sparkle" size={128} fill="currentColor" stroke="none" />
        </div>
        
        {/* 主内容卡片 */}
        <Card 
          className="kmq-compact-panel relative !rounded-[50px] !border-[8px] !border-white !p-8 sm:!p-12"
          style={{ backgroundColor: 'rgb(247, 243, 223)', boxShadow: '0 15px 0 0 rgba(107, 92, 67, 0.1)' }}
        >
          {/* 顶部标题区 */}
          <div className="text-center mb-10">
            <div className="kmq-compact-hero inline-block relative">
               <h1 
                 className="kmq-compact-title text-5xl sm:text-7xl font-black mb-4 text-[#794f27] tracking-tight"
                 style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}
               >
                 练习历史
               </h1>
               <div className="absolute -bottom-2 inset-x-0 h-3 bg-[#f5c31c]/30 rounded-full -z-10" />
            </div>
            <div className="kmq-compact-copy mt-4 text-xl sm:text-2xl font-black text-[#9f927d] bg-white/30 py-2 px-6 rounded-full inline-block">
              <Typewriter speed={80} autoPlay>
                {history.length === 0 ? '还没有练习记录，开始第一次练习吧！' : '看看你的进步吧！'}
              </Typewriter>
            </div>
          </div>

          {/* NPC 鼓励区 - 移到右上方 */}
          {history.length > 0 && (
            <div className="kmq-compact-npc absolute -top-16 -left-10 w-32 h-32 sm:w-40 sm:h-40 npc-float z-10 pointer-events-none">
              <div className="relative">
                 <img 
                   src="/ACNH_Isabelle.webp" 
                   alt="角色" 
                   className="w-full h-full object-contain drop-shadow-xl"
                 />
                 <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-md flex items-center justify-center">
                    <Icon name="star" size={24} className="text-[#ffcc00] fill-current" />
                 </div>
              </div>
            </div>
          )}

          {/* 历史列表区 */}
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center gap-2 mb-4">
                {[...Array(3)].map((_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    size={48}
                    className="text-[#f5c31c] fill-current"
                  />
                ))}
              </div>
              <p className="text-2xl font-bold text-[#794f27] mb-4">还没有练习记录</p>
              <Button
                type="primary"
                onClick={() => navigate('/child/dashboard')}
                className="kmq-compact-button !rounded-[50px] !px-8 !py-4"
              >
                返回主页
              </Button>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={tableData}
              striped={true}
              emptyText="暂无练习记录"
            />
          )}

          {/* 底部操作区 */}
          {history.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Button
                type="primary"
                onClick={() => navigate('/child/dashboard')}
                className="!rounded-[50px] !px-8 !py-4"
              >
                返回主页
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* 详情弹窗 */}
      <Modal isOpen={isModalOpen} onClose={closeDetail}>
        <div className="p-6">
          <h2 className="text-2xl font-black mb-6 text-[#794f27]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
            练习详情
          </h2>
          
          {detailLoading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#19c8b9] border-t-transparent mx-auto"></div>
              <p className="mt-4 font-bold text-[#794f27]">加载中...</p>
            </div>
          ) : detailSession ? (
            <div>
              <div className="mb-6 p-4 rounded-[20px]" style={{ backgroundColor: 'rgb(247, 243, 223)', boxShadow: '0 3px 0 0 #d4c9b4' }}>
                <p className="text-sm text-[#8a7b66] mb-2">
                  日期: {new Date(detailSession.date).toLocaleString()}
                </p>
                <p className="text-sm text-[#8a7b66] mb-2">
                  用时: {formatTime(detailSession.totalTime)}
                </p>
                <p className="text-sm text-[#8a7b66] mb-2">
                  正确率: <span className="font-black text-[#6fba2c]">{detailSession.accuracy?.toFixed(1)}%</span>
                </p>
                <p className="text-sm text-[#8a7b66]">
                  获得积分: <span className="font-black text-[#f5c31c]">{detailSession.pointsEarned || 0}</span>
                </p>
              </div>

              <h3 className="font-bold mb-4 text-[#794f27]">答题记录</h3>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {detailSession.questionInstances?.map((q: any, index: number) => {
                  const attempt = q.questionAttempts?.[0];
                  const isCorrect = attempt?.isCorrect;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-[20px] border-2 ${
                        isCorrect === true
                          ? 'border-[#6fba2c]/30 bg-[#6fba2c]/10'
                          : isCorrect === false
                          ? 'border-[#e05a5a]/30 bg-[#e05a5a]/10'
                          : 'border-[#c4b89e]/30 bg-[#f0ece2]'
                      }`}
                      style={{ boxShadow: '0 3px 0 0 ' + (isCorrect === true ? '#5a9e1e' : isCorrect === false ? '#c94444' : '#d4c9b4') }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-black text-lg text-[#794f27] mb-2">
                            {index + 1}. {q.questionText} ?
                          </p>
                          <p className="text-sm text-[#8a7b66]">
                            正确答案: <span className="font-black text-[#6fba2c]">{q.correctAnswer}</span>
                            {attempt && (
                              <span className={isCorrect ? ' text-[#6fba2c]' : ' text-[#e05a5a]'}>
                                {' '}你的答案: <span className="font-bold">{attempt.userAnswer}</span>
                              </span>
                            )}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold ${
                            isCorrect === true
                              ? 'bg-[#6fba2c] text-white'
                              : isCorrect === false
                              ? 'bg-[#e05a5a] text-white'
                              : 'bg-[#c4b89e] text-white'
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
          ) : null}
        </div>
      </Modal>
    </div>
  );
};
