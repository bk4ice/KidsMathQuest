import { Request, Response } from 'express';
import { ParentService } from '../services/parentService';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { AIAgentService } from '../services/aiAgentService';
import { isAIEnabled } from '../config/aiConfig';

const parentService = new ParentService();
const aiAgentService = new AIAgentService();

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

export const getAIChatHistory = async (req: Request, res: Response) => {
  try {
    // 检查 AI 功能是否已配置
    if (!isAIEnabled()) {
      return res.status(503).json({ 
        success: false, 
        error: { 
          message: 'AI 导师功能未配置。请在环境变量中配置 AI_PROVIDER 和对应的 API_KEY 后使用此功能。参考 .env.example 文件。' 
        } 
      });
    }

    const parentId = (req as any).user.parentId;
    const { childId } = req.params;
    
    if (childId !== 'general') {
      const child = await prisma.child.findFirst({
        where: { id: childId, parentId }
      });
      if (!child) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized child access' } });
      }
    }
    
    const targetChildId = childId === 'general' ? 'general_parent_chat' : childId;
    const history = aiAgentService.loadChatHistory(targetChildId);
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const sendAIChatMessage = async (req: Request, res: Response) => {
  try {
    // 检查 AI 功能是否已配置
    if (!isAIEnabled()) {
      return res.status(503).json({ 
        success: false, 
        error: { 
          message: 'AI 导师功能未配置。请在环境变量中配置 AI_PROVIDER 和对应的 API_KEY 后使用此功能。参考 .env.example 文件。' 
        } 
      });
    }

    const parentId = (req as any).user.parentId;
    const { childId, message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: { message: 'Message is required' } });
    }
    
    if (childId && childId !== 'general') {
      const child = await prisma.child.findFirst({
        where: { id: childId, parentId }
      });
      if (!child) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized child access' } });
      }
    }
    
    const targetChildId = (!childId || childId === 'general') ? 'general_parent_chat' : childId;

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendSSE = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    await aiAgentService.chatStream(
      parentId,
      targetChildId,
      message,
      (chunk) => {
        sendSSE(chunk.type, chunk);
      }
    );

    res.end();
  } catch (error: any) {
    console.error('[sendAIChatMessage Stream Error]', error);
    res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
    res.end();
  }
};

export const clearAIChatHistory = async (req: Request, res: Response) => {
  try {
    const parentId = (req as any).user.parentId;
    const { childId } = req.params;
    
    if (childId !== 'general') {
      const child = await prisma.child.findFirst({
        where: { id: childId, parentId }
      });
      if (!child) {
        return res.status(403).json({ success: false, error: { message: 'Unauthorized child access' } });
      }
    }
    
    const targetChildId = childId === 'general' ? 'general_parent_chat' : childId;
    aiAgentService.clearChatHistory(targetChildId);
    res.json({ success: true, data: null });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
