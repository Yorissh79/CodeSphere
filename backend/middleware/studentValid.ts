import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import userModel from "../models/userModel";
import { User } from '../types/types'; // Assuming your User type is defined here

// Extend the Request interface to include the 'user' property
interface AuthenticatedRequest extends Request {
    user?: User; // Make user optional to align with initial state, but ensure it's set later
}

export const studentValid = async (
    req: AuthenticatedRequest, // Use the extended AuthenticatedRequest interface
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

        // Assign the fetched user to req.user, ensuring it matches the User type
        req.user = user as unknown as User; // Explicitly cast to User type if userModel's return type isn't strictly User

        next();
    } catch (err) {
        // This catch block handles token verification failures (e.g., expired or invalid token)
        return res.status(401).json({ error: "Invalid token" });
    }
};