import image from '../../assets/Codesphere_icon.png';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {useUserCreateMutation} from "../../services/googleApi.ts";

const CompleteSignup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { googleId, name: googleName, email: googleEmail } = location.state || {};
    const [name, setName] = useState(googleName || '');
    const [email, setEmail] = useState(googleEmail || '');
    const [surname, setSurname] = useState('');
    const [group, setGroup] = useState('');
    const [createPost, { isLoading, error }] = useUserCreateMutation();

    // Submit form with Google and additional data
    const completeSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!googleId) {
            console.error('Google Auth data missing');
            navigate('/registration/signup');
            return;
        }
        try {
            await createPost({
                email,
                name,
                surname,
                googleId,
                group,
                role: 'student',
            }).unwrap();
            navigate('/registration/login');
        } catch (err) {
            console.error('Complete signup error:', err);
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-blue-200 dark:bg-gray-900 h-screen transition-colors">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img alt="Your Company" src={image} className="mx-auto h-48 w-auto" />
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Complete Your Signup
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {error && (
                    <p className="text-red-500 text-sm mb-4">
                        There was an error completing the signup
                    </p>
                )}

                <form onSubmit={completeSignup} className="space-y-6">
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
                                value={name}
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
                                value={email}
                                disabled
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
                                value={surname}
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
                                value={group}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Completing Signup...' : 'Complete Signup'}
                        </button>
                    </div>
                </form>

                {/* Redirect to Login */}
                <div className="flex items-center justify-center mt-4">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                        Already have an account?{' '}
                        <Link to="/registration/login" className="text-blue-600 dark:text-blue-400 hover:text-green-500">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompleteSignup;