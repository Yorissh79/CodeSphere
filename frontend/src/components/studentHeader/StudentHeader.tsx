import {useNavigate, useLocation, Link} from "react-router-dom";
import {useDarkMode} from "../../hooks/useDarkMode.ts";
import {useEffect, useState} from "react";
import {Menu, X, Moon, Sun, GraduationCap, Code, FileText, Clock, User, Home} from "lucide-react";
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
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=667eea&color=fff&rounded=true&bold=true`;

    const navigationItems = [
        {path: "/user/student/misses", label: "Misses", icon: Clock},
        {path: "/user/student/code-editor", label: "Code Editor", icon: Code},
        {path: "/user/student/quiz", label: "Quiz", icon: FileText},
        {path: "/user/student/task", label: "Task", icon: GraduationCap},
    ];

    const mobileNavigationItems = [
        {path: "/user/student/dashboard", label: "Dashboard", icon: Home},
        {path: "/user/student/profile", label: "Profile", icon: User},
        ...navigationItems,
    ];

    const isActivePath = (path: string) => location.pathname === path;

    const LoadingSkeleton = () => (
        <div
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
            <div
                className="max-w-7xl mx-auto flex justify-between items-center px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div
                        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 animate-pulse"></div>
                    <div
                        className="hidden sm:block w-24 sm:w-32 lg:w-40 h-3 sm:h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full animate-pulse"></div>
                </div>
                <div className="hidden md:flex items-center gap-2 lg:gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i}
                             className="w-12 lg:w-16 h-7 lg:h-8 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-lg animate-pulse"></div>
                    ))}
                    <div
                        className="w-10 lg:w-12 h-5 lg:h-6 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full animate-pulse"></div>
                    <div
                        className="w-16 lg:w-20 h-7 lg:h-8 bg-gradient-to-r from-red-200 to-red-300 dark:from-red-800 dark:to-red-700 rounded-lg animate-pulse"></div>
                </div>
                <div
                    className="md:hidden w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full animate-pulse"></div>
            </div>
        </div>
    );

    // Show loading skeleton while authentication is being checked
    if (!authData && !authError) {
        return <LoadingSkeleton/>;
    }

    return (
        <>
            {render ? (
                <motion.header
                    initial={{y: -100, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    transition={{type: "spring", stiffness: 100, damping: 20}}
                    className=" top-0 left-0 right-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20 border-b border-slate-200/30 dark:border-slate-700/30 transition-all duration-300"
                    style={{fontFamily: '"Space Mono", monospace'}}
                >
                    <div
                        className="max-w-7xl mx-auto flex justify-between items-center px-3 sm:px-4 lg:px-6 xl:px-8 py-2.5 sm:py-3 lg:py-4">
                        {/* Avatar and Name */}
                        <motion.div
                            className="flex items-center"
                            whileHover={{scale: 1.02}}
                            transition={{type: "spring", stiffness: 400, damping: 17}}
                        >
                            <Link
                                to="/user/student"
                                className="flex items-center gap-2 sm:gap-3 lg:gap-4"
                            >
                                {/* Avatar + Status */}
                                <div className="relative">
                                    <img
                                        src={avatarUrl}
                                        alt={`${fullName}'s avatar`}
                                        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full border-2 border-gradient-to-r from-violet-500 to-purple-500 shadow-md lg:shadow-lg shadow-violet-500/25"
                                    />
                                    <div
                                        className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"/>
                                </div>

                                {/* Text: Name + Label */}
                                <div className="flex flex-col justify-center">
      <span
          className="text-xs sm:text-sm lg:text-base font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent leading-tight">
        {fullName}
      </span>
                                    <span className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-medium">
        Student Portal
      </span>
                                </div>
                            </Link>
                        </motion.div>


                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = isActivePath(item.path);

                                return (
                                    <motion.div
                                        key={item.path}
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                        transition={{type: "spring", stiffness: 400, damping: 17}}
                                    >
                                        <Link
                                            to={item.path}
                                            className={`relative flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-4 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md lg:shadow-lg shadow-violet-500/25"
                                                    : "text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                                            }`}
                                        >
                                            <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4"/>
                                            <span className="hidden lg:inline">{item.label}</span>
                                            <span className="lg:hidden">{item.label.split(' ')[0]}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg lg:rounded-xl -z-10"
                                                    transition={{type: "spring", stiffness: 500, damping: 30}}
                                                />
                                            )}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </nav>

                        {/* Desktop Controls */}
                        <div className="hidden md:flex items-center gap-2 lg:gap-3">
                            {/* Dark Mode Toggle */}
                            <motion.button
                                onClick={toggleDarkMode}
                                whileHover={{scale: 1.1}}
                                whileTap={{scale: 0.9}}
                                className={`relative w-12 h-6 lg:w-14 lg:h-7 flex items-center rounded-full p-1 transition-all duration-300 ${
                                    isDark
                                        ? "bg-gradient-to-r from-violet-600 to-purple-600 shadow-md lg:shadow-lg shadow-violet-500/25"
                                        : "bg-gradient-to-r from-amber-400 to-orange-400 shadow-md lg:shadow-lg shadow-amber-400/25"
                                }`}
                                aria-label="Toggle Dark Mode"
                            >
                                <motion.div
                                    layout
                                    transition={{type: "spring", stiffness: 500, damping: 30}}
                                    className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full shadow-md flex items-center justify-center ${
                                        isDark ? "translate-x-6 lg:translate-x-7 bg-white" : "translate-x-0 bg-slate-800"
                                    }`}
                                >
                                    {isDark ?
                                        <Moon className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-violet-600"/> :
                                        <Sun className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-amber-400"/>
                                    }
                                </motion.div>
                            </motion.button>

                            {/* Logout Button */}
                            <motion.button
                                onClick={handleLogout}
                                disabled={logoutLoading}
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                className="px-3 lg:px-5 py-2 lg:py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg lg:rounded-xl hover:from-red-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs lg:text-sm font-medium shadow-md lg:shadow-lg shadow-red-500/25 hover:shadow-red-500/30"
                            >
                                {logoutLoading ? (
                                    <div className="flex items-center gap-1.5 lg:gap-2">
                                        <div
                                            className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span className="hidden lg:inline">Logging out...</span>
                                        <span className="lg:hidden">...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span className="hidden lg:inline">Logout</span>
                                        <span className="lg:hidden">Exit</span>
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* Mobile Menu Button */}
                        <motion.button
                            onClick={() => setMenuOpen(true)}
                            whileHover={{scale: 1.1}}
                            whileTap={{scale: 0.9}}
                            className="md:hidden p-2 sm:p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg sm:rounded-xl transition-colors duration-200"
                            aria-label="Open menu"
                        >
                            <Menu className="w-5 h-5 sm:w-6 sm:h-6"/>
                        </motion.button>
                    </div>

                    {/* Mobile Drawer */}
                    <AnimatePresence>
                        {menuOpen && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    exit={{opacity: 0}}
                                    onClick={() => setMenuOpen(false)}
                                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                                />

                                {/* Drawer */}
                                <motion.aside
                                    initial={{x: "100%"}}
                                    animate={{x: 0}}
                                    exit={{x: "100%"}}
                                    transition={{type: "spring", stiffness: 300, damping: 30}}
                                    className="fixed top-0 right-0 w-72 sm:w-80 lg:w-96 h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 border-l border-slate-200/50 dark:border-slate-700/50"
                                    style={{fontFamily: '"Space Mono", monospace'}}
                                >
                                    {/* Header */}
                                    <div
                                        className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={avatarUrl}
                                                alt={`${fullName}'s avatar`}
                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-300 dark:border-slate-600"
                                            />
                                            <div>
                                                <span
                                                    className="block text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                                                    Menu
                                                </span>
                                                <span
                                                    className="block text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-[200px]">
                                                    {fullName}
                                                </span>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={() => setMenuOpen(false)}
                                            whileHover={{scale: 1.1}}
                                            whileTap={{scale: 0.9}}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200"
                                            aria-label="Close menu"
                                        >
                                            <X className="w-5 h-5 text-slate-700 dark:text-slate-200"/>
                                        </motion.button>
                                    </div>

                                    {/* Navigation */}
                                    <nav
                                        className="flex flex-col p-3 sm:p-4 gap-1 overflow-y-auto max-h-[calc(100vh-120px)]">
                                        {mobileNavigationItems.map((item, index) => {
                                            const Icon = item.icon;
                                            const isActive = isActivePath(item.path);

                                            return (
                                                <motion.div
                                                    key={item.path}
                                                    initial={{opacity: 0, x: 50}}
                                                    animate={{opacity: 1, x: 0}}
                                                    transition={{delay: index * 0.05}}
                                                >
                                                    <Link
                                                        to={item.path}
                                                        onClick={() => setMenuOpen(false)}
                                                        className={`flex items-center gap-3 px-4 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 touch-manipulation ${
                                                            isActive
                                                                ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25"
                                                                : "text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 active:bg-violet-100 dark:active:bg-violet-900/30"
                                                        }`}
                                                    >
                                                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"/>
                                                        {item.label}
                                                    </Link>
                                                </motion.div>
                                            );
                                        })}

                                        {/* Dark Mode Toggle */}
                                        <motion.button
                                            onClick={toggleDarkMode}
                                            initial={{opacity: 0, x: 50}}
                                            animate={{opacity: 1, x: 0}}
                                            transition={{delay: mobileNavigationItems.length * 0.05}}
                                            className="flex items-center gap-3 px-4 py-3 sm:py-4 text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 active:bg-violet-100 dark:active:bg-violet-900/30 rounded-xl transition-all duration-200 text-sm sm:text-base font-medium touch-manipulation"
                                        >
                                            {isDark ? <Moon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"/> :
                                                <Sun className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"/>}
                                            Toggle Dark Mode
                                        </motion.button>

                                        {/* Logout Button */}
                                        <motion.button
                                            onClick={() => {
                                                setMenuOpen(false);
                                                handleLogout();
                                            }}
                                            initial={{opacity: 0, x: 50}}
                                            animate={{opacity: 1, x: 0}}
                                            transition={{delay: (mobileNavigationItems.length + 1) * 0.05}}
                                            disabled={logoutLoading}
                                            className="flex items-center justify-center gap-2 mt-4 px-4 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 active:from-red-700 active:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base font-medium shadow-lg shadow-red-500/25 touch-manipulation"
                                        >
                                            {logoutLoading ? (
                                                <>
                                                    <div
                                                        className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Logging out...</span>
                                                </>
                                            ) : (
                                                <span>Logout</span>
                                            )}
                                        </motion.button>
                                    </nav>
                                </motion.aside>
                            </>
                        )}
                    </AnimatePresence>
                </motion.header>
            ) : (
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    className="fixed top-0 left-0 right-0 z-50 p-4 text-red-500 text-center text-sm font-medium bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-red-200/50 dark:border-red-800/50"
                    style={{fontFamily: '"Space Mono", monospace'}}
                >
                    <div className="flex items-center justify-center gap-2">
                        <div
                            className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                        Unauthorized token
                    </div>
                </motion.div>
            )}
        </>
    );
};

export default StudentHeader;