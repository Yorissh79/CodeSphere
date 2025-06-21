import { Schema, model, Types } from 'mongoose';

export interface IAnswer {
    _id: Types.ObjectId;
    studentId: Types.ObjectId;
    quizId: Types.ObjectId;
    questionId: Types.ObjectId;
    answer: string | number | string[];
    timeSpent: number;
    changedCount: number;
    reviewed?: boolean;
    teacherFeedback?: string;
    isCorrect?: boolean;
}

const answerSchema = new Schema<IAnswer>({
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { type: Schema.Types.Mixed, required: true },
    timeSpent: { type: Number, required: true },
    changedCount: { type: Number, required: true },
    isCorrect: { type: Boolean, default: undefined },
    teacherFeedback: { type: String, default: undefined },
    reviewed: { type: Boolean, default: false },
}, { timestamps: true });

export const Answer = model<IAnswer>('Answer', answerSchema);