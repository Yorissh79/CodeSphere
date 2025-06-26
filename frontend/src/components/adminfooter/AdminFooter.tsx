import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {ArrowUp} from "lucide-react";

const AdminFooter: React.FC = () => {
    const [year, setYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    const scrollToTop = () => {
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    return (
        <footer
            className="w-full px-4 sm:px-6 py-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors duration-300">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 sm:gap-4">
                <div className="text-sm text-center">
                    © {year} CodeSphere Admin. All rights reserved.
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm">
                    <Link
                        to="/admin/dashboard"
                        className="py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/support"
                        className="py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        Support
                    </Link>
                    <Link
                        to="/terms"
                        className="py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        Terms
                    </Link>
                </div>
                <button
                    onClick={scrollToTop}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="w-4 h-4"/>
                    Back to Top
                </button>
            </div>
        </footer>
    );
};

export default AdminFooter;