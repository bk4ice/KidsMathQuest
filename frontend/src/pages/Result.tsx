import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronLeft } from 'lucide-react';
import { Button, Card, Typewriter, Icon } from '../components/ui';

export const Result: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    loadResult();
  }, [sessionId]);

  const loadResult = async () => {
    if (!sessionId) return;
    try {
      const response = await api.children.getHistoryDetail(sessionId);
      const data = response.data;
      setResult(data);
      
      // 计算星星数量（根据正确率）
      const accuracy = data.accuracy || 0;
      if (accuracy >= 90) setStars(5);
      else if (accuracy >= 80) setStars(4);
      else if (accuracy >= 70) setStars(3);
      else if (accuracy >= 60) setStars(2);
      else setStars(1);
    } catch (error) {
      console.error('Failed to load result:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  const getEncouragementText = () => {
    if (!result) return '';
    const accuracy = result.accuracy || 0;
    if (accuracy >= 90) return '太棒了！你简直是数学小天才！';
    if (accuracy >= 80) return '做得很好！继续保持！';
    if (accuracy >= 70) return '不错哦！再接再厉！';
    if (accuracy >= 60) return '继续加油，你做得很好！';
    return '努力就会有进步，加油！';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f0]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#19c8b9] border-t-transparent"></div>
          <p className="font-bold text-[#794f27]">加载结果中...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f0]">
        <Card className="text-center p-12">
          <h2 className="text-2xl font-bold mb-4">哎呀，结果加载失败</h2>
          <Button onClick={() => navigate('/child/dashboard')}>返回主页</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="kmq-responsive-page relative min-h-screen overflow-hidden bg-cover bg-center flex items-center justify-center px-4" style={{ backgroundImage: 'url(/result-bg.jpg)' }}>
      <style>{`
        @keyframes star-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes npc-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes result-zoom-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .star-float {
          animation: star-float 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .star-float-delayed {
          animation: star-float 3s cubic-bezier(0.4, 0, 0.2, 1) 0.3s infinite;
        }
        .star-float-delayed-2 {
          animation: star-float 3s cubic-bezier(0.4, 0, 0.2, 1) 0.6s infinite;
        }
        .npc-float {
          animation: npc-float 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .result-zoom-in {
          animation: result-zoom-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
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

      <div className="kmq-compact-shell relative w-full max-w-3xl">
        {/* 主结果卡片 */}
        <Card 
          className="kmq-compact-panel relative !rounded-[60px] !border-[10px] !border-white !p-10 sm:!p-16 result-zoom-in"
          style={{ backgroundColor: 'rgb(247, 243, 223)', boxShadow: '0 20px 0 0 rgba(107, 92, 67, 0.15)' }}
        >
          {/* 顶部标题区 */}
          <div className="text-center mb-10">
            <div className="kmq-compact-hero inline-block relative">
               <h1 
                 className="kmq-compact-title text-6xl sm:text-8xl font-black mb-6 text-[#794f27] tracking-tighter"
                 style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}
               >
                 完成啦！
               </h1>
               <div className="kmq-compact-hide-landscape absolute -top-6 -right-12">
                  <Icon name="sparkle" size={64} className="text-[#f5c31c] animate-pulse fill-current" />
               </div>
            </div>
            <div className="kmq-compact-copy text-2xl sm:text-3xl font-black text-[#8a7b66] bg-white/40 py-3 px-8 rounded-full inline-block">
              <Typewriter speed={80} autoPlay>
                {getEncouragementText()}
              </Typewriter>
            </div>
          </div>

          {/* 星星评分区 - 增大并增加立体感 */}
          <div className="kmq-compact-grid flex justify-center gap-6 mb-12">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="relative">
                <Icon
                  name="star"
                  size={96}
                  className={`transition-all duration-500 ${
                    i < stars 
                      ? 'text-[#ffcc00] fill-current drop-shadow-[0_6px_0_#e0b800] star-float' 
                      : 'text-[#d4c9b4] opacity-20'
                  } ${i === 1 ? 'star-float-delayed' : ''} ${i === 2 ? 'star-float-delayed-2' : ''}`}
                />
                {i < stars && (
                   <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150 -z-10" />
                )}
              </div>
            ))}
          </div>

          {/* 数据统计区 - 颜色升级 */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {[
              { label: '用时', value: formatTime(result.totalTime || 0), color: '#889df0', shadow: '#4a5a9a', name: 'history' },
              { label: '正确率', value: `${(result.accuracy || 0).toFixed(1)}%`, color: '#8ac68a', shadow: '#5a9e1e', name: 'target' },
              { label: '完成情况', value: `${result.correctCount || 0} / ${result.questionInstances?.length || 0}`, color: '#f7cd67', shadow: '#dfa000', name: 'critterpedia' }
            ].map((stat, idx) => (
              <Card 
                key={idx}
                className="!border-4 !border-white !p-6 text-center !rounded-[30px] flex flex-col items-center gap-2"
                style={{ backgroundColor: stat.color, boxShadow: `0 8px 0 0 ${stat.shadow}` }}
              >
                <div className="bg-white/20 w-12 h-12 flex items-center justify-center rounded-2xl shadow-inner">
                  <Icon name={stat.name as any} size={32} className="text-white fill-current" />
                </div>
                <div className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  {stat.value}
                </div>
                <div className="text-sm font-black text-white/80 uppercase tracking-widest">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* 底部操作区 */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              type="primary"
              onClick={() => navigate('/child/dashboard')}
              className="kmq-compact-button !rounded-[50px] !px-12 !py-6 !text-2xl !bg-[#ffcc00] !text-[#794f27] !border-[#ffcc00] !shadow-[0_8px_0_0_#e0b800]"
            >
              返回主页
            </Button>
            <Button
              type="default"
              onClick={() => navigate('/child/wrong-questions')}
              className="kmq-compact-button !rounded-[50px] !px-10 !py-6 !text-2xl !bg-[#f0e8d8] !text-[#794f27] !border-white !shadow-[0_8px_0_0_#d4c9b4] flex items-center"
            >
              <Icon name="critterpedia" size={24} className="mr-3" />
              查看错题本
            </Button>
          </div>

          {/* NPC 鼓励区 - 移到左下角并增大 */}
          <div className="kmq-compact-npc absolute -bottom-14 -left-14 w-48 h-48 sm:w-64 sm:h-64 npc-float z-10 pointer-events-none">
            <img 
              src="/Mamekichi_Tsubukichi.png" 
              alt="角色" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          
          <div className="kmq-compact-hide-landscape absolute -top-10 -right-10 w-32 h-32 opacity-20">
             <Icon name="star" size={128} className="text-[#ffcc00] rotate-12 fill-current" />
          </div>
        </Card>
      </div>
    </div>
  );
};
