import { Request, Response } from 'express';
import teacherModel, {IUser} from "../models/teacherModel";
import { z } from 'zod';
import { generateToken } from "../utils/generateToken";

const createTeacherSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    surname: z.string(),
    role: z.string(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export const createTeacher = async (req: Request, res: Response): Promise<any> => {
    const result = createTeacherSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const { name, email, password, surname, role} = result.data;

    const existingUser = await teacherModel.findOne({ email }) as IUser | null;
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = await teacherModel.create({
        name,
        email,
        password,
        surname,
        role,
    }) as IUser;

    generateToken(res, newUser._id.toString());

    res.status(201).json({
        message: 'User created successfully',
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        },
    });
};

export const loginTeacher = async (req: Request, res: Response): Promise<any> => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const { email, password } = result.data;

    const user = await teacherModel.findOne({ email }) as IUser | null;
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    const isMatch = await user.passwordControl(password);

    if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password' });
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

export const logoutTeacher = async (req: Request, res: Response) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ message: 'Logged out' });
};

export const getTeacher = async (req: Request, res: Response): Promise<any> => {
    if (req.body) {
        const { name, email, _id } = req.body;
        return res.status(200).json({ id: _id, name, email });
    }

    res.status(401).json({ error: 'Unauthorized' });
};

export const getAllUsers = async (req: Request, res: Response) => {
    const users = await teacherModel.find()
    res.json(users)
}