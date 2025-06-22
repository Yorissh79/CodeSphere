import mongoose, { Document, Schema, Model } from "mongoose";

export interface IComment extends Document {
    _id: mongoose.Types.ObjectId;
    submissionId: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    authorType: 'teacher' | 'student';
    content: string;
    createdAt: Date;
}

const commentSchema: Schema<IComment> = new Schema({
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    authorType: { type: String, enum: ['teacher', 'student'], required: true },
    content: { type: String, required: true },
}, { timestamps: true });

export const commentModel: Model<IComment> = mongoose.model<IComment>("Comment", commentSchema);