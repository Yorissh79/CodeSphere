import mongoose, { Document, Schema, Model } from "mongoose";

export interface Group extends Document {
    _id: mongoose.Types.ObjectId;
    teachers: string[];
    group: string;
    date: Date;
}

const groupSchema: Schema<Group> = new Schema(
    {
        teachers: { type: [String], required: true },
        group: { type: String, required: false },
        date: { type: Date, required: true, default: Date.now },
    },
    { timestamps: true }
);

const groupModel: Model<Group> = mongoose.model<Group>("Group", groupSchema);
export default groupModel;
