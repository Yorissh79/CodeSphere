import { Request, Response } from 'express';
import { submissionModel, ISubmission } from '../models/submissionModel';
import mongoose from 'mongoose';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

const createSubmissionSchema = z.object({
    taskId: z.string(),
    githubUrl: z.string().url(),
});

const updateSubmissionSchema = z.object({
    githubUrl: z.string().url().optional(),
    points: z.number().optional(),
    feedback: z.string().optional(),
    status: z.enum(['submitted', 'graded', 'returned']).optional(),
});

const gradeSubmissionSchema = z.object({
    points: z.number(),
    feedback: z.string().optional(),
});

export const createSubmission = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const result = createSubmissionSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const { taskId, githubUrl } = result.data;
    const studentId = req.user?.id;

    if (!studentId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const existingSubmission = await submissionModel.findOne({ taskId, studentId });
        if (existingSubmission) {
            return res.status(409).json({ error: 'Submission already exists for this task' });
        }

        // TODO: Add logic to check if submission is late based on task deadline
        const isLate = false;

        const submission = await submissionModel.create({
            taskId,
            studentId,
            githubUrl,
            isLate,
            status: 'submitted',
        });

        const populatedSubmission = await submission.populate(['taskId', 'studentId']);

        res.status(201).json({
            message: 'Submission created successfully',
            submission: populatedSubmission,
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ error: error.message });
        } else if (error instanceof mongoose.Error && error.message.includes('duplicate key')) {
            return res.status(409).json({ error: 'Submission already exists for this task' });
        }
        console.error('Error creating submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getSubmissions = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { taskId, studentId, status } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let query: any = {};

    if (userRole === 'student') {
        query.studentId = userId;
    }

    if (taskId) query.taskId = taskId;
    if (studentId && userRole !== 'student') query.studentId = studentId;
    if (status) query.status = status;

    try {
        const submissions = await submissionModel
            .find(query)
            .populate('taskId', 'title description deadline')
            .populate('studentId', 'name email')
            .sort({ submittedAt: -1 });

        res.status(200).json({
            message: 'Submissions retrieved successfully',
            submissions,
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getSubmissionById = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid submission ID' });
    }

    let query: any = { _id: id };

    if (userRole === 'student') {
        query.studentId = userId;
    }

    try {
        const submission = await submissionModel
            .findOne(query)
            .populate('taskId', 'title description deadline')
            .populate('studentId', 'name email');

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.status(200).json({
            message: 'Submission retrieved successfully',
            submission,
        });
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateSubmission = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { id } = req.params;
    const result = updateSubmissionSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid submission ID' });
    }

    let query: any = { _id: id };
    let updateData = result.data;

    try {
        if (userRole === 'student') {
            query.studentId = userId;
            const submission = await submissionModel.findOne(query);
            if (submission && submission.status === 'graded') {
                return res.status(403).json({ error: 'Cannot update graded submission' });
            }
            updateData = { githubUrl: updateData.githubUrl };
        } else if (userRole !== 'instructor' && userRole !== 'admin') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const updatedSubmission = await submissionModel
            .findOneAndUpdate(query, { $set: updateData }, { new: true, runValidators: true })
            .populate('taskId', 'title description deadline')
            .populate('studentId', 'name email');

        if (!updatedSubmission) {
            return res.status(404).json({ error: 'Submission not found or unauthorized' });
        }

        res.status(200).json({
            message: 'Submission updated successfully',
            submission: updatedSubmission,
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Error updating submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteSubmission = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid submission ID' });
    }

    let query: any = { _id: id };

    if (userRole === 'student') {
        query.studentId = userId;
        query.status = 'submitted';
    } else if (userRole !== 'instructor' && userRole !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }

    try {
        const deletedSubmission = await submissionModel.findOneAndDelete(query);

        if (!deletedSubmission) {
            return res.status(404).json({ error: 'Submission not found or cannot be deleted' });
        }

        res.status(200).json({
            message: 'Submission deleted successfully',
            submission: deletedSubmission,
        });
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getSubmissionsByTask = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { taskId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID' });
    }

    let query: any = { taskId };

    if (userRole === 'student') {
        query.studentId = userId;
    }

    try {
        const submissions = await submissionModel
            .find(query)
            .populate('taskId', 'title description deadline')
            .populate('studentId', 'name email')
            .sort({ submittedAt: -1 });

        res.status(200).json({
            message: 'Task submissions retrieved successfully',
            submissions,
        });
    } catch (error) {
        console.error('Error fetching task submissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const gradeSubmission = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { id } = req.params;
    const result = gradeSubmissionSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }

    const { points, feedback } = result.data;
    const userRole = req.user?.role;

    if (userRole !== 'instructor' && userRole !== 'admin') {
        return res.status(403).json({ error: 'Only instructors can grade submissions' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid submission ID' });
    }

    try {
        const gradedSubmission = await submissionModel
            .findByIdAndUpdate(
                id,
                {
                    points,
                    feedback: feedback || '',
                    status: 'graded',
                },
                { new: true, runValidators: true }
            )
            .populate('taskId', 'title description deadline')
            .populate('studentId', 'name email');

        if (!gradedSubmission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.status(200).json({
            message: 'Submission graded successfully',
            submission: gradedSubmission,
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Error grading submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getSubmissionStats = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { taskId } = req.query;
    const userRole = req.user?.role;

    if (userRole !== 'instructor' && userRole !== 'admin') {
        return res.status(403).json({ error: 'Only instructors can view statistics' });
    }

    let matchQuery: any = {};
    if (taskId) {
        if (!mongoose.Types.ObjectId.isValid(taskId as string)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }
        matchQuery.taskId = new mongoose.Types.ObjectId(taskId as string);
    }

    try {
        const stats = await submissionModel.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalSubmissions: { $sum: 1 },
                    submittedCount: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } },
                    gradedCount: { $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] } },
                    returnedCount: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } },
                    lateSubmissions: { $sum: { $cond: ['$isLate', 1, 0] } },
                    averagePoints: { $avg: '$points' },
                    maxPoints: { $max: '$points' },
                    minPoints: { $min: '$points' },
                },
            },
        ]);

        const result = stats[0] || {
            totalSubmissions: 0,
            submittedCount: 0,
            gradedCount: 0,
            returnedCount: 0,
            lateSubmissions: 0,
            averagePoints: null,
            maxPoints: null,
            minPoints: null,
        };

        res.status(200).json({
            message: 'Submission statistics retrieved successfully',
            stats: result,
        });
    } catch (error) {
        console.error('Error fetching submission statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};