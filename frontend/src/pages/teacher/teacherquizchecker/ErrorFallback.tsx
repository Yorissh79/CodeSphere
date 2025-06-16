import {motion} from 'framer-motion';

interface ErrorFallbackProps {
    message: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({message}) => {
    return (
        <motion.div
            className="p-6 max-w-7xl mx-auto text-center text-red-500"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
        >
            <p className="text-lg font-semibold">{message}</p>
            <p className="mt-2">Please try again later or contact support.</p>
        </motion.div>
    );
};

export default ErrorFallback;