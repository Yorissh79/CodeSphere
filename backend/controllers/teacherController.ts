import { Request, Response } from 'express';
import teacherModel, {ITeacher} from "../models/teacherModel";
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

const teacherUpdateSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    surname: z.string().optional(),
    role: z.string().optional(),
});

export const createTeacher = async (req: Request, res: Response): Promise<any> => {
    const result = createTeacherSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const { name, email, password, surname, role} = result.data;

    const existingUser = await teacherModel.findOne({ email }) as ITeacher | null;
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = await teacherModel.create({
        name,
        email,
        password,
        surname,
        role,
    }) as ITeacher;

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

    const user = await teacherModel.findOne({ email }) as ITeacher | null;
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
export const getAllTeachers = async (req: Request, res: Response) => {
    const { group, name } = req.query;

    const filter: any = {};

    if (group && typeof group === 'string') {
        filter.group = group;
    }

    if (name && typeof name === 'string') {
        filter.$or = [
            { name: { $regex: name, $options: 'i' } },
            { surname: { $regex: name, $options: 'i' } }
        ];
    }

    try {
        const users = await teacherModel.find(filter).select('name surname email group role');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const updateTeacher = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const result = teacherUpdateSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const user = await teacherModel.findById(id) as ITeacher | null;
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await teacherModel.findByIdAndUpdate(
        id,
        { $set: result.data },
        { new: true, runValidators: true }
    ).select('name surname email group role');

    if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
        message: 'User updated successfully',
        user: {
            id: updatedUser._id,
            name: updatedUser.name,
            surname: updatedUser.surname,
            email: updatedUser.email,
            role: updatedUser.role,
        },
    });
};

export const deleteTeacher = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    const user = await teacherModel.findByIdAndDelete(id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', user });
};