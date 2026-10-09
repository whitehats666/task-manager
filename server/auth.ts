import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import { User } from './types.js';

interface SessionData {
  userId: string;
  createdAt: number;
}

// In-memory token storage (persists through server runtime)
const tokenStore = new Map<string, SessionData>();

export function generateToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  tokenStore.set(token, {
    userId,
    createdAt: Date.now(),
  });
  return token;
}

export function revokeToken(token: string): void {
  tokenStore.delete(token);
}

export function getUserFromToken(token: string): User | null {
  const session = tokenStore.get(token);
  if (!session) return null;

  // 7 days token expiration
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > SEVEN_DAYS) {
    tokenStore.delete(token);
    return null;
  }

  const user = db.getUsers().find(u => u.id === session.userId);
  if (!user || user.status !== 'Active') {
    return null;
  }
  return user;
}

export function sanitizeUser(user: User): Omit<User, 'password_hash'> {
  const { password_hash, ...rest } = user;
  return rest;
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

// Extend Request
export interface AuthRequest extends Request {
  user?: User;
  token?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const user = getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }

  req.user = user;
  req.token = token;
  next();
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }
  next();
}

export function adminOrLead(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'TEAM_LEAD')) {
    res.status(403).json({ error: 'Forbidden: Admin or Team Lead access required' });
    return;
  }
  next();
}
