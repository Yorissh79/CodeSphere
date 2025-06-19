export const SearchInput = ({
                                value,
                                onChange,
                                onClear,
                            }: {
    value: string;
    onChange: (v: string) => void;
    onClear: () => void;
}) => (
    <div className="relative w-full max-w-xl mx-auto">
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search pages..."
            className="w-full px-4 py-2 rounded-md shadow border border-gray-300 focus:ring focus:outline-none
                       bg-white text-black
                       dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:border-gray-700"
        />
        {value && (
            <button
                onClick={onClear}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors dark:text-gray-400 dark:hover:text-red-400"
            >
                ✕
            </button>
        )}
    </div>
);
