import express from "express";
import {createUser, getAllUsers, getUser, loginUser, logout} from "../controllers/userController";
import {checkAuth} from "../controllers/authController";
import {createTeacher, loginTeacher, logoutTeacher} from "../controllers/teacherController";
import {checkTeacherAuth} from "../controllers/teacherAuthController";
import {createAdmin, loginAdmin} from "../controllers/adminController";
import {checkAdminAuth} from "../controllers/adminAuthController";

const router = express.Router();

router
    .post("/user/create", createUser)
    // .get("/user/gets", getAllUsers)
    .get("/user/get/:id", getUser)
    .get("/auth/check", checkAuth)
    .post("/user/login", loginUser)
    .post("/user/logout", logout)

    .post("/teacher/create", createTeacher)
    .post("/teacher/login", loginTeacher)
    .post("/teacher/logout", logoutTeacher)
    .get("/auth/teacher/check", checkTeacherAuth)

    .post("/admin/create", createAdmin)
    .post("/admin/login", loginAdmin)
    .post("/admin/logout", loginAdmin)
    .get("/auth/admin/check", checkAdminAuth)

export default router;