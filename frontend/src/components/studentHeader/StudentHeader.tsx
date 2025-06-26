import {useNavigate, useLocation, Link} from "react-router-dom";
import {useDarkMode} from "../../hooks/useDarkMode.ts";
import {useEffect, useState} from "react";
import {Menu, X, Moon, Sun} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import {useUserLogoutMutation} from "../../services/userApi.ts";
import {useCheckAuthQuery} from "../../services/authCheck.ts";

const StudentHeader: React.FC = () => {
    const [logoutTrigger, {isLoading: logoutLoading}] = useUserLogoutMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const {isDark, toggleDarkMode} = useDarkMode();
    const [render, setRender] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const {data: authData, isError: authError, refetch: refetchAuth} = useCheckAuthQuery();

    useEffect(() => {
        const pathSegment = location.pathname.split("/")[2];

        if (pathSegment === "student" && !authError) {
            refetchAuth();
            if (authData?.user?.role === "student") {
                setRender(true);
            } else {
                setRender(false);
            }
        } else {
            setRender(false);
            navigate("/registration/login");
        }
    }, [location, authData, authError, refetchAuth, navigate]);

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
                    className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-4">
                        {/* Avatar and Name */}
                        <div className="flex items-center gap-3">
                            <img src={avatarUrl} alt={`${fullName}'s avatar`}
                                 className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700"/>
                            <span
                                className="text-base font-medium text-gray-800 dark:text-gray-200 hidden sm:inline">{fullName}</span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                to="/user/student/misses"
                                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Misses
                            </Link>
                            <Link
                                to="/user/student/code-editor"
                                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Code Editor
                            </Link>
                            <Link
                                to="/user/student/quiz"
                                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Quiz
                            </Link>
                            <Link
                                to="/user/student/task"
                                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Task
                            </Link>
                            <button
                                onClick={toggleDarkMode}
                                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                                    isDark ? "bg-indigo-600" : "bg-gray-300"
                                }`}
                                aria-label="Toggle Dark Mode"
                            >
                                <motion.div
                                    layout
                                    transition={{type: "spring", stiffness: 500, damping: 30}}
                                    className={`w-4 h-4 rounded-full shadow-md ${
                                        isDark ? "translate-x-6 bg-white" : "translate-x-0 bg-gray-800"
                                    }`}
                                />
                            </button>
                            {isDark ? <Moon className="w-5 h-5 text-gray-300"/> :
                                <Sun className="w-5 h-5 text-yellow-500"/>}
                            <button
                                onClick={handleLogout}
                                disabled={logoutLoading}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors text-sm font-medium"
                            >
                                {logoutLoading ? "Logging out..." : "Logout"}
                            </button>
                        </div>

                        {/* Mobile Hamburger */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMenuOpen(true)}
                                className="p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                                aria-label="Open menu"
                            >
                                <Menu className="w-6 h-6"/>
                            </button>
                        </div>
                    </div>

                    {/* Drawer */}
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.aside
                                initial={{x: "100%"}}
                                animate={{x: 0}}
                                exit={{x: "100%"}}
                                transition={{type: "spring", stiffness: 300, damping: 30}}
                                className="fixed top-0 right-0 w-72 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg z-50 p-6"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Menu</span>
                                    <button
                                        onClick={() => setMenuOpen(false)}
                                        className="p-2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                                        aria-label="Close menu"
                                    >
                                        <X className="w-6 h-6 text-gray-700 dark:text-gray-200"/>
                                    </button>
                                </div>

                                <nav className="flex flex-col gap-4">
                                    <Link
                                        to="/user/student/dashboard"
                                        onClick={() => setMenuOpen(false)}
                                        className="py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/user/student/profile"
                                        onClick={() => setMenuOpen(false)}
                                        className="py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/user/student/misses"
                                        onClick={() => setMenuOpen(false)}
                                        className="py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                                    >
                                        Misses
                                    </Link>
                                    <Link
                                        to="/user/student/code-editor"
                                        onClick={() => setMenuOpen(false)}
                                        className="py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                                    >
                                        Code Editor
                                    </Link>
                                    <Link
                                        to="/user/student/quiz"
                                        onClick={() => setMenuOpen(false)}
                                        className="py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                                    >
                                        Quiz
                                    </Link>
                                    <button
                                        onClick={toggleDarkMode}
                                        className="flex items-center gap-3 py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                                    >
                                        {isDark ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
                                        Toggle Dark Mode
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-base font-medium"
                                    >
                                        Logout
                                    </button>
                                </nav>
                            </motion.aside>
                        )}
                    </AnimatePresence>
                </header>
            ) : (
                <div
                    className="p-4 text-red-500 text-center text-sm font-medium bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
                    Unauthorized token
                </div>
            )}
        </>
    );
};

export default StudentHeader;