import { notificationModel } from '../models/notificationModel';
import userModel from '../models/userModel';
import {taskModel} from "../models/taskModel";
import {submissionModel} from "../models/submissionModel";

class NotificationService {
    async notifyGroupsAboutNewTask(groups: string[], task: any) {
        try {
            // Find all students in assigned groups
            const students = await userModel.find({
                group: { $in: groups },
                role: 'student'
            });

            const notifications = students.map(student => ({
                userId: student._id,
                userType: 'student' as const,
                type: 'task_assigned' as const,
                title: 'New Task Assigned',
                message: `You have been assigned a new task: "${task.title}"`,
                relatedId: task._id
            }));

            await notificationModel.insertMany(notifications);
        } catch (error) {
            console.error('Error creating task notifications:', error);
        }
    }

    async notifyTeacherAboutSubmission(teacherId: any, submission: any, task: any) {
        try {
            await notificationModel.create({
                userId: teacherId,
                userType: 'teacher',
                type: 'submission_received',
                title: 'New Submission Received',
                message: `A student has submitted the task: "${task.title}"`,
                relatedId: submission._id
            });
        } catch (error) {
            console.error('Error creating submission notification:', error);
        }
    }

    async notifyStudentAboutGrading(studentId: any, submission: any) {
        try {
            await notificationModel.create({
                userId: studentId,
                userType: 'student',
                type: 'task_graded',
                title: 'Task Graded',
                message: `Your submission has been graded. Points: ${submission.points}`,
                relatedId: submission._id
            });
        } catch (error) {
            console.error('Error creating grading notification:', error);
        }
    }

    async sendDeadlineReminders() {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const nextDay = new Date(tomorrow);
            nextDay.setDate(nextDay.getDate() + 1);

            // Find tasks with deadline tomorrow
            const upcomingTasks = await taskModel.find({
                deadline: { $gte: tomorrow, $lt: nextDay }
            });

            for (const task of upcomingTasks) {
                // Find students who haven't submitted
                const submittedStudentIds = await submissionModel
                    .find({ taskId: task._id })
                    .distinct('studentId');

                const studentsToNotify = await userModel.find({
                    group: { $in: task.assignedGroups },
                    role: 'student',
                    _id: { $nin: submittedStudentIds }
                });

                const notifications = studentsToNotify.map(student => ({
                    userId: student._id,
                    userType: 'student' as const,
                    type: 'deadline_reminder' as const,
                    title: 'Deadline Reminder',
                    message: `Task "${task.title}" is due tomorrow!`,
                    relatedId: task._id
                }));

                await notificationModel.insertMany(notifications);
            }
        } catch (error) {
            console.error('Error sending deadline reminders:', error);
        }
    }
}

export const notificationService = new NotificationService();