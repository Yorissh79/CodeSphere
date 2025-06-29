import {Link} from "react-router-dom";
import {ArrowUp, Code2, Heart} from "lucide-react";
import {useEffect, useState} from "react";
import {motion} from "framer-motion";

const Footer: React.FC = () => {
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
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    const footerLinks = [
        {to: "/about", label: "About"},
        {to: "/contact", label: "Contact"},
        {to: "/faq", label: "FAQ"},
        {to: "/pp", label: "Privacy Policy"}
    ];

    return (
        <>
            {/* Back to Top Button - Floating */}
            <motion.button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 z-40 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
                aria-label="Scroll to top"
                whileHover={{y: -2}}
                whileTap={{scale: 0.95}}
                initial={{opacity: 0, y: 20}}
                animate={{
                    opacity: isVisible ? 1 : 0,
                    y: isVisible ? 0 : 20
                }}
                transition={{duration: 0.3}}
            >
                <ArrowUp className="w-5 h-5"/>
                <div
                    className="absolute inset-0 rounded-full bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>

            <footer
                className="relative w-full bg-white/5 dark:bg-black/10 backdrop-blur-xl border-t border-white/20 dark:border-white/10 transition-all duration-500">
                {/* Gradient overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 via-transparent to-transparent dark:from-indigo-400/10"></div>

                <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

                        {/* Brand Section */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
                                    <Code2 className="w-6 h-6 text-white"/>
                                </div>
                                <span
                                    className="font-mono text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    CodeSphere
                                </span>
                            </div>
                            <p className="font-mono text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
                                Empowering developers with cutting-edge tools and innovative solutions for the modern
                                web.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                                <span className="font-mono">Made with</span>
                                <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse"/>
                                <span className="font-mono">for developers</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="lg:col-span-1 space-y-6">
                            <h3 className="font-mono text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Quick Links
                            </h3>
                            <nav className="grid grid-cols-2 gap-4">
                                {footerLinks.map((link, index) => (
                                    <motion.div
                                        key={link.to}
                                        initial={{opacity: 0, y: 20}}
                                        whileInView={{opacity: 1, y: 0}}
                                        transition={{delay: index * 0.1}}
                                        viewport={{once: true}}
                                    >
                                        <Link
                                            to={link.to}
                                            className="group block p-3 font-mono text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/20 dark:hover:border-white/10"
                                        >
                                            <span className="flex items-center justify-between">
                                                {link.label}
                                                <div
                                                    className="w-1.5 h-1.5 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>
                        </div>

                        {/* Stats/Info Section */}
                        <div className="lg:col-span-1 space-y-6">
                            <h3 className="font-mono text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Connect
                            </h3>
                            <div className="space-y-4">
                                <div
                                    className="p-4 rounded-xl bg-gradient-to-r from-white/10 to-white/5 dark:from-white/5 dark:to-white/2 border border-white/20 dark:border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-sm"></div>
                                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                                            System Status: Online
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className="p-4 rounded-xl bg-gradient-to-r from-white/10 to-white/5 dark:from-white/5 dark:to-white/2 border border-white/20 dark:border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                                            Version
                                        </span>
                                        <span
                                            className="font-mono text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                            v2.1.0
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <motion.div
                        className="mt-16 pt-8 border-t border-white/10 dark:border-white/5"
                        initial={{opacity: 0}}
                        whileInView={{opacity: 1}}
                        transition={{delay: 0.5}}
                        viewport={{once: true}}
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 font-mono text-sm text-gray-500 dark:text-gray-500">
                                <span>© {year} CodeSphere.</span>
                                <span className="hidden sm:inline">•</span>
                                <span>All rights reserved.</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-white/10 to-white/5 dark:from-white/5 dark:to-white/2 border border-white/20 dark:border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                                        Live
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Elements */}
                <div
                    className="absolute top-0 left-1/4 w-px h-24 bg-gradient-to-b from-indigo-500/50 to-transparent"></div>
                <div
                    className="absolute top-0 right-1/3 w-px h-16 bg-gradient-to-b from-purple-500/50 to-transparent"></div>
                <div
                    className="absolute bottom-0 left-1/3 w-32 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            </footer>
        </>
    );
};

export default Footer;