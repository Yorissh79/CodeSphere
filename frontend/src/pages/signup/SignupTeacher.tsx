import image from '../../assets/Codesphere_icon.png';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTeacherSignupMutation } from "../../services/teacherApi.ts";
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [createPost, { isLoading, error }] = useTeacherSignupMutation();

    const signUp = async (e: React.FormEvent) => {
        e.preventDefault();
        await createPost({
            email,
            name,
            surname,
            password,
            role: "teacher",
        }).unwrap();
        if (!isLoading) {
            navigate("/registration/login");
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-blue-200 dark:bg-gray-900 h-screen transition-colors duration-300">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="Your Company"
                    src={image}
                    className="mx-auto h-48 w-auto"
                />
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Sign up to an account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {error && <p className="text-red-500 text-sm mb-4">There was an error creating a post</p>}

                <form onSubmit={signUp} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                            Name
                        </label>
                        <div className="mt-2">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                autoComplete="name"
                                className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-gray-100 outline-black placeholder:text-black dark:placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 border-solid border-black dark:border-gray-600 border-2"
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="surname" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                            Surname
                        </label>
                        <div className="mt-2">
                            <input
                                id="surname"
                                name="surname"
                                type="text"
                                required
                                autoComplete="family-name"
                                className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-gray-100 outline-black placeholder:text-black dark:placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 border-solid border-black dark:border-gray-600 border-2"
                                onChange={(e) => setSurname(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-base text-gray-900 dark:text-gray-100 outline-black placeholder:text-black dark:placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 border-solid border-black dark:border-gray-600 border-2"
                                onChange={(e) => setEmail(e.target.value)}
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

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signup ...' : 'Signup'}
                        </button>
                    </div>

                    <div className="flex items-center justify-center">
                        <p className="text-gray-900 dark:text-gray-100">
                            Do you have an account?{' '}
                            <Link className="text-blue-600 dark:text-blue-400 hover:text-green-500 dark:hover:text-green-400" to="/registration/login">
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