import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const PP = () => {
    // Scroll-to-top button visibility
    const [showTopBtn, setShowTopBtn] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowTopBtn(window.pageYOffset > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white px-6 py-12 max-w-4xl mx-auto rounded-lg shadow-lg">
            <h1 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600">
                Privacy Policy
            </h1>

            <p className="mb-6 text-center italic text-gray-700 dark:text-gray-400">
                Effective Date: <strong>[Insert Date]</strong>
            </p>

            <section className="space-y-6">
                <p>
                    Welcome to <strong>CodeSphere</strong>. Your privacy is important to
                    us. This Privacy Policy explains how we collect, use, and protect
                    your information when you use our services.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-3 border-b-2 border-indigo-300 dark:border-indigo-600 pb-1">
                    1. Information We Collect
                </h2>

                <h3 className="text-xl font-semibold mt-4 mb-2">a. Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-300">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Account type (student or teacher)</li>
                    <li>Profile information (optional)</li>
                </ul>

                <h3 className="text-xl font-semibold mt-4 mb-2">b. Usage Information</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-300">
                    <li>Login activity</li>
                    <li>Pages visited</li>
                    <li>Time spent on the platform</li>
                    <li>Features used (code editor, quiz system, etc.)</li>
                </ul>

                <h3 className="text-xl font-semibold mt-4 mb-2">c. Content Data</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-300">
                    <li>Code you write in the editor</li>
                    <li>Quiz results and answers</li>
                    <li>Messages sent/received via the messaging system</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-3 border-b-2 border-purple-300 dark:border-purple-600 pb-1">
                    2. How We Use Your Information
                </h2>
                <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-300">
                    <li>Provide and improve the CodeSphere platform</li>
                    <li>Enable communication between students and teachers</li>
                    <li>Track academic progress and quiz results</li>
                    <li>Personalize your learning experience</li>
                    <li>Ensure platform security and integrity</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-3 border-b-2 border-pink-300 dark:border-pink-600 pb-1">
                    3. Data Sharing and Disclosure
                </h2>
                <p className="text-gray-800 dark:text-gray-300">
                    We <strong>do not sell</strong> your data. We may share information:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-300">
                    <li>With teachers (for student performance and communication)</li>
                    <li>
                        With service providers (e.g. hosting, analytics) under strict
                        confidentiality
                    </li>
                    <li>To comply with legal requirements</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-3 border-b-2 border-indigo-300 dark:border-indigo-600 pb-1">
                    4. Cookies and Tracking
                </h2>
                <p className="text-gray-800 dark:text-gray-300">
                    We may use cookies to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-300">
                    <li>Keep you logged in</li>
                    <li>Analyze user behavior for improvements</li>
                    <li>Customize your experience</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-400 italic">
                    You can disable cookies through your browser settings, but some
                    features may not work properly.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-3 border-b-2 border-purple-300 dark:border-purple-600 pb-1">
                    5. Data Security
                </h2>
                <p className="text-gray-800 dark:text-gray-300">
                    We use reasonable technical and administrative measures to protect
                    your information. However, no platform is completely secure, so we
                    encourage strong passwords and safe usage.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-3 border-b-2 border-pink-300 dark:border-pink-600 pb-1">
                    6. Children’s Privacy
                </h2>
                <p className="text-gray-800 dark:text-gray-300">
                    CodeSphere is intended for use by students with parental or teacher
                    supervision. We do not knowingly collect personal data from children
                    under 13 without appropriate consent.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-3 border-b-2 border-indigo-300 dark:border-indigo-600 pb-1">
                    7. Your Rights and Choices
                </h2>
                <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-300">
                    <li>View and update your profile data</li>
                    <li>Delete your account at any time</li>
                    <li>Request access to or deletion of your personal data</li>
                </ul>
                <p className="mt-2">
                    To exercise your rights, contact us at:{" "}
                    <a
                        href="mailto:privacy@codesphere.com"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        privacy@codesphere.com
                    </a>
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-3 border-b-2 border-purple-300 dark:border-purple-600 pb-1">
                    8. Changes to This Policy
                </h2>
                <p className="text-gray-800 dark:text-gray-300">
                    We may update this Privacy Policy. Any changes will be posted here
                    with a revised effective date. Continued use of the platform means you
                    accept the changes.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-6 border-b-2 border-pink-300 dark:border-pink-600 pb-1">
                    9. Contact Us
                </h2>
                <p className="text-lg mb-4 text-center">
                    📧 Email:{" "}
                    <a
                        href="mailto:privacy@codesphere.com"
                        className="text-pink-600 dark:text-pink-400 font-semibold hover:underline"
                    >
                        privacy@codesphere.com
                    </a>
                </p>
            </section>

            <div className="mt-8 text-center">
                <Link
                    to="/"
                    className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-md shadow-md transition"
                >
                    ← Go to Home
                </Link>
            </div>

            {/* Scroll to Top Button */}
            {showTopBtn && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition"
                    aria-label="Scroll to top"
                    title="Scroll to top"
                >
                    ↑
                </button>
            )}
        </div>
    );
};

export default PP;
