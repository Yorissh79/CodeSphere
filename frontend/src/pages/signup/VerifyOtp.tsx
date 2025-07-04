import {useState} from 'react';
import {KeyRound, ShieldCheck, Mail, ArrowLeft, Sparkles} from 'lucide-react';

const VerifyOtp = () => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const email = "user@example.com"; // Demo email

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !otp) {
            alert("Email or OTP is missing.");
            return;
        }

        setIsLoading(true);
        setError(false);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            if (otp === "123456") {
                alert("Verification successful! You can now log in.");
            } else {
                setError(true);
            }
        }, 2000);
    };

    const handleBack = () => {
        // Navigate back functionality
        console.log("Navigate back");
    };

    if (!email) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-white/70"/>
                    <p className="text-white text-lg">No email provided. Please sign up first.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse"
                    style={{animationDelay: '1s'}}></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"
                    style={{animationDelay: '2s'}}></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Back button */}
                    <button
                        onClick={handleBack}
                        className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200"
                    >
                        <ArrowLeft size={20}/>
                        <span>Back</span>
                    </button>

                    <div
                        className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 relative">
                        {/* Decorative elements */}
                        <div
                            className="absolute -top-px left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                        <div
                            className="absolute -bottom-px left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

                        {error && (
                            <div
                                className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-400/30 backdrop-blur-sm animate-pulse">
                                <p className="text-red-200 text-sm font-medium flex items-center gap-2">
                                    <span className="text-red-300">⚠️</span>
                                    Invalid or expired OTP. Please try again.
                                </p>
                            </div>
                        )}

                        <div className="text-center mb-8">
                            <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-spin"
                                    style={{animationDuration: '3s'}}></div>
                                <div
                                    className="relative bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20">
                                    <ShieldCheck className="w-8 h-8 text-white"/>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                                Verify Your Account
                                <Sparkles className="w-6 h-6 text-purple-300"/>
                            </h1>
                            <p className="text-white/70 text-sm leading-relaxed">
                                We've sent a secure code to
                            </p>
                            <p className="text-white font-semibold text-lg mt-1 bg-white/10 rounded-full px-4 py-1 inline-block border border-white/20">
                                {email}
                            </p>
                        </div>

                        <div onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label htmlFor="otp"
                                       className="flex items-center gap-2 text-sm font-semibold text-white/90">
                                    <KeyRound size={16} className="text-purple-300"/>
                                    One-Time Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="otp"
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full px-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-center text-xl font-mono tracking-widest"
                                        placeholder="••••••"
                                        maxLength={6}
                                    />
                                    <div
                                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 pointer-events-none opacity-0 transition-opacity duration-300 focus-within:opacity-100"></div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-px transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div
                                    className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl px-6 py-4 flex items-center justify-center gap-3 font-semibold text-white">
                                    {isLoading ? (
                                        <>
                                            <div
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            Verify & Proceed
                                            <ShieldCheck size={20}
                                                         className="group-hover:scale-110 transition-transform duration-200"/>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-white/50 text-sm">
                                Didn't receive the code?{' '}
                                <button
                                    className="text-purple-300 hover:text-purple-200 font-medium transition-colors duration-200">
                                    Resend OTP
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;