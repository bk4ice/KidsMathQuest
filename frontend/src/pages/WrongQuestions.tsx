import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronLeft } from 'lucide-react';
import { Button, Card, Typewriter, Table, Icon } from '../components/ui';

export const WrongQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWrongQuestions();
  }, []);

  const loadWrongQuestions = async () => {
    try {
      const response = await api.children.getWrongQuestions();
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Failed to load wrong questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '题目',
      dataIndex: 'question',
      width: 200,
      render: (value: string) => (
        <span 
          className="text-lg font-black text-[#794f27]"
          style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}
        >
          {value}
        </span>
      ),
    },
    {
      title: '你的答案',
      dataIndex: 'userAnswer',
      width: 120,
      render: (value: string) => (
        <span className="text-base font-bold text-[#725d42]">{value}</span>
      ),
    },
    {
      title: '正确答案',
      dataIndex: 'correctAnswer',
      width: 120,
      render: (value: string) => (
        <span className="text-base font-black text-[#6fba2c] bg-[#e6f9f6] px-3 py-1 rounded-lg border border-[#6fba2c]/20">{value}</span>
      ),
    },
    {
      title: '时间',
      dataIndex: 'submittedAt',
      width: 120,
      render: (value: string) => (
        <span className="text-sm text-[#8a7b66]">{value ? new Date(value).toLocaleDateString() : ''}</span>
      ),
    },
  ];

  const tableData = questions.map((attempt) => ({
    key: attempt.id,
    question: attempt.questionInstance?.questionText || '题目加载失败',
    userAnswer: attempt.userAnswer,
    correctAnswer: attempt.questionInstance?.correctAnswer || '未知',
    submittedAt: attempt.submittedAt,
  }));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f0]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#19c8b9] border-t-transparent"></div>
          <p className="font-bold text-[#794f27]">加载错题本中...</p>
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
        {/* 装饰元素 */}
        <div className="kmq-compact-hide-landscape absolute -top-6 -right-10 w-40 h-40 text-[#f5c31c]/10 -rotate-12 pointer-events-none">
           <Icon name="critterpedia" size={160} fill="currentColor" stroke="none" />
        </div>
        
        {/* 主内容卡片 */}
        <Card 
          className="kmq-compact-panel relative !rounded-[50px] !border-[8px] !border-white !p-8 sm:!p-12 shadow-[0_20px_0_0_rgba(107,92,67,0.08)]"
          style={{ backgroundColor: 'rgb(247, 243, 223)' }}
        >
          {/* 顶部标题区 */}
          <div className="text-center mb-10">
            <div className="kmq-compact-hero inline-block relative">
               <h1 
                 className="kmq-compact-title text-5xl sm:text-7xl font-black mb-4 text-[#794f27] tracking-tight"
                 style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}
               >
                 错题本
               </h1>
               <div className="kmq-compact-hide-landscape absolute -top-4 -right-10">
                  <Icon name="sparkle" size={48} className="text-[#f5c31c] animate-pulse fill-current" />
               </div>
            </div>
            <div className="kmq-compact-copy mt-4 text-xl sm:text-2xl font-black text-[#9f927d] bg-white/40 py-2 px-8 rounded-full inline-block border-2 border-white/50">
              <Typewriter speed={80} autoPlay>
                {questions.length === 0 ? '太棒了！还没有错题记录' : '这些题目需要再练习一下哦！'}
              </Typewriter>
            </div>
          </div>

          {/* NPC 鼓励区 - 傅达（Blathers）风格 */}
          {questions.length > 0 && (
            <div className="kmq-compact-npc absolute -top-16 -left-12 w-32 h-32 sm:w-44 sm:h-44 npc-float z-10 pointer-events-none">
              <img 
                src="/Blathers.webp" 
                alt="角色" 
                className="w-full h-full object-contain drop-shadow-2xl transition-transform hover:scale-110"
              />
            </div>
          )}

          {/* 错题列表区 */}
          {questions.length === 0 ? (
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
              <p className="text-2xl font-bold text-[#794f27] mb-4">太棒了！还没有错题记录</p>
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
              emptyText="暂无错题记录"
            />
          )}

          {/* 底部操作区 */}
          {questions.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Button
                type="primary"
                onClick={() => navigate('/child/dashboard')}
                className="kmq-compact-button !rounded-[50px] !px-8 !py-4"
              >
                返回主页
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
