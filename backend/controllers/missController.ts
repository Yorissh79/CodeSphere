import { Request, Response } from 'express';
import missModel, { Miss } from "../models/missModel";
import { z } from 'zod';

const createMissSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    surname: z.string(),
    miss: z.string(),
    group: z.string().optional(),
});

export const createMiss = async (req: Request, res: Response): Promise<any> => {
    const result = createMissSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: result.error.errors,
        });
    }

    const { name, email, surname, miss, group } = result.data;

    try {
        const newMiss = await missModel.create({
            name,
            email,
            surname,
            group,
            miss,
        }) as Miss;

        res.status(201).json({
            message: 'Miss created successfully',
            user: {
                id: newMiss._id,
                name: newMiss.name,
                email: newMiss.email,
            },
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err,
        });
    }
};

export const getSpeMisses = async (req: Request, res: Response): Promise<any> => {
    if (req.body) {
        const { email, } = req.body;
        return res.status(200).json({email});
    }

    res.status(401).json({ error: 'Unauthorized' });
};

