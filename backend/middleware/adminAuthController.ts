import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import adminModel from "../models/adminModel";

export const checkAdminAuth = async (req: Request, res: Response): Promise<any> => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

        const user = await adminModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        res.status(200).json({ user });
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
};
