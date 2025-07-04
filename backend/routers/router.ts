import express from "express";
import {
    createUser,
    deleteUser,
    getAllUsers,
    getUser,
    loginUser,
    logout,
    updateUser,
    verifyOtp
} from "../controllers/userController";

import { checkAuth } from "../controllers/authController";

import {
    createTeacher, deleteTeacher, getAllTeachers,
    loginTeacher,
    logoutTeacher, updateTeacher
} from "../controllers/teacherController";

import { checkTeacherAuth } from "../middleware/teacherAuthController";

import {
    createAdmin,
    loginAdmin,
    logoutAdmin
} from "../controllers/adminController";

import { checkAdminAuth } from "../middleware/adminAuthController";

import {
    checkGoogleAuth,
    getCurrentUser,
    handleGoogleCallback,
    initiateGoogleAuth,
    logoutUser, protectedRoute,
    registerUser,
    verifyGoogleToken
} from "../controllers/googleController";

import {
    createGroup,
    deleteGroup,
    getAllGroups,
    updateGroup
} from "../controllers/groupController";

import {
    addMiss,
    getAllMisses,
    getMyMisses,
    getStudentMisses,
    updateMiss,
    deleteMiss
} from "../controllers/missController";

import {
    createQuiz,
    getAllQuizzes,
    deleteQuiz,
    getQuizById,
    updateQuiz,
} from "../controllers/quizController";

import {
    createQuestion,
    getQuestionsByQuiz,
    deleteQuestion,
} from "../controllers/questionController";

import {validTeacherOrAdmin} from "../middleware/validTeacherOrAdmin";
import {
    createAnswer,
    checkQuizSubmission, updateTeacherEvaluation,
} from "../controllers/answerController";

import { studentValid } from "../middleware/studentValid";
import {
    createTask,
    getAllTasks,
    getTaskById,
    deleteAllTasks,
    deleteTaskById, updateTaskById, getAllStudentTasks
} from "../controllers/taskController";

import {createComment, deleteComment, getCommentsByAuthor, getCommentsBySubmission, getCommentStats, updateComment} from "../controllers/commentController"

import {
    createSubmission,
    getSubmissions,
    getSubmissionById,
    updateSubmission,
    deleteSubmission,
    getSubmissionsByTask,
    getSubmissionStats
} from "../controllers/submissionController";
import { upload } from "../controllers/fileUploadService";
import {authenticateToken, requireAdmin} from "../middleware/googleAuth";
import { ContentController } from '../controllers/contentController';
import { emailSender } from '../controllers/emailController';

const router = express.Router();

// User Routes
router.post("/user/create", createUser);
router.get("/user/gets", getAllUsers);
router.get("/user/get/:id", getUser);
router.post("/user/login", loginUser);
router.post("/user/logout", logout);
router.put("/user/update/:id", updateUser);
router.delete("/user/delete/:id", deleteUser);
router.get("/auth/check", checkAuth);

// Teacher Routes
router.post("/teacher/create", createTeacher);
router.post("/teacher/login", loginTeacher);
router.post("/teacher/logout", logoutTeacher);
router.get("/auth/teacher/check", checkTeacherAuth);
router.put("/teacher/update/:id", updateTeacher);
router.delete("/teacher/delete/:id", deleteTeacher);
router.get("/teacher/gets", getAllTeachers);

// Admin Routes
router.post("/admin/create", checkAdminAuth, createAdmin);
router.post("/admin/login", loginAdmin);
router.post("/admin/logout", logoutAdmin);
router.get("/auth/admin/check", checkAdminAuth);

router.get('/google/auth', initiateGoogleAuth);
// router.get('/google/callback', ...handleGoogleCallback);

// Authentication check routes
router.get('/google/check-google-auth', checkGoogleAuth);

// Token verification
router.post('/google/verify', verifyGoogleToken);

// User registration and authentication
router.post('/register', registerUser);
router.post('/logout', logoutUser as any );

// Protected routes
router.get('/user', getCurrentUser as any);
router.get('/users', requireAdmin, getAllUsers);
router.get('/protected', protectedRoute as any);

// Group Routes
router.post("/group/create", validTeacherOrAdmin, createGroup);
router.get("/group/gets", getAllGroups);
router.put("/group/update/:id", updateGroup);
router.delete("/group/delete/:id", deleteGroup);

// Miss Routes
router.post("/misses/add", validTeacherOrAdmin, addMiss);
router.get("/misses/student/:studentId", getStudentMisses);
router.get("/misses/all", validTeacherOrAdmin, getAllMisses);
router.get("/misses/my", studentValid, getMyMisses);
router.put("/misses/update/:missId", validTeacherOrAdmin, updateMiss);
router.delete("/misses/delete/:missId", validTeacherOrAdmin, deleteMiss);

// Quiz Routes
router.post("/quiz/create", validTeacherOrAdmin, createQuiz);
router.get("/quiz/all", getAllQuizzes);
router.get("/quiz/:id", getQuizById);
router.delete("/quiz/:id", validTeacherOrAdmin, deleteQuiz);
router.post("/quiz/answers", createAnswer)
router.put("/quiz/update/:id", validTeacherOrAdmin, updateQuiz)
router.get("/quiz/answers/quiz/:quizId", checkQuizSubmission)
router.put("/quiz/answers/evaluate", updateTeacherEvaluation);

// Question Routes
router.post("/question/create", validTeacherOrAdmin, createQuestion);
router.get("/question/quiz/:quizId", getQuestionsByQuiz);
router.delete("/question/:id", validTeacherOrAdmin, deleteQuestion);

router.post("/apis/tasks/create", validTeacherOrAdmin, upload.array("files", 10), createTask as any);
router.get("/apis/tasks/", getAllTasks);
router.get("/apis/tasks/student", studentValid, getAllStudentTasks as any);
router.get("/apis/tasks/:id", studentValid, getTaskById);
router.delete("/apis/tasks/delete", validTeacherOrAdmin, deleteAllTasks);
router.delete("/apis/tasks/delete/:id", validTeacherOrAdmin, deleteTaskById);
router.put("/apis/tasks/update/:taskId", validTeacherOrAdmin, updateTaskById as any);

// email
router.post("/api/contact", emailSender as any)

// Submission Routes
router.post("/apis/submissions/create", studentValid, createSubmission as any);
router.get("/apis/submissions", getSubmissions as any);
router.get("/apis/submissions/:id", getSubmissionById as any);
router.put("/apis/submissions/:id", updateSubmission as any);
router.delete("/apis/submissions/:id", deleteSubmission as any);
router.get("/apis/submissions/task/:taskId", getSubmissionsByTask as any);
router.get("/apis/submissions/stats", validTeacherOrAdmin, getSubmissionStats as any);

// Comment Routes
router.post("/comments/:submissionId", createComment as any);
router.get("/comments/submission/:submissionId", getCommentsBySubmission as any);
router.put("/comments/:id", updateComment as any);
router.delete("/comments/:id", deleteComment as any);
router.get("/comments/author", getCommentsByAuthor as any);
router.get("/comments/stats", validTeacherOrAdmin, getCommentStats as any);

// Admin CRUD
const contentController = new ContentController();

// Public routes
router.get('/content/:pageType', contentController.getContentByType);
router.get('/faqs', contentController.getFAQs);
router.post('/contact', contentController.createContactMessage);

router.get('/admin/content', checkAdminAuth, contentController.getAllContent);
router.put('/admin/content/:pageType', checkAdminAuth, contentController.updateContent);

router.get('/admin/faqs', checkAdminAuth, contentController.getFAQs);
router.post('/admin/faqs', checkAdminAuth, contentController.createFAQ);
router.put('/admin/faqs/:id', checkAdminAuth, contentController.updateFAQ);
router.delete('/admin/faqs/:id', checkAdminAuth, contentController.deleteFAQ);

router.get('/admin/contact-messages', checkAdminAuth, contentController.getContactMessages);
router.put('/admin/contact-messages/:id', checkAdminAuth, contentController.updateContactMessage);
router.delete('/admin/contact-messages/:id', checkAdminAuth, contentController.deleteContactMessage);

// OTP
router.post('/user/verify-otp', verifyOtp);

export default router;