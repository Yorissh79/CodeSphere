import { Request, Response } from "express";
import quizModel from "../models/quizModel";
import questionModel from "../models/questionModel";
import { z } from "zod";
import mongoose from "mongoose";

const createQuizSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    group: z.string().optional(),
    timeLimit: z.number().int().positive().optional(),
    opened: z.boolean(),
});

const updateQuizSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    group: z.string().optional(),
    timeLimit: z.number().int().positive().optional(),
    opened: z.boolean().optional(),
});

export const updateQuiz = async (req: Request, res: Response): Promise<any> => {
    const result = updateQuizSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    try {
        const quiz = await quizModel.findByIdAndUpdate(
            req.params.id,
            { $set: result.data },
            { new: true, runValidators: true }
        );
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        res.status(200).json({ message: "Quiz updated", quiz });
    } catch (err) {
        res.status(500).json({ error: "Failed to update quiz" });
    }
};

export const createQuiz = async (req: Request, res: Response): Promise<any> => {
    const result = createQuizSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    try {
        const quiz = await quizModel.create({
            ...result.data,
            questionIds: [],
        });
        res.status(201).json({ message: "Quiz created", quiz });
    } catch (err) {
        res.status(500).json({ error: "Failed to create quiz" });
    }
};

export const getAllQuizzes = async (_req: Request, res: Response) => {
    try {
        const quizzes = await quizModel.find().select("title tags timeLimit opened");
        res.status(200).json(quizzes);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch quizzes" });
    }
};

export const getQuizById = async (req: Request, res: Response): Promise<any> => {
    try {
        const quiz = await quizModel.findById(req.params.id);
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        res.status(200).json(quiz);
    } catch (err) {
        res.status(500).json({ error: "Failed to get quiz" });
    }
};

export const deleteQuiz = async (req: Request, res: Response): Promise<any> => {
    try {
        const quiz = await quizModel.findByIdAndDelete(req.params.id);
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        await questionModel.deleteMany({ quizId: quiz._id });
        res.status(200).json({ message: "Quiz and questions deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete quiz" });
    }
};

