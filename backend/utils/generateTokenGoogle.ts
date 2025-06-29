import jwt from 'jsonwebtoken';
import {Response} from 'express';
import env from '../config/env'; // Import environment variables

export const generateToken = (res: Response, userId: string): string => {
    if (!env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }

    // @ts-ignore
    const token = jwt.sign(
        { userId },
        env.JWT_SECRET,
        {
            expiresIn: env.JWT_EXPIRES_IN,
            issuer: env.JWT_ISSUER,
            audience: env.JWT_AUDIENCE
        }
    );

    let maxAgeMs: number;
    if (env.JWT_EXPIRES_IN) {
        if (env.JWT_EXPIRES_IN.endsWith('d')) {
            const days = parseInt(env.JWT_EXPIRES_IN.replace('d', ''));
            maxAgeMs = days * 24 * 60 * 60 * 1000;
        } else {
            { // If it's a string number, parse it as days
                {
                    const days = parseInt(env.JWT_EXPIRES_IN);
                    maxAgeMs = days * 24 * 60 * 60 * 1000;
                }
            }
        }
    } else {
        // Default to 7 days
        maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    }

    // Set HTTP-only cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: maxAgeMs,
        path: '/'
    });

    return token;
};

export const verifyToken = (token: string): { userId: string } => {
    if (!env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }

    try {
        return jwt.verify(token, env.JWT_SECRET) as { userId: string };
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

// Additional utility for extracting token from cookies
export const extractTokenFromCookies = (cookieString: string | undefined): string | null => {
    if (!cookieString) return null;

    const cookies = cookieString.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    return cookies.jwt || null;
};