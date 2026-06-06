import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export class AuthService {
  async registerParent(username: string, password: string, email?: string) {
    const existingParent = await prisma.parent.findUnique({
      where: { username }
    });

    if (existingParent) {
      throw new AppError('Username already exists', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const parent = await prisma.parent.create({
      data: {
        username,
        passwordHash,
        email
      }
    });

    return parent;
  }

  async loginParent(username: string, password: string) {
    const parent = await prisma.parent.findUnique({
      where: { username }
    });

    if (!parent) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValid = await bcrypt.compare(password, parent.passwordHash);

    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { parentId: parent.id, username: parent.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token, parentId: parent.id };
  }

  async getChildLoginOptions() {
    return await prisma.child.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async loginChild(childId: string, password: string) {
    const child = await prisma.child.findFirst({
      where: {
        OR: [
          { id: childId },
          { name: childId }
        ]
      }
    });

    if (!child) {
      throw new AppError('Child not found', 404);
    }

    if (child.password !== password) {
      throw new AppError('Invalid password', 401);
    }

    const token = jwt.sign(
      { childId: child.id, name: child.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token, childId: child.id, name: child.name, points: child.points, level: child.level };
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }
}
