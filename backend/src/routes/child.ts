import { Router } from 'express';
import { childAuthMiddleware } from '../middleware/authMiddleware';
import {
  getTodayPractice,
  startPractice,
  submitAnswer,
  completePractice,
  getWrongQuestions,
  getBadges,
  getHistory,
  getProfile,
  getHistoryDetail
} from '../controllers/childController';

const router = Router();

router.use(childAuthMiddleware);

router.get('/today-practice', getTodayPractice);
router.post('/practice/:sessionId/start', startPractice);
router.post('/practice/:sessionId/question/:questionInstanceId/submit', submitAnswer);
router.post('/practice/:sessionId/complete', completePractice);
router.get('/wrong-questions', getWrongQuestions);
router.get('/badges', getBadges);
router.get('/history', getHistory);
router.get('/history/:sessionId', getHistoryDetail);
router.get('/profile', getProfile);

export default router;
