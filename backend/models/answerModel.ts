import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer extends Document {
    studentId: mongoose.Types.ObjectId;
    quizId: mongoose.Types.ObjectId;
    questionId: mongoose.Types.ObjectId;
    answer: string | number | string[];
    submittedAt: Date;
    timeSpent: number;
    changedCount: number;
}

const AnswerSchema: Schema = new Schema({
    studentId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    quizId: { type: Schema.Types.ObjectId, required: true, ref: "Quiz" },
    questionId: { type: Schema.Types.ObjectId, required: true, ref: "Question" },
    answer: { type: Schema.Types.Mixed, required: true },
    submittedAt: { type: Date, default: Date.now },
    timeSpent: { type: Number, required: true },
    changedCount: { type: Number, required: true },
});

// Prevent duplicate submissions
AnswerSchema.index({ studentId: 1, quizId: 1, questionId: 1 }, { unique: true });

export default mongoose.model<IAnswer>("Answer", AnswerSchema);