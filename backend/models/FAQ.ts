import mongoose, { Schema, Document } from 'mongoose';

export interface IFAQ extends Document {
    question: string;
    shortAnswer: string;
    detailedAnswer: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>({
    question: {
        type: String,
        required: true
    },
    shortAnswer: {
        type: String,
        required: true
    },
    detailedAnswer: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model<IFAQ>('FAQ', FAQSchema);