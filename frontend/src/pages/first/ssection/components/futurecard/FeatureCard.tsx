import type {ReactNode} from 'react';

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">{description}</p>
        </div>
    );
}

export default FeatureCard;