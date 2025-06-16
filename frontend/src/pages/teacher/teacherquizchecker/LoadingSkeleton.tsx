import {motion} from 'framer-motion';

const LoadingSkeleton: React.FC = () => {
    return (
        <motion.div
            className="p-6 max-w-7xl mx-auto"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
        >
            <div className="h-8 w-1/3 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-200">
                    <tr>
                        <th className="py-3 px-4">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </th>
                        {[...Array(5)].map((_, i) => (
                            <th key={i} className="py-3 px-4">
                                <div className="h-4 w-10 bg-gray-200 rounded animate-pulse mx-auto"></div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {[...Array(5)].map((_, i) => (
                        <tr key={i} className="border-t">
                            <td className="py-3 px-4">
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            {[...Array(5)].map((_, j) => (
                                <td key={j} className="py-3 px-4 text-center">
                                    <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default LoadingSkeleton;