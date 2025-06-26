import type {FC} from 'react';

const SkeletonLoader: FC = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-12 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-xl"/>
        <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-lg"/>
        <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"/>
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"/>
        </div>
    </div>
);

export default SkeletonLoader;