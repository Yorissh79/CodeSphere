import { Schema, model, Types } from 'mongoose';

export interface IAnswer {
    _id: Types.ObjectId;
    studentId: Types.ObjectId;
    quizId: Types.ObjectId;
    questionId: Types.ObjectId;
    answer: string | number | string[];
    timeSpent: number;
    changedCount: number;
}

const answerSchema = new Schema<IAnswer>({
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { type: Schema.Types.Mixed, required: true }, // Supports string, number, or string[]
    timeSpent: { type: Number, required: true },
    changedCount: { type: Number, required: true },
}, { timestamps: true });

export const Answer = model<IAnswer>('Answer', answerSchema);