import {useNavigate, useLocation, Link} from "react-router-dom";
import {useDarkMode} from "../../hooks/useDarkMode.ts";
import {useCheckTeacherAuthQuery} from "../../services/authCheck.ts";
import {useEffect, useState} from "react";
import {Menu, X, Moon, Sun} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import {useTeacherLogoutMutation} from "../../services/teacherApi.ts";

const TeacherHeader = () => {
    const [logoutTrigger, {isLoading: logoutLoading}] = useTeacherLogoutMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const {isDark, toggleDarkMode} = useDarkMode();
    const [render, setRender] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const {data: authData, isError: authError, refetch: refetchAuth} = useCheckTeacherAuthQuery();

    useEffect(() => {
        const pathSegment = location.pathname.split("/")[2];

        if (pathSegment === "teacher" && !authError) {
            refetchAuth();
            if (authData?.user?.role === "teacher") {
                setRender(true);
            } else {
                setRender(false);
            }
        } else {
            setRender(false);
            navigate("/registration/login");
        }
    }, [location, authData, authError, refetchAuth]);

    const handleLogout = async () => {
        try {
            await logoutTrigger().unwrap();
            navigate("/registration/login");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const fullName = `${authData?.user?.name || "Student"} ${authData?.user?.surname || ""}`;
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=4F46E5&color=fff&rounded=true`;

    return (
        <>
            {render ? (
                <header
                    className="flex justify-between items-center px-4 py-3 bg-gray-100 dark:bg-gray-900 shadow-md transition-colors">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-3">
                        <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full"/>
                        <span
                            className="text-lg font-medium text-gray-800 dark:text-gray-200 hidden sm:inline">{fullName}</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/user/teacher/misses"
                            className="px-3 py-2 text-sm font-medium text-gray-800 dark:text-white hover:underline"
                        >
                            Misses
                        </Link>
                        <Link
                            to="/user/teacher/code-editor"
                            className="px-3 py-2 text-sm font-medium text-gray-800 dark:text-white hover:underline"
                        >
                            Code Editor
                        </Link>
                        <Link
                            to="/user/teacher/quiz"
                            className="px-3 py-2 text-sm font-medium text-gray-800 dark:text-white hover:underline"
                        >
                            Quiz
                        </Link>
                        <Link
                            to="/user/teacher/quizchecker"
                            className="px-3 py-2 text-sm font-medium text-gray-800 dark:text-white hover:underline"
                        >
                            Quiz checker
                        </Link>
                        <button
                            onClick={toggleDarkMode}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
                                isDark ? "bg-indigo-600" : "bg-gray-300"
                            }`}
                            aria-label="Toggle Dark Mode"
                        >
                            <motion.div
                                layout
                                transition={{type: "spring", stiffness: 500, damping: 30}}
                                className={`w-6 h-6 rounded-full shadow-md ${
                                    isDark ? "translate-x-6 bg-white" : "translate-x-0 bg-gray-800"
                                }`}
                            />
                        </button>
                        {isDark ? <Moon className="text-white"/> : <Sun className="text-yellow-500"/>}
                        <button
                            onClick={handleLogout}
                            disabled={logoutLoading}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                        >
                            {logoutLoading ? "Logging out..." : "Logout"}
                        </button>
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="md:hidden">
                        <button onClick={() => setMenuOpen(true)} className="text-gray-800 dark:text-white">
                            <Menu className="w-6 h-6"/>
                        </button>
                    </div>

                    {/* Drawer */}
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.aside
                                initial={{x: "100%"}}
                                animate={{x: 0}}
                                exit={{x: "100%"}}
                                transition={{type: "spring", stiffness: 300, damping: 30}}
                                className="fixed top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 shadow-lg z-50 p-5"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-xl font-semibold dark:text-white">Menu</span>
                                    <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                                        <X className="w-6 h-6 text-gray-700 dark:text-white"/>
                                    </button>
                                </div>

                                <nav className="flex flex-col gap-4">
                                    <Link to="/user/teacher/dashboard"
                                          className="text-gray-800 dark:text-white hover:underline">
                                        Dashboard
                                    </Link>
                                    <Link to="/user/teacher/profile"
                                          className="text-gray-800 dark:text-white hover:underline">
                                        Profile
                                    </Link>
                                    <Link to="/user/teacher/misses"
                                          className="text-gray-800 dark:text-white hover:underline">
                                        Misses
                                    </Link>
                                    <Link to="/user/teacher/code-editor"
                                          className="text-gray-800 dark:text-white hover:underline">
                                        Code Editor
                                    </Link>
                                    <Link to="/user/teacher/quiz"
                                          className="text-gray-800 dark:text-white hover:underline">
                                        Quiz
                                    </Link>
                                    <button
                                        onClick={toggleDarkMode}
                                        className="flex items-center gap-2 text-gray-800 dark:text-white"
                                    >
                                        {isDark ? <Moon/> : <Sun/>}
                                        Toggle Dark Mode
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                        Logout
                                    </button>
                                </nav>
                            </motion.aside>
                        )}
                    </AnimatePresence>
                </header>
            ) : (
                <div className="p-4 text-red-500">Unauthorized token</div>
            )}
        </>
    );
};

export default TeacherHeader;
