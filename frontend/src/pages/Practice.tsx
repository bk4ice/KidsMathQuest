import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronLeft } from 'lucide-react';
import { Button, Card, Input, Icon } from '../components/ui';

export const Practice: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lives, setLives] = useState(3);
  const [isShaking, setIsShaking] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const loadSession = async () => {
    if (!sessionId) return;
    try {
      const response = await api.children.startPractice(sessionId);
      const sessionData = response.data;
      setSession(sessionData);
      
      if (sessionData.completedCount > 0) {
        const nextIndex = Math.min(sessionData.completedCount, sessionData.questionInstances.length - 1);
        setCurrentQuestionIndex(nextIndex);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !userAnswer || !sessionId || feedback) return;

    const question = session.questionInstances[currentQuestionIndex];
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    try {
      const response = await api.children.submitAnswer(sessionId, question.id, userAnswer, timeSpent);
      const result = response.data;
      setFeedback(result);

      if (result.isCorrect) {
        setShowSparkles(true);
        setTimeout(() => {
          setShowSparkles(false);
          handleNextQuestion();
        }, 1000);
      } else {
        setLives(prev => Math.max(0, prev - 1));
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setTimeout(() => {
          handleNextQuestion();
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setUserAnswer('');
    if (currentQuestionIndex < session.questionInstances.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      handleCompletePractice();
    }
  };

  const handleCompletePractice = async () => {
    if (!sessionId) return;
    try {
      await api.children.completePractice(sessionId);
      navigate(`/practice/${sessionId}/result`);
    } catch (error) {
      console.error('Failed to complete practice:', error);
    }
  };

  const handleKeyClick = (val: string) => {
    if (feedback) return;
    if (val === 'backspace') {
      setUserAnswer(prev => prev.slice(0, -1));
    } else {
      setUserAnswer(prev => prev + val);
    }
    inputRef.current?.focus();
  };

  const handleSkip = () => {
    if (feedback) return;
    handleNextQuestion();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f0]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#19c8b9] border-t-transparent"></div>
          <p className="font-bold text-[#794f27]">准备题目中...</p>
        </div>
      </div>
    );
  }

  if (!session || !session.questionInstances[currentQuestionIndex]) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f0]">
        <Card className="text-center p-12">
          <h2 className="text-2xl font-bold mb-4">哎呀，没有题目了</h2>
          <Button onClick={() => navigate('/child/dashboard')}>返回主页</Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = session.questionInstances[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / session.questionInstances.length) * 100;

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-cover bg-center flex items-center justify-center px-4"
      style={{
        backgroundImage: 'url(/practice-bg.png)',
        fontFamily: 'Nunito, "MarukoGothic", "Noto Sans SC", -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
      }}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
        @keyframes sparkle-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        .sparkle {
          animation: sparkle-pop 0.6s ease-out forwards;
        }
      `}</style>

      {/* 退出按钮 */}
      <div className="absolute top-8 left-8 z-20">
        <Button 
          type="default" 
          size="small" 
          onClick={() => navigate('/child/dashboard')}
          className="!rounded-full !w-12 !h-12 !p-0 !bg-white/80"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="relative w-full max-w-5xl flex flex-col items-center gap-8">
        {/* 顶部 HUD 栏 */}
        <div className="w-full flex justify-between items-center px-4">
           <Card className="!rounded-full !py-3 !px-6 !bg-white/90 !border-4 !border-[#f0e8d8] flex items-center gap-6 shadow-[0_6px_0_0_#f0e8d8]">
              <div className="flex items-center gap-3">
                <span className="font-black text-lg text-[#9f927d]">进度</span>
                <div className="w-48 sm:w-64 h-6 bg-[#f0e8d8] rounded-full overflow-hidden p-1.5 border-2 border-[#9f927d]/20 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[#6fba2c] to-[#86d67a] rounded-full transition-all duration-500 shadow-[0_2px_0_0_rgba(255,255,255,0.3)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="font-black text-xl text-[#794f27] min-w-[60px]">
                  {currentQuestionIndex + 1} / {session.questionInstances.length}
                </span>
              </div>
           </Card>

           <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border-4 transition-all duration-300 ${
                    i < lives 
                      ? 'bg-white border-[#fc736d] shadow-[0_5px_0_0_#e05a5a]' 
                      : 'bg-white/30 border-[#d4c9b4] opacity-30 shadow-none'
                  }`}
                >
                  <Icon 
                    name="heart" 
                    size={32}
                    className={`transition-all ${i < lives ? 'text-[#fc736d] fill-current animate-pulse' : 'text-[#d4c9b4]'}`}
                  />
                </div>
              ))}
           </div>
        </div>

        {/* 主答题卡片 */}
        <Card 
          className={`relative w-full !bg-white !rounded-[50px] !border-[8px] !border-[#f0e8d8] !p-10 sm:!p-16 transition-all duration-300 shadow-[0_15px_0_0_#f0e8d8] ${isShaking ? 'animate-shake' : ''}`}
        >
          {/* 题目内容区 */}
          <div className="flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-8 mb-10">
              <div 
                className="text-[100px] sm:text-[140px] font-black leading-none text-[#794f27] select-none tracking-tighter"
                style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}
              >
                {currentQuestion.questionText.replace('=', '')}
                <span className="text-[#19c8b9] mx-4">=</span>
              </div>
              
              <div className="relative">
                {showSparkles && (
                  <div className="absolute -top-20 inset-x-0 flex justify-center pointer-events-none z-10">
                    <Icon name="sparkle" size={96} className="text-[#f5c31c] sparkle fill-current" />
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                  className={`w-48 h-32 text-7xl text-center font-black rounded-[40px] border-[6px] transition-all duration-200 outline-none ${
                    feedback?.isCorrect ? 'border-[#6fba2c] bg-[#e6f9f6] text-[#6fba2c] shadow-[0_8px_0_0_#5a9e1e]' : 
                    feedback?.isCorrect === false ? 'border-[#e05a5a] bg-[#fff5f5] text-[#e05a5a] shadow-[0_8px_0_0_#c94444]' : 
                    'border-[#c4b89e] bg-[rgb(247,243,223)] text-[#794f27] shadow-[0_8px_0_0_#d4c9b4] focus:border-[#ffcc00] focus:shadow-[0_8px_0_0_#e0b800]'
                  }`}
                  autoFocus
                  disabled={!!feedback}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-[#f0e8d8]/30 px-6 py-2 rounded-full mb-10">
               <Icon name="sparkle" size={20} className="text-[#f5c31c] fill-current" />
               <p className="text-[#9f927d] font-black text-lg">输入答案并按回车确认</p>
            </div>

            {/* 虚拟键盘 - 增强色彩 */}
            <div className="w-full max-w-2xl">
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-4">
                {[
                  { val: 1, color: '#ff8a8a', shadow: '#e05a5a' },
                  { val: 2, color: '#889df0', shadow: '#4a5a9a' },
                  { val: 3, color: '#f7cd67', shadow: '#dfa000' },
                  { val: 4, color: '#82d5bb', shadow: '#327a93' },
                  { val: 5, color: '#e59266', shadow: '#b45f45' },
                  { val: 6, color: '#b77dee', shadow: '#7d4fc0' },
                  { val: 7, color: '#8ac68a', shadow: '#5a9e1e' },
                  { val: 8, color: '#fc736d', shadow: '#c94444' },
                  { val: 9, color: '#19c8b9', shadow: '#11a89b' },
                  { val: 0, color: '#f5c31c', shadow: '#dba90e' },
                ].map((item, idx) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => handleKeyClick(item.val.toString())}
                    className={`h-20 text-3xl font-black rounded-3xl text-white transition-all hover:-translate-y-1 active:translate-y-2 focus:outline-none focus:ring-4 focus:ring-white/50 ${idx === 9 ? 'sm:col-start-5' : ''}`}
                    style={{ 
                      backgroundColor: item.color,
                      boxShadow: `0 8px 0 0 ${item.shadow}`
                    }}
                  >
                    {item.val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleKeyClick('backspace')}
                  className="h-20 rounded-3xl bg-[#f0e8d8] border-4 border-white flex items-center justify-center transition-all hover:-translate-y-1 active:translate-y-2 shadow-[0_8px_0_0_#d4c9b4] sm:col-start-6"
                >
                  <Icon name="backspace" size={32} className="text-[#794f27] fill-current" />
                </button>
              </div>
            </div>
          </div>

          {/* 跳过按钮 - 移到左下角并缩小 */}
          <div className="absolute bottom-8 left-4">
            <button
              type="button"
              onClick={handleSkip}
              className="group flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#fbf6e8] border-2 border-[#f0e8d8] text-[#9f927d] font-black text-sm transition-all hover:bg-white hover:border-[#ffcc00] hover:text-[#ffcc00] hover:shadow-[0_4px_0_0_#e0b800]"
            >
              <Icon name="close" size={16} />
              <span>跳过</span>
            </button>
          </div>

          {/* 错误反馈 */}
          {feedback?.isCorrect === false && (
            <div className="absolute inset-x-0 -bottom-10 flex justify-center z-20">
              <Card className="!bg-[#e05a5a] !border-4 !border-white !px-10 !py-4 !rounded-[30px] shadow-2xl animate-animal-fade-up">
                <div className="text-white text-3xl font-black flex items-center gap-4">
                   <span>正确答案是:</span>
                   <span className="bg-white text-[#e05a5a] px-4 py-1 rounded-2xl">{feedback.correctAnswer}</span>
                </div>
              </Card>
            </div>
          )}

          {/* NPC 角色 */}
          <div className="absolute -bottom-8 -right-8 w-40 h-40 sm:w-52 sm:h-52 z-10">
            <img 
              src="/Blathers.webp" 
              alt="角色" 
              className="w-full h-full object-contain animate-[kmq-soft-float_5s_ease-in-out_infinite]"
            />
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes kmq-soft-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
};


