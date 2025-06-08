import {createBrowserRouter} from "react-router-dom";
import Layout from "../components/layout/Layout.tsx";
import Signup from "../pages/signup/Signup.tsx";
import Login from "../pages/login/Login.tsx";
import NotFound from "../pages/notfound/NotFound.tsx";
import Home from "../pages/student/home/Home.tsx";
import F from "../pages/first/home/F.tsx";
import PP from "../pages/contactpages/pp/PP.tsx";
import About from "../pages/contactpages/about/About.tsx";
import Contact from "../pages/contactpages/contact/Contact.tsx";
import Faq from "../pages/contactpages/faq/Faq.tsx";
import AppLayout from "../pages/auth/Auth.tsx";
import StudentLayout from "../components/studentLayout/StudentLayout.tsx";

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
        children: [
            {
                path: "/registration/signup",
                Component: Signup
            },
            {
                path: "/registration/teacher/signup"
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