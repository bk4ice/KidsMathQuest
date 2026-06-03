import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

function normalizePaperConfigMode(configData: any) {
  const numberMode = configData.numberMode === 'decimal' ? 'decimal' : 'integer';
  return {
    ...configData,
    numberMode,
    decimalPlaces: numberMode === 'decimal' ? Number(configData.decimalPlaces ?? 2) : null
  };
}

export class ParentService {
  async getChildren(parentId: string) {
    return await prisma.child.findMany({
      where: { parentId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addChild(parentId: string, data: {
    name: string;
    grade: number;
    password: string;
    avatarUrl?: string;
  }) {
    console.log('addChild received data:', data);
    console.log('avatarUrl value:', data.avatarUrl);
    return await prisma.child.create({
      data: {
        parentId,
        ...data
      }
    });
  }

  async updateChild(childId: string, parentId: string, data: any) {
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId }
    });

    if (!child) {
      throw new AppError('Child not found', 404);
    }

    return await prisma.child.update({
      where: { id: childId },
      data
    });
  }

  async deleteChild(childId: string, parentId: string) {
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId }
    });

    if (!child) {
      throw new AppError('Child not found', 404);
    }

    await prisma.child.delete({
      where: { id: childId }
    });
  }

  async getChildStats(childId: string, parentId: string) {
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId }
    });

    if (!child) {
      throw new AppError('Child not found', 404);
    }

    const sessions = await prisma.practiceSession.findMany({
      where: { childId, status: 'completed' },
      orderBy: { date: 'desc' },
      take: 30
    });

    const totalSessions = sessions.length;
    const totalQuestions = sessions.reduce((sum: number, s: any) => sum + s.targetCount, 0);
    const totalCorrect = sessions.reduce((sum: number, s: any) => sum + s.correctCount, 0);
    const avgAccuracy = totalSessions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    return {
      totalSessions,
      totalQuestions,
      totalCorrect,
      avgAccuracy: Math.round(avgAccuracy * 100) / 100,
      recentSessions: sessions
    };
  }

  async getPaperConfigs(childId: string, parentId: string) {
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId },
      include: {
        practiceConfigs: {
          include: {
            paperConfigs: true
          }
        }
      }
    });

    if (!child) {
      throw new AppError('Child not found', 404);
    }

    return child.practiceConfigs[0]?.paperConfigs || [];
  }

  async addPaperConfig(childId: string, parentId: string, configData: any) {
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId },
      include: {
        practiceConfigs: {
          include: {
            paperConfigs: true
          }
        }
      }
    });

    if (!child) {
      throw new AppError('Child not found', 404);
    }

    let practiceConfig = child.practiceConfigs[0];
    if (!practiceConfig) {
      const newPracticeConfig = await prisma.practiceConfig.create({
        data: { childId }
      });
      practiceConfig = await prisma.practiceConfig.findUnique({
        where: { id: newPracticeConfig.id },
        include: { paperConfigs: true }
      }) as any;
    }

    // 创建新配置，同时将其他所有配置设为非活跃
    await prisma.paperConfig.updateMany({
      where: { practiceConfigId: practiceConfig.id },
      data: { isActive: false }
    });

    const newConfig = await prisma.paperConfig.create({
      data: {
        practiceConfigId: practiceConfig.id,
        ...normalizePaperConfigMode(configData),
        isDefault: false,
        isActive: true
      }
    });

    return newConfig;
  }

  async resetPaperConfig(childId: string, parentId: string) {
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId },
      include: {
        practiceConfigs: {
          include: {
            paperConfigs: true
          }
        }
      }
    });

    if (!child) {
      throw new AppError('Child not found', 404);
    }

    let practiceConfig = child.practiceConfigs[0];
    if (!practiceConfig) {
      const newConfig = await prisma.practiceConfig.create({
        data: {
          childId
        }
      });
      practiceConfig = await prisma.practiceConfig.findUnique({
        where: { id: newConfig.id },
        include: {
          paperConfigs: true
        }
      }) as any;
    }

    const defaultConfig = {
      configName: '默认',
      step: 1,
      formulaList: JSON.stringify([
        { min: 1, max: 9, operators: null },
        { min: 1, max: 9, operators: [1] }
      ]),
      resultMinValue: 1,
      resultMaxValue: 9,
      numberOfFormulas: 30,
      whereIsResult: 0,
      enableBrackets: false,
      carry: 1,
      abdication: 1,
      remainder: 2,
      solution: 0,
      numberOfPapers: 3,
      numberOfPagerColumns: 3,
      paperTitle: '小学生口算题',
      paperSubTitle: '姓名：__________ 日期：____月____日 时间：________ 对题：____道',
      fileNameGeneratedRule: 'title',
      generateMode: 1,
      numberMode: 'integer',
      decimalPlaces: null,
      isDefault: true,
      isActive: true
    };

    const existingDefault = practiceConfig.paperConfigs.find((c: any) => c.isDefault);
    if (existingDefault) {
      await prisma.paperConfig.update({
        where: { id: existingDefault.id },
        data: defaultConfig
      });
      return existingDefault;
    }

    return await prisma.paperConfig.create({
      data: {
        practiceConfigId: practiceConfig.id,
        ...defaultConfig
      }
    });
  }

  async updatePaperConfig(configId: string, parentId: string, configData: any) {
    const config = await prisma.paperConfig.findFirst({
      where: { id: configId },
      include: {
        practiceConfig: {
          include: {
            child: true
          }
        }
      }
    });

    if (!config || config.practiceConfig.child.parentId !== parentId) {
      throw new AppError('Config not found', 404);
    }

    // 更新配置时保持 isActive 和 isDefault 状态
    const updatedConfig = await prisma.paperConfig.update({
      where: { id: configId },
      data: {
        ...normalizePaperConfigMode(configData),
        isActive: true,
        isDefault: config.isDefault
      }
    });

    // 更新 practiceConfig 的版本，使旧 session 失效
    await prisma.practiceConfig.update({
      where: { id: config.practiceConfigId },
      data: { version: config.practiceConfig.version + 1 }
    });

    return updatedConfig;
  }

  async deletePaperConfig(configId: string, parentId: string) {
    const config = await prisma.paperConfig.findFirst({
      where: { id: configId },
      include: {
        practiceConfig: {
          include: {
            child: true
          }
        },
        practiceSessions: {
          include: {
            questionInstances: {
              include: {
                questionAttempts: true
              }
            }
          }
        }
      }
    });

    if (!config || config.practiceConfig.child.parentId !== parentId) {
      throw new AppError('Config not found', 404);
    }

    // 级联删除相关的 practice session 及其关联数据
    if (config.practiceSessions && config.practiceSessions.length > 0) {
      for (const session of config.practiceSessions) {
        // 删除 question attempts
        await prisma.questionAttempt.deleteMany({
          where: { questionInstanceId: { in: session.questionInstances.map(qi => qi.id) } }
        });
        // 删除 question instances
        await prisma.questionInstance.deleteMany({
          where: { practiceSessionId: session.id }
        });
      }
      // 删除 practice sessions
      await prisma.practiceSession.deleteMany({
        where: { paperConfigId: configId }
      });
    }

    await prisma.paperConfig.delete({
      where: { id: configId }
    });
  }

  async setActivePaperConfig(configId: string, parentId: string) {
    const config = await prisma.paperConfig.findFirst({
      where: { id: configId },
      include: {
        practiceConfig: {
          include: {
            child: true
          }
        }
      }
    });

    if (!config || config.practiceConfig.child.parentId !== parentId) {
      throw new AppError('Config not found', 404);
    }

    await prisma.paperConfig.updateMany({
      where: { practiceConfigId: config.practiceConfigId },
      data: { isActive: false }
    });

    return await prisma.paperConfig.update({
      where: { id: configId },
      data: { isActive: true }
    });
  }

  async generatePaper(childId: string, parentId: string, configId: string, paperList?: any[]) {
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId },
      include: {
        practiceConfigs: {
          include: {
            paperConfigs: true
          }
        }
      }
    });

    if (!child) {
      throw new AppError('Child not found', 404);
    }

    const config = await prisma.paperConfig.findFirst({
      where: { id: configId }
    });

    if (!config) {
      throw new AppError('Config not found', 404);
    }

    const configWithDecimal = config as typeof config & {
      numberMode?: 'integer' | 'decimal';
      decimalPlaces?: number | null;
    };

    // 参考 PrimarySchoolMathematics 的逻辑，支持 paperList（多个题型组合）
    const formulaList = JSON.parse(config.formulaList);
    const customFormulaList = config.customFormulaList ? JSON.parse(config.customFormulaList) : null;

    let papersQuestions: string[][] = [];

    const numPapers = config.numberOfPapers || 1;

    // 优先使用请求中提供的 paperList，如果没有则从数据库中的 paperListData 恢复，最后才回退到基础配置
    let effectivePaperList = paperList;
    
    if (!effectivePaperList || effectivePaperList.length === 0) {
      if (config.paperListData) {
        try {
          effectivePaperList = JSON.parse(config.paperListData);
          console.log('Using saved paperListData for paper generation');
        } catch (e) {
          console.error('Failed to parse paperListData:', e);
        }
      }
    }

    if (!effectivePaperList || effectivePaperList.length === 0) {
      console.log('Using fallback config for paper generation');
      effectivePaperList = [{
        step: config.step,
        numberOfFormulas: config.numberOfFormulas,
        whereIsResult: config.whereIsResult,
        formulaList: formulaList,
        resultMinValue: config.resultMinValue,
        resultMaxValue: config.resultMaxValue,
        numberMode: configWithDecimal.numberMode,
        decimalPlaces: configWithDecimal.decimalPlaces,
        customFormulaList: customFormulaList
      }];
    }

    console.log('Generating paper with', effectivePaperList.length, 'config(s)');

    for (let p = 0; p < numPapers; p++) {
      let questions: string[] = [];

      // 遍历 paperList 中的每个题型配置
      for (const paperConfig of effectivePaperList) {
        const paperNumberMode = paperConfig.numberMode === 'decimal'
          ? 'decimal'
          : paperConfig.numberMode === 'integer'
            ? 'integer'
            : configWithDecimal.numberMode === 'decimal'
              ? 'decimal'
              : 'integer';
        const paperDecimalPlaces = paperNumberMode === 'decimal'
          ? (typeof paperConfig.decimalPlaces === 'number' ? paperConfig.decimalPlaces : configWithDecimal.decimalPlaces ?? 2)
          : null;

        console.log('Processing config item:', {
          mode: paperConfig.customFormulaList ? 'manual' : 'auto',
          count: paperConfig.numberOfFormulas || (paperConfig.customFormulaList?.length),
          numberMode: paperNumberMode,
          decimalPlaces: paperDecimalPlaces
        });
        
        if (paperConfig.customFormulaList) {
          // 手动添加模式：直接使用 customFormulaList
          const customQuestions = paperConfig.customFormulaList.map((item: any) => item.formula);
          questions.push(...customQuestions);
        } else {
          // 自动生成模式：使用 QuestionGeneratorService 生成题目
          const { QuestionGeneratorService } = await import('./questionGenerator');
          const generator = new QuestionGeneratorService();
          const generatedQuestions = generator.generateQuestions({
            step: paperConfig.step,
            formulaList: paperConfig.formulaList,
            resultMinValue: paperConfig.resultMinValue,
            resultMaxValue: paperConfig.resultMaxValue,
            numberOfFormulas: paperConfig.numberOfFormulas,
            whereIsResult: paperConfig.whereIsResult,
            enableBrackets: config.enableBrackets,
            carry: config.carry,
            abdication: config.abdication,
            remainder: config.remainder,
            solution: config.solution,
            numberMode: paperNumberMode,
            decimalPlaces: paperDecimalPlaces
          });
          
          if (generatedQuestions.length < paperConfig.numberOfFormulas) {
             console.warn(`Only generated ${generatedQuestions.length}/${paperConfig.numberOfFormulas} questions for a config item. Check constraints!`);
          }
          
          const questionStrings = generatedQuestions.map(q => q.question);
          questions.push(...questionStrings);
        }
      }

      // 打乱题目顺序
      questions.sort(() => Math.random() - 0.5);

      papersQuestions.push(questions);
    }

    const paperRecord = await prisma.paperRecord.create({
      data: {
        childId,
        configSnapshot: JSON.stringify(config),
        questions: JSON.stringify(papersQuestions),
        status: 'printed'
      }
    });

    return {
      id: paperRecord.id,
      papers: papersQuestions,
      config
    };
  }

  async getPaperRecords(childId: string, parentId: string) {
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId }
    });

    if (!child) {
      throw new AppError('Child not found', 404);
    }

    return await prisma.paperRecord.findMany({
      where: { childId },
      orderBy: { generatedAt: 'desc' }
    });
  }

  async getPaperRecordById(paperId: string, parentId: string) {
    const record = await prisma.paperRecord.findFirst({
      where: { id: paperId },
      include: {
        child: true
      }
    });

    if (!record || record.child.parentId !== parentId) {
      throw new AppError('Paper record not found', 404);
    }

    return record;
  }

  async deletePaperRecord(paperId: string, parentId: string) {
    const record = await prisma.paperRecord.findFirst({
      where: { id: paperId },
      include: {
        child: true
      }
    });

    if (!record || record.child.parentId !== parentId) {
      throw new AppError('Paper record not found', 404);
    }

    await prisma.paperRecord.delete({
      where: { id: paperId }
    });
  }

  async updatePracticeConfig(childId: string, parentId: string, configData: any) {
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId },
      include: {
        practiceConfigs: true
      }
    });

    if (!child) {
      throw new AppError('Child not found', 404);
    }

    let practiceConfig = child.practiceConfigs[0];
    if (!practiceConfig) {
      practiceConfig = await prisma.practiceConfig.create({
        data: {
          childId,
          ...configData
        }
      });
    } else {
      practiceConfig = await prisma.practiceConfig.update({
        where: { id: practiceConfig.id },
        data: configData
      });
    }

    return practiceConfig;
  }

  async getPracticeSessionDetail(sessionId: string, parentId: string) {
    const session = await prisma.practiceSession.findFirst({
      where: { id: sessionId },
      include: {
        child: true,
        questionInstances: {
          include: {
            questionAttempts: {
              orderBy: { submittedAt: 'desc' },
              take: 1
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!session || session.child.parentId !== parentId) {
      throw new AppError('Practice session not found', 404);
    }

    return session;
  }

  async getPracticeConfig(childId: string, parentId: string) {
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId },
      include: {
        practiceConfigs: true
      }
    });

    if (!child) {
      throw new AppError('Child not found', 404);
    }

    return child.practiceConfigs[0];
  }
}
