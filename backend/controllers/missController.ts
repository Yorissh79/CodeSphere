import { Request, Response } from "express";
import mongoose from "mongoose";
import missModel from "../models/missModel";
import { z } from "zod";

// Zod schemas
const missSchema = z.object({
    studentId: z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid student ID format",
    }),
    miss: z.string().min(1),
    date: z.string().optional()
});

const updateMissSchema = z.object({
    miss: z.string().optional(),
    date: z.string().optional()
});

// Add a new miss
export const addMiss = async (req: Request, res: Response):Promise<any> => {
    const user = (req as any).user;

    console.log(user)

    if (!user) return res.status(401).json({ success: false, message: "Authentication required" });
    if (user.role !== "teacher") return res.status(403).json({ success: false, message: "Only teachers can add misses" });

    const input = Array.isArray(req.body) ? req.body : [req.body];

    const parsedMisses = input.map((entry, i) => {
        const result = missSchema.safeParse(entry);
        if (!result.success) {
            return { success: false, error: result.error, index: i };
        }
        return { success: true, data: result.data };
    });

    const hasErrors = parsedMisses.some(entry => !entry.success);
    if (hasErrors) {
        const errors = parsedMisses
            .filter(entry => !entry.success)
            .map(({ error, index }) => ({ index, issues: error?.issues }));

        return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    try {
        const dataToInsert = parsedMisses.map(entry => ({
            student: (entry as any).data.studentId,
            miss: (entry as any).data.miss,
            date: (entry as any).data.date ? new Date((entry as any).data.date) : new Date()
        }));

        const inserted = await missModel.insertMany(dataToInsert);

        res.status(201).json({ success: true, message: "Misses added successfully", data: inserted });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// Get all misses of a student
export const getStudentMisses = async (req: Request, res: Response): Promise<any> => {
    const user = (req as any).user;
    const { studentId } = req.params;

    if (!user) return res.status(401).json({ success: false, message: "Authentication required" });
    if (!mongoose.Types.ObjectId.isValid(studentId)) return res.status(400).json({ success: false, message: "Invalid student ID format" });

    if (user.role === "student" && user._id.toString() !== studentId) {
        return res.status(403).json({ success: false, message: "You can only view your own misses" });
    }

    try {
        const misses = await missModel.find({ student: studentId }).populate("student", "name email").sort({ date: -1 });

        res.status(200).json({
            success: true,
            message: "Misses retrieved successfully",
            data: misses,
            count: misses.length
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// Get all misses (for teacher)
export const getAllMisses = async (req: Request, res: Response): Promise<any> => {
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (user.role !== "teacher") {
        return res.status(403).json({ success: false, message: "Only teachers can view all misses" });
    }

    const { page = 1, limit = 10, studentId, startDate, endDate } = req.query;

    const filter: any = {
        miss: { $ne: "Present" } // ✅ Exclude Present entries
    };

    // ✅ Support comma-separated student IDs
    if (studentId) {
        const ids = (studentId as string).split(",").filter(id => mongoose.Types.ObjectId.isValid(id));
        if (ids.length > 0) {
            filter.student = { $in: ids };
        }
    }

    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate as string);
        if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    try {
        const skip = (Number(page) - 1) * Number(limit);

        const [misses, total] = await Promise.all([
            missModel.find(filter)
                .populate("student", "name email")
                .sort({ date: -1 })
                .skip(skip)
                .limit(Number(limit)),
            missModel.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            message: "Filtered misses retrieved successfully",
            data: misses,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalItems: total,
                itemsPerPage: Number(limit)
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
// Update miss
export const updateMiss = async (req: Request, res: Response): Promise<any> => {
    const user = (req as any).user;
    const { missId } = req.params;

    if (!user) return res.status(401).json({ success: false, message: "Authentication required" });
    if (user.role !== "teacher") return res.status(403).json({ success: false, message: "Only teachers can update misses" });
    if (!mongoose.Types.ObjectId.isValid(missId)) return res.status(400).json({ success: false, message: "Invalid miss ID format" });

    const parsed = updateMissSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error });

    try {
        const updatedMiss = await missModel.findByIdAndUpdate(
            missId,
            { $set: parsed.data },
            { new: true, runValidators: true }
        ).populate("student", "name email");

        if (!updatedMiss) return res.status(404).json({ success: false, message: "Miss record not found" });

        res.status(200).json({ success: true, message: "Miss updated successfully", data: updatedMiss });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// Delete miss
export const deleteMiss = async (req: Request, res: Response): Promise<any> => {
    const user = (req as any).user;
    const { missId } = req.params;

    if (!user) return res.status(401).json({ success: false, message: "Authentication required" });
    if (user.role !== "teacher") return res.status(403).json({ success: false, message: "Only teachers can delete misses" });
    if (!mongoose.Types.ObjectId.isValid(missId)) return res.status(400).json({ success: false, message: "Invalid miss ID format" });

    try {
        const deletedMiss = await missModel.findByIdAndDelete(missId);
        if (!deletedMiss) return res.status(404).json({ success: false, message: "Miss record not found" });

        res.status(200).json({ success: true, message: "Miss deleted successfully", data: deletedMiss });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// Get current student's misses
export const getMyMisses = async (req: Request, res: Response): Promise<any> => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, message: "Authentication required" });

    try {
        const misses = await missModel.find({ student: user._id }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            message: "Your misses retrieved successfully",
            data: misses,
            count: misses.length
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
