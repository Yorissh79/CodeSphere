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
                    className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-md border-b border-gray-200/30 dark:border-gray-800/30 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-4">
                        {/* Admin Branding */}
                        <motion.div
                            initial={{opacity: 0, x: -20}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.5}}
                            className="flex items-center"
                        >
                            <Link to="/user/admin" aria-label="Admin Dashboard">
                                <motion.span
                                    className="text-xl sm:text-2xl font-bold uppercase bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent hover:from-indigo-500 hover:to-blue-500 transition-all duration-300"
                                    whileHover={{scale: 1.05, rotate: 2}}
                                    whileTap={{scale: 0.95}}
                                >
                                    Admin
                                </motion.span>
                            </Link>
                        </motion.div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <motion.div
                                whileHover={{scale: 1.05, translateY: -2}}
                                transition={{duration: 0.2}}
                            >
                                <Link
                                    to="/user/admin/dashboard"
                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-gradient-to-r from-indigo-600/10 to-blue-600/10 hover:from-indigo-600/20 hover:to-blue-600/20 rounded-lg"
                                >
                                    <LayoutDashboard className="w-5 h-5"/> Dashboard
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{scale: 1.05, translateY: -2}}
                                transition={{duration: 0.2}}
                            >
                                <Link
                                    to="/user/admin/students"
                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-gradient-to-r from-indigo-600/10 to-blue-600/10 hover:from-indigo-600/20 hover:to-blue-600/20 rounded-lg"
                                >
                                    <Users className="w-5 h-5"/> Students
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{scale: 1.05, translateY: -2}}
                                transition={{duration: 0.2}}
                            >
                                <Link
                                    to="/user/admin/teachers"
                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-gradient-to-r from-indigo-600/10 to-blue-600/10 hover:from-indigo-600/20 hover:to-blue-600/20 rounded-lg"
                                >
                                    <User className="w-5 h-5"/> Teachers
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{scale: 1.05, translateY: -2}}
                                transition={{duration: 0.2}}
                            >
                                <Link
                                    to="/user/admin/courses"
                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-gradient-to-r from-indigo-600/10 to-blue-600/10 hover:from-indigo-600/20 hover:to-blue-600/20 rounded-lg"
                                >
                                    <BookOpen className="w-5 h-5"/> Courses
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{scale: 1.05, translateY: -2}}
                                transition={{duration: 0.2}}
                            >
                                <Link
                                    to="/user/admin/groups"
                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-gradient-to-r from-indigo-600/10 to-blue-600/10 hover:from-indigo-600/20 hover:to-blue-600/20 rounded-lg"
                                >
                                    <Users className="w-5 h-5"/> Groups
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{scale: 1.05, translateY: -2}}
                                transition={{duration: 0.2}}
                            >
                                <Link
                                    to="/user/admin/misses"
                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-gradient-to-r from-indigo-600/10 to-blue-600/10 hover:from-indigo-600/20 hover:to-blue-600/20 rounded-lg"
                                >
                                    <Users className="w-5 h-5"/> Misses
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{scale: 1.05, translateY: -2}}
                                transition={{duration: 0.2}}
                            >
                                <Link
                                    to="/user/admin/quiz"
                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-gradient-to-r from-indigo-600/10 to-blue-600/10 hover:from-indigo-600/20 hover:to-blue-600/20 rounded-lg"
                                >
                                    <Users className="w-5 h-5"/> Quiz
                                </Link>
                            </motion.div>
                        </nav>

                        {/* Desktop Controls */}
                        <div className="hidden md:flex items-center gap-6">
                            <motion.button
                                onClick={toggleDarkMode}
                                className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                                    isDark ? "bg-indigo-600" : "bg-gray-300"
                                }`}
                                aria-label="Toggle Dark Mode"
                                whileHover={{scale: 1.1, rotate: 5}}
                                whileTap={{scale: 0.95}}
                            >
                                <motion.div
                                    layout
                                    transition={{type: "spring", stiffness: 500, damping: 30}}
                                    className={`w-5 h-5 rounded-full shadow-md ${
                                        isDark ? "translate-x-5 bg-white" : "translate-x-0 bg-gray-800"
                                    }`}
                                />
                            </motion.button>
                            {isDark ? <Moon className="w-5 h-5 text-gray-300"/> :
                                <Sun className="w-5 h-5 text-yellow-500"/>}
                            <motion.button
                                onClick={handleLogout}
                                disabled={logoutLoading}
                                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-300 shadow-md"
                                whileHover={{scale: 1.05, translateY: -2}}
                                whileTap={{scale: 0.95}}
                            >
                                <LogOut className="w-5 h-5"/>
                                {logoutLoading ? "Logging out..." : "Logout"}
                            </motion.button>
                        </div>

                        {/* Mobile Hamburger */}
                        <div className="md:hidden">
                            <motion.button
                                onClick={() => setMenuOpen(true)}
                                className="p-3 text-gray-800 dark:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                                aria-label="Open menu"
                                whileHover={{scale: 1.1, rotate: 5}}
                                whileTap={{scale: 0.95}}
                            >
                                <Menu className="w-7 h-7"/>
                            </motion.button>
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
                                className="fixed top-0 right-0 w-80 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-2xl z-50 p-6"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <span
                                        className="text-xl font-semibold text-gray-800 dark:text-gray-200">Admin Menu</span>
                                    <motion.button
                                        onClick={() => setMenuOpen(false)}
                                        className="p-3 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                                        aria-label="Close menu"
                                        whileHover={{scale: 1.1, rotate: 5}}
                                        whileTap={{scale: 0.95}}
                                    >
                                        <X className="w-7 h-7 text-gray-700 dark:text-gray-200"/>
                                    </motion.button>
                                </div>

                                <nav className="flex flex-col gap-4">
                                    <motion.div
                                        whileHover={{x: 5, scale: 1.02}}
                                        transition={{duration: 0.2}}
                                    >
                                        <Link
                                            to="/user/admin/dashboard"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 py-3 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base font-medium"
                                        >
                                            <LayoutDashboard className="w-6 h-6"/> Dashboard
                                        </Link>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{x: 5, scale: 1.02}}
                                        transition={{duration: 0.2}}
                                    >
                                        <Link
                                            to="/user/admin/students"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 py-3 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base font-medium"
                                        >
                                            <Users className="w-6 h-6"/> Students
                                        </Link>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{x: 5, scale: 1.02}}
                                        transition={{duration: 0.2}}
                                    >
                                        <Link
                                            to="/user/admin/teachers"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 py-3 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base font-medium"
                                        >
                                            <User className="w-6 h-6"/> Teachers
                                        </Link>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{x: 5, scale: 1.02}}
                                        transition={{duration: 0.2}}
                                    >
                                        <Link
                                            to="/user/admin/courses"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 py-3 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base font-medium"
                                        >
                                            <BookOpen className="w-6 h-6"/> Courses
                                        </Link>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{x: 5, scale: 1.02}}
                                        transition={{duration: 0.2}}
                                    >
                                        <Link
                                            to="/user/admin/groups"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 py-3 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base font-medium"
                                        >
                                            <Users className="w-6 h-6"/> Groups
                                        </Link>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{x: 5, scale: 1.02}}
                                        transition={{duration: 0.2}}
                                    >
                                        <Link
                                            to="/user/admin/misses"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 py-3 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base font-medium"
                                        >
                                            <Users className="w-6 h-6"/> Misses
                                        </Link>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{x: 5, scale: 1.02}}
                                        transition={{duration: 0.2}}
                                    >
                                        <Link
                                            to="/user/admin/quiz"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 py-3 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base font-medium"
                                        >
                                            <Users className="w-6 h-6"/> Quiz
                                        </Link>
                                    </motion.div>
                                    <motion.button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            toggleDarkMode();
                                        }}
                                        className="flex items-center gap-3 py-3 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base font-medium"
                                        whileHover={{x: 5, scale: 1.02}}
                                        transition={{duration: 0.2}}
                                    >
                                        {isDark ? <Moon className="w-6 h-6"/> : <Sun className="w-6 h-6"/>}
                                        Toggle Dark Mode
                                    </motion.button>
                                    <motion.button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="mt-4 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 text-base font-medium shadow-md"
                                        whileHover={{scale: 1.05, translateY: -2}}
                                        whileTap={{scale: 0.95}}
                                    >
                                        <LogOut className="w-6 h-6 inline-block mr-2"/>
                                        Logout
                                    </motion.button>
                                </nav>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {logoutError && (
                        <motion.p
                            initial={{opacity: 0, y: -10}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.3}}
                            className="text-red-500 text-sm mt-2 w-full text-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-md py-2"
                        >
                            Logout failed
                        </motion.p>
                    )}
                </header>
            ) : (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.3}}
                    className="p-4 text-center text-red-500 text-sm font-medium bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
                >
                    Unauthorized token
                </motion.div>
            )}
        </>
    );
};

export default AdminHeader;