import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import passport from '../controllers/googleAuth';
import userModel, {IUser} from "../models/userModel";
import {generateToken} from "../utils/generateTokenGoogle";
import {OAuth2Client} from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6).optional(),
    googleId: z.string().optional(),
    role: z.string().default('user'),
    surname: z.string().optional(),
    group: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    googleId: z.string()
});

const googleUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    googleId: z.string(),
    role: z.string().default('user'),
    surname: z.string().optional(),
    group: z.string().optional(),
});

export const createGoogle = async (req: Request, res: Response): Promise<any> => {
    const result = googleUserSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({error: result.error});
    }

    const {name, email, googleId, role, surname, group} = result.data;

    const existingUser = await userModel.findOne({email}) as IUser | null;
    if (existingUser) {
        return res.status(400).json({error: 'User already exists'});
    }

    const newUser = await userModel.create({
        name,
        email,
        googleId,
        role,
        surname,
        group,
    }) as IUser;

    generateToken(res, newUser._id.toString());

    res.status(201).json({
        message: 'Google user created successfully',
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        },
    });
}

// POST /register - Create a new user (existing)
export const registerGoogle = (async (req: Request, res: Response):Promise<any> => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const { name, email, password, googleId, role, surname, group } = result.data;

    const existingUser = await userModel.findOne({ email }) as IUser | null;
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const userData: Partial<IUser> = { name, email, role, surname, group };
    if (password) {
        userData.password = await bcrypt.hash(password, 6);
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
        },
    });
});

// POST /login - Login user (existing)
export const loginGoogle = async (req: Request, res: Response): Promise<any> => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const { email, googleId } = result.data;

    try {
        const ticket = await client.verifyIdToken({
            idToken: googleId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        console.log(payload);
        if (!payload || payload.email !== email) {
            return res.status(400).json({ error: 'Invalid Google token' });
        }
    } catch (err) {
        return res.status(400).json({ error: 'Google token verification failed' });
    }

    const user = await userModel.findOne({ $or: [{ email }, { googleId }] }) as IUser | null;
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    generateToken(res, user._id.toString());

    res.status(200).json({
        message: 'Logged in successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
};

// POST /logout - Logout user (existing)
export const logoutGoogle = (async (req: Request, res: Response) => {
    req.logout(() => {
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
        });
        res.status(200).json({ message: 'Logged out' });
    });
});

// GET /user - Get current user (existing)
export const getGoogle = (async (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        const { name, email, _id } = req.user as IUser;
        return res.status(200).json({ id: _id, name, email });
    }
    res.status(401).json({ error: 'Unauthorized' });
});

// GET /users - Get all users (existing)
export const getAllGoogle = (async (req: Request, res: Response) => {
    const users = await userModel.find();
    res.json(users);
});

// GET /auth/google - Initiate Google Auth
export const authedGoogle = (passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /auth/google/callback - Handle Google Auth callback
export const handleCallback = (
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req: Request, res: Response) => {
        if (req.user) {
            generateToken(res, (req.user as any)._id.toString());
            res.redirect('/profile');
        } else {
            res.status(401).json({ error: 'Authentication failed' });
        }
    }
);

// GET /profile - Protected route for authenticated user
export const authGoogle = ((req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json({ user: req.user });
});
