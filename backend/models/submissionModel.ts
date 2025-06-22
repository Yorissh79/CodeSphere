import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISubmission extends Document {
    _id: mongoose.Types.ObjectId;
    taskId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    githubUrl: string;
    submittedAt: Date;
    isLate: boolean;
    points?: number;
    feedback?: string;
    status: 'submitted' | 'graded' | 'returned';
}

const submissionSchema: Schema<ISubmission> = new Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    githubUrl: {
        type: String,
        required: true,
        validate: {
            validator: (v: string) => /^https:\/\/github\.com\//.test(v),
            message: 'Must be a valid GitHub URL'
        }
    },
    submittedAt: { type: Date, default: Date.now },
    isLate: { type: Boolean, default: false },
    points: { type: Number, min: 0 },
    feedback: { type: String },
    status: { type: String, enum: ['submitted', 'graded', 'returned'], default: 'submitted' }
}, { timestamps: true });

// Compound index to prevent duplicate submissions
submissionSchema.index({ taskId: 1, studentId: 1 }, { unique: true });

export const submissionModel: Model<ISubmission> = mongoose.model<ISubmission>("Submission", submissionSchema);