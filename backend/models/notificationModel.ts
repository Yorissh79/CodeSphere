import mongoose, { Document, Schema, Model } from "mongoose";

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    userType: 'teacher' | 'student';
    type: 'task_assigned' | 'submission_received' | 'task_graded' | 'deadline_reminder';
    title: string;
    message: string;
    relatedId?: mongoose.Types.ObjectId; // taskId or submissionId
    isRead: boolean;
    createdAt: Date;
}

const notificationSchema: Schema<INotification> = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userType: { type: String, enum: ['teacher', 'student'], required: true },
    type: { type: String, enum: ['task_assigned', 'submission_received', 'task_graded', 'deadline_reminder'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const notificationModel: Model<INotification> = mongoose.model<INotification>("Notification", notificationSchema);