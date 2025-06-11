import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AdminFooter = () => {
    const [year, setYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="w-full px-4 py-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm">
                    © {year} Codesphere Admin. All rights reserved.
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <Link to="/admin/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        Dashboard
                    </Link>
                    <Link to="/support" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        Support
                    </Link>
                    <Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        Terms
                    </Link>
                </div>
                <button
                    onClick={scrollToTop}
                    className="text-xs px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow transition"
                    aria-label="Back to top"
                >
                    ↑ Top
                </button>
            </div>
        </footer>
    );
};

export default AdminFooter;
