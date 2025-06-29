import image from '../../assets/Codesphere_icon.png';
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useUserSignupMutation} from '../../services/userApi';
import {GoogleLogin} from '@react-oauth/google';
import {Eye, EyeOff, User, Mail, Users, Lock, ArrowRight, Sparkles} from 'lucide-react';
import {jwtDecode} from 'jwt-decode';

interface GoogleCredential {
    sub: string; // Google ID
    name: string;
    email: string;
}

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [password, setPassword] = useState('');
    const [group, setGroup] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [createPost, {isLoading, error}] = useUserSignupMutation();

    // Password-based signup
    const signUp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPost({
                email,
                name,
                surname,
                password,
                group,
                role: 'student',
            }).unwrap();
            navigate('/registration/login');
        } catch (err) {
            console.error('Signup error:', err);
        }
    };

    // Google Auth: Redirect to CompleteSignup with Google data
    const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
        if (credentialResponse.credential) {
            const decoded: GoogleCredential = jwtDecode(credentialResponse.credential);
            navigate('/registration/complete-signup', {
                state: {
                    googleId: decoded.sub,
                    name: decoded.name,
                    email: decoded.email,
                },
            });
        }
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4 transition-all duration-300">
            {/* Main Container */}
            <div className="w-full max-w-md">
                {/* Header Section */}


                <div
                    className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 transition-all duration-300">
                    {/* Error Alert */}
                    {error && (
                        <div
                            className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 backdrop-blur-sm">
                            <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                                ⚠️ Unable to create account. Please try again.
                            </p>
                        </div>
                    )}

                    <div className="text-center mb-8">
                        <div className="relative mb-6">
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
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
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2"
                            style={{fontFamily: 'Space Mono, monospace'}}>
                            Create Account
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center gap-1">
                            <Sparkles size={14} className="text-blue-500"/>
                            Join the learning community
                        </p>
                    </div>

                    <form onSubmit={signUp} className="space-y-5">
                        {/* Name & Surname Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <label htmlFor="name"
                                       className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300"
                                       style={{fontFamily: 'Space Mono, monospace'}}>
                                    <User size={12} className="text-blue-600 dark:text-blue-400"/>
                                    First Name
                                </label>
                                <div className="relative group">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        autoComplete="name"
                                        className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm group-hover:bg-white/70 dark:group-hover:bg-gray-700/70"
                                        style={{fontFamily: 'Space Mono, monospace'}}
                                        onChange={(e) => setName(e.target.value)}
                                        value={name}
                                        placeholder="John"
                                    />
                                </div>
                            </div>

                            {/* Surname Field */}
                            <div className="space-y-2">
                                <label htmlFor="surname"
                                       className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300"
                                       style={{fontFamily: 'Space Mono, monospace'}}>
                                    <User size={12} className="text-blue-600 dark:text-blue-400"/>
                                    Last Name
                                </label>
                                <div className="relative group">
                                    <input
                                        id="surname"
                                        name="surname"
                                        type="text"
                                        required
                                        autoComplete="surname"
                                        className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm group-hover:bg-white/70 dark:group-hover:bg-gray-700/70"
                                        style={{fontFamily: 'Space Mono, monospace'}}
                                        onChange={(e) => setSurname(e.target.value)}
                                        value={surname}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Group Field */}
                        <div className="space-y-2">
                            <label htmlFor="group"
                                   className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                   style={{fontFamily: 'Space Mono, monospace'}}>
                                <Users size={14} className="text-blue-600 dark:text-blue-400"/>
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

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email"
                                   className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                   style={{fontFamily: 'Space Mono, monospace'}}>
                                <Mail size={14} className="text-blue-600 dark:text-blue-400"/>
                                Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/70 dark:group-hover:bg-gray-700/70"
                                    style={{fontFamily: 'Space Mono, monospace'}}
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    placeholder="john.doe@example.com"
                                />
                                <div
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password"
                                   className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                   style={{fontFamily: 'Space Mono, monospace'}}>
                                <Lock size={14} className="text-blue-600 dark:text-blue-400"/>
                                Password
                            </label>
                            <div className="relative group">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="new-password"
                                    className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/70 dark:group-hover:bg-gray-700/70"
                                    style={{fontFamily: 'Space Mono, monospace'}}
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
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
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight size={18}
                                                    className="group-hover:translate-x-1 transition-transform duration-300"/>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-200 dark:border-gray-600"></div>
                        <span
                            className="mx-4 text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full backdrop-blur-sm"
                            style={{fontFamily: 'Space Mono, monospace'}}>
                            or
                        </span>
                        <div className="flex-1 border-t border-gray-200 dark:border-gray-600"></div>
                    </div>

                    {/* Google Sign-In */}
                    <div className="flex justify-center">
                        <div className="transform hover:scale-105 transition-transform duration-200">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => console.error('Google Sign-In Failed')}
                                text="signup_with"
                                width="350"
                                theme="outline"
                                shape="pill"
                            />
                        </div>
                    </div>

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

export default Signup;