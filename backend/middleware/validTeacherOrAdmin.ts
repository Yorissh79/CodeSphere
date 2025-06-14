import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import teacherModel from "../models/teacherModel";
import adminModel from "../models/adminModel";

export const validTeacherOrAdmin = async (
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

        let teacher = await teacherModel.findById(decoded.id).select("-password");

        if (teacher && teacher.role === "teacher") {
            (req as any).user = teacher;
            return next();
        }

        let admin = await adminModel.findById(decoded.id).select("-password");

        if (admin && admin.role === "admin") {
            (req as any).user = admin;
            return next();
        }

        return res.status(401).json({ error: "User not found" });
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
};