import express, { Request, Response } from "express";
import { z } from "zod";
import Answer from "../models/answerModel";
import mongoose from "mongoose";

const AnswerSchema = z.array(
    z.object({
        studentId: z.string(),
        quizId: z.string(),
        questionId: z.string(),
        answer: z.union([z.string(), z.number(), z.array(z.string())]),
        timeSpent: z.number().min(0),
        changedCount: z.number().min(0),
    })
);

export const createAnswer = async (req: Request, res: Response):Promise<any> => {
    try {
        const parsed = AnswerSchema.parse(req.body);

        // Check for existing submissions
        const existing = await Answer.findOne({
            studentId: parsed[0].studentId,
            quizId: parsed[0].quizId,
        });

        if (existing) {
            return res.status(400).json({error: "Quiz already submitted by this student"});
        }

        // Save answers
        const answers = parsed.map((ans) => ({
            ...ans,
            studentId: new mongoose.Types.ObjectId(ans.studentId),
            quizId: new mongoose.Types.ObjectId(ans.quizId),
            questionId: new mongoose.Types.ObjectId(ans.questionId),
        }));

        await Answer.insertMany(answers);

        // Emit Socket.IO event (mocked)
        // io.emit("quizSubmitted", { quizId: parsed[0].quizId });

        res.status(201).json({message: "Answers submitted successfully"});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({error: error.errors});
        }
        console.error(error);
        res.status(500).json({error: "Server error"});
    }
}