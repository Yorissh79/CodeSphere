import type {FC} from 'react';
import {Zap, Users, BookOpen} from 'lucide-react';

interface Benefit {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const BenefitsSection: FC = () => {
    const benefits: Benefit[] = [
        {
            icon: <Zap className="h-6 w-6 text-indigo-400"/>,
            title: "Instant Feedback",
            description: "Get real-time feedback on code and quizzes to accelerate learning."
        },
        {
            icon: <Users className="h-6 w-6 text-indigo-400"/>,
            title: "Community Driven",
            description: "Join a vibrant community of learners and educators."
        },
        {
            icon: <BookOpen className="h-6 w-6 text-indigo-400"/>,
            title: "Rich Resources",
            description: "Access a library of tutorials, examples, and templates."
        }
    ];

    return (
        <section className="py-16 px-4 sm:px-6 bg-white dark:bg-gray-900">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
                    Why Choose CodeSphere?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                    Unlock a world of possibilities with our innovative platform.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {benefits.map((benefit, index) => (
                        <div key={index}
                             className="flex flex-col items-center text-center p-6 rounded-xl bg-white/5 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200/20 dark:border-gray-800/50 animate-in fade-in duration-500"
                             style={{animationDelay: `${index * 100}ms`}}>
                            <div
                                className="w-12 h-12 flex items-center justify-center bg-indigo-500/10 rounded-lg mb-4">
                                {benefit.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                {benefit.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;