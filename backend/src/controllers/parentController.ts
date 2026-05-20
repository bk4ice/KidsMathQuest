import { Request, Response } from 'express';
import { ParentService } from '../services/parentService';
import { AppError } from '../middleware/errorHandler';

const parentService = new ParentService();

export const getChildren = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const children = await parentService.getChildren(parentId);
    res.json({ success: true, data: children });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const addChild = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const child = await parentService.addChild(parentId, req.body);
    res.status(201).json({ success: true, data: child });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const updateChild = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { id } = req.params;
    const child = await parentService.updateChild(id, parentId, req.body);
    res.json({ success: true, data: child });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const deleteChild = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { id } = req.params;
    await parentService.deleteChild(id, parentId);
    res.json({ success: true, data: null });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const getChildStats = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { id } = req.params;
    const stats = await parentService.getChildStats(id, parentId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const getPaperConfigs = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { id } = req.params;
    const configs = await parentService.getPaperConfigs(id, parentId);
    res.json({ success: true, data: configs });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const addPaperConfig = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { id } = req.params;
    const config = await parentService.addPaperConfig(id, parentId, req.body);
    res.status(201).json({ success: true, data: config });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const updatePaperConfig = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { id, configId } = req.params;
    const config = await parentService.updatePaperConfig(configId, parentId, req.body);
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const deletePaperConfig = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { id, configId } = req.params;
    await parentService.deletePaperConfig(configId, parentId);
    res.json({ success: true, data: null });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};

export const setActivePaperConfig = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { id, configId } = req.params;
    const config = await parentService.setActivePaperConfig(configId, parentId);
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

export const resetPaperConfig = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { id } = req.params;
    const config = await parentService.resetPaperConfig(id, parentId);
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

export const generatePaper = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { id } = req.params;
    const { configId, paperList } = req.body;
    const result = await parentService.generatePaper(id, parentId, configId, paperList);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

export const getPaperRecords = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { id } = req.params;
    const records = await parentService.getPaperRecords(id, parentId);
    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

export const getPaperRecordById = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { paperId } = req.params;
    const record = await parentService.getPaperRecordById(paperId, parentId);
    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

export const deletePaperRecord = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { paperId } = req.params;
    await parentService.deletePaperRecord(paperId, parentId);
    res.json({ success: true, data: null });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

export const updatePracticeConfig = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { id } = req.params;
    const config = await parentService.updatePracticeConfig(id, parentId, req.body);
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

export const getPracticeConfig = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { id } = req.params;
    const config = await parentService.getPracticeConfig(id, parentId);
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

export const getPracticeSessionDetail = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { sessionId } = req.params;
    const session = await parentService.getPracticeSessionDetail(sessionId, parentId);
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};
