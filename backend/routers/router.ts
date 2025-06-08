import express from "express";
import {createTeacher, createUser, getAllUsers, getUser, loginUser, logout} from "../controllers/userController";
import {checkAuth} from "../controllers/authController";

const router = express.Router();

router
    .post("/user/create", createUser)
    .post("/teacher/create", createTeacher)
    // .get("/user/gets", getAllUsers)
    .get("/user/get", getUser)
    .get("/auth/check", checkAuth)
    .post("/user/login", loginUser)
    .post("/user/logout", logout)

export default router;