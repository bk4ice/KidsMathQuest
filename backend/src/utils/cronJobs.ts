import cron from 'node-cron';
import prisma from '../config/database';

export function startCronJobs() {
  cron.schedule('0 6 * * *', async () => {
    console.log('Running daily practice generation...');
    
    try {
      const children = await prisma.child.findMany({
        where: {
          practiceConfigs: {
            some: {
              isEnabled: true,
              paperConfigs: {
                some: {
                  isActive: true
                }
              }
            }
          }
        },
        include: {
          practiceConfigs: {
            include: {
              paperConfigs: {
                where: { isActive: true }
              }
            }
          }
        }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const child of children) {
        const practiceConfig = child.practiceConfigs[0];
        const paperConfig = practiceConfig.paperConfigs[0];

        if (!paperConfig) continue;

        const existingSession = await prisma.practiceSession.findFirst({
          where: {
            childId: child.id,
            date: {
              gte: today
            }
          }
        });

        if (existingSession) continue;

        await prisma.practiceSession.create({
          data: {
            childId: child.id,
            paperConfigId: paperConfig.id,
            configVersion: practiceConfig.version,
            targetCount: paperConfig.numberOfFormulas,
            status: 'pending'
          }
        });

        console.log(`Created practice session for child ${child.name}`);
      }

      console.log('Daily practice generation completed');
    } catch (error) {
      console.error('Error in daily practice generation:', error);
    }
  });

  console.log('Cron jobs started');
}
