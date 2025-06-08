import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import UserModel from "../models/userModel";

interface UserPayload {
    _id: string;
    name: string;
    group?: string;
    email: string;
    password: string;
    surname: string;
    role: string;
}

interface AuthenticatedRequest extends Request {
    user?: UserPayload;
}

const userControl = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies?.jwt;

    if (!token) {
        return res.status(401).json({ error: "Token not found" });
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET is not set");

        const decoded = jwt.verify(token, secret) as { id: string };

        const user = await UserModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        next();
    } catch (error) {
        console.error("JWT validation error:", error);
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

export default userControl;
