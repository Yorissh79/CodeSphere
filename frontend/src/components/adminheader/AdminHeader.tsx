import {useNavigate, useLocation, Link} from "react-router-dom";
import {useDarkMode} from "../../hooks/useDarkMode.ts";
import {useEffect, useState} from "react";
import {useAdminLogoutMutation} from "../../services/adminApi.ts";
import {useCheckAdminAuthQuery} from "../../services/authCheck.ts";
import {Menu, X, Moon, Sun, LogOut, User, Users, LayoutDashboard, BookOpen} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";

const AdminHeader: React.FC = () => {
    const [logoutTrigger, {isLoading: logoutLoading, error: logoutError}] = useAdminLogoutMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const {isDark, toggleDarkMode} = useDarkMode();
    const [render, setRender] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const {data: authData, isError: authError, refetch: refetchAuth} = useCheckAdminAuthQuery();

    useEffect(() => {
        const pathSegment = location.pathname.split("/")[2];

        if (pathSegment === "admin" && !authError) {
            refetchAuth();
            if (authData?.user?.role === "admin") {
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

    return (
        <>
            {render ? (
                <header
                    className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-4">
                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link
                                to="/user/admin/dashboard"
                                className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <LayoutDashboard className="w-4 h-4"/> Dashboard
                            </Link>
                            <Link
                                to="/user/admin/students"
                                className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <Users className="w-4 h-4"/> Students
                            </Link>
                            <Link
                                to="/user/admin/teachers"
                                className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <User className="w-4 h-4"/> Teachers
                            </Link>
                            <Link
                                to="/user/admin/courses"
                                className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <BookOpen className="w-4 h-4"/> Courses
                            </Link>
                            <Link
                                to="/user/admin/groups"
                                className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <Users className="w-4 h-4"/> Groups
                            </Link>
                            <Link
                                to="/user/admin/misses"
                                className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <Users className="w-4 h-4"/> Misses
                            </Link>
                            <Link
                                to="/user/admin/quiz"
                                className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <Users className="w-4 h-4"/> Quiz
                            </Link>
                        </nav>

                        {/* Desktop Controls */}
                        <div className="hidden md:flex items-center gap-6">
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
                                className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4"/>
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

                    {/* Mobile Drawer */}
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
                                        to="/user/admin/dashboard"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                                    >
                                        <LayoutDashboard className="w-5 h-5"/> Dashboard
                                    </Link>
                                    <Link
                                        to="/user/admin/students"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                                    >
                                        <Users className="w-5 h-5"/> Students
                                    </Link>
                                    <Link
                                        to="/user/admin/teachers"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                                    >
                                        <User className="w-5 h-5"/> Teachers
                                    </Link>
                                    <Link
                                        to="/user/admin/courses"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                                    >
                                        <BookOpen className="w-5 h-5"/> Courses
                                    </Link>
                                    <Link
                                        to="/user/admin/groups"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                                    >
                                        <Users className="w-5 h-5"/> Groups
                                    </Link>
                                    <Link
                                        to="/user/admin/misses"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                                    >
                                        <Users className="w-5 h-5"/> Misses
                                    </Link>
                                    <Link
                                        to="/user/admin/quiz"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                                    >
                                        <Users className="w-5 h-5"/> Quiz
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            toggleDarkMode();
                                        }}
                                        className="flex items-center gap-2 py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
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
                                        <LogOut className="w-5 h-5 inline-block mr-2"/>
                                        Logout
                                    </button>
                                </nav>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {logoutError && (
                        <p className="text-red-500 text-sm mt-2 w-full text-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-md py-2">
                            Logout failed
                        </p>
                    )}
                </header>
            ) : (
                <div
                    className="p-4 text-center text-red-500 text-sm font-medium bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
                    Unauthorized token
                </div>
            )}
        </>
    );
};

export default AdminHeader;