import image from '../../assets/Codesphere_icon.png';
import {useState} from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import {useUserCreateMutation} from "../../services/googleApi.ts";
import {User, Mail, Users, ArrowRight, CheckCircle} from 'lucide-react';

const CompleteSignup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {googleId, name: googleName, email: googleEmail} = location.state || {};
    const [name, setName] = useState(googleName || '');
    const [email, setEmail] = useState(googleEmail || '');
    const [surname, setSurname] = useState('');
    const [group, setGroup] = useState('');
    const [createPost, {isLoading, error}] = useUserCreateMutation();

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
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4 transition-all duration-300">
            {/* Glassmorphism Container */}
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="relative mb-6">
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <img
                            alt="Codesphere"
                            src={image}
                            className="relative mx-auto h-20 w-20 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm"
                        />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2"
                        style={{fontFamily: 'Space Mono, monospace'}}>
                        Complete Setup
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Just a few more details to get started
                    </p>
                </div>

                {/* Main Form Card */}
                <div
                    className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 transition-all duration-300">
                    {/* Error Alert */}
                    {error && (
                        <div
                            className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 backdrop-blur-sm">
                            <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                                ⚠️ Unable to complete signup. Please try again.
                            </p>
                        </div>
                    )}

                    <form onSubmit={completeSignup} className="space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label htmlFor="name"
                                   className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                   style={{fontFamily: 'Space Mono, monospace'}}>
                                <User size={16} className="text-blue-600 dark:text-blue-400"/>
                                First Name
                            </label>
                            <div className="relative group">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/70 dark:group-hover:bg-gray-700/70"
                                    style={{fontFamily: 'Space Mono, monospace'}}
                                    onChange={(e) => setName(e.target.value)}
                                    value={name}
                                    placeholder="Enter your first name"
                                />
                                <div
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email"
                                   className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                   style={{fontFamily: 'Space Mono, monospace'}}>
                                <Mail size={16} className="text-blue-600 dark:text-blue-400"/>
                                Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-100/70 dark:bg-gray-600/50 border border-gray-200 dark:border-gray-600 backdrop-blur-sm text-gray-500 dark:text-gray-400 cursor-not-allowed transition-all duration-300"
                                    style={{fontFamily: 'Space Mono, monospace'}}
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    disabled
                                />
                                <CheckCircle size={18}
                                             className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"/>
                            </div>
                        </div>

                        {/* Surname Field */}
                        <div className="space-y-2">
                            <label htmlFor="surname"
                                   className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                   style={{fontFamily: 'Space Mono, monospace'}}>
                                <User size={16} className="text-blue-600 dark:text-blue-400"/>
                                Last Name
                            </label>
                            <div className="relative group">
                                <input
                                    id="surname"
                                    name="surname"
                                    type="text"
                                    required
                                    autoComplete="surname"
                                    className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/70 dark:group-hover:bg-gray-700/70"
                                    style={{fontFamily: 'Space Mono, monospace'}}
                                    onChange={(e) => setSurname(e.target.value)}
                                    value={surname}
                                    placeholder="Enter your last name"
                                />
                                <div
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Group Field */}
                        <div className="space-y-2">
                            <label htmlFor="group"
                                   className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                   style={{fontFamily: 'Space Mono, monospace'}}>
                                <Users size={16} className="text-blue-600 dark:text-blue-400"/>
                                Group/Class
                            </label>
                            <div className="relative group">
                                <input
                                    id="group"
                                    name="group"
                                    type="text"
                                    required
                                    autoComplete="group"
                                    className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/70 dark:group-hover:bg-gray-700/70"
                                    style={{fontFamily: 'Space Mono, monospace'}}
                                    onChange={(e) => setGroup(e.target.value)}
                                    value={group}
                                    placeholder="e.g., CS-101, Grade 10A"
                                />
                                <div
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            style={{fontFamily: 'Space Mono, monospace'}}
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <div
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Setting up your account...
                                    </>
                                ) : (
                                    <>
                                        Complete Setup
                                        <ArrowRight size={18}
                                                    className="group-hover:translate-x-1 transition-transform duration-300"/>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link
                                to="/registration/login"
                                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                                style={{fontFamily: 'Space Mono, monospace'}}
                            >
                                Sign in here →
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div
                        className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-ping"></div>
                    <div
                        className="absolute top-3/4 right-1/4 w-1 h-1 bg-indigo-400 rounded-full opacity-40 animate-pulse"></div>
                    <div
                        className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-20 animate-bounce"></div>
                </div>
            </div>
        </div>
    );
};

export default CompleteSignup;