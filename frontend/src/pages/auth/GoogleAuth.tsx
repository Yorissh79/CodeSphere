import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {useGetCurrentUserQuery, type User} from "../../services/googleApi.ts";

export default function GoogleAuth() {
    const {data, error, isLoading, refetch} = useGetCurrentUserQuery();
    const navigate = useNavigate();

    const user: User | undefined = data;

    useEffect(() => {
        const handleGoogleAuthCheck = async () => {
            if (isLoading) {
                return;
            }

            if (error) {
                // Navigate to login on error - cookies are handled by the server
                navigate("/registration/login", {replace: true});
                return;
            }

            if (user) {
                // Check if user is a Google user and redirect accordingly
                if (user.role === "student") {
                    navigate("/user/student", {replace: true});
                } else if (user.role === "teacher") {
                    navigate("/user/teacher", {replace: true});
                } else if (user.role === "admin") {
                    navigate("/user/admin", {replace: true});
                } else {
                    // Handle case where user exists but role is not set
                    navigate("/registration/login", {replace: true});
                }
            } else {
                // No user data, redirect to login
                navigate("/registration/login", {replace: true});
            }
        };

        handleGoogleAuthCheck();
    }, [isLoading, error, data, navigate, user]);

    // Handle Google OAuth callback - no need for token handling since using cookies
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const authSuccess = urlParams.get('auth');
        const authError = urlParams.get('error');

        // Handle successful OAuth callback
        if (authSuccess === 'success') {
            // Clean up URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            // Refetch user data - JWT cookie should now be set
            refetch();
        }

        // Handle OAuth error callback
        if (authError) {
            console.error('OAuth error:', authError);
            // Clean up URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            // Navigate to login
            navigate("/registration/login", {replace: true});
        }
    }, [refetch, navigate]);

    if (isLoading) {
        return (
            <div
                className="flex justify-center items-center h-screen font-sans text-xl text-gray-600 dark:text-gray-400">
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <span>Verifying Google authentication...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen font-sans text-xl text-red-600 dark:text-red-400">
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                    <span>Authentication failed. Redirecting to login...</span>
                </div>
            </div>
        );
    }

    return null;
}