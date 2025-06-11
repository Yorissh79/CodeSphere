import { useUserLogoutMutation } from "../../services/userApi.ts";
import { useNavigate, useLocation } from "react-router-dom";
import { useDarkMode } from "../../hooks/useDarkMode.ts";
import { useCheckAuthQuery } from "../../services/authCheck.ts";
import { useEffect, useState } from "react";
import {Moon, Sun} from "lucide-react";

const StudentHeader = () => {
    const [logoutTrigger, { isLoading: logoutLoading, error: logoutError }] = useUserLogoutMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, toggleDarkMode } = useDarkMode();
    const [render, setRender] = useState(false);

    const { data: authData, isError: authError, refetch: refetchAuth } = useCheckAuthQuery();

    useEffect(() => {
        const pathSegment = location.pathname.split("/")[2];

        if (pathSegment === "student" && !authError) {
            refetchAuth();
            if (authData?.user?.role === "student") {
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
                <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                    <button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                    >
                        {logoutLoading ? "Logging out..." : "Logout"}
                    </button>
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
                    {logoutError && <p className="text-red-500 text-sm">Logout failed</p>}
                </div>
            ) : (
                <div><p>Unauthorized token</p></div>
            )}
        </>
    );
};

export default StudentHeader;