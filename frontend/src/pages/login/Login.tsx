import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {useUserGLoginMutation, useUserGTeacherLoginMutation} from "../../services/googleApi";
import {useUserLoginMutation} from "../../services/userApi";
import image from "../../assets/Codesphere_icon.png";
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import {useTeacherLoginMutation} from "../../services/teacherApi.ts";

interface GoogleCredential {
    sub: string;
    email: string;
}

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isTeacher, setIsTeacher] = useState(false);
    const [userGLogin, { isLoading: userGLoading, error: userGError }] = useUserGLoginMutation();
    const [teacherGLogin, { isLoading: teacherGLoading, error: teacherGError }] = useUserGTeacherLoginMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [userLogin, { isLoading: userLoading, error: userError }] = useUserLoginMutation();
    const [teacherLogin, { isLoading: teacherLoading, error: teacherError }] = useTeacherLoginMutation();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isTeacher) {
                await teacherLogin({ email, password }).unwrap();
                navigate("/check/teacher");
            } else {
                await userLogin({ email, password }).unwrap();
                navigate("/check/student");
            }
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    const handleGoogleLogin = async (credentialResponse: { credential?: string }) => {
        if (credentialResponse.credential) {
            const decoded: GoogleCredential = jwtDecode(credentialResponse.credential);
            try {
                // const endpoint = isTeacher ? '/teacher/google-login' : '/google-login';
                await (isTeacher ? teacherGLogin : userGLogin)({
                    email: decoded.email,
                    googleId: decoded.sub,
                }).unwrap();
                navigate(isTeacher ? '/check/teacher' : '/check/student');
            } catch (err) {
                console.error('Google login error:', err);
            }
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-blue-200 dark:bg-gray-900 h-screen transition-colors duration-300">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img alt="Codesphere" src={image} className="mx-auto h-48 w-auto" />
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Login to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {(userError || teacherError) && (
                    <p className="text-red-500 text-sm mb-4">Login failed. Please check your credentials.</p>
                )}
                {(userGError || teacherGError) && (
                    <p className="text-red-500 text-sm mb-4">Login failed. Please check your credentials.</p>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-gray-100 border-2 border-solid border-black dark:border-gray-600 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white">
                            Password
                        </label>
                        <div className="mt-2 relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pr-10 rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-black dark:border-gray-600 focus:outline-indigo-600 sm:text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 dark:text-gray-300"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            type="button"
                            onClick={() => setIsTeacher(false)}
                            className={`px-4 py-2 rounded-md text-sm font-semibold ${!isTeacher ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsTeacher(true)}
                            className={`px-4 py-2 rounded-md text-sm font-semibold ${isTeacher ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}
                        >
                            Teacher
                        </button>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                            disabled={userLoading || teacherLoading || userGLoading || teacherGLoading}
                        >
                            {(userLoading || teacherLoading || userGLoading || teacherGLoading) ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => console.error('Google Login Failed')}
                        render={(renderProps) => (
                            <button
                                onClick={renderProps.onClick}
                                disabled={renderProps.disabled || userLoading || teacherLoading}
                                className="flex w-full items-center justify-center gap-3 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all duration-300"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#fff"
                                        d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.327 0 3.904.932 4.812 1.734l3.276-3.162C18.104 1.226 15.171 0 12.24 0 5.466 0 0 5.524 0 12.286s5.466 12.286 12.24 12.286c6.944 0 12.24-5.888 12.24-12.286 0-.828-.069-1.643-.204-2.426h-12.036z"
                                    />
                                </svg>
                                Sign in with Google {isTeacher ? '(Teacher)' : '(Student)'}
                            </button>
                        )}
                    />
                </div>

                <div className="flex items-center justify-center mt-4">
                    <p className="text-gray-900 dark:text-gray-100">
                        Don't have an account?{' '}
                        <Link className="text-blue-600 dark:text-blue-400 hover:text-green-500 dark:hover:text-green-400" to="/registration/signup">
                            Signup
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;