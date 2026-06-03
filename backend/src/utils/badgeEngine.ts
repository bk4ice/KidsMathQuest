import { BadgeDefinition, BadgeGroupKey, BadgeStats, BadgeWallEntry, BadgeWallGroup, BadgeWallPayload, BadgeWallSummary } from '../types';

export type EarnedBadge = {
  badgeType: string;
  earnedAt: Date;
};

export type BadgeGroupMeta = {
  key: BadgeGroupKey;
  title: string;
  description: string;
  accent: string;
  accentDark: string;
};

export const BADGE_GROUPS: BadgeGroupMeta[] = [
  {
    key: 'habit',
    title: '学习习惯',
    description: '把学习变成每天都能完成的小习惯。',
    accent: '#6cab4f',
    accentDark: '#4f8d31'
  },
  {
    key: 'practice',
    title: '累计练习',
    description: '记录孩子一步一步积累下来的努力。',
    accent: '#e57f62',
    accentDark: '#c85a42'
  },
  {
    key: 'accuracy',
    title: '正确率表现',
    description: '鼓励孩子越做越准，找到自己的节奏。',
    accent: '#f0c54b',
    accentDark: '#d89d19'
  },
  {
    key: 'speed',
    title: '速度效率',
    description: '奖励更快、更稳、更专注的答题节奏。',
    accent: '#78a8eb',
    accentDark: '#5b87d6'
  },
  {
    key: 'growth',
    title: '综合成长',
    description: '让坚持、准确和积累一起发光。',
    accent: '#c38e62',
    accentDark: '#9b6c45'
  }
];

const ICONS: Record<string, string> = {
  sprout: 'sprout',
  leaf: 'leaf',
  tree: 'tree',
  lantern: 'lantern',
  fruit: 'fruit',
  shell: 'shell',
  boat: 'boat',
  map: 'map',
  target: 'target',
  star: 'star',
  sparkles: 'sparkles',
  moon: 'moon',
  house: 'house',
  flag: 'flag',
  crown: 'crown',
  gem: 'gem',
  flower: 'flower',
  compass: 'compass',
  island: 'island'
};

const makeBadge = (
  badgeType: string,
  groupKey: BadgeGroupKey,
  title: string,
  value: string,
  description: string,
  icon: keyof typeof ICONS,
  sortOrder: number,
  isUnlocked: (stats: BadgeStats) => boolean
): BadgeDefinition => ({
  badgeType,
  groupKey,
  title,
  value,
  description,
  icon: ICONS[icon],
  sortOrder,
  isUnlocked
});

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  makeBadge('habit-01', 'habit', '初到岛上', '1天', '连续学习 1 天', 'sprout', 1, (s) => s.streakDays >= 1),
  makeBadge('habit-02', 'habit', '晨露小芽', '3天', '连续学习 3 天', 'sprout', 2, (s) => s.streakDays >= 3),
  makeBadge('habit-03', 'habit', '椰风连线', '5天', '连续学习 5 天', 'leaf', 3, (s) => s.streakDays >= 5),
  makeBadge('habit-04', 'habit', '岛风嫩叶', '7天', '连续学习 7 天', 'leaf', 4, (s) => s.streakDays >= 7),
  makeBadge('habit-05', 'habit', '海湾守约', '10天', '连续学习 10 天', 'tree', 5, (s) => s.streakDays >= 10),
  makeBadge('habit-06', 'habit', '树屋学徒', '14天', '连续学习 14 天', 'tree', 6, (s) => s.streakDays >= 14),
  makeBadge('habit-07', 'habit', '潮汐同伴', '21天', '连续学习 21 天', 'lantern', 7, (s) => s.streakDays >= 21),
  makeBadge('habit-08', 'habit', '林间守望者', '30天', '连续学习 30 天', 'lantern', 8, (s) => s.streakDays >= 30),
  makeBadge('habit-09', 'habit', '星灯旅人', '45天', '连续学习 45 天', 'moon', 9, (s) => s.streakDays >= 45),
  makeBadge('habit-10', 'habit', '岛屿习惯家', '60天', '连续学习 60 天', 'moon', 10, (s) => s.streakDays >= 60),

  makeBadge('practice-01', 'practice', '第一盒彩笔', '10题', '累计完成 10 题', 'fruit', 1, (s) => s.totalQuestions >= 10),
  makeBadge('practice-02', 'practice', '海边拾贝', '20题', '累计完成 20 题', 'shell', 2, (s) => s.totalQuestions >= 20),
  makeBadge('practice-03', 'practice', '题海启航', '50题', '累计完成 50 题', 'boat', 3, (s) => s.totalQuestions >= 50),
  makeBadge('practice-04', 'practice', '灯塔航线', '100题', '累计完成 100 题', 'boat', 4, (s) => s.totalQuestions >= 100),
  makeBadge('practice-05', 'practice', '岛屿探索者', '200题', '累计完成 200 题', 'map', 5, (s) => s.totalQuestions >= 200),
  makeBadge('practice-06', 'practice', '木桥工坊', '300题', '累计完成 300 题', 'map', 6, (s) => s.totalQuestions >= 300),
  makeBadge('practice-07', 'practice', '贝壳仓库', '500题', '累计完成 500 题', 'star', 7, (s) => s.totalQuestions >= 500),
  makeBadge('practice-08', 'practice', '星空远航', '800题', '累计完成 800 题', 'star', 8, (s) => s.totalQuestions >= 800),
  makeBadge('practice-09', 'practice', '彩虹图鉴', '1200题', '累计完成 1200 题', 'sparkles', 9, (s) => s.totalQuestions >= 1200),
  makeBadge('practice-10', 'practice', '全岛总动员', '2000题', '累计完成 2000 题', 'sparkles', 10, (s) => s.totalQuestions >= 2000),

  makeBadge('accuracy-01', 'accuracy', '稳稳上岸', '60%', '至少完成 3 场练习，平均正确率达到 60%', 'target', 1, (s) => s.sessionCount >= 3 && s.averageAccuracy >= 60),
  makeBadge('accuracy-02', 'accuracy', '海风及格', '70%', '至少完成 5 场练习，平均正确率达到 70%', 'target', 2, (s) => s.sessionCount >= 5 && s.averageAccuracy >= 70),
  makeBadge('accuracy-03', 'accuracy', '认真伙伴', '75%', '至少完成 8 场练习，平均正确率达到 75%', 'shell', 3, (s) => s.sessionCount >= 8 && s.averageAccuracy >= 75),
  makeBadge('accuracy-04', 'accuracy', '准确航线', '80%', '至少完成 10 场练习，平均正确率达到 80%', 'shell', 4, (s) => s.sessionCount >= 10 && s.averageAccuracy >= 80),
  makeBadge('accuracy-05', 'accuracy', '命中珊瑚', '85%', '至少完成 12 场练习，平均正确率达到 85%', 'sparkles', 5, (s) => s.sessionCount >= 12 && s.averageAccuracy >= 85),
  makeBadge('accuracy-06', 'accuracy', '星轨准线', '90%', '至少完成 15 场练习，平均正确率达到 90%', 'sparkles', 6, (s) => s.sessionCount >= 15 && s.averageAccuracy >= 90),
  makeBadge('accuracy-07', 'accuracy', '星砂闪耀', '95%', '至少完成 20 场练习，平均正确率达到 95%', 'moon', 7, (s) => s.sessionCount >= 20 && s.averageAccuracy >= 95),
  makeBadge('accuracy-08', 'accuracy', '首次满分', '1次', '至少完成 3 场练习，并拿到 1 次满分', 'moon', 8, (s) => s.sessionCount >= 3 && s.perfectSessions >= 1),
  makeBadge('accuracy-09', 'accuracy', '满分收藏家', '5次', '至少完成 5 场练习，并拿到 5 次满分', 'crown', 9, (s) => s.sessionCount >= 5 && s.perfectSessions >= 5),
  makeBadge('accuracy-10', 'accuracy', '满分殿堂', '10次', '至少完成 10 场练习，并拿到 10 次满分', 'crown', 10, (s) => s.sessionCount >= 10 && s.perfectSessions >= 10),

  makeBadge('speed-01', 'speed', '轻快起航', '45秒/题', '平均每题用时不超过 45 秒，且至少完成 3 场练习', 'compass', 1, (s) => s.sessionCount >= 3 && s.averageSecondsPerQuestion > 0 && s.averageSecondsPerQuestion <= 45),
  makeBadge('speed-02', 'speed', '风铃答题', '35秒/题', '平均每题用时不超过 35 秒，且至少完成 5 场练习', 'compass', 2, (s) => s.sessionCount >= 5 && s.averageSecondsPerQuestion > 0 && s.averageSecondsPerQuestion <= 35),
  makeBadge('speed-03', 'speed', '海鸟飞行', '30秒/题', '平均每题用时不超过 30 秒，且至少完成 8 场练习', 'flag', 3, (s) => s.sessionCount >= 8 && s.averageSecondsPerQuestion > 0 && s.averageSecondsPerQuestion <= 30),
  makeBadge('speed-04', 'speed', '珊瑚快线', '25秒/题', '平均每题用时不超过 25 秒，且至少完成 10 场练习', 'flag', 4, (s) => s.sessionCount >= 10 && s.averageSecondsPerQuestion > 0 && s.averageSecondsPerQuestion <= 25),
  makeBadge('speed-05', 'speed', '航海速答', '20秒/题', '平均每题用时不超过 20 秒，且至少完成 12 场练习', 'gem', 5, (s) => s.sessionCount >= 12 && s.averageSecondsPerQuestion > 0 && s.averageSecondsPerQuestion <= 20),
  makeBadge('speed-06', 'speed', '闪电手指', '15秒/题', '平均每题用时不超过 15 秒，且至少完成 15 场练习', 'gem', 6, (s) => s.sessionCount >= 15 && s.averageSecondsPerQuestion > 0 && s.averageSecondsPerQuestion <= 15),
  makeBadge('speed-07', 'speed', '追风小队', '18秒/题', '单场最佳速度不高于 18 秒/题，且至少完成 5 场练习', 'house', 7, (s) => s.sessionCount >= 5 && s.bestSecondsPerQuestion > 0 && s.bestSecondsPerQuestion <= 18),
  makeBadge('speed-08', 'speed', '海鸥冲刺', '15秒/题', '单场最佳速度不高于 15 秒/题，且至少完成 8 场练习', 'house', 8, (s) => s.sessionCount >= 8 && s.bestSecondsPerQuestion > 0 && s.bestSecondsPerQuestion <= 15),
  makeBadge('speed-09', 'speed', '星光急行', '12秒/题', '单场最佳速度不高于 12 秒/题，且至少完成 10 场练习', 'lantern', 9, (s) => s.sessionCount >= 10 && s.bestSecondsPerQuestion > 0 && s.bestSecondsPerQuestion <= 12),
  makeBadge('speed-10', 'speed', '岛主极速', '10秒/题', '单场最佳速度不高于 10 秒/题，且至少完成 15 场练习', 'lantern', 10, (s) => s.sessionCount >= 15 && s.bestSecondsPerQuestion > 0 && s.bestSecondsPerQuestion <= 10),

  makeBadge('growth-01', 'growth', '风和小苗', '平衡', '连续学习 7 天且正确率达到 80%', 'flower', 1, (s) => s.streakDays >= 7 && s.averageAccuracy >= 80),
  makeBadge('growth-02', 'growth', '贝壳航线', '稳定', '累计完成 50 题且正确率达到 85%', 'compass', 2, (s) => s.totalQuestions >= 50 && s.averageAccuracy >= 85),
  makeBadge('growth-03', 'growth', '树屋养成', '成长', '连续学习 14 天且累计完成 100 题', 'tree', 3, (s) => s.streakDays >= 14 && s.totalQuestions >= 100),
  makeBadge('growth-04', 'growth', '岛民学徒', '启程', '达到 2 级且至少获得过 1 次满分', 'house', 4, (s) => s.level >= 2 && s.perfectSessions >= 1),
  makeBadge('growth-05', 'growth', '工匠岛民', '精进', '达到 4 级且连续学习 14 天', 'crown', 5, (s) => s.level >= 4 && s.streakDays >= 14),
  makeBadge('growth-06', 'growth', '稳稳领航', '可靠', '累计完成 200 题且正确率达到 90%', 'map', 6, (s) => s.totalQuestions >= 200 && s.averageAccuracy >= 90),
  makeBadge('growth-07', 'growth', '纯净星光', '耀眼', '至少获得过 3 次满分且正确率达到 85%', 'sparkles', 7, (s) => s.perfectSessions >= 3 && s.averageAccuracy >= 85),
  makeBadge('growth-08', 'growth', '星光领航员', '进阶', '达到 6 级、累计完成 300 题且正确率达到 90%', 'gem', 8, (s) => s.level >= 6 && s.totalQuestions >= 300 && s.averageAccuracy >= 90),
  makeBadge('growth-09', 'growth', '潮汐大师', '专注', '连续学习 30 天且正确率达到 95%', 'moon', 9, (s) => s.streakDays >= 30 && s.averageAccuracy >= 95),
  makeBadge('growth-10', 'growth', '传奇岛主', '终章', '累计完成 500 题、至少 10 次满分且达到 8 级', 'island', 10, (s) => s.totalQuestions >= 500 && s.perfectSessions >= 10 && s.level >= 8)
];

export function calculateBadgeStats(params: {
  streakDays: number;
  points: number;
  level: number;
  sessions: Array<{
    completedCount: number;
    correctCount: number;
    accuracy: number | null;
    totalTime: number | null;
  }>;
}): BadgeStats {
  const completedSessions = params.sessions.filter((session) => session.completedCount > 0);
  const totalQuestions = completedSessions.reduce((sum, session) => sum + Number(session.completedCount || 0), 0);
  const totalCorrect = completedSessions.reduce((sum, session) => sum + Number(session.correctCount || 0), 0);
  const totalTime = completedSessions.reduce((sum, session) => sum + Number(session.totalTime || 0), 0);
  const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  const bestAccuracy = completedSessions.reduce((max, session) => Math.max(max, Number(session.accuracy ?? 0)), 0);
  const perfectSessions = completedSessions.filter((session) => Number(session.accuracy ?? 0) >= 100).length;
  const averageSecondsPerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;
  const bestSecondsPerQuestion = completedSessions.reduce((min, session) => {
    if (session.completedCount <= 0 || !session.totalTime) {
      return min;
    }

    const perQuestion = session.totalTime / session.completedCount;
    return Math.min(min, perQuestion);
  }, Number.POSITIVE_INFINITY);

  return {
    streakDays: params.streakDays,
    totalQuestions,
    averageAccuracy,
    bestAccuracy,
    perfectSessions,
    sessionCount: completedSessions.length,
    averageSecondsPerQuestion,
    bestSecondsPerQuestion: Number.isFinite(bestSecondsPerQuestion) ? bestSecondsPerQuestion : 0,
    points: params.points,
    level: params.level
  };
}

export function getUnlockedBadgeDefinitions(stats: BadgeStats): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter((definition) => definition.isUnlocked(stats));
}

export function buildBadgeWall(
  childName: string,
  stats: BadgeStats,
  earnedBadges: EarnedBadge[]
): BadgeWallPayload {
  const earnedByType = new Map(earnedBadges.map((badge) => [badge.badgeType, badge.earnedAt] as const));
  const unlockedDefinitions = getUnlockedBadgeDefinitions(stats);
  const unlockedTypes = new Set(unlockedDefinitions.map((definition) => definition.badgeType));

  const groups: BadgeWallGroup[] = BADGE_GROUPS.map((group) => ({
    ...group,
    badges: BADGE_DEFINITIONS
      .filter((definition) => definition.groupKey === group.key)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map<BadgeWallEntry>((definition) => ({
        badgeType: definition.badgeType,
        groupKey: definition.groupKey,
        title: definition.title,
        value: definition.value,
        description: definition.description,
        icon: definition.icon,
        unlocked: unlockedTypes.has(definition.badgeType),
        earnedAt: earnedByType.get(definition.badgeType)?.toISOString() ?? null
      }))
  }));

  const summary: BadgeWallSummary = {
    ...stats,
    badgeCount: earnedBadges.length,
    unlockedCount: unlockedDefinitions.length,
    totalCount: BADGE_DEFINITIONS.length
  };

  return {
    childName,
    summary,
    groups
  };
}

export function getEarnedBadgeInsertions(stats: BadgeStats, earnedBadges: EarnedBadge[]) {
  const earnedTypeSet = new Set(earnedBadges.map((badge) => badge.badgeType));

  return getUnlockedBadgeDefinitions(stats)
    .filter((definition) => !earnedTypeSet.has(definition.badgeType))
    .map((definition) => ({
      badgeType: definition.badgeType,
      badgeName: definition.title,
      badgeTypeLabel: definition.badgeType
    }));
}
