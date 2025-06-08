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
import teacherLayout from "../components/teacherlayout/TeacherLayout.tsx";

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
        path: '/student',
        Component: StudentLayout,
        children: [
            {
                path: "/student",
                Component: Home
            }
        ]
    },
    {
        path: '/teacher',
        Component: teacherLayout,
        children: [
            {
                path: "/teacher",
                Component: Homet
            }
        ]
    },
    {
        path: '/check/',
        Component: AppLayout
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