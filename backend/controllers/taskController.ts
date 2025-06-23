import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { taskModel, ITask } from '../models/taskModel';
import mongoose from 'mongoose';

// Zod Schemas
const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    assignedGroups: z.array(z.string()).min(1, 'At least one group must be assigned'),
    deadline: z.string().datetime(),
    allowLateSubmission: z.string(),
    maxPoints: z.string().refine(val => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0, {
        message: 'Points must be a valid non-negative number',
    }),
    attachments: z
        .array(
            z.object({
                type: z.enum(['text', 'image', 'link']),
                content: z.string(),
                filename: z.string().optional(),
                originalName: z.string().optional(),
            })
        )
        .optional(),
});

const getTasksQuerySchema = z.object({
    page: z
        .string()
        .transform(val => parseInt(val, 10))
        .refine(val => val >= 1, { message: 'Page must be at least 1' })
        .default('1'),
    limit: z
        .string()
        .transform(val => parseInt(val, 10))
        .refine(val => val >= 1 && val <= 100, { message: 'Limit must be between 1 and 100' })
        .default('10'),
    group: z.string().optional(),
    teacherId: z.string().optional(),
    status: z.enum(['active', 'expired']).optional(),
    sortBy: z.enum(['createdAt', 'deadline', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Create Task
export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = createTaskSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: result.error.flatten() });
            return;
        }

        const { title, description, assignedGroups, deadline, allowLateSubmission, maxPoints, attachments } = result.data;
        const teacherId = req.body.user._id; // From auth middleware

        const newTask = await taskModel.create({
            title,
            description,
            teacherId,
            assignedGroups,
            attachments: attachments || [],
            deadline,
            allowLateSubmission,
            maxPoints,
        });

        res.status(201).json({
            message: 'Task created successfully',
            task: newTask,
        });
    } catch (error) {
        console.error('Create task error:', error);
        next(new Error('Internal server error'));
    }
};

// Get All Tasks
export const getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const queryResult = getTasksQuerySchema.safeParse(req.query);
        if (!queryResult.success) {
            res.status(400).json({ error: queryResult.error.flatten() });
            return;
        }

        const { page, limit, group, teacherId, status, sortBy, sortOrder } = queryResult.data;

        const filter: any = {};
        const now = new Date().toISOString();

        if (group) filter.assignedGroups = { $in: [group] };
        if (teacherId) {
            if (!mongoose.isValidObjectId(teacherId)) {
                res.status(400).json({ error: 'Invalid teacherId' });
                return;
            }
            filter.teacherId = teacherId;
        }
        if (status === 'active') filter.deadline = { $gte: now };
        else if (status === 'expired') filter.deadline = { $lt: now };

        const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [tasks, total] = await Promise.all([
            taskModel
                .find(filter)
                .sort(sort)
                .limit(limit)
                .skip((page - 1) * limit)
                .populate('teacherId', 'name surname email')
                .lean() as Promise<ITask[]>,
            taskModel.countDocuments(filter),
        ]);

        const enrichedTasks = await Promise.all(
            tasks.map(async (task) => {
                const [submissionCount, totalStudents] = await Promise.all([
                    mongoose.model('Submission').countDocuments({ taskId: task._id }),
                    mongoose.model('Group').aggregate([
                        { $match: { _id: { $in: task.assignedGroups.map(id => new mongoose.Types.ObjectId(id)) } } },
                        { $unwind: '$students' },
                        { $group: { _id: null, count: { $sum: 1 } } },
                    ]),
                ]);

                return {
                    ...task,
                    submissionCount: submissionCount || 0,
                    totalStudents: totalStudents[0]?.count || 0,
                    dueDate: task.deadline,
                };
            })
        );

        res.json({
            tasks: enrichedTasks,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get all tasks error:', error);
        next(new Error('Failed to fetch tasks'));
    }
};

// Get Task By ID
export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            res.status(400).json({ error: 'Invalid task ID' });
            return;
        }

        const task = await taskModel
            .findById(id)
            .populate('teacherId', 'name surname email')
            .lean() as ITask;

        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        const [submissionCount, totalStudents] = await Promise.all([
            mongoose.model('Submission').countDocuments({ taskId: task._id }),
            mongoose.model('Group').aggregate([
                { $match: { _id: { $in: task.assignedGroups.map(id => new mongoose.Types.ObjectId(id)) } } },
                { $unwind: '$students' },
                { $group: { _id: null, count: { $sum: 1 } } },
            ]),
        ]);

        const enrichedTask = {
            ...task,
            submissionCount: submissionCount || 0,
            totalStudents: totalStudents[0]?.count || 0,
            dueDate: task.deadline,
        };

        res.json({ task: enrichedTask });
    } catch (error) {
        console.error('Get task by ID error:', error);
        next(new Error('Failed to fetch task'));
    }
};

// Delete All Tasks (Admin Only)
export const deleteAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (req.body.user.role !== 'admin') {
            res.status(403).json({ error: 'Unauthorized: Admin access required' });
            return;
        }

        await taskModel.deleteMany({});
        res.json({ message: 'All tasks deleted successfully' });
    } catch (error) {
        console.error('Delete all tasks error:', error);
        next(new Error('Failed to delete tasks'));
    }
};

// Delete Task By ID
export const deleteTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            res.status(400).json({ error: 'Invalid task ID' });
            return;
        }

        const task = await taskModel.findById(id);
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        // Verify teacher owns this task or user is admin
        if (task.teacherId.toString() !== req.body.user._id.toString() && req.body.user.role !== 'admin') {
            res.status(403).json({ error: 'Unauthorized to delete this task' });
            return;
        }

        await taskModel.findByIdAndDelete(id);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task by ID error:', error);
        next(new Error('Failed to delete task'));
    }
};