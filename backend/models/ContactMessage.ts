import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
    name: string;
    email: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
    reply?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'replied'],
        default: 'unread'
    },
    reply: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);