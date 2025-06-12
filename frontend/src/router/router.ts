import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout/Layout.tsx";
import Signup from "../pages/signup/Signup.tsx";
import SignupTeacher from "../pages/signup/SignupTeacher.tsx";
import Login from "../pages/login/Login.tsx";
import NotFound from "../pages/notfound/NotFound.tsx";
import Home from "../pages/student/home/Home.tsx";
import Homet from "../pages/teacher/home/Home.tsx";
import F from "../pages/first/home/F.tsx";
import PP from "../pages/contactpages/pp/PP.tsx";
import About from "../pages/contactpages/about/About.tsx";
import Contact from "../pages/contactpages/contact/Contact.tsx";
import Faq from "../pages/contactpages/faq/Faq.tsx";
import AppLayout from "../pages/auth/Auth.tsx";
import StudentLayout from "../components/studentLayout/StudentLayout.tsx";
import SignLayout from "../components/signlayout/SignLayout.tsx";
import TeacherAppLayout from "../pages/auth/TeacherAuth.tsx";
import AdminAuth from "../pages/auth/AdminAuth.tsx";
import CompleteSignup from "../pages/signup/CompleteSignup.tsx";
import TeacherLayout from "../components/teacherlayout/TeacherLayout.tsx";
import AdminLayout from "../components/adminlayout/AdminLayout.tsx";
import Admin from "../pages/admin/home/Admin.tsx";
import Students from "../pages/admin/students/Students.tsx";
import Teachers from "../pages/admin/teachers/Teachers.tsx";
import Charts from "../pages/admin/charts/Charts.tsx";
import Groups from "../pages/admin/groups/Groups.tsx";
// import Teachers from "../pages/admin/teachers/Teachers.tsx";
// import Dashboard from "../pages/admin/dashboard/Dashboard.tsx";

export const router = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
        children: [
            {
                path: "/",
                Component: F
            },
            {
                path: "pp",
                Component: PP
            },
            {
                path: "about",
                Component: About
            },
            {
                path: "contact",
                Component: Contact
            },
            {
                path: "faq",
                Component: Faq
            },
        ]
    },
    {
        path: '/registration',
        Component: SignLayout,
        children: [
            {
                path: "signup",
                Component: Signup
            },
            {
                path: "teacher/signup",
                Component: SignupTeacher
            },
            {
                path: "login",
                Component: Login
            },
            {
                path: "complete-signup",
                Component: CompleteSignup
            },
        ]
    },
    {
        path: '/user',
        children: [
            {
                path: "student",
                Component: StudentLayout,
                children: [
                    {
                        path: "",
                        Component: Home
                    }
                ]
            },
            {
                path: "teacher",
                Component: TeacherLayout,
                children: [
                    {
                        path: "",
                        Component: Homet
                    }
                ]
            },
            {
                path: "admin",
                Component: AdminLayout,
                children: [
                    {
                        path: "",
                        Component: Admin
                    },
                    {
                        path: "students",
                        Component: Students
                    },
                    {
                        path: "teachers",
                        Component: Teachers
                    },
                    {
                        path: "dashboard",
                        Component: Charts
                    },
                    {
                        path: "groups",
                        Component: Groups
                    }
                ]
            },
        ]
    },
    {
        path: '/check',
        children: [
            {
                path: "student",
                Component: AppLayout
            },
            {
                path: "teacher",
                Component: TeacherAppLayout
            },
            {
                path: "admin",
                Component: AdminAuth
            },
        ]
    },
    {
        path: "*",
        Component: NotFound
    },
]);