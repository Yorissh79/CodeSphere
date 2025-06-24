import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITask extends Document {
    _id: string;
    title: string;
    description: string;
    teacherId: mongoose.Types.ObjectId | { // Allow both ObjectId and populated object
        _id: string;
        name: string;
        surname: string;
        email: string;
    };
    assignedGroups: string[];
    attachments: {
        type: 'text' | 'image' | 'link' | 'file';
        content: string;
        filename?: string;
        originalName?: string;
    }[];
    deadline: string; // ISO date string
    allowLateSubmission: boolean;
    maxPoints: string;
    createdAt: string;
    updatedAt: string;
    dueDate?: string; // For frontend compatibility
    submissionCount?: number; // Optional, may be added by backend
    totalStudents?: number; // Optional, may be added by backend
}

const taskSchema: Schema<ITask> = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    assignedGroups: [{
        type: String,
        required: true
    }],
    attachments: [{
        type: {
            type: String,
            enum: ['text', 'image', 'link', 'file'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        filename: {
            type: String
        },
        originalName: {
            type: String
        }
    }],
    deadline: {
        type: String,
        required: true,
        validate: {
            validator: function(v: string) {
                // Validate ISO date string
                return !isNaN(Date.parse(v));
            },
            message: 'Invalid deadline format'
        }
    },
    allowLateSubmission: {
        type: Boolean,
        required: true,
    },
    maxPoints: {
        type: String,
        required: true,
        validate: {
            validator: function(v: string) {
                const num = parseInt(v, 10);
                return !isNaN(num) && num >= 0;
            },
            message: 'Max points must be a valid non-negative number'
        }
    },
    dueDate: {
        type: String,
        validate: {
            validator: function(v: string) {
                return !v || !isNaN(Date.parse(v));
            },
            message: 'Invalid due date format'
        }
    },
    submissionCount: {
        type: Number,
        min: 0,
        default: 0
    },
    totalStudents: {
        type: Number,
        min: 0,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add indexes for better query performance
taskSchema.index({ teacherId: 1, createdAt: -1 });
taskSchema.index({ assignedGroups: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure dueDate matches deadline
taskSchema.pre('save', function(next) {
    if (this.deadline && !this.dueDate) {
        this.dueDate = this.deadline;
    }
    next();
});

export const taskModel: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);