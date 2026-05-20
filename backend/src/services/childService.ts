import prisma from '../config/database';
import { QuestionGeneratorService } from './questionGenerator';
import { PaperConfig } from '../types';
import { AppError } from '../middleware/errorHandler';

const questionGenerator = new QuestionGeneratorService();

export class ChildService {
  async getTodayPractice(childId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 获取孩子配置信息
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        practiceConfigs: {
          where: { isEnabled: true }, // 核心修复：只获取已启用的配置
          include: {
            paperConfigs: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    if (!child || !child.practiceConfigs[0] || !child.practiceConfigs[0].paperConfigs[0]) {
      throw new AppError('No active paper config found', 400);
    }

    const practiceConfig = child.practiceConfigs[0];
    const paperConfig = practiceConfig.paperConfigs[0];

    // 查找今天所有的 session
    const todaySessions = await prisma.practiceSession.findMany({
      where: {
        childId,
        date: {
          gte: today
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        questionInstances: true
      }
    });

    // 如果有未完成的 session，检查其对应的 paperConfig 是否仍然 active 且版本匹配
    const pendingSession = todaySessions.find(s => s.status !== 'completed');
    if (pendingSession) {
      // 检查 session 的 paperConfig 是否仍然 active
      const sessionPaperConfig = await prisma.paperConfig.findUnique({
        where: { id: pendingSession.paperConfigId }
      });
      
      if (!sessionPaperConfig || !sessionPaperConfig.isActive) {
        // paperConfig 已被停用，不返回这个 session，继续创建新的
      } else if (pendingSession.configVersion !== practiceConfig.version) {
        // 配置版本不匹配（家长更新了配置），废弃旧 session，创建新的
        console.log('Config version mismatch, creating new session');
      } else {
        return pendingSession;
      }
    }

    // 检查今日已完成次数是否达到限制
    const completedCount = todaySessions.filter(s => s.status === 'completed').length;
    if (completedCount >= practiceConfig.dailyFrequency) {
      // 返回一个标记表示今日已完成
      return {
        id: 'done',
        childId,
        status: 'daily_limit_reached',
        completedCount,
        dailyFrequency: practiceConfig.dailyFrequency,
        date: new Date(),
        paperConfigId: paperConfig.id,
        configVersion: practiceConfig.version,
        targetCount: 0,
        completedCount_actual: 0,
        correctCount: 0,
        accuracy: 0,
        totalTime: 0,
        pointsEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        questionInstances: []
      } as any;
    }

    // 创建新 session
    const createdSession = await prisma.practiceSession.create({
      data: {
        childId,
        paperConfigId: paperConfig.id,
        configVersion: practiceConfig.version,
        targetCount: paperConfig.numberOfFormulas,
        status: 'pending'
      }
    });

    return await prisma.practiceSession.findUnique({
      where: { id: createdSession.id },
      include: { questionInstances: true }
    });
  }

  async startPractice(sessionId: string, childId: string) {
    console.log('Starting practice for session:', sessionId, 'child:', childId);

    const session = await prisma.practiceSession.findFirst({
      where: {
        id: sessionId,
        childId
      },
      include: {
        paperConfig: true,
        questionInstances: true
      }
    });

    if (!session) {
      console.error('Session not found:', sessionId);
      throw new AppError('Session not found', 404);
    }

    if (!session.paperConfig) {
      console.error('Paper config not found for session:', sessionId);
      throw new AppError('Paper config not found for this session', 404);
    }

    console.log('Session found with paperConfig:', session.paperConfig.id);

    if (session.questionInstances && session.questionInstances.length > 0) {
      console.log('Session already has questions:', session.questionInstances.length);
      return session;
    }

    console.log('Generating questions for session...');

    try {
      let formulaList;
      try {
        formulaList = JSON.parse(session.paperConfig.formulaList);
      } catch (e) {
        console.error('Failed to parse formulaList:', session.paperConfig.formulaList);
        throw new AppError('Invalid formulaList configuration', 400);
      }

      console.log('Parsed formulaList:', formulaList);

      const config: PaperConfig = {
        step: session.paperConfig.step,
        formulaList: formulaList,
        resultMinValue: session.paperConfig.resultMinValue,
        resultMaxValue: session.paperConfig.resultMaxValue,
        numberOfFormulas: session.paperConfig.numberOfFormulas,
        whereIsResult: session.paperConfig.whereIsResult,
        enableBrackets: session.paperConfig.enableBrackets,
        carry: session.paperConfig.carry,
        abdication: session.paperConfig.abdication,
        remainder: session.paperConfig.remainder,
        solution: session.paperConfig.solution
      };

      console.log('Config:', config);

      const questions = questionGenerator.generateQuestions(config);

      console.log('Generated questions:', questions.length);

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        console.error('Failed to generate questions');
        throw new AppError('Failed to generate questions', 500);
      }

      for (let i = 0; i < questions.length; i++) {
        await prisma.questionInstance.create({
          data: {
            practiceSessionId: sessionId,
            questionText: questions[i].question,
            correctAnswer: questions[i].answer,
            questionType: 'calculation',
            orderIndex: i
          }
        });
      }

      // 自动创建一份 PaperRecord，让家长在“历史试卷”中能看到
      await prisma.paperRecord.create({
        data: {
          childId,
          configSnapshot: JSON.stringify(session.paperConfig), // 保存完整的 paperConfig，包含显示所需的字段
          questions: JSON.stringify(questions.map(q => q.question)),
          status: 'practiced'
        }
      });

      await prisma.practiceSession.update({
        where: { id: sessionId },
        data: {
          status: 'in_progress'
        }
      });

      console.log('Practice started successfully');
    } catch (error) {
      console.error('Error in startPractice:', error);
      throw error;
    }

    return await prisma.practiceSession.findUnique({
      where: { id: sessionId },
      include: {
        questionInstances: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
  }

  async submitAnswer(sessionId: string, childId: string, questionInstanceId: string, userAnswer: string, timeSpent?: number) {
    const session = await prisma.practiceSession.findFirst({
      where: {
        id: sessionId,
        childId
      }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const question = await prisma.questionInstance.findUnique({
      where: { id: questionInstanceId }
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    const isCorrect = userAnswer === question.correctAnswer;

    await prisma.questionAttempt.create({
      data: {
        questionInstanceId,
        userAnswer,
        isCorrect,
        timeSpent
      }
    });

    // 实时更新 session 的进度
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        completedCount: {
          increment: 1
        },
        correctCount: {
          increment: isCorrect ? 1 : 0
        }
      }
    });

    return {
      isCorrect,
      correctAnswer: question.correctAnswer
    };
  }

  async completePractice(sessionId: string, childId: string) {
    const session = await prisma.practiceSession.findFirst({
      where: {
        id: sessionId,
        childId
      },
      include: {
        questionInstances: {
          include: {
            questionAttempts: true
          }
        }
      }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const totalQuestions = session.questionInstances.length;
    let correctCount = 0;
    let totalTime = 0;

    for (const question of session.questionInstances) {
      const latestAttempt = question.questionAttempts[question.questionAttempts.length - 1];
      if (latestAttempt && latestAttempt.isCorrect) {
        correctCount++;
      }
      if (latestAttempt && latestAttempt.timeSpent) {
        totalTime += latestAttempt.timeSpent;
      }
    }

    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const basePoints = 10;
    const perfectBonus = accuracy === 100 ? 5 : 0;
    const pointsEarned = basePoints + perfectBonus;

    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completedCount: totalQuestions,
        correctCount,
        accuracy,
        totalTime,
        pointsEarned,
        completedAt: new Date()
      }
    });

    // 正确的连续打卡逻辑
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 检查今天是否已经完成过练习
    const todayCompleted = await prisma.practiceSession.findFirst({
      where: {
        childId,
        status: 'completed',
        completedAt: {
          gte: today
        }
      }
    });

    // 检查昨天是否完成过练习
    const yesterdayCompleted = await prisma.practiceSession.findFirst({
      where: {
        childId,
        status: 'completed',
        completedAt: {
          gte: yesterday,
          lt: today
        }
      }
    });

    let newStreakDays = 1;
    if (todayCompleted) {
      // 今天已经完成过，保持当前连续天数
      const child = await prisma.child.findUnique({ where: { id: childId } });
      newStreakDays = child?.streakDays ?? 1;
    } else if (yesterdayCompleted) {
      // 今天第一次完成，且昨天完成过，连续天数+1
      const child = await prisma.child.findUnique({ where: { id: childId } });
      newStreakDays = (child?.streakDays ?? 0) + 1;
    } else {
      // 今天第一次完成，且昨天没完成过，重置为1
      newStreakDays = 1;
    }

    await prisma.child.update({
      where: { id: childId },
      data: {
        points: {
          increment: pointsEarned
        },
        streakDays: newStreakDays
      }
    });

    const child = await prisma.child.findUnique({ where: { id: childId } });
    let newLevel = child?.level || 1;
    
    const levelThresholds = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500];
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (child && child.points >= levelThresholds[i]) {
        newLevel = i + 1;
        break;
      }
    }

    if (child && newLevel > child.level) {
      await prisma.child.update({
        where: { id: childId },
        data: { level: newLevel }
      });
    }

    return {
      accuracy,
      pointsEarned,
      newLevel
    };
  }

  async getWrongQuestions(childId: string) {
    const attempts = await prisma.questionAttempt.findMany({
      where: {
        isCorrect: false
      },
      include: {
        questionInstance: {
          include: {
            practiceSession: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 20
    });

    return attempts.filter((a: any) => a.questionInstance.practiceSession.childId === childId);
  }

  async getBadges(childId: string) {
    return await prisma.badge.findMany({
      where: { childId },
      orderBy: { earnedAt: 'desc' }
    });
  }

  async getHistory(childId: string) {
    return await prisma.practiceSession.findMany({
      where: {
        childId,
        status: 'completed'
      },
      orderBy: {
        date: 'desc'
      },
      take: 30
    });
  }

  async getHistoryDetail(sessionId: string, childId: string) {
    const session = await prisma.practiceSession.findFirst({
      where: {
        id: sessionId,
        childId
      },
      include: {
        questionInstances: {
          include: {
            questionAttempts: {
              orderBy: {
                submittedAt: 'desc'
              },
              take: 1
            }
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    return session;
  }

  async getProfile(childId: string) {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        badges: true
      }
    });

    if (!child) {
      throw new AppError('Child not found', 404);
    }

    return {
      id: child.id,
      name: child.name,
      avatarUrl: child.avatarUrl,
      grade: child.grade,
      points: child.points,
      level: child.level,
      streakDays: child.streakDays,
      badges: child.badges
    };
  }
}
