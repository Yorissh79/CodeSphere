import {motion} from 'framer-motion';

const LoadingSkeleton: React.FC = () => {
    return (
        <motion.div
            className="p-6 max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-300"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.5}}
        >
            <div className="h-10 w-2/5 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 animate-pulse-fast"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {[...Array(4)].map((_, i) => (
                    <div key={i}
                         className="p-6 rounded-xl shadow-md bg-gray-100 dark:bg-gray-700 animate-pulse-fast h-36">
                        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mb-3"></div>
                        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-4 w-2/5 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    </div>
                ))}
            </div>

            <div className="overflow-x-auto bg-gray-100 dark:bg-gray-700 rounded-xl p-6 transition-colors duration-300">
                <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-600 rounded mb-6 animate-pulse-fast"></div>
                <table className="min-w-full bg-white dark:bg-gray-800 shadow-inner rounded-lg overflow-hidden">
                    <thead className="bg-gray-200 dark:bg-gray-900">
                    <tr>
                        <th className="py-4 px-6">
                            <div className="h-5 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse-fast"></div>
                        </th>
                        {[...Array(5)].map((_, i) => (
                            <th key={i} className="py-4 px-4">
                                <div
                                    className="h-5 w-12 bg-gray-300 dark:bg-gray-700 rounded animate-pulse-fast mx-auto"></div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {[...Array(5)].map((_, i) => (
                        <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                            <td className="py-4 px-6">
                                <div className="h-5 w-36 bg-gray-200 dark:bg-gray-600 rounded animate-pulse-fast"></div>
                            </td>
                            {[...Array(5)].map((_, j) => (
                                <td key={j} className="py-4 px-4 text-center">
                                    <div
                                        className="h-6 w-6 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse-fast mx-auto"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className="flex justify-between items-center mt-6">
                    <div className="h-10 w-28 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse-fast"></div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse-fast"></div>
                    <div className="h-10 w-28 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse-fast"></div>
                </div>
            </div>
        </motion.div>
    );
};

export default LoadingSkeleton;