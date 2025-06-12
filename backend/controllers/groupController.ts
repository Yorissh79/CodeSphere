import { z } from "zod";
import { Request, Response } from "express";
import groupModel from "../models/groupModel";

const createGroupSchema = z.object({
    teachers: z.array(z.string()).optional(),
    group: z.string().min(1, "Group is required")
});

export const updateGroupSchema = z.object({
    group: z.string().optional(),
    teachers: z.array(z.string()).optional(),
});

export const createGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = createGroupSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: result.error.flatten() });
            return;
        }

        const { teachers, group } = result.data;
        const newGroup = await groupModel.create({ teachers, group, date: new Date() });
        res.status(201).json(newGroup);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllGroups = async (req: Request, res: Response) => {
    const { group, teacher } = req.query;

    const filter: any = {};

    if (group && typeof group === 'string') {
        filter.group = group;
    }

    try {
        const users = await groupModel.find(filter).select('group teachers');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const updateGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = updateGroupSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: result.error.flatten() });
            return;
        }

        console.log("Incoming update:", req.body);

        const updatedGroup = await groupModel.findByIdAndUpdate(id, result.data, { new: true });
        if (!updatedGroup) {
            res.status(404).json({ error: "Group not found" });
            return;
        }

        res.status(200).json(updatedGroup);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedGroup = await groupModel.findByIdAndDelete(id);
        if (!deletedGroup) {
            res.status(404).json({ error: "Group not found" });
            return;
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};