import {createBrowserRouter} from "react-router-dom";
import Layout from "../components/layout/Layout.tsx";
import Signup from "../pages/signup/Signup.tsx";
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
import signupTeacher from "../pages/signup/SignupTeacher.tsx";
import SignLayout from "../components/signlayout/SignLayout.tsx";
import TeacherAppLayout from "../pages/auth/TeacherAuth.tsx";
import AdminAuth from "../pages/auth/AdminAuth.tsx";

export const router = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
        children: [
            {
                path: "/",
                Component: F
            }
        ]
    },
    {
        path: '/registration',
        Component: SignLayout,
        children: [
            {
                path: "/registration/signup",
                Component: Signup
            },
            {
                path: "/registration/teacher/signup",
                Component: signupTeacher
            },
            {
                path: "/registration/login",
                Component: Login
            }
        ]
    },
    {
        path: '/dashboard',
        Component: StudentLayout,
        children: [
            {
                path: "/dashboard/student",
                Component: Home
            },
            {
                path: "/dashboard/teacher",
                Component: Homet
            },
            {
                path: '/dashboard/admin',
                Component: AdminAuth
            },
        ]
    },
    {
        path: '/check/student',
        Component: AppLayout
    },
    {
        path: '/check/teacher',
        Component: TeacherAppLayout
    },
    {
        path: "*",
        Component: NotFound
    },
    {
        path: '/pp',
        Component: PP
    },
    {
        path: '/about',
        Component: About
    },
    {
        path: '/contact',
        Component: Contact
    },
    {
        path: '/faq',
        Component: Faq
    },
])