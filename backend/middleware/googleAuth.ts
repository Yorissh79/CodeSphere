// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import userModel, { IUser } from '../models/userModel';
import { verifyToken } from '../utils/generateTokenGoogle'; // Import JWT verification utility

// Solution 1: Use a different property name
interface AuthenticatedRequest extends Request {
    currentUser?: IUser;
}

// declare global {
//     namespace Express {
//         interface Request {
//             user?: IUser;
//         }
//     }
// }

export const authenticateToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        // Extract token from cookie or Authorization header
        const token = req.cookies.jwt || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        // Verify the token and get the user ID
        const decoded = verifyToken(token);
        const user = await userModel.findById(decoded.userId).select('-password') as IUser | null;

        if (!user) {
            return res.status(401).json({ error: 'User not found or token invalid' });
        }

        req.currentUser = user; // Using currentUser instead of user
        next();
    } catch (error: any) {
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('Authentication middleware error:', error);
        return res.status(500).json({ error: 'Internal authentication error' });
    }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    if (!req.currentUser || req.currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};