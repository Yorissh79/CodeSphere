import {useState} from 'react';
import {Mail, User, MessageCircle, Send, Home, CheckCircle2, AlertCircle, Sparkles} from 'lucide-react';
import {useSendContactEmailMutation} from '../../../services/emailApi'; // Adjust path as needed

// Define error types for better type safety
interface RTKQueryError {
    status: string | number;
    data?: {
        message?: string;
    };
}

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        message?: string;
    }>({});
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // RTK Query mutation hook
    const [sendContactEmail, {isLoading}] = useSendContactEmailMutation();

    const validateForm = () => {
        const newErrors: {
            name?: string;
            email?: string;
            message?: string;
        } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionMessage('');

        if (!validateForm()) return;

        try {
            const response = await sendContactEmail(formData).unwrap();

            setIsSuccess(true);
            setSubmissionMessage(response.message || "Thank you! Your message has been sent successfully. We'll get back to you soon.");
            setFormData({name: '', email: '', message: ''});
        } catch (error: unknown) {
            setIsSuccess(false);

            // Type guard to check if error is an RTK Query error
            if (error && typeof error === 'object' && 'status' in error) {
                const rtkError = error as RTKQueryError;

                // Handle different types of errors
                if (rtkError.status === 'FETCH_ERROR') {
                    setSubmissionMessage("Network error. Please check your connection and try again.");
                } else if (rtkError.status) {
                    setSubmissionMessage(rtkError.data?.message || "Something went wrong. Please try again later.");
                } else {
                    setSubmissionMessage("An unexpected error occurred. Please try again.");
                }
            } else {
                // Handle other types of errors (network errors, etc.)
                setSubmissionMessage("An unexpected error occurred. Please try again.");
            }
        } finally {
            // Auto-hide message after 5 seconds
            setTimeout(() => setSubmissionMessage(''), 5000);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
                        <Sparkles className="w-8 h-8 text-white"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-4">
                        Get In Touch
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                        Ready to start something amazing? Let's connect and bring your ideas to life.
                    </p>
                </div>

                {/* Form Container */}
                <div
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 md:p-10 relative">
                    {/* Glassmorphism effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>

                    <div className="relative">
                        <div className="space-y-8">
                            {/* Name Field */}
                            <div className="relative">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div
                                        className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className={`w-5 h-5 transition-colors ${
                                            focusedField === 'name'
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-400 dark:text-gray-500'
                                        }`}/>
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 ${
                                            errors.name
                                                ? 'border-red-400 dark:border-red-400 focus:border-red-500'
                                                : focusedField === 'name'
                                                    ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                        }`}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                {errors.name && (
                                    <div className="text-red-500 text-sm mt-2 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1"/>
                                        <span>{errors.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Email Field */}
                            <div className="relative">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div
                                        className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className={`w-5 h-5 transition-colors ${
                                            focusedField === 'email'
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-400 dark:text-gray-500'
                                        }`}/>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 ${
                                            errors.email
                                                ? 'border-red-400 dark:border-red-400 focus:border-red-500'
                                                : focusedField === 'email'
                                                    ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                        }`}
                                        placeholder="your@email.com"
                                    />
                                </div>
                                {errors.email && (
                                    <div className="text-red-500 text-sm mt-2 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1"/>
                                        <span>{errors.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Message Field */}
                            <div className="relative">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Your Message
                                </label>
                                <div className="relative">
                                    <div className="absolute top-4 left-4 pointer-events-none">
                                        <MessageCircle className={`w-5 h-5 transition-colors ${
                                            focusedField === 'message'
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-400 dark:text-gray-500'
                                        }`}/>
                                    </div>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('message')}
                                        onBlur={() => setFocusedField(null)}
                                        rows={5}
                                        className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 resize-none ${
                                            errors.message
                                                ? 'border-red-400 dark:border-red-400 focus:border-red-500'
                                                : focusedField === 'message'
                                                    ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                        }`}
                                        placeholder="Tell us about your project, ideas, or just say hello..."
                                    />
                                </div>
                                {errors.message && (
                                    <div className="text-red-500 text-sm mt-2 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1"/>
                                        <span>{errors.message}</span>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                                    isLoading
                                        ? 'bg-gradient-to-r from-blue-400 to-purple-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                }`}
                                disabled={isLoading}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    {isLoading ? (
                                        <>
                                            <div
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5"/>
                                            <span>Send Message</span>
                                        </>
                                    )}
                                </div>
                            </button>

                            {/* Status Messages */}
                            {submissionMessage && (
                                <div className={`mt-6 p-4 rounded-2xl border-2 ${
                                    isSuccess
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                                }`}>
                                    <div className="flex items-center space-x-2">
                                        {isSuccess ? (
                                            <CheckCircle2 className="w-5 h-5 flex-shrink-0"/>
                                        ) : (
                                            <AlertCircle className="w-5 h-5 flex-shrink-0"/>
                                        )}
                                        <span>{submissionMessage}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Home Button */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-300 hover:scale-105"
                    >
                        <Home className="w-5 h-5"/>
                        <span>Back to Home</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Contact;