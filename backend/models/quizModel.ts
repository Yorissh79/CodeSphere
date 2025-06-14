import mongoose, { Document, Schema, Model } from "mongoose";

export interface IQuiz extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    tags?: string[];
    questionIds: mongoose.Types.ObjectId[];
    timeLimit?: number; // in seconds
}

const quizSchema: Schema<IQuiz> = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        tags: [{ type: String }],
        questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
        timeLimit: { type: Number },
    },
    { timestamps: true }
);

const quizModel: Model<IQuiz> = mongoose.model<IQuiz>("Quiz", quizSchema);
export default quizModel;
