import express from "express";
import {
    createUser,
    deleteUser,
    getAllUsers,
    getUser,
    loginUser,
    logout,
    updateUser
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
    authedGoogle,
    createGoogle,
    loginGoogle,
    logoutGoogle,
    registerGoogle
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

// Google Auth Routes
router.post("/gUser", createGoogle);
router.post("/register", registerGoogle);
router.post("/login", loginGoogle);
router.post("/logout", logoutGoogle);
router.get("/gUser/check", authedGoogle);

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

export default router;