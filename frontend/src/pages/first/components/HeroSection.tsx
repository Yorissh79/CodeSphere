import type {FC} from 'react';
import {Link} from 'react-router-dom';
import {Sparkles} from 'lucide-react';

const HeroSection: FC = () => {
    return (
        <section
            className="relative min-h-[80vh] flex items-center justify-center text-center py-16 px-4 sm:px-6 overflow-hidden">
            <div
                className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
                <div
                    className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-5"/>
            </div>
            <div className="relative z-10 max-w-5xl mx-auto">
                <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 dark:bg-indigo-900/20 backdrop-blur-md border border-indigo-200/30 dark:border-indigo-800/30 mb-6">
                    <Sparkles className="h-4 w-4 text-indigo-400"/>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
            Modern Education Platform
          </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Empower Learning
          </span>
                    <br/>
                    <span className="text-gray-800 dark:text-gray-200">
            with CodeSphere
          </span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                    Transform education with real-time coding, intelligent quizzes, and seamless collaboration tools for
                    teachers and students.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        className="relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
                        Get Started
                    </button>
                    <Link to="/editor"
                          className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
                        Try Code Editor
                    </Link>
                    <Link to="/registration/teacher/signup"
                          className="px-6 py-3 bg-white/10 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200/20 dark:border-gray-800/50 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-white/20 dark:hover:bg-gray-900/70 transition-all duration-300">
                        Join as Teacher
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;