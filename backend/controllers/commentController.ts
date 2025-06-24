import { Request, Response } from 'express';
import { z } from 'zod';
import { commentModel } from '../models/commentModel';
import { submissionModel } from '../models/submissionModel';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Omit<Request, 'user'> {
    user?: {
        id: string;
        role: string;
    };
}

const createCommentSchema = z.object({
    content: z.string().min(1, "Comment content is required").max(1000, "Comment too long"),
});

const updateCommentSchema = z.object({
    content: z.string().min(1, "Comment content is required").max(1000, "Comment too long"),
});

export const createComment = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { submissionId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
        return res.status(400).json({ error: 'Invalid submission ID' });
    }

    const result = createCommentSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error.flatten() });
    }

    const { content } = result.data;

    try {
        const submission = await submissionModel.findById(submissionId).populate('taskId');
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const task = submission.taskId as any;
        const isTeacher = userRole === 'teacher' || userRole === 'instructor';
        const isSubmissionOwner = submission.studentId.toString() === userId;
        const isTaskOwner = isTeacher && task.teacherId.toString() === userId;

        if (!isSubmissionOwner && !isTaskOwner) {
            return res.status(403).json({ error: 'Unauthorized to comment on this submission' });
        }

        const comment = await commentModel.create({
            submissionId,
            authorId: userId,
            authorType: isTeacher ? 'teacher' : 'student',
            content,
        });

        const populatedComment = await comment.populate('authorId', 'name surname email');

        res.status(201).json({
            message: 'Comment created successfully',
            comment: populatedComment,
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getCommentsBySubmission = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { submissionId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
        return res.status(400).json({ error: 'Invalid submission ID' });
    }

    try {
        const submission = await submissionModel.findById(submissionId).populate('taskId');
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const task = submission.taskId as any;
        const isTeacher = userRole === 'teacher' || userRole === 'instructor';
        const isSubmissionOwner = submission.studentId.toString() === userId;
        const isTaskOwner = isTeacher && task.teacherId.toString() === userId;

        if (!isSubmissionOwner && !isTaskOwner) {
            return res.status(403).json({ error: 'Unauthorized to view comments on this submission' });
        }

        const comments = await commentModel
            .find({ submissionId })
            .populate('authorId', 'name surname email')
            .sort({ createdAt: 1 });

        res.status(200).json({
            message: 'Comments retrieved successfully',
            comments,
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateComment = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid comment ID' });
    }

    const result = updateCommentSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error.flatten() });
    }

    const { content } = result.data;

    try {
        const comment = await commentModel.findOne({
            _id: id,
            authorId: userId,
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found or unauthorized' });
        }

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (comment.createdAt < fiveMinutesAgo) {
            return res.status(403).json({ error: 'Comment can only be edited within 5 minutes of creation' });
        }

        const updatedComment = await commentModel
            .findByIdAndUpdate(
                id,
                { content },
                { new: true, runValidators: true }
            )
            .populate('authorId', 'name surname email');

        if (!updatedComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.status(200).json({
            message: 'Comment updated successfully',
            comment: updatedComment,
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid comment ID' });
    }

    try {
        const comment = await commentModel
            .findById(id)
            .populate({
                path: 'submissionId',
                populate: { path: 'taskId' },
            });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const submission = comment.submissionId as any;
        const task = submission.taskId;

        const isCommentAuthor = comment.authorId.toString() === userId;
        const isTaskOwner = (userRole === 'teacher' || userRole === 'instructor') &&
            task.teacherId.toString() === userId;

        if (!isCommentAuthor && !isTaskOwner) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }

        await commentModel.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Comment deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getCommentsByAuthor = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const comments = await commentModel
            .find({ authorId: userId })
            .populate('submissionId', '_id')
            .populate({
                path: 'submissionId',
                populate: {
                    path: 'taskId',
                    select: 'title',
                },
            })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const totalComments = await commentModel.countDocuments({ authorId: userId });

        res.status(200).json({
            message: 'Comments retrieved successfully',
            comments,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalComments / Number(limit)),
                totalComments,
            },
        });
    } catch (error) {
        console.error('Error fetching user comments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getCommentStats = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { taskId, submissionId } = req.query;
    const userRole = req.user?.role;

    if (userRole !== 'teacher' && userRole !== 'instructor' && userRole !== 'admin') {
        return res.status(403).json({ error: 'Only instructors can view comment statistics' });
    }

    let matchQuery: any = {};

    if (submissionId) {
        if (!mongoose.Types.ObjectId.isValid(submissionId as string)) {
            return res.status(400).json({ error: 'Invalid submission ID' });
        }
        matchQuery.submissionId = new mongoose.Types.ObjectId(submissionId as string);
    } else if (taskId) {
        if (!mongoose.Types.ObjectId.isValid(taskId as string)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }

        const submissions = await submissionModel.find({ taskId }).select('_id');
        const submissionIds = submissions.map(sub => sub._id);
        matchQuery.submissionId = { $in: submissionIds };
    }

    try {
        const stats = await commentModel.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalComments: { $sum: 1 },
                    teacherComments: { $sum: { $cond: [{ $eq: ['$authorType', 'teacher'] }, 1, 0] } },
                    studentComments: { $sum: { $cond: [{ $eq: ['$authorType', 'student'] }, 1, 0] } },
                    averageCommentsPerSubmission: { $avg: 1 },
                },
            },
        ]);

        const result = stats[0] || {
            totalComments: 0,
            teacherComments: 0,
            studentComments: 0,
            averageCommentsPerSubmission: 0,
        };

        res.status(200).json({
            message: 'Comment statistics retrieved successfully',
            stats: result,
        });
    } catch (error) {
        console.error('Error fetching comment statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};