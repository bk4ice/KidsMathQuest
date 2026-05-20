import { Request, Response } from 'express';
import { ChildService } from '../services/childService';
import { AppError } from '../middleware/errorHandler';

const childService = new ChildService();

export const getTodayPractice = async (req: Request, res: Response) => {
  try {
    const childId = (req as any).user.childId;
    const session = await childService.getTodayPractice(childId);
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const startPractice = async (req: Request, res: Response) => {
  try {
    const childId = (req as any).user.childId;
    const { sessionId } = req.params;
    const session = await childService.startPractice(sessionId, childId);
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const childId = (req as any).user.childId;
    const { sessionId, questionInstanceId } = req.params;
    const { userAnswer, timeSpent } = req.body;
    const result = await childService.submitAnswer(sessionId, childId, questionInstanceId, userAnswer, timeSpent);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const completePractice = async (req: Request, res: Response) => {
  try {
    const childId = (req as any).user.childId;
    const { sessionId } = req.params;
    const result = await childService.completePractice(sessionId, childId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const getWrongQuestions = async (req: Request, res: Response) => {
  try {
    const childId = (req as any).user.childId;
    const questions = await childService.getWrongQuestions(childId);
    res.json({ success: true, data: questions });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const getBadges = async (req: Request, res: Response) => {
  try {
    const childId = (req as any).user.childId;
    const badges = await childService.getBadges(childId);
    res.json({ success: true, data: badges });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const childId = (req as any).user.childId;
    const history = await childService.getHistory(childId);
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const childId = (req as any).user.childId;
    const profile = await childService.getProfile(childId);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const getHistoryDetail = async (req: Request, res: Response) => {
  try {
    const childId = (req as any).user.childId;
    const { sessionId } = req.params;
    const session = await childService.getHistoryDetail(sessionId, childId);
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};
