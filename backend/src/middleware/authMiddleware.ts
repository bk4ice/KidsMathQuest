import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AppError } from './errorHandler';

const authService = new AuthService();

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = authService.verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const parentAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  authMiddleware(req, res, () => {
    if (!(req as any).user.parentId) {
      throw new AppError('Parent access required', 403);
    }
    next();
  });
};

export const childAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  authMiddleware(req, res, () => {
    if (!(req as any).user.childId) {
      throw new AppError('Child access required', 403);
    }
    next();
  });
};
