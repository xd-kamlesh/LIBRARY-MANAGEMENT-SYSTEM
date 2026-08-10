import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/generateToken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            if (!token) throw new Error('Token is undefined');
            const decoded = verifyToken(token);
            req.user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, role: true, email: true } });
            if (!req.user) {
                res.status(401).json({ message: 'Not authorized, user not found' });
                return;
            }
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const authorizeLibrarian = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'LIBRARIAN') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as librarian' });
    }
};
