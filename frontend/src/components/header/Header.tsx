import {Link} from "react-router-dom";
import {useDarkMode} from "../../hooks/useDarkMode.ts";
import * as React from "react";
import {useState} from "react";
import {Menu, X, Moon, Sun} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import logo from '../../assets/Codesphere_icon.png';

const Header: React.FC = () => {
    const {isDark, toggleDarkMode} = useDarkMode();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header
            className="top-0 left-0 right-0 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-xl border-b border-white/20 dark:border-white/10 transition-all duration-500">
            {/* Gradient overlay for depth */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-400/10 dark:via-purple-400/10 dark:to-pink-400/10"></div>

            <div className="relative max-w-7xl mx-auto flex justify-between items-center px-6 sm:px-8 py-4">
                {/* Logo */}
                <Link to="/" className="group">
                    <motion.div
                        className="flex items-center"
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        transition={{type: "spring", stiffness: 400, damping: 10}}
                    >
                        <div className="relative">
                            <img
                                src={logo}
                                alt="CodeSphere Logo"
                                className="h-10 sm:h-12 mr-3 drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300"
                            />
                            <div
                                className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="hidden sm:block">
                            <span
                                className="font-mono text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                                CodeSphere
                            </span>
                        </div>
                    </motion.div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        to="/registration/login"
                        className="group relative px-6 py-2.5 font-mono font-medium text-sm overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10">Login</span>
                        <div
                            className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>

                    {/* Dark Mode Toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleDarkMode}
                            className="relative w-14 h-7 flex items-center rounded-full p-1 transition-all duration-300 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 shadow-inner hover:shadow-lg"
                            aria-label="Toggle Dark Mode"
                        >
                            <motion.div
                                layout
                                transition={{type: "spring", stiffness: 700, damping: 30}}
                                className={`w-5 h-5 rounded-full shadow-lg bg-gradient-to-r transition-all duration-300 ${
                                    isDark
                                        ? "translate-x-7 from-indigo-400 to-purple-400"
                                        : "translate-x-0 from-yellow-400 to-orange-400"
                                }`}
                            />
                        </button>
                        <motion.div
                            animate={{rotate: isDark ? 180 : 0}}
                            transition={{duration: 0.3}}
                        >
                            {isDark ? (
                                <Moon className="w-5 h-5 text-indigo-400 drop-shadow-sm"/>
                            ) : (
                                <Sun className="w-5 h-5 text-yellow-500 drop-shadow-sm"/>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Mobile Hamburger */}
                <div className="md:hidden">
                    <motion.button
                        onClick={() => setMenuOpen(true)}
                        className="p-3 text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-white/10"
                        aria-label="Open menu"
                        whileTap={{scale: 0.95}}
                    >
                        <Menu className="w-6 h-6"/>
                    </motion.button>
                </div>
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
                            transition={{duration: 0.3}}
                            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
                            onClick={() => setMenuOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{x: "100%"}}
                            animate={{x: 0}}
                            exit={{x: "100%"}}
                            transition={{type: "spring", stiffness: 400, damping: 40}}
                            className="fixed top-0 right-0 w-80 h-full bg-white/10 dark:bg-black/20 backdrop-blur-2xl shadow-2xl z-50 border-l border-white/20 dark:border-white/10"
                        >
                            {/* Gradient overlay */}
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-400/20 dark:via-purple-400/10 dark:to-pink-400/20"></div>

                            <div className="relative p-8">
                                <div className="flex justify-between items-center mb-12">
                                    <span
                                        className="font-mono text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                                        Menu
                                    </span>
                                    <motion.button
                                        onClick={() => setMenuOpen(false)}
                                        className="p-3 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/20 dark:border-white/10"
                                        aria-label="Close menu"
                                        whileTap={{scale: 0.95}}
                                    >
                                        <X className="w-6 h-6 text-gray-700 dark:text-gray-200"/>
                                    </motion.button>
                                </div>

                                <nav className="flex flex-col gap-6">
                                    <motion.div
                                        initial={{opacity: 0, x: 20}}
                                        animate={{opacity: 1, x: 0}}
                                        transition={{delay: 0.1}}
                                    >
                                        <Link
                                            to="/registration/login"
                                            onClick={() => setMenuOpen(false)}
                                            className="group block w-full p-4 font-mono text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-white rounded-xl bg-gradient-to-r from-transparent to-transparent hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 border border-white/20 dark:border-white/10 hover:border-transparent hover:shadow-lg"
                                        >
                                            <span className="flex items-center justify-between">
                                                Login
                                                <div
                                                    className="w-2 h-2 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </span>
                                        </Link>
                                    </motion.div>

                                    <motion.div
                                        initial={{opacity: 0, x: 20}}
                                        animate={{opacity: 1, x: 0}}
                                        transition={{delay: 0.2}}
                                    >
                                        <button
                                            onClick={() => {
                                                setMenuOpen(false);
                                                toggleDarkMode();
                                            }}
                                            className="group flex items-center justify-between w-full p-4 font-mono text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-white rounded-xl bg-gradient-to-r from-transparent to-transparent hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 border border-white/20 dark:border-white/10 hover:border-transparent hover:shadow-lg"
                                        >
                                            <span className="flex items-center gap-4">
                                                <motion.div
                                                    animate={{rotate: isDark ? 180 : 0}}
                                                    transition={{duration: 0.3}}
                                                >
                                                    {isDark ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
                                                </motion.div>
                                                Toggle Dark Mode
                                            </span>
                                            <div
                                                className="w-2 h-2 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </button>
                                    </motion.div>
                                </nav>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;