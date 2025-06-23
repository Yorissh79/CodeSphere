import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITask extends Document {
    _id: string;
    title: string;
    description: string;
    teacherId: {
        _id: string;
        name: string;
        surname: string;
        email: string;
    };
    assignedGroups: string[];
    attachments: {
        type: 'text' | 'image' | 'link';
        content: string;
        filename?: string;
        originalName?: string;
    }[];
    deadline: string; // ISO date string
    allowLateSubmission: string;
    maxPoints: string;
    createdAt: string;
    updatedAt: string;
    dueDate?: string; // For frontend compatibility
    submissionCount?: number; // Optional, may be added by backend
    totalStudents?: number; // Optional, may be added by backend
}

const taskSchema: Schema<ITask> = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    assignedGroups: [{ type: String, required: true }],
    attachments: [{
        type: { type: String, enum: ['text', 'image', 'link'], required: true },
        content: { type: String, required: true },
        filename: { type: String },
        originalName: { type: String }
    }],
    deadline: { type: String, required: true }, // Changed from Date to String to match interface
    allowLateSubmission: { type: String, required: true }, // Added required: true
    maxPoints: { type: String, required: true },
    dueDate: { type: String }, // Optional ISO date string
    submissionCount: { type: Number }, // Optional
    totalStudents: { type: Number } // Optional
}, { timestamps: true });

export const taskModel: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);
