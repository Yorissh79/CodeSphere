import image from '../../assets/Codesphere_icon.png';
import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useTeacherSignupMutation} from "../../services/teacherApi.ts";
import {Eye, EyeOff, User, Mail, Lock, ArrowRight, GraduationCap, Shield} from 'lucide-react';

const SignupTeacher = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [createPost, {isLoading, error}] = useTeacherSignupMutation();

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
        <div
            className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-gray-900 dark:via-slate-900 dark:to-emerald-950 flex items-center justify-center p-4 transition-all duration-300">
            {/* Main Container */}
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="relative mb-6">
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <div className="relative">
                            <img
                                alt="Codesphere"
                                src={image}
                                className="mx-auto h-20 w-20 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm"
                            />
                            <div
                                className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-2 shadow-lg">
                                <GraduationCap size={16} className="text-white"/>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2"
                        style={{fontFamily: 'Space Mono, monospace'}}>
                        Educator Portal
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center gap-2">
                        <Shield size={14} className="text-emerald-500"/>
                        Create your teacher account
                    </p>
                </div>

                {/* Main Form Card */}
                <div
                    className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 transition-all duration-300">
                    {/* Teacher Badge */}
                    <div className="flex justify-center mb-6">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-700/50">
                            <GraduationCap size={16} className="text-emerald-600 dark:text-emerald-400"/>
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300"
                                  style={{fontFamily: 'Space Mono, monospace'}}>
                                Teacher Registration
                            </span>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div
                            className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 backdrop-blur-sm">
                            <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                                ⚠️ Unable to create teacher account. Please try again.
                            </p>
                        </div>
                    )}

                    <form onSubmit={signUp} className="space-y-6">
                        {/* Name & Surname Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <label htmlFor="name"
                                       className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300"
                                       style={{fontFamily: 'Space Mono, monospace'}}>
                                    <User size={12} className="text-emerald-600 dark:text-emerald-400"/>
                                    First Name
                                </label>
                                <div className="relative group">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        autoComplete="name"
                                        className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 text-sm group-hover:bg-white/70 dark:group-hover:bg-gray-700/70"
                                        style={{fontFamily: 'Space Mono, monospace'}}
                                        onChange={(e) => setName(e.target.value)}
                                        value={name}
                                        placeholder="Prof. John"
                                    />
                                    <div
                                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600/10 to-teal-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>

                            {/* Surname Field */}
                            <div className="space-y-2">
                                <label htmlFor="surname"
                                       className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300"
                                       style={{fontFamily: 'Space Mono, monospace'}}>
                                    <User size={12} className="text-emerald-600 dark:text-emerald-400"/>
                                    Last Name
                                </label>
                                <div className="relative group">
                                    <input
                                        id="surname"
                                        name="surname"
                                        type="text"
                                        required
                                        autoComplete="family-name"
                                        className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 text-sm group-hover:bg-white/70 dark:group-hover:bg-gray-700/70"
                                        style={{fontFamily: 'Space Mono, monospace'}}
                                        onChange={(e) => setSurname(e.target.value)}
                                        value={surname}
                                        placeholder="Smith"
                                    />
                                    <div
                                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600/10 to-teal-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email"
                                   className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                   style={{fontFamily: 'Space Mono, monospace'}}>
                                <Mail size={14} className="text-emerald-600 dark:text-emerald-400"/>
                                Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/70 dark:group-hover:bg-gray-700/70"
                                    style={{fontFamily: 'Space Mono, monospace'}}
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    placeholder="professor@university.edu"
                                />
                                <div
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-600/10 to-teal-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password"
                                   className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                   style={{fontFamily: 'Space Mono, monospace'}}>
                                <Lock size={14} className="text-emerald-600 dark:text-emerald-400"/>
                                Password
                            </label>
                            <div className="relative group">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/70 dark:group-hover:bg-gray-700/70"
                                    style={{fontFamily: 'Space Mono, monospace'}}
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    placeholder="Create a secure password"
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
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-600/10 to-teal-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            style={{fontFamily: 'Space Mono, monospace'}}
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <div
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <GraduationCap size={18}/>
                                        Create Teacher Account
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
                                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200"
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
                        className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full opacity-30 animate-ping"></div>
                    <div
                        className="absolute top-3/4 right-1/4 w-1 h-1 bg-teal-400 rounded-full opacity-40 animate-pulse"></div>
                    <div
                        className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-20 animate-bounce"></div>
                </div>
            </div>
        </div>
    );
};

export default SignupTeacher;