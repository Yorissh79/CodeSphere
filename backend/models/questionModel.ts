import mongoose, { Document, Schema, Model } from "mongoose";

export type QuestionType = "mcq" | "truefalse" | "short";

export interface IQuestion extends Document {
    _id: mongoose.Types.ObjectId;
    quizId: mongoose.Types.ObjectId;
    questionText: string;
    options?: string[]; // Required for MCQ/TrueFalse
    correctAnswerIndex?: number; // Optional for open-ended
    type: QuestionType;
}

const questionSchema: Schema<IQuestion> = new Schema(
    {
        quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
        questionText: { type: String, required: true },
        options: [{ type: String }],
        correctAnswerIndex: { type: Number },
        type: {
            type: String,
            enum: ["mcq", "truefalse", "short"],
            required: true,
        },
    },
    { timestamps: true }
);

const questionModel: Model<IQuestion> = mongoose.model<IQuestion>("Question", questionSchema);
export default questionModel;
