import {motion} from 'framer-motion';
import {Search} from 'lucide-react';
import {useState} from "react";

interface SearchFilterBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterStatus: string;
    setFilterStatus: (status: string) => void;
}

const SearchFilterBar = ({searchQuery, setSearchQuery, filterStatus, setFilterStatus}: SearchFilterBarProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3}}
            className="flex flex-col sm:flex-row gap-4 mb-8"
        >
            <div className="relative flex-1">
                <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-colors duration-200"/>
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
            </div>

            <div className="relative">
                <motion.select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none w-full sm:w-48 pl-4 pr-10 py-3 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-gray-900 dark:text-gray-100 cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                </motion.select>
                <motion.div
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    animate={{rotate: isOpen ? 180 : 0}}
                    transition={{duration: 0.2}}
                >
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor"
                         viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SearchFilterBar;
