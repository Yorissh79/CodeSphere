import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCheckTeacherAuthQuery } from "../../../services/authCheck.ts";
import { motion, AnimatePresence } from "framer-motion";

// Spinner while loading
const Spinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <svg className="animate-spin h-10 w-10 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    </div>
);

// Welcome popup
const WelcomePopup = ({ name }: { name: string }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShow(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded shadow-lg z-50"
                >
                    👋 Welcome back, {name}!
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const Home = () => {
    const { data, error, isLoading, refetch, isError } = useCheckTeacherAuthQuery();

    useEffect(() => {
        refetch();
    }, []);

    if (isLoading) return <Spinner />;

    if (error || !data?.user || isError) {
        return (
            <div className="flex flex-col gap-4 justify-center items-center h-screen font-sans text-xl text-gray-600 dark:text-gray-200">
                <div>Unauthorized access token.</div>
                <Link to={"/registration/login"} className="underline text-blue-600 dark:text-blue-400">
                    Go to login page
                </Link>
            </div>
        );
    }

    const { name, surname, email, role } = data.user;

    return (
        <div className="bg-gray-100 dark:bg-gray-800 min-h-screen font-sans text-black dark:text-white">
            <WelcomePopup name={name} />

            {/* Header */}
            <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow p-4">
                <h1 className="text-2xl font-bold">Welcome, {name} {surname}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Role: {role} | {email}</p>
            </header>

            {/* Metrics Summary */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {[
                    { title: "Students Enrolled", value: 42 },
                    { title: "Assignments Posted", value: 8 },
                    { title: "Missed Submissions", value: 5 },
                    { title: "Upcoming Lessons", value: 2 },
                ].map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded shadow hover:shadow-lg transition">
                        <h2 className="text-sm text-gray-500 dark:text-gray-300">{item.title}</h2>
                        <p className="text-xl font-bold">{item.value}</p>
                    </div>
                ))}
            </section>

            {/* Recent Activity */}
            <section className="p-4">
                <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
                <ul className="space-y-2">
                    {[
                        "John submitted Homework 3",
                        "Anna missed today's class",
                        "You posted a new assignment",
                    ].map((entry, i) => (
                        <li key={i} className="bg-white dark:bg-gray-700 px-4 py-2 rounded shadow text-sm">
                            {entry}
                        </li>
                    ))}
                </ul>
            </section>

            {/* Quick Actions */}
            <section className="p-4">
                <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
                <div className="flex gap-4 flex-wrap">
                    {[
                        { label: "Add Assignment", to: "/assignments/new" },
                        { label: "Manage Students", to: "/students" },
                        { label: "View Groups", to: "/groups" },
                    ].map(({ label, to }, i) => (
                        <Link
                            key={i}
                            to={to}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            </section>

            {/* Motivational Quote */}
            <section className="p-4 italic text-gray-600 dark:text-gray-300">
                “Programs must be written for people to read, and only incidentally for machines to execute.” – Harold Abelson
            </section>
        </div>
    );
};

export default Home;
