import {Search} from 'lucide-react';

interface SearchFilterBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterStatus: string;
    setFilterStatus: (status: string) => void;
}

const SearchFilterBar = ({searchQuery, setSearchQuery, filterStatus, setFilterStatus}: SearchFilterBarProps) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
                <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5"
                />
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
            </div>

            <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors min-w-40"
            >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
            </select>
        </div>
    );
};

export default SearchFilterBar;