// userModel.ts

import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    surname: string;
    role: string;
    group: string;
    googleId?: string;
    otp?: string; // Add OTP field
    otpExpires?: Date; // Add OTP expiration field
    isVerified: boolean; // Add verification status
    passwordControl(password: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        surname: { type: String, required: false },
        role: { type: String, required: true },
        group: { type: String, required: false },
        googleId: { type: String, required: false },
        otp: { type: String },
        otpExpires: { type: Date },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
    if (this.isModified("password") && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.passwordControl = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

const userModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default userModel;