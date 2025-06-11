import { Request, Response } from 'express';
import { z } from 'zod';
import { generateToken } from "../utils/generateToken";
import adminModel, {Admin} from "../models/adminModel";

const createAdminSchema = z.object({
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

export const createAdmin = async (req: Request, res: Response): Promise<any> => {
    const result = createAdminSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const { name, email, password, surname, role} = result.data;

    const existingUser = await adminModel.findOne({ email }) as Admin | null;
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = await adminModel.create({
        name,
        email,
        password,
        surname,
        role,
    }) as Admin;

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

export const loginAdmin = async (req: Request, res: Response): Promise<any> => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const { email, password } = result.data;

    const user = await adminModel.findOne({ email }) as Admin | null;
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

export const logoutAdmin = async (req: Request, res: Response) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ message: 'Logged out' });
};

// export const getAdmin = async (req: Request, res: Response): Promise<any> => {
//     const { id } = req.params;
//     if (id) {
//         const user = await adminModel.findById(id).select('name email');
//         if (user) {
//             return res.status(200).json({ id: user._id, name: user.name, email: user.email });
//         }
//         return res.status(404).json({ error: 'User not found' });
//     }
//     return res.status(400).json({ error: 'ID required' });
// };
//
// export const getAllUsers = async (req: Request, res: Response) => {
//     const users = await adminModel.find()
//     res.json(users)
// }