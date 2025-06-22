import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import userModel from '../models/userModel';
import teacherModel from '../models/teacherModel';

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // Try to find user first, then teacher
        let user = await userModel.findById(decoded.userId);
        let userType = 'student';

        if (!user) {
            user = await teacherModel.findById(decoded.userId);
            userType = 'teacher';
        }

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.body = { ...req.body, ...user.toObject(), userType };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

export const requireTeacher = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.userType !== 'teacher') {
        return res.status(403).json({ error: 'Teacher access required' });
    }
    next();
};

export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.userType !== 'student') {
        return res.status(403).json({ error: 'Student access required' });
    }
    next();
};