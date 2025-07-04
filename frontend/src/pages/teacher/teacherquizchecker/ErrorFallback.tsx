import {motion} from 'framer-motion';
import {TriangleAlert} from 'lucide-react';

interface ErrorFallbackProps {
    message: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({message}) => {
    return (
        <motion.div
            className="p-8 max-w-md mx-auto text-center bg-red-50 dark:bg-red-900 rounded-xl shadow-lg border border-red-200 dark:border-red-700 mt-10 transition-colors duration-300"
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
        >
            <TriangleAlert size={48} className="text-red-500 dark:text-red-300 mx-auto mb-4"/>
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-200 mb-3">Oops! Something went wrong.</h2>
            <p className="text-lg text-red-600 dark:text-red-300 font-semibold">{message}</p>
            <p className="mt-4 text-gray-700 dark:text-gray-300">Please try again later or contact support if the issue
                persists.</p>
        </motion.div>
    );
};

export default ErrorFallback;