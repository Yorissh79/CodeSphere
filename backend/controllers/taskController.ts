import { Request, Response } from 'express';
import { z } from 'zod';
import { taskModel, ITask } from '../models/taskModel';
import { submissionModel } from '../models/submissionModel';
import { notificationService } from './notificationService';

const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    assignedGroups: z.array(z.string()).min(1, "At least one group must be assigned"),
    deadline: z.string().datetime(),
    allowLateSubmission: z.string(),
    maxPoints: z.string().refine(val => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0, {
        message: "Points must be a valid non-negative number"
    }),
    attachments: z.array(z.object({
        type: z.enum(['text', 'image', 'link']),
        content: z.string(),
        filename: z.string().optional(),
        originalName: z.string().optional()
    })).optional()
});

export const createTask = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = createTaskSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.flatten() });
        }

        const { title, description, assignedGroups, deadline, allowLateSubmission, maxPoints, attachments } = result.data;

        // Get teacher ID from authenticated user
        const teacherId = req.body.teacherId; // From auth middleware

        const newTask = await taskModel.create({
            title,
            description,
            teacherId,
            assignedGroups,
            attachments: attachments || [],
            deadline: new Date(deadline),
            allowLateSubmission,
            maxPoints
        });

        await notificationService.notifyGroupsAboutNewTask(assignedGroups, newTask);

        res.status(201).json({
            message: 'Task created successfully',
            task: newTask
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getTasksForTeacher = async (req: Request, res: Response): Promise<any> => {
    try {
        const teacherId = req.body.teacherId; // From auth middleware
        const { page = 1, limit = 10, status } = req.query;

        const filter: any = { teacherId };

        // Add status filtering logic
        if (status === 'active') {
            filter.deadline = { $gte: new Date() };
        } else if (status === 'expired') {
            filter.deadline = { $lt: new Date() };
        }

        const tasks = await taskModel
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .populate('teacherId', 'name surname email');

        const totalTasks = await taskModel.countDocuments(filter);

        res.json({
            tasks,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalTasks / Number(limit)),
                totalTasks
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

export const getTasksForStudent = async (req: Request, res: Response): Promise<any> => {
    try {
        const studentGroup = req.body.group; // From auth middleware
        const { page = 1, limit = 10, status } = req.query;

        const filter: any = { assignedGroups: { $in: [studentGroup] } };

        if (status === 'pending') {
            // Tasks without submission from this student
            const studentId = req.body._id;
            const submittedTaskIds = await submissionModel
                .find({ studentId })
                .distinct('taskId');
            filter._id = { $nin: submittedTaskIds };
        }

        const tasks = await taskModel
            .find(filter)
            .sort({ deadline: 1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .populate('teacherId', 'name surname');

        res.json({ tasks });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

export const submitTask = async (req: Request, res: Response): Promise<any> => {
    try {
        const submitSchema = z.object({
            taskId: z.string(),
            githubUrl: z.string().url().refine(url => url.includes('github.com'), {
                message: "Must be a valid GitHub URL"
            })
        });

        const result = submitSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.flatten() });
        }

        const { taskId, githubUrl } = result.data;
        const studentId = req.body._id; // From auth middleware

        // Check if task exists and student's group is assigned
        const task = await taskModel.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const studentGroup = req.body.group;
        if (!task.assignedGroups.includes(studentGroup)) {
            return res.status(403).json({ error: 'Task not assigned to your group' });
        }

        // Check deadline and late submission policy
        const now = new Date();
        const isLate = now > task.deadline;

        if (isLate && !task.allowLateSubmission) {
            return res.status(400).json({ error: 'Deadline has passed and late submissions are not allowed' });
        }

        // Check for existing submission
        const existingSubmission = await submissionModel.findOne({ taskId, studentId });
        if (existingSubmission) {
            return res.status(400).json({ error: 'You have already submitted this task' });
        }

        const submission = await submissionModel.create({
            taskId,
            studentId,
            githubUrl,
            isLate,
            submittedAt: now
        });

        // Notify teacher about new submission
        await notificationService.notifyTeacherAboutSubmission(task.teacherId, submission, task);

        res.status(201).json({
            message: 'Task submitted successfully',
            submission
        });
    } catch (error) {
        console.error('Submit task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const gradeSubmission = async (req: Request, res: Response): Promise<any> => {
    try {
        const gradeSchema = z.object({
            points: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val) && val >= 0, {
                message: "Points must be a valid non-negative number"
            }), // Match schema's string type
            feedback: z.string().optional()
        });

        const result = gradeSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.flatten() });
        }

        const { submissionId } = req.params;
        const { points, feedback } = result.data;

        const submission = await submissionModel
            .findById(submissionId)
            .populate('taskId');

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const task = submission.taskId as unknown as ITask;

        if (task.teacherId.toString() !== (req.user as any)._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (parseInt(String(points), 10) > parseInt(task.maxPoints, 10)) { // Compare as numbers
            return res.status(400).json({ error: 'Points cannot exceed maximum points for this task' });
        }

        const updatedSubmission = await submissionModel.findByIdAndUpdate(
            submissionId,
            {
                points: points, // Store as string to match schema
                feedback,
                status: 'graded'
            },
            { new: true }
        );

        await notificationService.notifyStudentAboutGrading(submission.studentId, updatedSubmission);

        res.json({
            message: 'Submission graded successfully',
            submission: updatedSubmission
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to grade submission' });
    }
};

export const getTaskSubmissions = async (req: Request, res: Response): Promise<any> => {
    try {
        const { taskId } = req.params;
        const teacherId = req.body._id;

        // Verify teacher owns this task
        const task = await taskModel.findOne({ _id: taskId, teacherId });
        if (!task) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        const submissions = await submissionModel
            .find({ taskId })
            .populate('studentId', 'name surname email group')
            .sort({ submittedAt: -1 });

        res.json({ submissions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};