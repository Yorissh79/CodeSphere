import { Response } from 'express';
import jwt from 'jsonwebtoken';

export const generateToken = (res: Response, userId: string) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret', {
        expiresIn: '1d',
    });
    res.cookie('jwt', token, { httpOnly: true });
};