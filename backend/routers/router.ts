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
    createTeacher,
    loginTeacher,
    logoutTeacher
} from "../controllers/teacherController";
import { checkTeacherAuth } from "../controllers/teacherAuthController";
import {
    createAdmin,
    loginAdmin,
    logoutAdmin
} from "../controllers/adminController";
import { checkAdminAuth } from "../controllers/adminAuthController";
import {
    authedGoogle,
    createGoogle,
    loginGoogle,
    logoutGoogle,
    registerGoogle
} from "../controllers/googleController";

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

export default router;
