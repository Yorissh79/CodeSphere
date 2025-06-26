import React, {type FC} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
    href?: string;
    gradient?: string;
}

const FeatureCard: FC<Feature> = ({icon, title, description, href, gradient = "from-indigo-600 to-blue-600"}) => {
    const cardClasses = "group relative overflow-hidden rounded-xl bg-white/5 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200/20 dark:border-gray-800/50 p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10";

    const cardContent = (
        <>
            <div
                className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                style={{backgroundImage: `linear-gradient(to bottom right, ${gradient})`}}
            />
            <div className="relative z-10">
                <div
                    className={`w-12 h-12 flex items-center justify-center bg-gradient-to-r ${gradient} rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                    {icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {description}
                </p>
                {href && (
                    <div
                        className="mt-4 flex items-center text-indigo-500 dark:text-indigo-400 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                        Explore <ArrowRight className="ml-2 h-4 w-4"/>
                    </div>
                )}
            </div>
        </>
    );

    if (href) {
        return (
            <Link to={href} className={cardClasses}>
                {cardContent}
            </Link>
        );
    }

    return (
        <div className={cardClasses}>
            {cardContent}
        </div>
    );
};

export default FeatureCard;