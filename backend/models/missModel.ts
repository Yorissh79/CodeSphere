import mongoose, { Document, Schema, Model } from "mongoose";

export interface Miss extends Document {
    _id: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId; // Reference to User (student)
    miss: string;
    date: Date;
}

const missSchema: Schema<Miss> = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
        miss: { type: String, required: true },
        date: { type: Date, required: true, default: Date.now },
    },
    { timestamps: true }
);

const missModel: Model<Miss> = mongoose.model<Miss>("Miss", missSchema);
export default missModel;