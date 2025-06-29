import {Link} from "react-router-dom";
import {Moon, Sun, Menu, X, Monitor} from "lucide-react";
import {useState, useEffect} from "react";
import logo from "../../assets/Codesphere_icon.png";

const SignHeader = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState('system');

    // Enhanced dark mode with system preference support
    useEffect(() => {
        const root = window.document.documentElement;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const applyTheme = (mode: string) => {
            root.classList.remove('light', 'dark');

            if (mode === 'system') {
                if (systemPrefersDark) {
                    root.classList.add('dark');
                } else {
                    root.classList.add('light');
                }
            } else {
                root.classList.add(mode);
            }
        };

        // Apply saved theme or system preference
        const savedTheme = localStorage.getItem('theme') || 'system';
        setDarkMode(savedTheme);
        applyTheme(savedTheme);

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = () => {
            if (savedTheme === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, []);

    const handleThemeChange = (newMode: string) => {
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode);

        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (newMode === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.add(systemPrefersDark ? 'dark' : 'light');
        } else {
            root.classList.add(newMode);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <>
            {/* Backdrop blur overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <header className="relative font-mono dark:text-white dark:bg-gray-900/80">
                <div
                    className="bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 sm:h-20">
                            {/* Logo Section */}
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/"
                                    className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
                                >
                                    <div className="relative">
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"/>
                                        <img
                                            src={logo}
                                            alt="CodeSphere Logo"
                                            className="relative h-11/12 w-16 shadow-lg"
                                        />
                                    </div>
                                    <div className="hidden sm:block">
                                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                            CodeSphere
                                        </h1>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {window.location.pathname === "/registration/teacher/signup"
                                                ? "Teacher Portal"
                                                : (window.location.pathname === "/registration/login" || window.location.pathname === "/registration/signup")
                                                    ? "Coding Platform"
                                                    : "CodeSphere"
                                            }
                                        </p>
                                    </div>
                                </Link>
                            </div>

                            {/* Desktop Controls */}
                            <div className="hidden sm:flex items-center space-x-4">
                                {/* Enhanced Theme Toggle */}
                                <div className="relative group">
                                    <button
                                        onClick={() => {
                                            // Cycle through themes: system -> light -> dark -> system
                                            const nextMode = darkMode === 'system' ? 'light' : darkMode === 'light' ? 'dark' : 'system';
                                            handleThemeChange(nextMode);
                                        }}
                                        className="relative p-3 rounded-xl bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-300 group"
                                        aria-label={`Current theme: ${darkMode}. Click to cycle themes.`}
                                    >
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                                        <div className="relative">
                                            {darkMode === 'system' ? (
                                                <Monitor
                                                    className="h-5 w-5 text-purple-400 transition-transform duration-300 group-hover:scale-110"/>
                                            ) : darkMode === 'dark' ? (
                                                <Moon
                                                    className="h-5 w-5 text-blue-400 transition-transform duration-300 group-hover:-rotate-12"/>
                                            ) : (
                                                <Sun
                                                    className="h-5 w-5 text-yellow-400 transition-transform duration-300 group-hover:rotate-180"/>
                                            )}
                                        </div>
                                    </button>

                                    {/* Theme indicator tooltip */}
                                    <div
                                        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                        <div
                                            className="bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900 text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                            {darkMode.charAt(0).toUpperCase() + darkMode.slice(1)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={toggleMobileMenu}
                                className="sm:hidden p-2 rounded-lg bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-700/30 transition-all duration-300"
                                aria-label="Toggle mobile menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6 text-gray-700 dark:text-gray-300"/>
                                ) : (
                                    <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300"/>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`fixed top-16 right-0 w-80 max-w-[90vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-white/20 dark:border-gray-700/30 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out sm:hidden ${
                        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}>
                    <div className="p-6 space-y-6">
                        {/* Mobile Logo */}
                        <div
                            className="flex items-center space-x-3 pb-4 border-b border-gray-200/30 dark:border-gray-700/30">
                            <img
                                src={logo}
                                alt="CodeSphere Logo"
                                className="h-8 w-8 rounded-lg"
                            />
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white">
                                    CodeSphere
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Teacher Portal
                                </p>
                            </div>
                        </div>

                        {/* Mobile Controls */}
                        <div className="space-y-4">
                            {/* Theme Selection */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        {mode: 'light', icon: Sun, label: 'Light', color: 'text-yellow-500'},
                                        {mode: 'dark', icon: Moon, label: 'Dark', color: 'text-blue-500'},
                                        {mode: 'system', icon: Monitor, label: 'System', color: 'text-purple-500'}
                                    ].map(({mode, icon: Icon, label, color}) => (
                                        <button
                                            key={mode}
                                            onClick={() => {
                                                handleThemeChange(mode);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`p-3 rounded-xl border transition-all duration-300 ${
                                                darkMode === mode
                                                    ? 'bg-gray-200/80 dark:bg-gray-700/80 border-gray-300 dark:border-gray-600'
                                                    : 'bg-gray-100/50 dark:bg-gray-800/50 border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center space-y-1">
                                                <Icon className={`h-5 w-5 ${color}`}/>
                                                <span className="text-xs font-medium text-gray-900 dark:text-white">
                                                    {label}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Status */}
                            <div
                                className="flex items-center justify-center space-x-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                                <span className="text-sm text-green-600 dark:text-green-400">
                                    System Online
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Gradient decoration */}
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"/>
        </>
    );
};

export default SignHeader;