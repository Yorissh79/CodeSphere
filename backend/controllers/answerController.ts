import express, { Request, Response } from "express";
import { z } from "zod";
import { Answer, IAnswer } from '../models/answerModel';
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

export const getQuizSubmissionsSchema = z.object({
    quizId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid quizId",
    }),
});

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

export const checkQuizSubmission = async (req: Request, res: Response): Promise<any> => {
    // Log req.params for debugging
    console.log('Request params:', req.params);

    // Validate request params
    const result = getQuizSubmissionsSchema.safeParse(req.params);
    if (!result.success) {
        console.error('Validation error:', result.error);
        return res.status(400).json({ error: result.error, message: 'Invalid or missing quizId' });
    }

    const { quizId } = result.data;

    try {
        // Fetch all answers for the quiz
        const answers: IAnswer[] = await Answer.find({ quizId }).select('_id studentId quizId questionId answer timeSpent changedCount');

        // Transform to API response format
        const response = answers.map((answer) => ({
            _id: answer._id.toString(),
            studentId: answer.studentId.toString(),
            quizId: answer.quizId.toString(),
            questionId: answer.questionId.toString(),
            answer: answer.answer,
            timeSpent: answer.timeSpent,
            changedCount: answer.changedCount,
        }));

        res.status(200).json(response);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Failed to fetch quiz answers' });
    }
};