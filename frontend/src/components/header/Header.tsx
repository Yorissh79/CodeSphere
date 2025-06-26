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
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-4">
                {/* Logo */}
                <Link to="/">
                    <div className="flex items-center">
                        <img src={logo} alt="CodeSphere Logo" className="h-10 sm:h-12 mr-2"/>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        to="/registration/login"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                        Login
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
                    {isDark ? <Moon className="w-5 h-5 text-gray-300"/> : <Sun className="w-5 h-5 text-yellow-500"/>}
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
                                to="/registration/login"
                                onClick={() => setMenuOpen(false)}
                                className="py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                            >
                                Login
                            </Link>
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    toggleDarkMode();
                                }}
                                className="flex items-center gap-3 py-2 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                            >
                                {isDark ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
                                Toggle Dark Mode
                            </button>
                        </nav>
                    </motion.aside>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;