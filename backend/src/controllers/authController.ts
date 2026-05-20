import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { validateBody } from '../middleware/validationMiddleware';
import { z } from 'zod';

const authService = new AuthService();

const registerParentSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email().optional().or(z.literal(''))
});

const loginParentSchema = z.object({
  username: z.string(),
  password: z.string()
});

const loginChildSchema = z.object({
  childId: z.string(),
  password: z.string()
});

export const registerParent = [
  validateBody(registerParentSchema),
  async (req: Request, res: Response) => {
    try {
      const { username, password, email } = req.body;
      const parent = await authService.registerParent(username, password, email);
      res.status(201).json({ success: true, data: parent });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: { message: error.message } 
      });
    }
  }
];

export const loginParent = [
  validateBody(loginParentSchema),
  async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const result = await authService.loginParent(username, password);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: { message: error.message } 
      });
    }
  }
];

export const getChildLoginOptions = async (_req: Request, res: Response) => {
  try {
    const children = await authService.getChildLoginOptions();
    res.status(200).json({ success: true, data: children });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

export const loginChild = [
  validateBody(loginChildSchema),
  async (req: Request, res: Response) => {
    try {
      const { childId, password } = req.body;
      const result = await authService.loginChild(childId, password);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: { message: error.message } 
      });
    }
  }
];
