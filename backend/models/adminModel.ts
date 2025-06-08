import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface Admin extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    surname: string;
    role: string;
    group?: string;
    passwordControl(password: string): Promise<boolean>;
}

const adminSchema: Schema<Admin> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        surname: { type: String, required: true },
        role: { type: String, required: true },
        group: { type: String, required: false },
    },
    { timestamps: true }
);

adminSchema.pre<Admin>("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

adminSchema.methods.passwordControl = async function (password: string) {
    return await bcrypt.compare(password, this.password);

};

const adminModel: Model<Admin> = mongoose.model<Admin>("Admin", adminSchema);
export default adminModel;
