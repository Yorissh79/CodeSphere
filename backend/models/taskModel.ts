import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITask extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    teacherId: mongoose.Types.ObjectId;
    assignedGroups: string[]; // Group names
    attachments: {
        type: 'text' | 'image' | 'link';
        content: string;
        filename?: string;
        originalName?: string;
    }[];
    deadline: Date;
    allowLateSubmission: string;
    maxPoints: string;
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema: Schema<ITask> = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    assignedGroups: [{ type: String, required: true }],
    attachments: [{
        type: { type: String, enum: ['text', 'image', 'link'], required: true },
        content: { type: String, required: true },
        filename: { type: String },
        originalName: { type: String }
    }],
    deadline: { type: Date, required: true },
    allowLateSubmission: { type: String},
    maxPoints: { type: String, required: true}
}, { timestamps: true });

export const taskModel: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);
