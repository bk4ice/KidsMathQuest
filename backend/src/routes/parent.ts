import { Router } from 'express';
import { parentAuthMiddleware } from '../middleware/authMiddleware';
import {
  getChildren,
  addChild,
  updateChild,
  deleteChild,
  getChildStats,
  getPaperConfigs,
  addPaperConfig,
  updatePaperConfig,
  deletePaperConfig,
  setActivePaperConfig,
  resetPaperConfig,
  generatePaper,
  getPaperRecords,
  getPaperRecordById,
  deletePaperRecord,
  updatePracticeConfig,
  getPracticeConfig,
  getPracticeSessionDetail,
  getAIChatHistory,
  sendAIChatMessage,
  clearAIChatHistory
} from '../controllers/parentController';

const router = Router();

router.use(parentAuthMiddleware);

router.get('/children', getChildren);
router.post('/children', addChild);
router.put('/children/:id', updateChild);
router.delete('/children/:id', deleteChild);
router.get('/children/:id/stats', getChildStats);
router.get('/children/:id/practice-sessions/:sessionId', getPracticeSessionDetail);
router.get('/children/:id/paper-configs', getPaperConfigs);
router.post('/children/:id/paper-configs', addPaperConfig);
router.put('/children/:id/paper-configs/:configId', updatePaperConfig);
router.delete('/children/:id/paper-configs/:configId', deletePaperConfig);
router.post('/children/:id/paper-configs/:configId/set-active', setActivePaperConfig);
router.post('/children/:id/paper-configs/reset', resetPaperConfig);
router.post('/children/:id/generate-paper', generatePaper);
router.get('/children/:id/papers', getPaperRecords);
router.get('/children/:id/papers/:paperId', getPaperRecordById);
router.delete('/children/:id/papers/:paperId', deletePaperRecord);
router.get('/children/:id/practice-config', getPracticeConfig);
router.put('/children/:id/practice-config', updatePracticeConfig);

// AI Chat Routes
router.get('/ai/chat/:childId/history', getAIChatHistory);
router.post('/ai/chat', sendAIChatMessage);
router.delete('/ai/chat/:childId', clearAIChatHistory);

export default router;
