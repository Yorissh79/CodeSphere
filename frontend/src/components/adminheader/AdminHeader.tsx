import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDarkMode } from "../../hooks/useDarkMode.ts";
import { useEffect, useState } from "react";
import { useAdminLogoutMutation } from "../../services/adminApi.ts";
import { useCheckAdminAuthQuery } from "../../services/authCheck.ts";
import { Moon, Sun, LogOut, User, Users, LayoutDashboard, BookOpen } from "lucide-react"; // Optional: icons

const AdminHeader = () => {
    const [logoutTrigger, { isLoading: logoutLoading, error: logoutError }] = useAdminLogoutMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, toggleDarkMode } = useDarkMode();
    const [render, setRender] = useState(false);

    const { data: authData, isError: authError, refetch: refetchAuth } = useCheckAdminAuthQuery();

    useEffect(() => {
        const pathSegment = location.pathname.split("/")[2];

        if (pathSegment === "admin" && !authError) {
            refetchAuth();
            if (authData?.user?.role === "admin") {
                setRender(true);
            } else {
                setRender(false);
            }
        } else {
            setRender(false);
        }
    }, [location, authData, authError, refetchAuth]);

    const handleLogout = async () => {
        try {
            await logoutTrigger().unwrap();
            navigate("/registration/login");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <>
            {render ? (
                <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-gray-100 dark:bg-gray-900 shadow-md transition-colors duration-300">
                    <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
                        <Link
                            to="/user/admin/dashboard"
                            className="flex items-center gap-1 text-gray-800 dark:text-gray-200 hover:text-indigo-600 transition"
                        >
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link
                            to="/user/admin/students"
                            className="flex items-center gap-1 text-gray-800 dark:text-gray-200 hover:text-indigo-600 transition"
                        >
                            <Users className="w-4 h-4" /> Students
                        </Link>
                        <Link
                            to="/user/admin/teachers"
                            className="flex items-center gap-1 text-gray-800 dark:text-gray-200 hover:text-indigo-600 transition"
                        >
                            <User className="w-4 h-4" /> Teachers
                        </Link>
                        <Link
                            to="/user/admin/courses"
                            className="flex items-center gap-1 text-gray-800 dark:text-gray-200 hover:text-indigo-600 transition"
                        >
                            <BookOpen className="w-4 h-4" /> Courses
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {/* Dark Mode Toggle Switch */}
                        <button
                            onClick={toggleDarkMode}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
                                isDark ? "bg-indigo-600" : "bg-gray-300"
                            }`}
                            aria-label="Toggle Dark Mode"
                        >
                            <div
                                className={`w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${
                                    isDark ? "translate-x-6 bg-white" : "translate-x-0 bg-gray-800"
                                }`}
                            />
                        </button>
                        <span className="text-gray-800 dark:text-gray-200 hidden sm:inline">
                            {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </span>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            disabled={logoutLoading}
                            className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition disabled:opacity-50"
                        >
                            <LogOut className="w-4 h-4" />
                            {logoutLoading ? "Logging out..." : "Logout"}
                        </button>
                    </div>

                    {logoutError && (
                        <p className="text-red-500 text-sm mt-2 w-full text-center">Logout failed</p>
                    )}
                </header>
            ) : (
                <div className="p-4 text-center text-red-500">Unauthorized token</div>
            )}
        </>
    );
};

export default AdminHeader;
