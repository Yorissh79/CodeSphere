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
    checkQuizSubmission,
} from "../controllers/quizController";

import {
    createQuestion,
    getQuestionsByQuiz,
    deleteQuestion,
} from "../controllers/questionController";

import {validTeacherOrAdmin} from "../middleware/validTeacherOrAdmin";
import {studentValid} from "../middleware/studentValid";
import {createAnswer} from "../controllers/answerController";

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
router.post("/admin/create", createAdmin);
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
router.delete("/misses/:missId", deleteMiss);

// Quiz Routes
router.post("/quiz/create", createQuiz);
router.get("/quiz/all", getAllQuizzes);
router.get("/quiz/:id", getQuizById);
router.delete("/quiz/:id", deleteQuiz);
router.post("/quiz/answers", createAnswer)
router.put("/quiz/update/:id", updateQuiz)
router.get("/quiz/answers/check", checkQuizSubmission)

// Question Routes
router.post("/question/create", createQuestion);
router.get("/question/quiz/:quizId", getQuestionsByQuiz);
router.delete("/question/:id", deleteQuestion);


export default router;