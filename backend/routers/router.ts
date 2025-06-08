import express from "express";
import {createUser, getAllUsers, getUser, loginUser, logout} from "../controllers/userController";
import {checkAuth} from "../controllers/authController";
import {createTeacher, loginTeacher} from "../controllers/teacherController";

const router = express.Router();

router
    .post("/user/create", createUser)
    // .get("/user/gets", getAllUsers)
    .get("/user/get", getUser)
    .get("/auth/check", checkAuth)
    .post("/user/login", loginUser)
    .post("/user/logout", logout)

    .post("/teacher/create", createTeacher)
    .post("/teacher/login", loginTeacher)
    .post("/teacher/logout", loginTeacher)
export default router;