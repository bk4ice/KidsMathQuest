import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ChevronRight
} from 'lucide-react';
import { 
  Button, 
  Card, 
  Time, 
  Typewriter, 
  Footer,
  Icon
} from '../components/ui';
import { Cursor } from 'animal-island-ui';

export const ChildDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [todayPractice, setTodayPractice] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [practiceResponse, profileResponse] = await Promise.all([
        api.children.getTodayPractice(),
        api.children.getProfile(),
      ]);
      
      const session = practiceResponse.data;
      if (session && session.id && session.id !== 'done') {
        setTodayPractice(session);
      } else if (session && session.status === 'daily_limit_reached') {
        setTodayPractice(session);
      } else {
        setTodayPractice(null);
      }
      
      setProfile(profileResponse.data);
      
      if (profileResponse.data) {
        const updatedUser = {
          ...user,
          points: profileResponse.data.points,
          level: profileResponse.data.level,
          streakDays: profileResponse.data.streakDays,
          type: user?.type || 'child',
        };
        localStorage.setItem('child_user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
      if (error.message?.includes('No active paper config')) {
        setTodayPractice(null);
      }
      try {
        const profileResponse = await api.children.getProfile();
        setProfile(profileResponse.data);
      } catch (profileError) {
        console.error('Failed to load profile separately:', profileError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = async () => {
    if (!todayPractice?.id) return;
    if (todayPractice.status === 'pending') {
      try {
        await api.children.startPractice(todayPractice.id);
        navigate(`/practice/${todayPractice.id}`);
      } catch (error) {
        console.error('Failed to start practice:', error);
      }
    } else {
      navigate(`/practice/${todayPractice.id}`);
    }
  };

  const handleCompleteSession = async () => {
    if (!todayPractice?.id) return;
    setLoading(true);
    try {
      await api.children.completePractice(todayPractice.id);
      await loadData();
    } catch (error) {
      console.error('Failed to complete practice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(true);
    window.location.href = '/child-login';
  };

  const welcomeMessage = useMemo(() => {
    const childName = profile?.name || user?.name || '小朋友';
    const streakDays = profile?.streakDays || 0;
    const isSessionFinished = todayPractice && todayPractice.completedCount >= todayPractice.targetCount && todayPractice.targetCount > 0;
    
    if (isSessionFinished) return `哇！${childName}太厉害了，题目都做完了！快点“结算并领奖”吧！`;
    if (!todayPractice) return `哈喽，${childName}！村长正在为你准备今天的练习卷呢...`;
    if (todayPractice.status === 'daily_limit_reached') {
      return `哇！${childName}今天太棒了！所有的练习都做完了，去休息一下吧！`;
    }
    if (streakDays > 0) {
      return `欢迎回来，${childName}！你已经连续打卡 ${streakDays} 天了，真厉害！今天也要加油哦！`;
    }
    return `欢迎回来，${childName}！今天的小岛充满了智慧的气息，快来开始练习吧！`;
  }, [todayPractice, profile, user?.name]);

  if (loading) {
    return (
      <Cursor>
        <div className="flex min-h-screen items-center justify-center bg-[#f8f8f0]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#19c8b9] border-t-transparent"></div>
            <p className="font-bold text-[#794f27]">正在登岛中...</p>
          </div>
        </div>
      </Cursor>
    );
  }

  return (
    <Cursor>
      <div className="relative min-h-screen overflow-hidden bg-[#f8f8f0] text-[#794f27]">
      <style>{`
        @keyframes kmq-soft-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes kmq-bubble-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
      `}</style>

      {/* 背景层 */}
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: 'url(/common-bg.png)' }} />

      {/* 顶部 HUD */}
      <nav className="relative z-10 mx-auto max-w-[1280px] px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Time />

          <div className="flex items-center gap-4">
            <Card color="yellow-green" className="!rounded-[50px] !py-2 !px-5 flex items-center gap-3 border-4 border-white shadow-[0_4px_0_0_#bdaea0]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/30 text-white shadow-inner">
                <Icon name="star" size={24} fill="currentColor" stroke="none" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Points</span>
                <span className="text-xl font-black">{profile?.points || user?.points || 0}</span>
              </div>
            </Card>

            <Card color="app-blue" className="!rounded-[50px] !py-2 !px-5 flex items-center gap-3 border-4 border-white shadow-[0_4px_0_0_#bdaea0]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/30 text-white shadow-inner">
                <Icon name="sparkle" size={24} fill="currentColor" stroke="none" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Level</span>
                <span className="text-xl font-black">{profile?.level || user?.level || 1}</span>
              </div>
            </Card>

            <Button 
              type="danger" 
              size="small" 
              onClick={handleLogout}
              className="!h-12 !w-12 !p-0 !rounded-full !shadow-[0_4px_0_0_#c94444] flex items-center justify-center"
            >
              <Icon name="logout" size={20} />
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-24 pt-4 sm:px-6">
        {/* NPC 欢迎区 */}
        <div className="mb-12 flex flex-col items-center justify-center sm:flex-row sm:gap-10">
          <div 
            className="relative group h-44 w-44 sm:h-52 sm:w-52"
            style={{ animation: 'kmq-soft-float 5s ease-in-out infinite' }}
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[8px] border-white bg-[#f7cd67] shadow-[0_12px_0_0_#dfa000]">
              <img 
                src="/ACNH_Isabelle.webp" 
                alt="西施惠" 
                className="h-[90%] w-[90%] object-contain transition-transform group-hover:scale-110"
              />
            </div>
            <div className="absolute -right-2 -top-2 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#19c8b9] text-white shadow-lg ring-4 ring-[#19c8b9]/20">
              <Icon name="sparkle" size={32} fill="currentColor" stroke="none" />
            </div>
            
            {/* 装饰草丛 */}
            <div className="absolute -bottom-4 -left-6 opacity-80">
               <div className="h-8 w-16 bg-[#6fba2c] rounded-full" />
            </div>
          </div>

          <div className="relative mt-8 max-w-md sm:mt-0">
            <Card 
              className="!rounded-[40px] !border-[6px] !border-[#f0e8d8] !bg-white !p-8 shadow-[0_10px_0_0_#f0e8d8]"
              style={{ animation: 'kmq-bubble-float 4s ease-in-out infinite' }}
            >
              <div className="absolute -top-4 left-1/2 h-8 w-8 -translate-x-1/2 rotate-45 border-l-[6px] border-t-[6px] border-[#f0e8d8] bg-white sm:-left-4 sm:top-1/2 sm:-translate-y-1/2 sm:border-b-0 sm:border-l-[6px] sm:border-r-0 sm:border-t-[6px]" />
              
              <div className="relative text-xl font-black leading-relaxed text-[#794f27]">
                <Typewriter trigger={welcomeMessage} speed={60}>
                  {welcomeMessage}
                </Typewriter>
              </div>
            </Card>
          </div>
        </div>

        {/* 核心内容区 */}
        <div className="space-y-8">
          <Card type="title" color="default" className="!p-1 !border-[6px]" style={{ backgroundColor: 'rgb(247, 243, 223)', borderColor: '#c4b89e' }}>
            <div className="rounded-[28px] border-2 border-dashed border-[#c4b89e] bg-white/50 p-6 sm:p-8">
              <div className="mb-8 flex flex-col items-center justify-between gap-4 border-b border-[#794f27]/10 pb-6 sm:flex-row sm:text-left">
                <div>
                  <h3 className="text-2xl font-black text-[#654322]">今日挑战</h3>
                  <p className="mt-1 font-bold text-[#9f927d]">
                    {todayPractice?.status === 'daily_limit_reached' 
                      ? '今天的目标已经达成啦！' 
                      : '完成练习，获取更多积分吧！'}
                  </p>
                </div>
                <Card color="app-yellow" className="!rounded-2xl !px-4 !py-2 !font-black !shadow-none flex items-center">
                  <Icon name="trophy" size={20} className="mr-2 text-[#f5c31c]" />
                  <span>连续打卡 {profile?.streakDays || 0} 天</span>
                </Card>
              </div>

              {(() => {
                const isDailyLimitReached = todayPractice?.status === 'daily_limit_reached';
                const hasPractice = todayPractice && todayPractice.id && todayPractice.id !== 'done';
                const isInProgress = todayPractice?.status === 'in_progress';
                const isFinished = todayPractice && todayPractice.completedCount >= todayPractice.targetCount && todayPractice.targetCount > 0;
                
                if (isDailyLimitReached) {
                  return (
                    <div className="flex flex-col items-center justify-center rounded-[30px] bg-[#e6f9f6] py-8 text-center animate-animal-fade-up">
                      <div className="mb-3">
                        <Icon name="trophy" size={60} className="text-[#f5c31c]" />
                      </div>
                      <h4 className="text-xl font-black text-[#19c8b9]">任务圆满完成</h4>
                      <p className="mt-2 font-bold text-[#725d42]">
                        已完成 {todayPractice.completedCount}/{todayPractice.dailyFrequency} 次练习
                      </p>
                    </div>
                  );
                } else if (hasPractice && isFinished) {
                  return (
                    <div className="flex flex-col items-center gap-6 animate-animal-fade-up">
                      <div className="flex w-full items-center justify-between rounded-2xl bg-[#e6f9f6] px-6 py-4 border-2 border-[#19c8b9]/20">
                        <span className="font-bold text-[#19c8b9]">已答完所有题</span>
                        <span className="text-2xl font-black text-[#19c8b9]">{todayPractice.completedCount} / {todayPractice.targetCount}</span>
                      </div>
                      
                      <Button
                        type="warning"
                        size="large"
                        onClick={handleCompleteSession}
                        className="w-full !h-20 !text-2xl flex items-center justify-center"
                      >
                        <Icon name="trophy" size={32} className="mr-4 fill-current" />
                        <span>结算并领奖</span>
                        <ChevronRight className="h-8 w-8 ml-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  );
                } else if (hasPractice && isInProgress) {
                  return (
                    <div className="flex flex-col items-center gap-6 animate-animal-fade-up">
                      <div className="flex w-full items-center justify-between rounded-2xl bg-[#fff2cf] px-6 py-4">
                        <span className="font-bold text-[#b68039]">题目数量</span>
                        <span className="text-2xl font-black text-[#d89a46]">{todayPractice.targetCount || 30} 题</span>
                      </div>
                      
                      <div className="flex w-full items-center justify-between rounded-2xl bg-[#e6f9f6] px-6 py-4">
                        <span className="font-bold text-[#19c8b9]">已完成</span>
                        <span className="text-2xl font-black text-[#19c8b9]">{todayPractice.completedCount || 0} 题</span>
                      </div>
                      
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleStartPractice}
                        className="w-full !h-20 !text-2xl !bg-[#889df0] !text-white !border-[#889df0] !shadow-[0_8px_0_0_#4a5a9a] flex items-center justify-center"
                      >
                        <Icon name="play" size={32} className="mr-4 fill-current" />
                        <span>继续练习</span>
                        <ChevronRight className="h-8 w-8 ml-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  );
                } else if (hasPractice) {
                  return (
                    <div className="flex flex-col items-center gap-6 animate-animal-fade-up">
                      <div className="flex w-full items-center justify-between rounded-2xl bg-[#fff2cf] px-6 py-4">
                        <span className="font-bold text-[#b68039]">题目数量</span>
                        <span className="text-2xl font-black text-[#d89a46]">{todayPractice.targetCount || 30} 题</span>
                      </div>
                      
                      <Button
                        type="success"
                        size="large"
                        onClick={handleStartPractice}
                        className="w-full !h-20 !text-2xl flex items-center justify-center"
                      >
                        <Icon name="play" size={32} className="mr-4 fill-current" />
                        <span>立即开始练习</span>
                        <ChevronRight className="h-8 w-8 ml-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex flex-col items-center justify-center rounded-[30px] bg-[#fff5ec] py-8 text-center animate-animal-fade-up">
                      <div className="mb-3">
                        <Icon name="leaf" size={60} className="text-[#e59266] opacity-50" />
                      </div>
                      <h4 className="text-xl font-black text-[#e59266]">今天还没有练习哦</h4>
                      <p className="mt-2 font-bold text-[#725d42]">请让家长先配置今日的练习卷</p>
                    </div>
                  );
                }
              })()}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { label: '练习历史', name: 'history', color: 'app-teal', path: '/child/history', shadow: '#327a93' },
              { label: '错题本', name: 'critterpedia', color: 'app-pink', path: '/child/wrong-questions', shadow: '#b45f45' },
              { label: '成就', name: 'trophy', color: 'purple', path: '/child/badges', shadow: '#7d4fc0' }
            ].map((item, idx) => (
              <Card
                key={idx}
                color={item.color as any}
                className="group relative flex flex-col items-center gap-5 !rounded-[40px] !border-[6px] !border-white !p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 active:translate-y-1"
                style={{ boxShadow: `0 10px 0 0 ${item.shadow}` }}
                onClick={() => navigate(item.path)}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-[30px] bg-white/25 shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <Icon name={item.name as any} size={48} className="text-white" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">{item.label}</span>
                <div className="absolute bottom-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-white/20 text-white transition-all group-hover:bg-white group-hover:text-current group-hover:translate-x-1">
                  <ChevronRight className="h-6 w-6" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer className="fixed bottom-0 left-0 right-0 z-0 opacity-60" />
    </div>
    </Cursor>
  );
};


