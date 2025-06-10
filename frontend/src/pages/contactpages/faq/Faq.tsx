import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
    {
        question: "What is Codesphere?",
        shortAnswer: "Codesphere is a modern coding education platform that connects students and educators.",
        detailedAnswer:
            "Codesphere is a modern coding education platform that connects students and educators with powerful tools for collaboration and learning. It supports live coding, real-time feedback, and interactive lessons designed for both beginners and advanced users.",
    },
    {
        question: "Who can use Codesphere?",
        shortAnswer: "Anyone interested in learning or teaching programming.",
        detailedAnswer:
            "Anyone interested in learning or teaching programming—students, teachers, and coding enthusiasts—can use Codesphere. We offer tailored tools for different roles to enhance the learning experience.",
    },
    {
        question: "Which programming languages does Codesphere support?",
        shortAnswer: "Supports multiple popular languages like JavaScript, Python, Java, and C++.",
        detailedAnswer:
            "Codesphere supports multiple popular languages including JavaScript, Python, Java, C++, and more. We regularly add support for additional languages based on community demand.",
    },
    {
        question: "Is Codesphere free to use?",
        shortAnswer: "Codesphere offers a free tier with essential features.",
        detailedAnswer:
            "Currently, Codesphere offers a free tier with essential features to get you started. We plan to introduce premium plans in the future with advanced tools and collaboration features.",
    },
    {
        question: "How do I contact support?",
        shortAnswer: "Reach out via contact page or email team@codesphere.dev.",
        detailedAnswer:
            "You can reach out to our support team anytime via the contact page or by emailing team@codesphere.dev. We're here to help with any questions or issues you may have.",
    },
];

const fadeVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } },
};

const FAQ = () => {
    const [selectedFAQ, setSelectedFAQ] = useState<number | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [query, setQuery] = useState("");
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedFAQ(null);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (selectedFAQ !== null && cardRefs.current[selectedFAQ]) {
            cardRefs.current[selectedFAQ]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [selectedFAQ]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const filteredFAQs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(query.toLowerCase()) ||
            faq.shortAnswer.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <>
            <div className="min-h-screen py-16 px-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white">
                <div className="max-w-4xl mx-auto space-y-16">
                    <section className="text-center">
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.7, delay: 0.2 } }}
                            className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600"
                        >
                            Frequently Asked Questions
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.7, delay: 0.4 } }}
                            className="mt-6 text-xl text-gray-800 dark:text-gray-300"
                        >
                            Got questions? We’ve got answers. Click on any question to learn more.
                        </motion.p>
                        <motion.input
                            type="text"
                            placeholder="Search FAQs..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="mt-6 w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-black dark:text-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.7, delay: 0.6 } }}
                        />
                    </section>

                    <section>
                        <div className="space-y-6">
                            <AnimatePresence>
                                {filteredFAQs.map(({ question, shortAnswer }) => {
                                    const originalIndex = faqs.findIndex((f) => f.question === question);
                                    return (
                                        <motion.div
                                            key={question}
                                            // ref={(el) => (cardRefs.current[originalIndex] = el)}
                                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            variants={fadeVariant}
                                            onClick={() => setSelectedFAQ(originalIndex)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") setSelectedFAQ(originalIndex);
                                            }}
                                        >
                                            <h3 className="text-2xl font-semibold mb-2 text-indigo-700 dark:text-indigo-400">
                                                {question}
                                            </h3>
                                            <p className="text-lg text-gray-800 dark:text-gray-300">{shortAnswer}</p>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <AnimatePresence>
                                {filteredFAQs.length === 0 && (
                                    <motion.p
                                        key="no-results"
                                        className="text-center text-gray-600 dark:text-gray-400 mt-6"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        No results found.
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>

                    <div className="text-center mt-10">
                        <Link
                            to="/"
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-md shadow transition"
                        >
                            ← Go to Home
                        </Link>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedFAQ !== null && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                        onClick={() => setSelectedFAQ(null)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.3 } }}
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    >
                        <motion.div
                            className="bg-white dark:bg-gray-900 rounded-lg max-w-lg p-6 mx-4 relative shadow-lg"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, transition: { duration: 0.3 } }}
                            exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.3 } }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-2xl font-bold"
                                onClick={() => setSelectedFAQ(null)}
                                aria-label="Close modal"
                            >
                                &times;
                            </button>
                            <h2 className="text-3xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">
                                {faqs[selectedFAQ].question}
                            </h2>
                            <p className="text-lg text-gray-800 dark:text-gray-300 whitespace-pre-line">
                                {faqs[selectedFAQ].detailedAnswer}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scroll to Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition z-50"
                        aria-label="Scroll to top"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, transition: { duration: 0.3 } }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                    >
                        ↑
                    </motion.button>
                )}
            </AnimatePresence>
        </>
    );
};

export default FAQ;
