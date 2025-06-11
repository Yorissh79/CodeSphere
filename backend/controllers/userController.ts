import { Request, Response } from 'express';
import userModel, {IUser} from "../models/userModel";
import { z } from 'zod';
import { generateToken } from "../utils/generateToken";

const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    surname: z.string(),
    role: z.string(),
    group: z.string()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

const updateUserSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    surname: z.string().optional(),
    role: z.string().optional(),
    group: z.string().optional(),
});

export const createUser = async (req: Request, res: Response): Promise<any> => {
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const { name, email, password, surname, role, group } = result.data;

    const existingUser = await userModel.findOne({ email }) as IUser | null;
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = await userModel.create({
        name,
        email,
        password,
        surname,
        role,
        group,
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

export const loginUser = async (req: Request, res: Response): Promise<any> => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const { email, password } = result.data;

    const user = await userModel.findOne({ email }) as IUser | null;
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

export const logout = async (req: Request, res: Response) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ message: 'Logged out' });
};

export const getUser = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    if (id) {
        const user = await userModel.findById(id).select('name email');
        if (user) {
            return res.status(200).json({ id: user._id, name: user.name, email: user.email });
        }
        return res.status(404).json({ error: 'User not found' });
    }
    return res.status(400).json({ error: 'ID required' });
};

export const getAllUsers = async (req: Request, res: Response) => {
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
        const users = await userModel.find(filter).select('name surname email group role');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};


export const updateUser = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const user = await userModel.findById(id) as IUser | null;
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
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
            group: updatedUser.group,
            role: updatedUser.role,
        },
    });
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', user });
};
