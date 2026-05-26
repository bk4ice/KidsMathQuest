import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';
import { Icon } from '../components/ui';

type ChildLoginOption = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

type DefaultAvatar = {
  emoji: string;
  accent: string;
};

const DEFAULT_AVATARS: DefaultAvatar[] = [
  {
    emoji: '🐰',
    accent: '#f4b16f',
  },
  {
    emoji: '🐻',
    accent: '#d08a42',
  },
  {
    emoji: '🐱',
    accent: '#ec7b95',
  },
  {
    emoji: '🐦',
    accent: '#69a8ff',
  },
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

const NOOK_COLORS = [
  'app-pink',
  'purple',
  'app-blue',
  'app-yellow',
  'app-orange',
  'app-teal',
  'app-green',
  'app-red',
  'lime-green',
  'yellow-green',
  'brown',
  'warm-peach-pink',
];

const getNookColor = (seed: string) => {
  const index = hashString(seed) % NOOK_COLORS.length;
  return NOOK_COLORS[index];
};

export const ChildLogin: React.FC = () => {
  const [children, setChildren] = useState<ChildLoginOption[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [childrenLoadError, setChildrenLoadError] = useState('');
  const [childId, setChildId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const { childLogin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const loadChildren = async () => {
      setLoadingChildren(true);
      setChildrenLoadError('');

      try {
        const response = await api.auth.getChildLoginOptions();

        if (!active) {
          return;
        }

        setChildren(response.data ?? []);
      } catch (err: any) {
        if (!active) {
          return;
        }

        setChildren([]);
        setChildrenLoadError(err.message || '孩子头像暂时加载失败。');
      } finally {
        if (active) {
          setLoadingChildren(false);
        }
      }
    };

    loadChildren();

    return () => {
      active = false;
    };
  }, []);

  const selectedChild = useMemo(
    () => children.find((child) => child.id === selectedChildId) ?? null,
    [children, selectedChildId],
  );

  const selectedAvatar = useMemo(() => {
    if (!selectedChild) {
      return null;
    }

    const fallback = getDefaultAvatar(selectedChild.id);
    
    let avatarUrl = selectedChild.avatarUrl;
    if (avatarUrl && (avatarUrl.includes('localhost') || avatarUrl.includes('127.0.0.1'))) {
      const uploadsIndex = avatarUrl.indexOf('/uploads/');
      if (uploadsIndex !== -1) {
        avatarUrl = avatarUrl.substring(uploadsIndex);
      }
    }

    return avatarUrl
      ? {
          type: 'image' as const,
          src: avatarUrl.startsWith('http') ? avatarUrl : `${config.API_BASE_URL}${avatarUrl}`,
          accent: fallback.accent,
        }
      : {
          type: 'fallback' as const,
          emoji: fallback.emoji,
          accent: fallback.accent,
        };
  }, [selectedChild]);

  const handleSelectChild = (child: ChildLoginOption) => {
    setSelectedChildId(child.id);
    setChildId(child.name);
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedChild) {
      setError('先选一个孩子头像，再输入密码哦。');
      return;
    }

    try {
      await childLogin(childId, password);
      navigate('/child/dashboard');
    } catch (err: any) {
      // 错误信息映射
      const errorMessage = err.message || '';
      const errorMap: Record<string, string> = {
        'Invalid password': '密码不对哦，再试试看吧！',
        'Login failed': '登录失败，请稍后重试',
      };
      setError(errorMap[errorMessage] || errorMessage || '登录出错了，请稍后重试');
    }
  };

  return (
    <div className="kmq-responsive-page relative min-h-screen overflow-hidden bg-[#f7f3df] text-[#6f4d2d]" style={{ fontFamily: 'Nunito, "MarukoGothic", "Noto Sans SC", -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif' }}>
      <style>{`
        @keyframes kmq-cloud-drift {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(14px) translateY(-6px); }
        }

        @keyframes kmq-soft-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/login-bg.png)' }} />

      <div className="kmq-compact-shell relative mx-auto flex min-h-screen max-w-[1280px] items-start px-4 py-4 sm:items-center sm:px-6 sm:py-6 lg:px-10 lg:py-6">
        <div className="w-full">
          <div className="mb-8 flex justify-center px-2">
            <div className="kmq-compact-hero relative">
              <div className="absolute left-1/2 top-[-18px] h-6 w-40 -translate-x-1/2 rounded-full bg-[#d89a46]/50 blur-lg" />
              <div className="absolute left-[12%] top-[-10px] h-6 w-6 rounded-full bg-[#8d5626] shadow-[0_0_0_4px_rgba(255,255,255,0.12)]" />
              <div className="absolute right-[12%] top-[-10px] h-6 w-6 rounded-full bg-[#8d5626] shadow-[0_0_0_4px_rgba(255,255,255,0.12)]" />

              <div
                className="relative rounded-[34px] border-[6px] border-[#a66b2f] px-8 py-4 text-center text-white shadow-[0_5px_0_0_#bdaea0] sm:px-12 sm:py-5"
                style={{ background: 'linear-gradient(180deg, #dfaa58 0%, #c97f38 100%)' }}
              >
                <div className="pointer-events-none absolute inset-[6px] rounded-[28px] border border-white/15" />
                <div className="kmq-compact-title relative text-3xl font-black tracking-[0.02em] text-[#fff8ec] sm:text-4xl">
                  计算小岛
                </div>
                <div className="kmq-compact-copy relative mt-1 text-[12px] font-bold text-[#fff0cf]/90 sm:text-sm">
                  ⏬ 选择角色登岛吧，少年！ ⏬
                </div>
              </div>
            </div>
          </div>

          <div className="kmq-compact-panel mx-auto max-w-[1060px] rounded-[40px] border-0 bg-transparent p-5 shadow-none backdrop-blur-0 sm:p-7">
            {loadingChildren ? (
              <div className="rounded-[28px] border border-dashed border-[#d8c7a9] bg-white/20 px-5 py-8 text-center text-sm font-medium text-[#8f7759]">
                正在加载孩子头像…
              </div>
            ) : children.length > 0 ? (
              <div className="kmq-compact-grid flex flex-wrap justify-center gap-3">
                {children.map((child) => {
                  const isSelected = selectedChildId === child.id;
                  const fallback = getDefaultAvatar(child.id);
                  
                  // 处理头像 URL，防止数据库中存的是旧的 localhost 地址
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
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => handleSelectChild(child)}
                      aria-pressed={isSelected}
                      className={`group relative w-full max-w-[220px] overflow-hidden rounded-[40px] border-4 p-5 text-left transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:scale-[1.05] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ffcc00]/50 ${
                        isSelected
                          ? 'border-[#ffcc00] bg-white shadow-[0_8px_0_0_#e0b800]'
                          : 'border-white/80 bg-white/40 shadow-[0_5px_0_0_#bdaea0] hover:bg-white/60'
                      }`}
                    >
                      <div className="relative flex flex-col items-center gap-4">
                        <div 
                          className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-lg transition-transform group-hover:rotate-3`}
                          style={{ backgroundColor: isSelected ? '#fff' : fallback.accent + '33' }}
                        >
                          {finalAvatarUrl ? (
                            <img
                              src={finalAvatarUrl}
                              alt={child.name}
                              className="h-full w-full object-cover"
                              style={{ animation: 'kmq-soft-float 4.8s ease-in-out infinite' }}
                            />
                          ) : (
                            <span className="text-5xl" style={{ animation: 'kmq-soft-float 4.8s ease-in-out infinite' }}>{fallback.emoji}</span>
                          )}
                        </div>

                        <div className="text-center">
                          <div className={`text-xl font-black ${isSelected ? 'text-[#794f27]' : 'text-[#8d5626]'}`}>{child.name}</div>
                          <div className={`mt-1 text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-[#d89a46]' : 'text-[#bdaea0]'}`}>
                            ID: {child.id.slice(0, 6)}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#ffcc00] text-[#794f27] shadow-[0_3px_0_0_#e0b800] ring-4 ring-white">
                            <Icon name="star" size={24} fill="currentColor" stroke="none" />
                          </div>
                        )}
                        
                        <div className="absolute bottom-0 right-0 opacity-10">
                           <Icon name="heart" size={48} className="rotate-12" fill="currentColor" stroke="none" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[#d8c7a9] bg-white/20 px-5 py-8 text-center text-sm font-medium text-[#8f7759]">
                {childrenLoadError || '还没有可登录的孩子账号。'}
              </div>
            )}

            <div
              className={`mx-auto mt-6 w-full max-w-[640px] overflow-hidden rounded-[40px] border-4 border-[#ffcc00] bg-white transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                selectedChild ? 'max-h-[700px] py-6 opacity-100 shadow-[0_10px_0_0_#e0b800]' : 'max-h-0 py-0 opacity-0'
              }`}
            >
              <div className="px-4 sm:px-5">
                <div className="mb-4 flex items-center gap-4">
                  <div
                    className="flex h-[72px] w-[72px] items-center justify-center rounded-[50px] border-4 border-white/80 text-4xl shadow-[0_4px_10px_rgba(107,92,67,0.42)]"
                    style={{ background: 'rgba(255,255,255,0.38)' }}
                  >
                    {selectedChild ? (
                      selectedAvatar?.type === 'image' ? (
                        <img src={selectedAvatar.src} alt={selectedChild.name} className="h-full w-full rounded-[50px] object-cover" style={{ animation: 'kmq-soft-float 4.8s ease-in-out infinite' }} />
                      ) : (
                        <span style={{ animation: 'kmq-soft-float 4.8s ease-in-out infinite' }}>{selectedAvatar?.emoji ?? '🌼'}</span>
                      )
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* <p className="text-sm font-extrabold tracking-[0.02em] text-[#8b6a41]">密码卡已展开</p> */}
                    <h2 className="mt-1 truncate text-2xl font-black text-[#654322] sm:text-[1.9rem]">
                      {selectedChild ? `已选择：${selectedChild.name}` : '轻轻点一个头像'}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-[#8f7759]">
                      用户名已经自动匹配好了，只需要输入密码。
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-[560px] space-y-4">
                  <div className="rounded-[30px] border-4 border-[#f0e8d8] bg-[#fdfdf5] p-5 shadow-[0_5px_0_0_#d4c9b4] sm:p-6">
                    {/* <label className="mb-3 flex items-center gap-2 text-base font-black text-[#794f27]">
                      <Lock className="h-5 w-5 text-[#f5c31c]" />
                      请输入通行密码
                    </label> */}

                    <div className="flex items-center gap-3 rounded-[50px] border-[3px] border-[#c4b89e] bg-[rgb(247,243,223)] px-5 py-4 shadow-[0_4px_0_0_#d4c9b4] transition-all duration-200 focus-within:border-[#ffcc00] focus-within:shadow-[0_4px_0_0_#e0b800]">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/50 text-[#794f27] shadow-inner">
                        <Lock className="h-6 w-6" />
                      </div>

                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="在此输入数字密码"
                        autoComplete="current-password"
                        className="kmq-compact-input min-w-0 flex-1 bg-transparent text-xl font-black text-[#794f27] outline-none placeholder:text-[#9f927d]/60 sm:text-2xl"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-[50px] border border-[#f2c1b0] bg-[#fff3ec] px-4 py-3 text-sm font-semibold text-[#b45f45] shadow-[0_4px_10px_rgba(107,92,67,0.42)]">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/75 text-[#f06a78] shadow-[0_2px_0_0_#bdaea0]">
                          <Icon name="heart" size={16} fill="currentColor" stroke="none" />
                        </span>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !selectedChildId || !childId.trim() || !password.trim()}
                    className="kmq-compact-button group relative flex h-20 w-full items-center justify-center gap-4 rounded-[50px] bg-[#ffcc00] px-8 text-2xl font-black text-[#794f27] shadow-[0_8px_0_0_#e0b800] transition-all duration-200 hover:-translate-y-1 hover:bg-[#ffd633] hover:shadow-[0_10px_0_0_#e0b800] active:translate-y-2 active:shadow-[0_2px_0_0_#e0b800] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#794f27]/20 border-t-[#794f27]" />
                        <span>正在登岛...</span>
                      </>
                    ) : (
                      <>
                        <span>出发！登岛</span>
                        <ArrowRight className="h-8 w-8 transition-transform duration-200 group-hover:translate-x-2" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
