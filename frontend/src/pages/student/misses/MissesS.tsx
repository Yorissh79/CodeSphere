import { motion } from 'framer-motion';
import { useGetMyMissesQuery } from '../../../services/missesApi';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

const MissesS = () => {
    const { data, error, isLoading, refetch } = useGetMyMissesQuery();
    const TOTAL_HOURS = 6;
    const MAX_MISS_HOURS = 24;

    const misses = Array.isArray(data?.data)
        ? data.data
            .filter((m: { miss: number }) => m.miss !== undefined && m.miss < TOTAL_HOURS) // Only show records with misses
            .map((m: { miss: number; date: string }) => ({
                date: m.date,
                hoursMissed: TOTAL_HOURS - m.miss,
            }))
        : [];

    const totalMissedHours = misses.reduce((sum: number, m: { hoursMissed: number }) => sum + m.hoursMissed, 0);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return (
        <section className="px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10">
                My Missed Hours
            </h2>

            {isLoading && <div className="text-center text-gray-500">Loading...</div>}
            {error && <div className="text-center text-red-500">Error loading misses.</div>}
            {misses.length === 0 && !isLoading && !error && (
                <div className="text-center text-gray-500">No missed hours found.</div>
            )}

            {misses.length > 0 && (
                <div className="max-w-4xl mx-auto space-y-4">
                    <div className="text-center text-gray-700 dark:text-gray-200 font-semibold">
                        Total Missed Hours: {Math.min(totalMissedHours, MAX_MISS_HOURS)}/{MAX_MISS_HOURS}
                    </div>
                    {totalMissedHours >= 24 && (
                        <div className="text-center text-red-500">You have exceeded your maximum missed hours.</div>
                    )}
                    <div className="grid gap-4">
                        {misses.map((miss: { date: string; hoursMissed: number }, index: number) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 bg-white dark:bg-gray-800 border rounded-lg dark:border-gray-700"
                            >
                                <p className="text-gray-700 dark:text-gray-200">
                                    Date: {new Date(miss.date).toLocaleDateString()}
                                </p>
                                <p className="text-gray-700 dark:text-gray-200">
                                    Missed: {miss.hoursMissed} hour{miss.hoursMissed > 1 ? 's' : ''}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center mt-8">
                <Link
                    to="/user/student"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md shadow hover:shadow-md transition duration-200"
                >
                    <ArrowLeft size={18} />
                    Back to Main Page
                </Link>
            </div>
        </section>
    );
};

export default MissesS;