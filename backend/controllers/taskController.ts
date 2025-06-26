import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { taskModel, ITask } from '../models/taskModel';
import { fileUploadService } from './fileUploadService';
import mongoose from 'mongoose';
import { User } from '../types/types'; // or wherever your User type lives

interface AuthenticatedRequest extends Request {
    user: User;
    files?: Express.Multer.File[]; // Add files property for multer
}

// Define the attachment schema for Zod
const attachmentSchema = z.object({
    type: z.enum(['text', 'image', 'link', 'file']),
    content: z.string(),
    filename: z.string().optional(),
    originalName: z.string().optional(),
});

// Zod Schemas
const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    assignedGroups: z.array(z.string()).min(1, 'At least one group must be assigned'),
    deadline: z.string().datetime(),
    allowLateSubmission: z.boolean(),
    maxPoints: z.string().refine(val => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0, {
        message: 'Points must be a valid non-negative number',
    }),
    // Now expecting a unified 'attachments' array from the frontend
    attachments: z.array(attachmentSchema).optional(),
});

const updateTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    assignedGroups: z.array(z.string()).min(1, 'At least one group must be assigned').optional(),
    deadline: z.string().datetime().optional(),
    allowLateSubmission: z.boolean().optional(),
    maxPoints: z.string().refine(val => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0, {
        message: 'Points must be a valid non-negative number',
    }).optional(),
    // Now expecting a unified 'attachments' array from the frontend
    attachments: z.array(attachmentSchema).optional(),
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
export const createTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        // Check for authenticated user
        if (!req.user || !req.user._id) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const teacherId = req.user._id;

        let parsedBody = { ...req.body };

        // Parse assignedGroups if it's a string (from form-data)
        if (typeof req.body.assignedGroups === 'string') {
            try {
                parsedBody.assignedGroups = JSON.parse(req.body.assignedGroups);
            } catch (e) {
                console.error('Failed to parse assignedGroups:', e);
                res.status(400).json({ error: 'Invalid assignedGroups format' });
                return;
            }
        }

        // Parse attachments if it's a string (from form-data, if no files are directly uploaded)
        // This handles cases where attachments are sent as JSON string in form-data
        if (typeof req.body.attachments === 'string') {
            try {
                parsedBody.attachments = JSON.parse(req.body.attachments);
            } catch (e) {
                console.error('Failed to parse attachments:', e);
                // If parsing fails, treat as empty array
                parsedBody.attachments = [];
            }
        } else if (!req.body.attachments) {
            // If attachments field is completely missing, ensure it's an empty array for processing
            parsedBody.attachments = [];
        }


        const result = createTaskSchema.safeParse(parsedBody);
        if (!result.success) {
            console.error('Validation error:', result.error);
            res.status(400).json({ error: result.error.flatten() });
            return;
        }

        const { title, description, assignedGroups, deadline, allowLateSubmission, maxPoints, attachments: bodyAttachments } = result.data;

        // Process all attachments: files uploaded via multer and attachments from request body
        // The fileUploadService will now combine and differentiate
        const processedAttachments = fileUploadService.processTaskAttachments(
            req.files as Express.Multer.File[], // Files uploaded via Multer (Cloudinary URLs)
            bodyAttachments || [] // Attachments from the request body (could be existing URLs or new base64)
        );

        console.log('Processed attachments:', processedAttachments);

        const newTask = await taskModel.create({
            title,
            description,
            teacherId,
            assignedGroups,
            attachments: processedAttachments,
            deadline,
            allowLateSubmission,
            maxPoints,
        });

        // Populate the teacher information for the response
        const populatedTask = await taskModel
            .findById(newTask._id)
            .populate('teacherId', 'name surname email')
            .lean();

        res.status(201).json({
            message: 'Task created successfully',
            task: populatedTask,
        });
    } catch (error) {
        console.error('Create task error:', error);
        next(new Error('Internal server error'));
    }
};

// Update Task By ID
export const updateTaskById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user || !req.user._id) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            res.status(400).json({ error: 'Invalid task ID' });
            return;
        }

        let parsedBody = { ...req.body };

        // Parse assignedGroups if it's a string (from form-data)
        if (typeof req.body.assignedGroups === 'string') {
            try {
                parsedBody.assignedGroups = JSON.parse(req.body.assignedGroups);
            } catch (e) {
                console.error('Failed to parse assignedGroups:', e);
                res.status(400).json({ error: 'Invalid assignedGroups format' });
                return;
            }
        }

        // Parse attachments if it's a string (from form-data, if no files are directly uploaded)
        if (typeof req.body.attachments === 'string') {
            try {
                parsedBody.attachments = JSON.parse(req.body.attachments);
            } catch (e) {
                console.error('Failed to parse attachments:', e);
                parsedBody.attachments = [];
            }
        } else if (!req.body.attachments) {
            parsedBody.attachments = [];
        }


        const result = updateTaskSchema.safeParse(parsedBody);
        if (!result.success) {
            console.error('Validation error:', result.error);
            res.status(400).json({ error: result.error.flatten() });
            return;
        }

        const task = await taskModel.findById(id);
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        // Verify teacher owns this task or user is admin
        if (task.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403).json({ error: 'Unauthorized to update this task' });
            return;
        }

        const { title, description, assignedGroups, deadline, allowLateSubmission, maxPoints, attachments: bodyAttachments } = result.data;

        // Prepare update object
        const updateFields: Partial<ITask> = {};
        if (title !== undefined) updateFields.title = title;
        if (description !== undefined) updateFields.description = description;
        if (assignedGroups !== undefined) updateFields.assignedGroups = assignedGroups;
        if (deadline !== undefined) updateFields.deadline = deadline;
        if (allowLateSubmission !== undefined) updateFields.allowLateSubmission = allowLateSubmission;
        if (maxPoints !== undefined) updateFields.maxPoints = maxPoints;

        // Process attachments: files uploaded via multer and attachments from request body
        // This will combine existing attachments (sent from frontend) and new files (uploaded via multer).
        const processedAttachments = fileUploadService.processTaskAttachments(
            req.files as Express.Multer.File[],
            bodyAttachments || []
        );
        updateFields.attachments = processedAttachments;


        const updatedTask = await taskModel
            .findByIdAndUpdate(id, updateFields, { new: true, runValidators: true })
            .populate('teacherId', 'name surname email')
            .lean();

        res.json({
            message: 'Task updated successfully',
            task: updatedTask,
        });
    } catch (error) {
        console.error('Update task by ID error:', error);
        next(new Error('Failed to update task'));
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
        if (!req.user || req.user.role !== 'admin') {
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
        if (!req.user || !req.user._id) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const { id } = req.params;

        const task = await taskModel.findById(id);
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        await taskModel.findByIdAndDelete(id);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task by ID error:', error);
        next(new Error('Failed to delete task'));
    }
};

const getStudentTasksQuerySchema = z.object({
    // studentId is NOT expected as a query parameter from the frontend here.
    // It will be derived from req.user.id on the backend.
    groupIds: z.array(z.string()).or(z.string()).transform(val =>
        Array.isArray(val) ? val : [val]
    ),
    status: z.enum(['active', 'expired', 'all']).optional(),
    sortBy: z.enum(['createdAt', 'deadline', 'title']).default('deadline'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Add this new controller function to your existing task controller
export const getAllStudentTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // SECURELY get studentId from the authenticated user object.
        // This relies on your authentication middleware setting req.user.id.
        const studentId = req.user?._id;

        if (!studentId) {
            // This case should ideally be handled by earlier authentication middleware
            // that prevents unauthenticated access or redirects.
            res.status(401).json({ error: 'Authentication required: Student ID is not available.' });
            return;
        }

        // Handle groupIds from query parameters
        let rawGroupIds = req.query.groupIds;
        if (typeof rawGroupIds === 'string') {
            rawGroupIds = [rawGroupIds];
        } else if (!rawGroupIds) {
            rawGroupIds = [];
        }

        // Validate query parameters using Zod (excluding studentId)
        const queryResult = getStudentTasksQuerySchema.safeParse({
            ...req.query,
            groupIds: rawGroupIds
        });

        if (!queryResult.success) {
            res.status(400).json({ error: queryResult.error.flatten() });
            return;
        }

        const { groupIds, status, sortBy, sortOrder } = queryResult.data;

        // Validate studentId from the authenticated user (it must be a valid MongoDB ObjectId)
        if (!mongoose.isValidObjectId(studentId)) {
            res.status(400).json({ error: 'Invalid student ID format provided by authentication system.' });
            return;
        }

        // Validate groupIds - allow empty array if no group provided
        const validGroupIds = groupIds.filter(id => id && mongoose.isValidObjectId(id));

        // If no valid groupIds are provided AND some groupIds were attempted but invalid,
        // it means there was a format error. If rawGroupIds was empty, it's just no groups.
        if (validGroupIds.length === 0 && groupIds.length > 0) {
            res.status(400).json({ error: 'Invalid group ID format provided.' });
            return;
        }

        // If no groups are provided, it usually means no tasks can be assigned.
        // Return an empty result in this case.
        if (validGroupIds.length === 0) {
            res.json({
                tasks: [],
                totalTasks: 0,
            });
            return;
        }

        const filter: any = {
            assignedGroups: { $in: validGroupIds }
        };

        const now = new Date(); // Use new Date() for current time comparison
        if (status === 'active') {
            filter.deadline = { $gte: now.toISOString() }; // Ensure ISO string for comparison with dates in DB
        } else if (status === 'expired') {
            filter.deadline = { $lt: now.toISOString() };
        }
        // If status is 'all' or undefined, don't add deadline filter

        const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        // Cast to ITask[] for better type inference after populate/lean
        const tasks = await taskModel
            .find(filter)
            .sort(sort)
            .populate('teacherId', 'name surname email') // Populate teacher details
            .lean() as ITask[];

        // Check if student has submitted each task
        const tasksWithSubmissionStatus = await Promise.all(
            tasks.map(async (task) => {
                // Ensure taskId and studentId are Mongoose ObjectIds for the query
                const submission = await mongoose.model('Submission').findOne({
                    taskId: new mongoose.Types.ObjectId(task._id),
                    studentId: new mongoose.Types.ObjectId(studentId) // Use the secure studentId here
                });

                return {
                    ...task,
                    hasSubmitted: !!submission,
                    submissionId: submission?._id || null,
                    submissionStatus: submission?.status || null,
                    // Convert deadline to a consistent format if needed for frontend display
                    dueDate: task.deadline, // Keep as is if it's already suitable
                    isExpired: new Date(task.deadline) < now, // Compare with the consistent 'now'
                    canSubmit: task.allowLateSubmission || new Date(task.deadline) >= now // Compare with 'now'
                };
            })
        );

        res.json({
            tasks: tasksWithSubmissionStatus,
            totalTasks: tasksWithSubmissionStatus.length,
        });
    } catch (error) {
        console.error('Get student tasks error:', error);
        next(new Error('Failed to fetch student tasks')); // Pass to error handling middleware
    }
};