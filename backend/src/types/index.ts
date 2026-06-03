export interface FormulaList {
  min: number;
  max: number;
  operators: number[];
}

export interface PaperConfig {
  step: number;
  formulaList: FormulaList[];
  resultMinValue: number;
  resultMaxValue: number;
  numberOfFormulas: number;
  whereIsResult: number;
  enableBrackets: boolean;
  carry: number;
  abdication: number;
  remainder: number;
  solution: number;
  numberMode?: 'integer' | 'decimal';
  decimalPlaces?: number | null;
}

export type BadgeGroupKey = 'habit' | 'practice' | 'accuracy' | 'speed' | 'growth';

export interface BadgeStats {
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
}

export interface BadgeDefinition {
  badgeType: string;
  groupKey: BadgeGroupKey;
  title: string;
  value: string;
  description: string;
  icon: string;
  sortOrder: number;
  isUnlocked: (stats: BadgeStats) => boolean;
}

export interface BadgeWallEntry {
  badgeType: string;
  groupKey: BadgeGroupKey;
  title: string;
  value: string;
  description: string;
  icon: string;
  unlocked: boolean;
  earnedAt: string | null;
}

export interface BadgeWallGroup {
  key: BadgeGroupKey;
  title: string;
  description: string;
  accent: string;
  accentDark: string;
  badges: BadgeWallEntry[];
}

export interface BadgeWallSummary extends BadgeStats {
  badgeCount: number;
  unlockedCount: number;
  totalCount: number;
}

export interface BadgeWallPayload {
  childName: string;
  summary: BadgeWallSummary;
  groups: BadgeWallGroup[];
}

export interface GeneratedQuestion {
  question: string;
  answer: string;
}

export interface JwtPayload {
  parentId?: string;
  childId?: string;
  username?: string;
  name?: string;
}
