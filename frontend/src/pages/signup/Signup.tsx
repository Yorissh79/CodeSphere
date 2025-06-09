import image from '../../assets/Codesphere_icon.png'
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserSignupMutation } from "../../services/userApi.ts";
import { Eye, EyeOff } from 'lucide-react';


const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [password, setPassword] = useState('');
    const [group, setGroup] = useState('');

    const [showPassword, setShowPassword] = useState(false);

    const [createPost, { isLoading, error }] = useUserSignupMutation();

    const signUp = async (e: React.FormEvent) => {
        e.preventDefault();
        await createPost({
            email,
            name,
            surname,
            password,
            group,
            role: "student"
        });
        if (!isLoading) {
            navigate("/registration/login");
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-blue-200 dark:bg-gray-900 h-screen transition-colors">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="Your Company"
                    src={image}
                    className="mx-auto h-48 w-auto"
                />
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Sign up to an account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {error && (
                    <p className="text-red-500 text-sm mb-4">
                        There was an error creating the account
                    </p>
                )}

                <form onSubmit={signUp} className="space-y-6">

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white">
                            Name
                        </label>
                        <div className="mt-2">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                autoComplete="name"
                                className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-black dark:border-gray-600 focus:outline-indigo-600 sm:text-sm"
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Surname */}
                    <div>
                        <label htmlFor="surname" className="block text-sm font-medium text-gray-900 dark:text-white">
                            Surname
                        </label>
                        <div className="mt-2">
                            <input
                                id="surname"
                                name="surname"
                                type="text"
                                required
                                autoComplete="surname"
                                className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-black dark:border-gray-600 focus:outline-indigo-600 sm:text-sm"
                                onChange={(e) => setSurname(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Group */}
                    <div>
                        <label htmlFor="group" className="block text-sm font-medium text-gray-900 dark:text-white">
                            Group
                        </label>
                        <div className="mt-2">
                            <input
                                id="group"
                                name="group"
                                type="text"
                                required
                                autoComplete="group"
                                className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-black dark:border-gray-600 focus:outline-indigo-600 sm:text-sm"
                                onChange={(e) => setGroup(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-black dark:border-gray-600 focus:outline-indigo-600 sm:text-sm"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password */}
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
                                autoComplete="new-password"
                                className="block w-full pr-10 rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-black dark:border-gray-600 focus:outline-indigo-600 sm:text-sm"
                                onChange={(e) => setPassword(e.target.value)}
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

                    {/* Submit */}
                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing up...' : 'Signup'}
                        </button>
                    </div>

                    {/* Redirect to Login */}
                    <div className="flex items-center justify-center">
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                            Already have an account?{' '}
                            <Link to="/registration/login" className="text-blue-600 dark:text-blue-400 hover:text-green-500">
                                Login
                            </Link>
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Signup;
