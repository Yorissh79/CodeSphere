// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Add this import
import passport from '../config/passport'; // Correct path to Passport config
import userModel, { IUser } from '../models/userModel';
import { generateToken } from '../utils/generateTokenGoogle';
import { registerSchema, googleTokenSchema } from '../middleware/authValidation';
import { handleControllerError } from '../utils/errorHandler';
import env from '../config/env';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

interface CustomAuthRequest {
    user?: IUser;
    body: any;
    params: any;
    query: any;
    session: any;
    logout?: (callback: (err: any) => void) => void;
}

// GET /auth/check-google-auth - Check if user is authenticated via Google using cookie
export const checkGoogleAuth = async (req: Request, res: Response): Promise<any> => {
    try {
        // Get JWT token from cookie
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                isAuthenticated: false,
                isGoogleAuth: false,
                message: 'No authentication token found'
            });
        }

        // Verify and decode JWT token
        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };

        if (!decoded.userId) {
            return res.status(401).json({
                isAuthenticated: false,
                isGoogleAuth: false,
                message: 'Invalid token'
            });
        }

        // Find user in database
        const user = await userModel.findById(decoded.userId).select('-password') as IUser | null;

        if (!user) {
            return res.status(404).json({
                isAuthenticated: false,
                isGoogleAuth: false,
                message: 'User not found'
            });
        }

        // Check if user has Google ID (indicating Google authentication)
        const isGoogleAuth = !!user.googleId;

        return res.status(200).json({
            isAuthenticated: true,
            isGoogleAuth,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                surname: user.surname,
                group: user.group
            }
        });

    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                isAuthenticated: false,
                isGoogleAuth: false,
                message: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                isAuthenticated: false,
                isGoogleAuth: false,
                message: 'Token expired'
            });
        }

        return handleControllerError(res, error, 'Authentication check failed');
    }
};

// Alternative: Middleware function to check Google authentication
export const checkGoogleAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                isAuthenticated: false,
                isGoogleAuth: false,
                message: 'No authentication token found'
            });
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
        const user = await userModel.findById(decoded.userId).select('-password') as IUser | null;

        if (!user) {
            return res.status(404).json({
                isAuthenticated: false,
                isGoogleAuth: false,
                message: 'User not found'
            });
        }

        // Add user info to request object
        (req as any).user = user;
        (req as any).isGoogleAuth = !!user.googleId;

        next();
    } catch (error) {
        return res.status(401).json({
            isAuthenticated: false,
            isGoogleAuth: false,
            message: 'Authentication failed'
        });
    }
};

// POST /auth/google/verify - Verify Google ID token (for client-side integration)
export const verifyGoogleToken = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = googleTokenSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Invalid request data",
                details: result.error.errors
            });
        }

        const { idToken } = result.data;

        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.sub) {
            return res.status(400).json({ error: 'Invalid token payload' });
        }

        const { email, name, sub: googleId } = payload;

        // Find or create user
        let user = await userModel.findOne({
            $or: [{ email }, { googleId }]
        }) as IUser | null;

        if (!user) {
            user = await userModel.create({
                name: name || 'Google User',
                email,
                googleId,
                role: 'user',
            }) as IUser;
        } else if (!user.googleId) {
            // Update existing user with Google ID if it's missing
            user.googleId = googleId;
            await user.save();
        }

        generateToken(res, user._id.toString());

        res.status(200).json({
            message: 'Authentication successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error: any) {
        if (error.message.includes('Token used too late') || error.message.includes('Invalid token')) {
            return res.status(401).json({ error: 'Invalid or expired Google token' });
        }
        return handleControllerError(res, error, 'Google token verification failed');
    }
};

// POST /auth/register - Create a new user with optional Google integration
export const registerUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = registerSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Invalid request data",
                details: result.error.errors
            });
        }

        const { name, email, password, googleId, role, surname, group } = result.data;

        // Check if user already exists
        const existingUser = await userModel.findOne({
            $or: [{ email }, ...(googleId ? [{ googleId }] : [])]
        }) as IUser | null;

        if (existingUser) {
            return res.status(409).json({ error: 'User already exists with this email or Google account' });
        }

        // Prepare user data
        const userData: Partial<IUser> = {
            name,
            email,
            role,
            surname,
            group
        };

        if (password) {
            userData.password = await bcrypt.hash(password, 12); // Increased salt rounds for better security
        }

        if (googleId) {
            userData.googleId = googleId;
        }

        const newUser = await userModel.create(userData) as IUser;
        generateToken(res, newUser._id.toString());

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });

    } catch (error) {
        return handleControllerError(res, error, 'User registration failed');
    }
};

// POST /auth/logout - Logout user
export const logoutUser = async (req: CustomAuthRequest, res: Response): Promise<void> => {
    try {
        // Clear session if Passport is used
        if (req.logout) {
            req.logout((err) => {
                if (err) {
                    console.error('Passport logout error:', err);
                }
            });
            req.session = null; // Clear session data for express-session
        }

        // Clear JWT cookie
        res.cookie('jwt', '', {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0), // Expire immediately
            path: '/'
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
};

// GET /auth/user - Get current authenticated user
export const getCurrentUser = async (req: CustomAuthRequest, res: Response): Promise<any> => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = req.user;
        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            surname: user.surname,
            group: user.group
        });
    } catch (error) {
        return handleControllerError(res, error, 'Failed to get current user');
    }
};

// GET /auth/users - Get all users (admin only)
export const getAllUsers = async (req: CustomAuthRequest, res: Response): Promise<any> => {
    try {
        // Middleware `requireAdmin` should already handle access control, but double-check for robustness.
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const users = await userModel.find().select('-password -googleId'); // Exclude sensitive fields
        res.status(200).json({ users });
    } catch (error) {
        return handleControllerError(res, error, 'Failed to fetch users');
    }
};

// GET /auth/google - Initiate Google OAuth flow
export const initiateGoogleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account' // Force account selection
});

// GET /auth/google/callback - Handle Google OAuth callback
export const handleGoogleCallback = [
    passport.authenticate('google', {
        failureRedirect: `${env.CLIENT_URL}/login?error=auth_failed`,
        session: true // Ensure session is used for Passport callback
    }),
    (req: CustomAuthRequest, res: Response) => {
        try {
            if (req.user) {
                const user = req.user;
                generateToken(res, user._id.toString());

                // Redirect to frontend with success
                res.redirect(`${env.CLIENT_URL}/dashboard`);
            } else {
                res.redirect(`${env.CLIENT_URL}/login?error=no_user`);
            }
        } catch (error) {
            console.error('Google OAuth Callback error:', error);
            res.redirect(`${env.CLIENT_URL}/login?error=callback_failed`);
        }
    }
] as const; // Use `as const` to correctly infer tuple type

// GET /auth/protected - Example protected route
export const protectedRoute = (req: CustomAuthRequest, res: Response): any => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({
        message: 'Access granted to protected route',
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        }
    });
};