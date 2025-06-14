import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import userModel from "../models/userModel";

export const studentValid = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        (req as any).user = user;

        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
};