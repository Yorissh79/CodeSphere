import React, {useState} from 'react';
import {Link} from 'react-router-dom';

const NotFound: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div
            className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-indigo-100 to-indigo-300 text-gray-900'
            }`}
        >
            <main className="text-center max-w-lg">
                {/* Illustration */}
                <div
                    className="animate-fade-in mb-8"
                    role="img"
                    aria-label="Illustration of a lost astronaut"
                >
                    <svg
                        className="w-40 h-40 mx-auto"
                        fill="none"
                        stroke={isDarkMode ? '#F9FAFB' : '#4F46E5'}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 14a2 2 0 110-4 2 2 0 010 4zm-4-7a1 1 0 110-2 1 1 0 010 2zm8 0a1 1 0 110-2 1 1 0 010 2z"
                        />
                    </svg>
                </div>

                {/* Text Section */}
                <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">404</h1>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                    Oops! Page Not Found
                </h2>
                <p className="text-lg mb-8">
                    It looks like this page took a detour to outer space. Let’s get you back on track!
                </p>

                {/* CTA Buttonssection */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        to="/"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        Go Home
                    </Link>
                    <Link
                        to="/search"
                        className="bg-transparent border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-600 hover:text-white hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        Search Site
                    </Link>
                </div>
            </main>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="mt-8 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

            {/* Custom Animation Styles */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in {
            animation: none;
          }
        }
      `}</style>
        </div>
    );
};

export default NotFound;