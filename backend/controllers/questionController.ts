import { Request, Response } from "express";
import questionModel from "../models/questionModel";
import quizModel from "../models/quizModel";
import { z } from "zod";
import mongoose from "mongoose";

const createQuestionSchema = z.object({
    quizId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid quizId",
    }),
    questionText: z.string().min(1, "Question text is required"),
    type: z.enum(["mcq", "truefalse", "short"]),
    options: z.array(z.string()).optional(),
    correctAnswerIndices: z.array(z.number().int().nonnegative()).optional(),
}).refine(
    (data) => {
        if (data.type === "mcq" || data.type === "truefalse") {
            // Ensure options and correctAnswerIndices are provided and valid
            return (
                data.options &&
                data.options.length > 0 &&
                data.correctAnswerIndices &&
                data.correctAnswerIndices.length > 0 && // Ensure at least one correct answer
                data.correctAnswerIndices.every((idx) => idx >= 0 && idx < (data.options?.length ?? 0))
            );
        }
        // For short questions, options and correctAnswerIndices should not be provided
        return !data.options && !data.correctAnswerIndices;
    },
    { message: "Invalid options or correctAnswerIndices for question type" }
);

export const createQuestion = async (req: Request, res: Response): Promise<any> => {
    const result = createQuestionSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const { quizId, ...questionData } = result.data;

    try {
        const question = await questionModel.create({ ...questionData, quizId });
        await quizModel.findByIdAndUpdate(quizId, {
            $push: { questionIds: question._id },
        });
        res.status(201).json({ message: "Question added", question });
    } catch (err) {
        res.status(500).json({ error: "Failed to add question" });
    }
};


export const getQuestionsByQuiz = async (req: Request, res: Response):Promise<any> => {
    try {
        const questions = await questionModel.find({ quizId: req.params.quizId });
        res.status(200).json(questions);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch questions" });
    }
};

export const deleteQuestion = async (req: Request, res: Response):Promise<any> => {
    try {
        const question = await questionModel.findByIdAndDelete(req.params.id);
        if (!question) return res.status(404).json({ error: "Question not found" });

        await quizModel.findByIdAndUpdate(question.quizId, {
            $pull: { questionIds: question._id },
        });

        res.status(200).json({ message: "Question deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete question" });
    }
};
