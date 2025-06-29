import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import {useVerifyGoogleTokenMutation} from "../../services/googleApi";
import {useUserLoginMutation} from "../../services/userApi";
import image from "../../assets/Codesphere_icon.png";
import {Eye, EyeOff, Mail, Lock, AlertCircle} from 'lucide-react';
import {GoogleLogin} from '@react-oauth/google';
import {useTeacherLoginMutation} from "../../services/teacherApi";
import {useAdminLoginMutation} from "../../services/adminApi";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isTeacher, setIsTeacher] = useState(false);
    const [verifyGoogleToken, {isLoading: googleLoading, error: googleError}] = useVerifyGoogleTokenMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [userLogin, {isLoading: userLoading, error: userError}] = useUserLoginMutation();
    const [teacherLogin, {isLoading: teacherLoading, error: teacherError}] = useTeacherLoginMutation();
    const [adminLogin, {isLoading: adminLoading, error: adminError}] = useAdminLoginMutation();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Check if email indicates admin (e.g., ends with @admin.com)
            if (email.toLowerCase().endsWith('@admin.com')) {
                await adminLogin({email, password}).unwrap();
                navigate("/check/admin");
            } else if (isTeacher) {
                await teacherLogin({email, password}).unwrap();
                navigate("/check/teacher");
            } else {
                await userLogin({email, password}).unwrap();
                navigate("/check/student");
            }
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    const handleGoogleLogin = async (credentialResponse: { credential?: string }) => {
        if (credentialResponse.credential) {
            try {
                const result = await verifyGoogleToken({
                    idToken: credentialResponse.credential,
                }).unwrap();
                // Navigate based on user role from the response
                if (result.user.role === 'admin') {
                    navigate('/user/admin');
                } else if (result.user.role === 'teacher') {
                    navigate('/user/teacher');
                } else {
                    navigate('/user/student');
                }
            } catch (err) {
                console.error('Google login error:', err);
            }
        }
    };

    const isLoading = userLoading || teacherLoading || googleLoading || adminLoading;
    const hasError = userError || teacherError || adminError || googleError;

    // Skeleton loader component
    const SkeletonLoader = () => (
        <div className="animate-pulse space-y-6">
            <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
    );

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-mono transition-all duration-500">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Main card with glassmorphism effect */}
                <div
                    className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 sm:p-10 transition-all duration-500">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="relative mb-6 flex justify-center">
                            <div className="group relative">
                                {/* Outer glow */}
                                <div
                                    className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-all duration-700 animate-pulse"></div>

                                {/* Main container */}
                                <div
                                    className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-500 group-hover:scale-105">
                                    <img
                                        alt="CodeSphere"
                                        src={image}
                                        className="h-24 w-24 object-contain filter drop-shadow-2xl group-hover:drop-shadow-[0_0_30px_rgba(139,92,246,0.7)] transition-all duration-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Sign in to your Codesphere account
                        </p>
                    </div>

                    {/* Error messages */}
                    {hasError && (
                        <div
                            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-3 transition-all duration-300">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0"/>
                            <p className="text-red-700 dark:text-red-400 text-sm">
                                Login failed. Please check your credentials.
                            </p>
                        </div>
                    )}

                    {/* Role selector */}
                    <div className="mb-8">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
                            I am a
                        </p>
                        <div
                            className="flex bg-gray-100 dark:bg-gray-700/50 rounded-2xl p-1 transition-all duration-300">
                            <button
                                type="button"
                                onClick={() => setIsTeacher(false)}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                    !isTeacher
                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-lg transform scale-[1.02]'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsTeacher(true)}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                    isTeacher
                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-lg transform scale-[1.02]'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                            >
                                Teacher
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    {isLoading ? (
                        <SkeletonLoader/>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email field */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div
                                        className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400"/>
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 placeholder:text-gray-400 text-sm"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            {/* Password field */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <div
                                        className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400"/>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-12 pr-12 py-4 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 placeholder:text-gray-400 text-sm"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                    </button>
                                </div>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Divider */}
                    <div className="my-8 flex items-center">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
                        <div className="px-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            or continue with
                        </div>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
                    </div>

                    {/* Google login */}
                    <div className="flex justify-center">
                        <div className="transform hover:scale-105 transition-transform duration-200 w-full">
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => console.error('Google Login Failed')}
                                shape="pill"
                                theme="outline"
                            />
                        </div>
                    </div>

                    {/* Signup link */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                to="/registration/signup"
                                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors duration-200"
                            >
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;