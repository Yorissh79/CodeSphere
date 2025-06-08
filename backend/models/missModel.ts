import mongoose, { Document, Schema, Model } from "mongoose";

export interface Miss extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    surname: string;
    group: string;
    miss: string;
    date: Date;
}

const missSchema: Schema<Miss> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        surname: { type: String, required: true },
        group: { type: String, required: false },
        miss: { type: String, required: true },
        date: { type: Date, required: true, default: Date.now },
    },
    { timestamps: true }
);

const missModel: Model<Miss> = mongoose.model<Miss>("Miss", missSchema);
export default missModel;
