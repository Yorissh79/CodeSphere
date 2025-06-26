import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {motion} from "framer-motion";
import {
    ChevronUp,
    Heart,
    Code2,
    BookOpen,
    Users,
    Mail,
    Phone,
    MapPin,
    Github,
    Twitter,
    Linkedin,
    Shield,
    FileText,
    HelpCircle,
    Zap
} from "lucide-react";

const TeacherFooter = () => {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setYear(new Date().getFullYear());

        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const footerLinks = [
        {
            title: "Teacher Tools",
            links: [
                {name: "Dashboard", href: "/user/teacher/dashboard", icon: BookOpen},
                {name: "Code Editor", href: "/user/teacher/code-editor", icon: Code2},
                {name: "Quiz Manager", href: "/user/teacher/quiz", icon: BookOpen},
                {name: "Attendance", href: "/user/teacher/misses", icon: Users},
            ]
        },
        {
            title: "Support & Help",
            links: [
                {name: "Help Center", href: "/support", icon: HelpCircle},
                {name: "Documentation", href: "/docs", icon: FileText},
                {name: "Contact Support", href: "/contact", icon: Mail},
                {name: "System Status", href: "/status", icon: Zap},
            ]
        },
        {
            title: "Legal & Privacy",
            links: [
                {name: "Privacy Policy", href: "/privacy", icon: Shield},
                {name: "Terms of Service", href: "/terms", icon: FileText},
                {name: "Cookie Policy", href: "/cookies", icon: Shield},
                {name: "Data Protection", href: "/gdpr", icon: Shield},
            ]
        }
    ];

    const socialLinks = [
        {name: "GitHub", href: "https://github.com/codesphere", icon: Github, color: "hover:bg-gray-900"},
        {name: "Twitter", href: "https://twitter.com/codesphere", icon: Twitter, color: "hover:bg-blue-500"},
        {name: "LinkedIn", href: "https://linkedin.com/company/codesphere", icon: Linkedin, color: "hover:bg-blue-600"},
    ];

    const contactInfo = [
        {
            icon: Mail,
            text: "support@codesphere.edu",
            href: "mailto:support@codesphere.edu",
            label: "Email Support"
        },
        {
            icon: Phone,
            text: "+1 (555) 123-4567",
            href: "tel:+15551234567",
            label: "Phone Support"
        },
        {
            icon: MapPin,
            text: "San Francisco, CA",
            href: "https://maps.google.com",
            label: "Our Location"
        },
    ];

    return (
        <>
            <footer
                className="relative bg-gradient-to-br from-white via-gray-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 border-t border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-100/20 to-purple-100/20 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-full blur-3xl animate-pulse"></div>
                    <div
                        className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-100/20 to-pink-100/20 dark:from-purple-900/10 dark:to-pink-900/10 rounded-full blur-3xl animate-pulse"
                        style={{animationDelay: '2s'}}></div>
                </div>

                <div className="relative z-10">
                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                            {/* Brand Section - Takes more space */}
                            <div className="lg:col-span-4">
                                <motion.div
                                    initial={{opacity: 0, y: 20}}
                                    whileInView={{opacity: 1, y: 0}}
                                    transition={{duration: 0.6}}
                                    viewport={{once: true}}
                                    className="space-y-6"
                                >
                                    {/* Logo and Brand */}
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div
                                                className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                                <Code2 className="w-7 h-7 text-white"/>
                                            </div>
                                            <div
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                Codesphere
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Education
                                                Platform</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                                        Empowering educators with cutting-edge tools for modern programming education.
                                        Build, teach, and inspire the next generation of developers with our
                                        comprehensive platform.
                                    </p>

                                    {/* Social Links */}
                                    <div className="flex gap-3">
                                        {socialLinks.map((social) => {
                                            const Icon = social.icon;
                                            return (
                                                <motion.a
                                                    key={social.name}
                                                    href={social.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group relative w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                                                    whileHover={{scale: 1.1, y: -2}}
                                                    whileTap={{scale: 0.95}}
                                                >
                                                    <div
                                                        className={`absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                                    <Icon className="w-5 h-5 relative z-10"/>
                                                </motion.a>
                                            );
                                        })}
                                    </div>

                                    {/* Newsletter Signup */}
                                    <div
                                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Stay
                                            Updated</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Get the latest
                                            updates and teaching resources.</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <motion.button
                                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                                                whileHover={{scale: 1.05}}
                                                whileTap={{scale: 0.95}}
                                            >
                                                Subscribe
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Links Sections */}
                            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
                                {footerLinks.map((section, index) => (
                                    <motion.div
                                        key={section.title}
                                        initial={{opacity: 0, y: 20}}
                                        whileInView={{opacity: 1, y: 0}}
                                        transition={{duration: 0.6, delay: index * 0.1}}
                                        viewport={{once: true}}
                                        className="space-y-4"
                                    >
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                            {section.title}
                                        </h4>
                                        <ul className="space-y-3">
                                            {section.links.map((link) => {
                                                const Icon = link.icon;
                                                return (
                                                    <li key={link.name}>
                                                        <Link
                                                            to={link.href}
                                                            className="group flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 py-1"
                                                        >
                                                            <div
                                                                className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                                                                {Icon && <Icon className="w-4 h-4"/>}
                                                            </div>
                                                            <span
                                                                className="group-hover:translate-x-1 transition-transform duration-200 font-medium">
                                                                {link.name}
                                                            </span>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Section */}
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            whileInView={{opacity: 1, y: 0}}
                            transition={{duration: 0.6, delay: 0.4}}
                            viewport={{once: true}}
                            className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
                        >
                            <div className="text-center mb-8">
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Get in Touch</h4>
                                <p className="text-gray-600 dark:text-gray-400">We're here to help you succeed in your
                                    teaching journey</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {contactInfo.map((contact, index) => {
                                    const Icon = contact.icon;
                                    return (
                                        <motion.a
                                            key={contact.text}
                                            href={contact.href}
                                            initial={{opacity: 0, y: 20}}
                                            whileInView={{opacity: 1, y: 0}}
                                            transition={{duration: 0.5, delay: index * 0.1}}
                                            viewport={{once: true}}
                                            className="group relative p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    <Icon className="w-6 h-6"/>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                        {contact.label}
                                                    </p>
                                                    <p className="text-gray-900 dark:text-white font-semibold">
                                                        {contact.text}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.a>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Bar */}
                    <div
                        className="border-t border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                                <motion.div
                                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                                    initial={{opacity: 0}}
                                    whileInView={{opacity: 1}}
                                    transition={{duration: 0.6}}
                                    viewport={{once: true}}
                                >
                                    <span>© {year} Codesphere Education Platform.</span>
                                    <span className="hidden sm:inline">Made with</span>
                                    <Heart className="w-4 h-4 text-red-500 animate-pulse hidden sm:inline"/>
                                    <span className="hidden sm:inline">for educators worldwide</span>
                                </motion.div>

                                <motion.div
                                    className="flex items-center gap-6 text-sm"
                                    initial={{opacity: 0}}
                                    whileInView={{opacity: 1}}
                                    transition={{duration: 0.6, delay: 0.2}}
                                    viewport={{once: true}}
                                >
                                    <Link to="/privacy"
                                          className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
                                        Privacy
                                    </Link>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <Link to="/terms"
                                          className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
                                        Terms
                                    </Link>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <span
                                        className="text-gray-500 dark:text-gray-500 font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                        v2.1.0
                                    </span>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Back to Top Button */}
            <motion.button
                onClick={scrollToTop}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm border border-white/20 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                }`}
                whileHover={{scale: 1.1, y: -3}}
                whileTap={{scale: 0.9}}
                initial={{opacity: 0, y: 20}}
                animate={{
                    opacity: isVisible ? 1 : 0,
                    y: isVisible ? 0 : 20
                }}
                transition={{duration: 0.3}}
            >
                <ChevronUp className="w-6 h-6 mx-auto"/>
            </motion.button>

            {/* Mobile Quick Actions */}
            <motion.div
                className="fixed bottom-24 right-6 z-40 flex flex-col gap-3 lg:hidden"
                initial={{opacity: 0, x: 100}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: 0.5, delay: 0.3}}
            >
                <motion.a
                    href="mailto:support@codesphere.edu"
                    className="w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-all duration-300"
                    whileHover={{scale: 1.1, rotate: 5}}
                    whileTap={{scale: 0.9}}
                >
                    <Mail className="w-5 h-5"/>
                </motion.a>

                <motion.a
                    href="tel:+15551234567"
                    className="w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50 transition-all duration-300"
                    whileHover={{scale: 1.1, rotate: -5}}
                    whileTap={{scale: 0.9}}
                >
                    <Phone className="w-5 h-5"/>
                </motion.a>
            </motion.div>
        </>
    );
};

export default TeacherFooter;