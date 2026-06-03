import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Coins, CalendarDays, Sparkles, Target } from 'lucide-react';
import { api } from '../services/api';
import { Button, Card, Typewriter } from '../components/ui';

type BadgeWallEntry = {
  badgeType: string;
  groupKey: string;
  title: string;
  value: string;
  description: string;
  icon: string;
  unlocked: boolean;
  earnedAt: string | null;
};

type BadgeWallGroup = {
  key: string;
  title: string;
  description: string;
  accent: string;
  accentDark: string;
  badges: BadgeWallEntry[];
};

type BadgeWallSummary = {
  streakDays: number;
  totalQuestions: number;
  averageAccuracy: number;
  bestAccuracy: number;
  perfectSessions: number;
  sessionCount: number;
  averageSecondsPerQuestion: number;
  bestSecondsPerQuestion: number;
  points: number;
  level: number;
  badgeCount: number;
  unlockedCount: number;
  totalCount: number;
};

type BadgeWallPayload = {
  childName: string;
  summary: BadgeWallSummary;
  groups: BadgeWallGroup[];
};

type BadgeSlot = {
  key: string;
  title: string;
  value: string;
  description: string;
  accent: string;
  accentDark: string;
  icon: string;
};

const formatCount = (value: number) => `${value.toLocaleString('zh-CN')}题`;

const renderBadgeGlyph = (slot: BadgeSlot, unlocked: boolean) => {
  const fill = unlocked ? '#fff4cf' : '#d7cab7';
  const stroke = unlocked ? slot.accentDark : '#b9ab97';

  switch (slot.icon) {
    case 'sprout':
      return (
        <g transform="translate(80 80)">
          <path d="M0 14 V2" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M0 2 C-9 -2 -13 -10 -9 -15 C-3 -20 6 -15 8 -7 C9 -1 5 3 0 2 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M2 2 C8 -1 14 -8 13 -14 C12 -20 2 -19 -2 -13 C-5 -8 -3 -1 2 2 Z" fill={fill} stroke={stroke} strokeWidth="2" />
        </g>
      );
    case 'leaf':
      return (
        <g transform="translate(80 78)">
          <path d="M0 -15 C10 -15 18 -7 18 3 C18 13 10 20 -2 20 C-12 20 -19 13 -18 3 C-17 -8 -8 -15 0 -15 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M-5 12 C0 6 6 1 13 -4" fill="none" stroke={unlocked ? '#fffdf4' : '#b9ab97'} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    case 'tree':
      return (
        <g transform="translate(80 78)">
          <path d="M0 -16 C10 -16 18 -8 18 2 C18 11 11 18 2 20 C-7 22 -18 15 -19 4 C-20 -7 -11 -16 0 -16 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M-1 6 C1 10 1 14 0 18" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M-8 0 C-4 -2 -1 -3 4 -3 C8 -2 12 0 15 4" fill="none" stroke={unlocked ? '#fffdf4' : '#b9ab97'} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'lantern':
      return (
        <g transform="translate(80 79)">
          <path d="M-6 -12 H6 L10 -2 V10 C10 16 5 20 0 20 C-5 20 -10 16 -10 10 V-2 Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path d="M0 -16 V-12" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M-3 2 H3" fill="none" stroke={unlocked ? '#fffdf4' : '#b9ab97'} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'fruit':
      return (
        <g transform="translate(80 79)">
          <circle cx="0" cy="4" r="12" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M0 -10 C2 -16 8 -18 12 -14" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M-1 -10 C-5 -15 -11 -15 -14 -11" fill="none" stroke={unlocked ? '#fffdf4' : '#b9ab97'} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'shell':
      return (
        <g transform="translate(80 80)">
          <path d="M0 -15 C10 -15 18 -6 18 6 C18 15 10 21 0 21 C-10 21 -18 15 -18 6 C-18 -6 -10 -15 0 -15 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M0 -14 V18" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M-8 -11 C-6 -1 -5 8 -5 18" fill="none" stroke={unlocked ? '#fffdf4' : '#b9ab97'} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8 -11 C6 -1 5 8 5 18" fill="none" stroke={unlocked ? '#fffdf4' : '#b9ab97'} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    case 'boat':
      return (
        <g transform="translate(80 80)">
          <path d="M-14 9 L0 -10 L14 9 L0 14 Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path d="M0 -10 V6" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M0 -10 L8 -3" fill="none" stroke={unlocked ? '#fffdf4' : '#b9ab97'} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'map':
      return (
        <g transform="translate(80 80)">
          <path d="M-16 -10 L-4 -15 L8 -10 L16 -14 V12 L4 16 L-8 12 L-16 14 Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path d="M-4 -15 V15" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M8 -10 V16" fill="none" stroke={unlocked ? '#fffdf4' : '#b9ab97'} strokeWidth="1.7" strokeLinecap="round" />
        </g>
      );
    case 'moon':
      return (
        <g transform="translate(80 78)">
          <path d="M7 -16 C1 -13 -3 -7 -3 0 C-3 10 4 18 14 18 C8 22 -1 22 -9 17 C-17 12 -20 3 -18 -5 C-16 -13 -8 -18 0 -18 C3 -18 5 -17 7 -16 Z" fill={fill} stroke={stroke} strokeWidth="2" />
        </g>
      );
    case 'house':
      return (
        <g transform="translate(80 80)">
          <path d="M-14 0 L0 -13 L14 0 V15 H-14 Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path d="M-5 15 V6 H5 V15" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case 'flag':
      return (
        <g transform="translate(80 80)">
          <path d="M-6 -16 V16" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M-6 -14 C0 -16 5 -16 10 -12 L10 -2 C5 2 0 2 -6 0 Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        </g>
      );
    case 'crown':
      return (
        <g transform="translate(80 80)">
          <path d="M-14 10 L-11 -8 L-2 0 L0 -12 L2 0 L11 -8 L14 10 Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path d="M-14 10 H14" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'gem':
      return (
        <g transform="translate(80 80)">
          <path d="M0 -16 L14 -4 L8 14 H-8 L-14 -4 Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path d="M0 -16 L0 14" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    case 'flower':
      return (
        <g transform="translate(80 80)">
          <circle cx="0" cy="0" r="5" fill={stroke} />
          <ellipse cx="0" cy="-11" rx="6" ry="8" fill={fill} stroke={stroke} strokeWidth="2" />
          <ellipse cx="9" cy="-4" rx="6" ry="8" transform="rotate(72 9 -4)" fill={fill} stroke={stroke} strokeWidth="2" />
          <ellipse cx="7" cy="7" rx="6" ry="8" transform="rotate(144 7 7)" fill={fill} stroke={stroke} strokeWidth="2" />
          <ellipse cx="-7" cy="7" rx="6" ry="8" transform="rotate(216 -7 7)" fill={fill} stroke={stroke} strokeWidth="2" />
          <ellipse cx="-9" cy="-4" rx="6" ry="8" transform="rotate(288 -9 -4)" fill={fill} stroke={stroke} strokeWidth="2" />
        </g>
      );
    case 'compass':
      return (
        <g transform="translate(80 80)">
          <circle cx="0" cy="0" r="16" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="0" cy="0" r="10" fill="none" stroke={stroke} strokeWidth="2" />
          <path d="M0 -10 L4 2 L0 10 L-4 -2 Z" fill={stroke} />
        </g>
      );
    case 'island':
      return (
        <g transform="translate(80 80)">
          <path d="M-16 6 C-10 1 -4 -1 0 -1 C6 -1 12 2 16 7 C11 14 3 18 -6 18 C-13 18 -18 14 -16 6 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M-8 5 C-4 2 0 1 5 1" fill="none" stroke={unlocked ? '#fffdf4' : '#b9ab97'} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'star':
      return (
        <g transform="translate(80 78)">
          <path d="M0 -16 L5 -5 L17 -4 L8 4 L11 16 L0 10 L-11 16 L-8 4 L-17 -4 L-5 -5 Z" fill={fill} stroke={stroke} strokeWidth="2" />
        </g>
      );
    case 'target':
      return (
        <g transform="translate(80 78)">
          <circle cx="0" cy="0" r="13" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="0" cy="0" r="8" fill="none" stroke={stroke} strokeWidth="2" />
          <circle cx="0" cy="0" r="3" fill={stroke} />
        </g>
      );
    case 'sparkles':
      return (
        <g transform="translate(80 78)">
          <path d="M0 -15 L4 -4 L15 0 L4 4 L0 15 L-4 4 L-15 0 L-4 -4 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M12 -8 L14 -2 L20 0 L14 2 L12 8 L10 2 L4 0 L10 -2 Z" fill={unlocked ? '#fff9db' : '#c9bead'} stroke={stroke} strokeWidth="1.5" />
        </g>
      );
    default:
      return (
        <g transform="translate(80 78)">
          <path d="M0 -14 C9 -14 17 -8 18 1 C19 12 10 20 0 20 C-11 20 -19 12 -18 1 C-17 -8 -9 -14 0 -14 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M0 -18 V-14" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="-18" r="2" fill={stroke} />
        </g>
      );
  }
};

const BadgeMedal: React.FC<{
  badge: BadgeWallEntry;
  group: BadgeWallGroup;
  unlocked: boolean;
  earnedAt?: string | null;
  index: number;
}> = ({ badge, group, unlocked, earnedAt, index }) => {
  return (
    <div
      className={`badge-float group relative flex flex-col items-center text-center ${unlocked ? '' : 'opacity-55 grayscale-[0.95]'}`}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="relative w-full max-w-[160px]">
        <svg viewBox="0 0 160 176" className="h-auto w-full drop-shadow-[0_8px_10px_rgba(107,92,67,0.16)]">
          <defs>
            <linearGradient id={`badge-gradient-${badge.badgeType}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={group.accent} />
              <stop offset="100%" stopColor={group.accentDark} />
            </linearGradient>
          </defs>

          <path d="M55 8 L80 44 L105 8 L112 44 L48 44 Z" fill={unlocked ? group.accentDark : '#c9bead'} />
          <path d="M40 45 L64 86 L52 92 L34 62 Z" fill={unlocked ? group.accent : '#ddd0bd'} />
          <path d="M120 45 L106 62 L88 92 L76 86 L100 45 Z" fill={unlocked ? group.accent : '#ddd0bd'} />
          <circle cx="80" cy="92" r="54" fill="#fff8e8" stroke={`url(#badge-gradient-${badge.badgeType})`} strokeWidth="6" />
          <circle cx="80" cy="92" r="42" fill={unlocked ? '#fff3c7' : '#eee1cf'} />
          <circle cx="80" cy="92" r="30" fill={unlocked ? group.accent : '#d8cdbb'} stroke={unlocked ? group.accentDark : '#c6b8a4'} strokeWidth="3" />
          {renderBadgeGlyph({ key: badge.badgeType, title: badge.title, value: badge.value, description: badge.description, accent: group.accent, accentDark: group.accentDark, icon: badge.icon }, unlocked)}
          <text
            x="80"
            y="110"
            textAnchor="middle"
            fill={unlocked ? '#fffdf4' : '#8f8270'}
            fontFamily="Nunito, 'Noto Sans SC', 'MarukoGothic', sans-serif"
            fontSize="20"
            fontWeight="900"
          >
            {unlocked ? badge.value : '锁'}
          </text>
          <path d="M58 144 L72 126 L80 138 L88 126 L102 144 L80 164 Z" fill={unlocked ? group.accentDark : '#cabca7'} />
          <path d="M52 144 L64 164 L76 152 L80 158 L84 152 L96 164 L108 144 L80 172 Z" fill={unlocked ? group.accent : '#ddd0bd'} opacity={unlocked ? 1 : 0.95} />
        </svg>
      </div>

      <div className="-mt-1 space-y-1 px-2">
        <div className="text-base font-black text-[#6e4a27]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
          {badge.title}
        </div>
        <div className="text-sm font-bold text-[#8a7b66]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>{badge.description}</div>
        <div className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold ${unlocked ? 'bg-[#f5c31c] text-[#725d42]' : 'bg-[#f0ece2] text-[#a89878]'}`} style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
          {unlocked ? '已获得' : '未解锁'}
          {earnedAt ? <span className="ml-2 text-[10px] font-bold opacity-80">{new Date(earnedAt).toLocaleDateString()}</span> : null}
        </div>
      </div>
    </div>
  );
};

export const ChildBadges: React.FC = () => {
  const navigate = useNavigate();
  const [badgeWall, setBadgeWall] = useState<BadgeWallPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.children.getBadges();
      setBadgeWall(response.data ?? null);
    } catch (err: any) {
      console.error('Failed to load badges page data:', err);
      setError(err.message || '加载成就数据失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary: BadgeWallSummary = badgeWall?.summary ?? {
    streakDays: 0,
    totalQuestions: 0,
    averageAccuracy: 0,
    bestAccuracy: 0,
    perfectSessions: 0,
    sessionCount: 0,
    averageSecondsPerQuestion: 0,
    bestSecondsPerQuestion: 0,
    points: 0,
    level: 1,
    badgeCount: 0,
    unlockedCount: 0,
    totalCount: 50,
  };
  const badgeGroups = badgeWall?.groups ?? [];
  const unlockedCount = summary?.unlockedCount ?? 0;
  const encouragement = summary && summary.totalQuestions > 0
    ? '看看你的成长轨迹，每一步都很棒。'
    : '先完成一次练习，成就墙就会慢慢亮起来啦！';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f0] px-4">
        <Card className="flex w-full max-w-md flex-col items-center gap-4 !rounded-[32px] !p-8 text-center">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#f7cd67] border-t-transparent" />
          <p className="text-lg font-bold text-[#794f27]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>正在装饰成就墙...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f8f8f0] px-4 py-8">
        <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
          <Card className="w-full !rounded-[32px] !p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f7cd67]/30 text-3xl text-[#794f27]">
              ⚠️
            </div>
            <h1 className="mb-3 text-3xl font-black text-[#794f27]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
              成就页加载失败
            </h1>
            <p className="mb-6 text-lg font-semibold text-[#8a7b66]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>{error}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button type="primary" onClick={loadData}>
                重新加载
              </Button>
              <Button type="default" onClick={() => navigate('/child/dashboard')}>
                返回主页
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="kmq-responsive-page relative min-h-screen overflow-hidden bg-cover bg-center px-4 py-6 md:px-6 md:py-8"
      style={{ backgroundImage: 'url(/common-bg.png)' }}
    >
      <style>{`
        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes badgeShine {
          0%, 100% { filter: drop-shadow(0 10px 12px rgba(107, 92, 67, 0.18)); }
          50% { filter: drop-shadow(0 14px 18px rgba(107, 92, 67, 0.26)); }
        }
        @keyframes paperEnter {
          0% { opacity: 0; transform: translateY(18px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .badge-float {
          animation: badgeFloat 5s ease-in-out infinite;
        }
        .badge-float svg {
          animation: badgeShine 6s ease-in-out infinite;
        }
        .paper-enter {
          animation: paperEnter 0.55s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <div className="absolute inset-0 bg-[rgb(247,243,223)]/40" />

      <div className="kmq-compact-shell relative mx-auto max-w-[1120px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Button
            type="default"
            size="small"
            onClick={() => navigate('/child/dashboard')}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            返回主页
          </Button>

          <div className="hidden items-center gap-2 rounded-full border-2 border-[#c4b89e] bg-[rgb(247,243,223)] px-4 py-2 text-sm font-bold text-[#8a7b66] shadow-[0_4px_10px_rgba(107,92,67,0.42)] md:flex" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
            <Sparkles className="h-4 w-4 text-[#f5c31c]" />
            已解锁 {unlockedCount} / {summary?.totalCount ?? 0}
          </div>
        </div>

        <div className="mb-3 flex justify-center">
          <Card type="title" className="kmq-compact-panel flex items-center gap-2 border-4 border-[#c4b89e] px-8 py-2.5 text-xl font-black text-[#794f27] shadow-[0_6px_14px_rgba(107,92,67,0.42)]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
            我的成就
            <Sparkles className="h-5 w-5 text-[#6fba2c]" />
          </Card>
        </div>

        <Card className="paper-enter kmq-compact-panel relative overflow-hidden !rounded-[34px] !p-4 shadow-[0_8px_24px_rgba(107,92,67,0.42)] sm:!p-5">
          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-5">
            <aside className="kmq-compact-panel rounded-[28px] border-4 border-[#c4b89e] bg-[rgb(247,243,223)] px-3 py-4 lg:border-r-4 lg:border-[#c4b89e] lg:px-4 lg:py-4">
              <div className="rounded-[24px] border-2 border-[#c4b89e] bg-[rgb(247,243,223)] p-3 shadow-[0_4px_10px_rgba(107,92,67,0.42)]">
                <div className="kmq-compact-title mb-2 text-center text-xl font-black text-[#794f27]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
                  成长记录
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      label: '连续学习',
                      value: `${summary.streakDays}天`,
                      icon: CalendarDays,
                      tone: '#6fba2c',
                    },
                    {
                      label: '累计练习',
                      value: formatCount(summary.totalQuestions),
                      icon: Target,
                      tone: '#f5c31c',
                    },
                    {
                      label: '获得星星',
                      value: summary.points.toLocaleString('zh-CN'),
                      icon: Coins,
                      tone: '#e05a5a',
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <div
                        key={stat.label}
                        className="rounded-[20px] border-2 border-[#c4b89e] bg-[rgb(247,243,223)] px-3 py-3 shadow-[0_3px_0_0_#bdaea0]"
                      >
                        <div className="mb-1.5 flex items-center justify-between text-xs font-black text-[#9f927d]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
                          <span>{stat.label}</span>
                          <Icon className="h-3.5 w-3.5" style={{ color: stat.tone }} />
                        </div>
                        <div className="text-2xl font-black tracking-tight text-[#6e4a27]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
                          {stat.value}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 rounded-[20px] border-2 border-[#c4b89e] bg-[rgb(247,243,223)] px-3 py-2.5 text-center text-xs font-bold text-[#8a7b66] shadow-[0_3px_0_0_#bdaea0]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
                  {badgeWall?.childName ? `${badgeWall.childName}，继续收集更多成就吧！` : '继续收集更多成就吧！'}
                </div>
              </div>
            </aside>

            <main className="kmq-compact-panel relative rounded-[28px] bg-[rgb(247,243,223)] px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-5">
              <div className="mb-3 flex flex-col gap-1.5 text-center lg:text-left">
                <div className="kmq-compact-title text-2xl font-black leading-tight text-[#794f27] sm:text-[30px]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
                  {badgeWall?.childName ? `${badgeWall.childName} 的奖章墙` : '我的奖章墙'}
                </div>
                <div className="kmq-compact-copy text-base font-bold text-[#9f927d] sm:text-lg" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
                  <Typewriter speed={80} autoPlay>
                    {encouragement}
                  </Typewriter>
                </div>
              </div>

              <div className="mb-3 flex items-center justify-center lg:justify-start">
                <div className="kmq-compact-copy rounded-full border-2 border-[#c4b89e] bg-[rgb(247,243,223)] px-3 py-1.5 text-xs font-black text-[#725d42] shadow-[0_3px_0_0_#bdaea0]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
                  统计来自成长数据与练习记录汇总
                </div>
              </div>

              {unlockedCount === 0 && (
                <div className="mb-4 rounded-[24px] border-2 border-[#c4b89e] bg-[rgb(247,243,223)] px-4 py-3 text-center shadow-[0_4px_10px_rgba(107,92,67,0.42)]">
                  <div className="mx-auto mb-2 flex w-fit items-center gap-2 rounded-full bg-[rgb(247,243,223)] px-3 py-1.5 text-xs font-black text-[#8a7b66]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
                    <Sparkles className="h-4 w-4 text-[#f5c31c]" />
                    还没有勋章，先完成一次练习吧！
                  </div>
                  <p className="text-sm font-semibold text-[#8a7b66]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>完成练习后，勋章墙就会慢慢点亮。</p>
                </div>
              )}

              <div className="space-y-4">
                {badgeGroups.map((group) => (
                  <section key={group.key} className="rounded-[24px] border-2 border-[#c4b89e] bg-[rgb(247,243,223)]/45 px-3 py-3 shadow-[0_4px_10px_rgba(107,92,67,0.42)] sm:px-4">
                    <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: group.accent }} />
                        <div>
                          <div className="text-lg font-black text-[#6e4a27]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
                            {group.title}
                          </div>
                          <div className="text-sm font-semibold text-[#9f927d]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>{group.description}</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#b39f7f]" style={{ fontFamily: '"MarukoGothic", "Nunito", sans-serif' }}>
                        {group.badges.filter((badge: BadgeWallEntry) => badge.unlocked).length} / {group.badges.length}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
                      {group.badges.map((badge: BadgeWallEntry, index: number) => (
                        <BadgeMedal
                          key={badge.badgeType}
                          badge={badge}
                          group={group}
                          unlocked={badge.unlocked}
                          earnedAt={badge.earnedAt}
                          index={index}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </main>
          </div>
        </Card>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button type="primary" onClick={() => navigate('/child/dashboard')}>
            返回主页
          </Button>
          <Button type="default" onClick={() => navigate('/child/history')}>
            查看历史
          </Button>
        </div>
      </div>
    </div>
  );
};
