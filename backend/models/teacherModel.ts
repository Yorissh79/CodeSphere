import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    surname: string;
    role: string;
    passwordControl(password: string): Promise<boolean>;
}

const teacherSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        surname: { type: String, required: true },
        role: { type: String, required: true },
    },
    { timestamps: true }
);

teacherSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

teacherSchema.methods.passwordControl = async function (password: string) {
    return await bcrypt.compare(password, this.password);

};

const teacherModel: Model<IUser> = mongoose.model<IUser>("Teacher", teacherSchema);
export default teacherModel;