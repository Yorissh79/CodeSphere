import mongoose, { Schema, Document } from 'mongoose';

export interface IContent extends Document {
    pageType: 'about' | 'faq' | 'contact' | 'privacy';
    title: string;
    content: any; // Flexible content structure
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ContentSchema = new Schema<IContent>({
    pageType: {
        type: String,
        enum: ['about', 'faq', 'contact', 'privacy'],
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: Schema.Types.Mixed,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model<IContent>('Content', ContentSchema);