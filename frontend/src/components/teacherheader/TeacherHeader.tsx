import {useNavigate, useLocation, Link} from "react-router-dom";
import {useDarkMode} from "../../hooks/useDarkMode.ts";
import {useCheckTeacherAuthQuery} from "../../services/authCheck.ts";
import {useEffect, useState} from "react";
import {Menu, X, Moon, Sun, Code2, BookOpen, ClipboardCheck, Users, LogOut, Sparkles} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import {useTeacherLogoutMutation} from "../../services/teacherApi.ts";

const TeacherHeader = () => {
    const [logoutTrigger, {isLoading: logoutLoading}] = useTeacherLogoutMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const {isDark, toggleDarkMode} = useDarkMode();
    const [render, setRender] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const {data: authData, isError: authError, refetch: refetchAuth} = useCheckTeacherAuthQuery();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        // Initial check
        handleScroll();

        window.addEventListener('scroll', handleScroll, {passive: true});
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const fullName = `${authData?.user?.name || "Teacher"} ${authData?.user?.surname || ""}`;
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366F1&color=fff&rounded=true&size=40`;

    const navigationItems = [
        {to: "/user/teacher/misses", label: "Attendance", icon: Users},
        {to: "/user/teacher/code-editor", label: "Code Editor", icon: Code2},
        {to: "/user/teacher/quiz", label: "Quiz", icon: BookOpen},
        {to: "/user/teacher/quizchecker", label: "Quiz Checker", icon: ClipboardCheck},
        {to: "/user/teacher/task", label: "Tasks", icon: Sparkles},
    ];

    const isActivePath = (path: string) => location.pathname === path;

    if (!render) {
        return (
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="fixed top-4 right-4 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl shadow-lg font-medium z-[9999]"
            >
                🔒 Unauthorized Access
            </motion.div>
        );
    }

    return (
        <motion.header
            initial={{y: -100}}
            animate={{y: 0}}
            className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 will-change-transform ${
                isScrolled
                    ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl border-b border-gray-200/30 dark:border-gray-700/30'
                    : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg'
            }`}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 999
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-18">
                    {/* Brand & Avatar */}
                    <motion.div
                        className="flex items-center gap-3 sm:gap-4"
                        whileHover={{scale: 1.02}}
                        transition={{type: "spring", stiffness: 400, damping: 25}}
                    >
                        <div className="relative">
                            <img
                                src={avatarUrl}
                                alt="avatar"
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-indigo-500/20 shadow-lg"
                            />
                            <div
                                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                        </div>
                        <div className="hidden sm:block">
                            <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                                {fullName}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Teacher
                                Dashboard</p>
                        </div>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = isActivePath(item.to);
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 group ${
                                        isActive
                                            ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25'
                                            : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4"/>
                                        <span className="hidden xl:inline">{item.label}</span>
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl -z-10"
                                            transition={{type: "spring", stiffness: 500, damping: 30}}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Controls */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Theme Toggle */}
                        <motion.button
                            onClick={toggleDarkMode}
                            className={`relative w-12 h-6 sm:w-14 sm:h-7 rounded-full p-1 transition-all duration-300 ${
                                isDark
                                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/25"
                                    : "bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/25"
                            }`}
                            whileTap={{scale: 0.95}}
                        >
                            <motion.div
                                layout
                                transition={{type: "spring", stiffness: 500, damping: 30}}
                                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ${
                                    isDark ? "translate-x-6 sm:translate-x-7" : "translate-x-0"
                                }`}
                            >
                                {isDark ? (
                                    <Moon className="w-2 h-2 sm:w-3 sm:h-3 text-purple-600"/>
                                ) : (
                                    <Sun className="w-2 h-2 sm:w-3 sm:h-3 text-orange-500"/>
                                )}
                            </motion.div>
                        </motion.button>

                        {/* Desktop Logout */}
                        <motion.button
                            onClick={handleLogout}
                            disabled={logoutLoading}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-red-500/25 hover:shadow-red-500/40 disabled:opacity-50 transition-all duration-200"
                            whileHover={{scale: 1.05, y: -1}}
                            whileTap={{scale: 0.95}}
                        >
                            <LogOut className="w-4 h-4"/>
                            <span className="hidden md:inline">
                                {logoutLoading ? "Signing out..." : "Sign Out"}
                            </span>
                        </motion.button>

                        {/* Mobile Menu Toggle */}
                        <motion.button
                            onClick={() => setMenuOpen(true)}
                            className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            whileTap={{scale: 0.95}}
                        >
                            <Menu className="w-5 h-5"/>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {menuOpen && (
                    <>
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
                            onClick={() => setMenuOpen(false)}
                        />
                        <motion.aside
                            initial={{x: "100%"}}
                            animate={{x: 0}}
                            exit={{x: "100%"}}
                            transition={{type: "spring", stiffness: 300, damping: 30}}
                            className="fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl z-[1001] border-l border-gray-200/20 dark:border-gray-700/20"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={avatarUrl}
                                            alt="avatar"
                                            className="w-12 h-12 rounded-full ring-2 ring-indigo-500/20"
                                        />
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{fullName}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Teacher</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        onClick={() => setMenuOpen(false)}
                                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        whileTap={{scale: 0.95}}
                                    >
                                        <X className="w-5 h-5"/>
                                    </motion.button>
                                </div>

                                {/* Navigation */}
                                <nav className="space-y-2 mb-8">
                                    {navigationItems.map((item, index) => {
                                        const Icon = item.icon;
                                        const isActive = isActivePath(item.to);
                                        return (
                                            <motion.div
                                                key={item.to}
                                                initial={{opacity: 0, x: 20}}
                                                animate={{opacity: 1, x: 0}}
                                                transition={{delay: index * 0.1}}
                                            >
                                                <Link
                                                    to={item.to}
                                                    onClick={() => setMenuOpen(false)}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                                        isActive
                                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                                                    }`}
                                                >
                                                    <Icon className="w-5 h-5"/>
                                                    <span>{item.label}</span>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </nav>

                                {/* Bottom Actions */}
                                <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <motion.button
                                        onClick={toggleDarkMode}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        whileTap={{scale: 0.95}}
                                    >
                                        {isDark ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
                                        <span>Toggle {isDark ? 'Light' : 'Dark'} Mode</span>
                                    </motion.button>
                                    <motion.button
                                        onClick={handleLogout}
                                        disabled={logoutLoading}
                                        className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-red-500/40 disabled:opacity-50 transition-all duration-200"
                                        whileTap={{scale: 0.95}}
                                    >
                                        <LogOut className="w-5 h-5"/>
                                        <span>{logoutLoading ? "Signing out..." : "Sign Out"}</span>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default TeacherHeader;