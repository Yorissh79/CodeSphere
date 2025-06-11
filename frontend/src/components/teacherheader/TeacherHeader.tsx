import { useNavigate, useLocation } from "react-router-dom";
import { useDarkMode } from "../../hooks/useDarkMode.ts";
import { useEffect, useState } from "react";
import {useTeacherLogoutMutation} from "../../services/teacherApi.ts";
import {useCheckTeacherAuthQuery} from "../../services/authCheck.ts";

const TeacherHeader = () => {
    const [logoutTrigger, { isLoading: logoutLoading, error: logoutError }] = useTeacherLogoutMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, toggleDarkMode } = useDarkMode();
    const [render, setRender] = useState(false);

    const { data: authData, isError: authError, refetch: refetchAuth } = useCheckTeacherAuthQuery();

    useEffect(() => {
        const pathSegment = location.pathname.split("/")[2];

        if (pathSegment === "teacher" && !authError) {
            refetchAuth();
            if (authData?.user?.role === "teacher") {
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
                        className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700"
                    >
                        {isDark ? "Light Mode" : "Dark Mode"}
                    </button>
                    {logoutError && <p className="text-red-500 text-sm">Logout failed</p>}
                </div>
            ) : (
                <div><p>Unauthorized token</p></div>
            )}
        </>
    );
};

export default TeacherHeader;