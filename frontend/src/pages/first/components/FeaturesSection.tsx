import React, {type FC} from 'react';
import FeatureCard from './FeatureCard';
import {Code2, Users, MessageSquare, BookOpen, CheckSquare, ClipboardList} from 'lucide-react';

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
    href?: string;
    gradient?: string;
}

const FeaturesSection: FC = () => {
    const features: Feature[] = [
        {
            icon: <Code2 className="h-6 w-6 text-white"/>,
            title: "Live Code Editor",
            description: "Real-time collaborative coding with syntax highlighting and instant execution across multiple languages.",
            gradient: "from-indigo-600 to-blue-600",
            href: "/editor"
        },
        {
            icon: <Users className="h-6 w-6 text-white"/>,
            title: "Teacher Dashboard",
            description: "Manage classrooms, track student progress, and distribute assignments with ease.",
            gradient: "from-purple-600 to-pink-600",
            href: "/dashboard"
        },
        {
            icon: <MessageSquare className="h-6 w-6 text-white"/>,
            title: "Messaging System",
            description: "Connect students and teachers with real-time messaging and file sharing.",
            gradient: "from-blue-600 to-cyan-600",
            href: "/messages"
        },
        {
            icon: <BookOpen className="h-6 w-6 text-white"/>,
            title: "Create Quizzes",
            description: "Build interactive quizzes with auto-grading and detailed analytics.",
            gradient: "from-orange-600 to-red-600",
            href: "/quizzes/create"
        },
        {
            icon: <CheckSquare className="h-6 w-6 text-white"/>,
            title: "Track Progress",
            description: "Monitor attendance, mark absences, and view academic performance.",
            gradient: "from-teal-600 to-green-600",
            href: "/progress"
        },
        {
            icon: <ClipboardList className="h-6 w-6 text-white"/>,
            title: "Assignment Management",
            description: "Streamline task assignment, submissions, and grading workflows.",
            gradient: "from-indigo-600 to-purple-600",
            href: "/assignments"
        }
    ];

    return (
        <section className="py-16 px-4 sm:px-6 bg-white dark:bg-gray-900">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
                    Comprehensive Tools for Education
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                    Discover CodeSphere's powerful features for interactive learning and teaching.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="animate-in fade-in duration-500"
                             style={{animationDelay: `${index * 100}ms`}}>
                            <FeatureCard {...feature} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;