import { useDarkMode } from "../../hooks/useDarkMode.ts";
import { Link } from "react-router-dom";
import logo from "../../assets/Codesphere_icon.png";

const SignHeader = () => {
    const { isDark, toggleDarkMode } = useDarkMode();

    return (
        <header className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-900 via-blue-900 to-black dark:from-gray-800 dark:via-gray-900 dark:to-black text-white dark:text-gray-100 transition-colors duration-300">
            <div className="flex items-center">
                <Link to={"/"}>
                    <img src={logo} alt="CodeSphere Logo" className="h-12 mr-2" />
                </Link>
            </div>
            <div>
                <button
                    onClick={toggleDarkMode}
                    className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700"
                >
                    {isDark ? "Light Mode" : "Dark Mode"}
                </button>
            </div>
        </header>
    );
};

export default SignHeader;