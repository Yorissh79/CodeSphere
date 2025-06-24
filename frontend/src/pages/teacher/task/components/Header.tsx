import {motion} from 'framer-motion';
import {Bell, FileText} from 'lucide-react';
import {useState} from "react";
import {useEffect} from "react";

const Header = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    return (
        <motion.header
            initial={{y: -100}}
            animate={{y: 0}}
            transition={{duration: 0.4, ease: 'easeOut'}}
            className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Corrected classname from lg8 to lg:px-8 */}
                <div className="flex items-center justify-between h-16">
                    <motion.div
                        className="flex items-center space-x-3"
                        whileHover={{scale: 1.02}}
                        transition={{duration: 0.2}}
                    >
                        <div
                            className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                            <FileText className="w-5 h-5 text-white"/>
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            EduTasks
                        </h1>
                    </motion.div>

                    <div className="flex items-center space-x-4">
                        <motion.button
                            whileHover={{scale: 1.1}}
                            whileTap={{scale: 0.9}}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 relative transition-colors duration-200"
                        >
                            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                            <span
                                className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white dark:ring-gray-900"/>
                        </motion.button>
                        <motion.button
                            whileHover={{scale: 1.1}}
                            whileTap={{scale: 0.9}}
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200"
                        >
                            {isDarkMode ? (
                                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                                </svg>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
};


export default Header;
