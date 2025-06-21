import express, { Request, Response } from "express";
import { z } from "zod";
import { Answer, IAnswer } from "../models/answerModel";
import questionModel from "../models/questionModel";
import mongoose from "mongoose";

const AnswerSchema = z.array(
    z.object({
        studentId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid studentId",
        }),
        quizId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid quizId",
        }),
        questionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid questionId",
        }),
        answer: z.union([z.string(), z.number(), z.array(z.string())]),
        timeSpent: z.number().min(0),
        changedCount: z.number().min(0),
    })
);

const TeacherEvaluationSchema = z.object({
    answerId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid answerId",
    }),
    isCorrect: z.boolean(),
    teacherFeedback: z.string().optional(),
});

export const getQuizSubmissionsSchema = z.object({
    quizId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid quizId",
    }),
});

// Helper to compute correctness
const computeCorrectness = async (answerData: any, question: any): Promise<boolean> => {
    if (question.type === "short") return false; // Short answers are teacher-evaluated
    if (!question.options || !question.correctAnswerIndices) return false;

    if (question.type === "truefalse") {
        const correctAnswer = question.options[question.correctAnswerIndices[0]];
        return answerData.answer === correctAnswer;
    }

    // MCQ: Check if all selected answers match correct indices
    const selectedIndices = Array.isArray(answerData.answer)
        ? answerData.answer.map((ans: string) => question.options.indexOf(ans))
        : [Number(answerData.answer)];
    return (
        selectedIndices.length === question.correctAnswerIndices.length &&
        selectedIndices.every((index: number) => question.correctAnswerIndices.includes(index))
    );
};

export const createAnswer = async (req: Request, res: Response): Promise<any> => {
    try {
        const parsed = AnswerSchema.parse(req.body);

        // Check for existing submissions
        const existing = await Answer.findOne({
            studentId: parsed[0].studentId,
            quizId: parsed[0].quizId,
        });

        if (existing) {
            return res.status(400).json({ error: "Quiz already submitted by this student" });
        }

        // Compute correctness for each answer
        const answers = await Promise.all(
            parsed.map(async (ans) => {
                const question = await questionModel.findById(ans.questionId);
                if (!question) {
                    throw new Error(`Question ${ans.questionId} not found`);
                }
                const isCorrect = question.type !== "short" ? await computeCorrectness(ans, question) : undefined;
                return {
                    ...ans,
                    studentId: new mongoose.Types.ObjectId(ans.studentId),
                    quizId: new mongoose.Types.ObjectId(ans.quizId),
                    questionId: new mongoose.Types.ObjectId(ans.questionId),
                    isCorrect,
                };
            })
        );

        await Answer.insertMany(answers);

        res.status(201).json({ message: "Answers submitted successfully" });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const checkQuizSubmission = async (req: Request, res: Response): Promise<any> => {
    const result = getQuizSubmissionsSchema.safeParse(req.params);
    if (!result.success) {
        console.error("Validation error:", result.error);
        return res.status(400).json({ error: result.error, message: "Invalid or missing quizId" });
    }

    const { quizId } = result.data;

    try {
        const answers: IAnswer[] = await Answer.find({ quizId }).lean();
        const questions = await questionModel.find({ quizId }).lean();

        const response = answers.map((answer) => {
            const question = questions.find((q) => q._id.toString() === answer.questionId.toString());
            return {
                _id: answer._id.toString(),
                studentId: answer.studentId.toString(),
                quizId: answer.quizId.toString(),
                questionId: answer.questionId.toString(),
                answer: answer.answer,
                timeSpent: answer.timeSpent,
                changedCount: answer.changedCount,
                isCorrect: answer.isCorrect,
                teacherFeedback: answer.teacherFeedback,
                reviewed: answer.reviewed,
            };
        });

        res.status(200).json(response);
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Failed to fetch quiz answers" });
    }
};

export const updateTeacherEvaluation = async (req: Request, res: Response): Promise<any> => {
    try {
        const { answerId, isCorrect, teacherFeedback } = TeacherEvaluationSchema.parse(req.body);
        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({ message: "Answer not found" });
        }

        const question = await questionModel.findById(answer.questionId);
        if (!question || question.type !== "short") {
            return res.status(400).json({ message: "Invalid question type for teacher evaluation" });
        }

        answer.isCorrect = isCorrect;
        answer.teacherFeedback = teacherFeedback;
        answer.reviewed = true;
        await answer.save();

        res.status(200).json({ message: "Evaluation updated", answer });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};