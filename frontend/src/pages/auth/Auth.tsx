import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {useCheckAuthQuery} from "../../services/authCheck.ts";

interface User {
    _id: string;
    name: string;
    email: string;
    surname: string;
    group: string;
    role: string;
    // Add Google-specific fields
    googleId?: string;
    picture?: string;
    isGoogleUser?: boolean;
}

export default function AppLayout() {

    const {data, error, isLoading, refetch} = useCheckAuthQuery();
    const navigate = useNavigate();

    const user: User | undefined = data?.user;

    useEffect(() => {

        const handleAuthCheck = async () => {
            if (isLoading) {
                return;
            }

            if (error) {
                // Clear any stale auth tokens and navigate to login
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                navigate("/registration/login", {replace: true});
            } else if (user?.role === "student") {
                navigate("/user/student", {replace: true});
            } else if (user?.role === "teacher") {
                navigate("/user/teacher", {replace: true});
            } else if (user?.role === "admin") {
                navigate("/user/admin", {replace: true});
            } else if (user && !user.role) {
                // Handle case where user exists but role is not set
                console.warn("User authenticated but no role assigned");
                navigate("/registration/login", {replace: true});
            }
        };

        handleAuthCheck()

    }, [isLoading, error, data, navigate, user]);

    // Add effect to handle URL fragments (for OAuth redirects)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            // Store token from URL parameter (useful for OAuth redirects)
            localStorage.setItem('token', token);
            // Remove token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Refetch auth data with new token
            refetch();
        }
    }, [refetch]);

    if (isLoading) {
        return (
            <div
                className="flex justify-center items-center h-screen font-sans text-xl text-gray-600 dark:text-gray-400">
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                </div>
            </div>
        );
    }

    return null;
}