import {Link} from "react-router-dom";

export const SkeletonLoader = () => (
    <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <Link to={"/"} className="text-lg font-semibold mb-2">Home</Link>
            <p className="text-gray-600 dark:text-gray-400">Welcome to the home page</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <Link to={"/registration/login"} className="text-lg font-semibold mb-2">Login</Link>
            <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <Link to={"/registration/signup"} className="text-lg font-semibold mb-2">Signup</Link>
            <p className="text-gray-600 dark:text-gray-400">Create a new account</p>
        </div>
    </div>
);