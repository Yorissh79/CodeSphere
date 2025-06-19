import {useState} from "react";
import {allowedPages} from "../../data/allowedPages";
import {useSearch} from "../../hooks/useSearch";
import {SearchInput} from "./components/SearchInput";
import SearchResultCard from "./components/SearchResultCard";
import {SkeletonLoader} from "./components/SkeletonLoader";
import {DarkModeToggle} from "./components/DarkModeToggle";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const results = useSearch(query, allowedPages);

    return (
        <div className="min-h-screen px-4 py-8 dark:bg-gray-900 dark:text-white transition-colors">
            <DarkModeToggle/>
            <SearchInput value={query} onChange={setQuery} onClear={() => setQuery("")}/>

            <div className="mt-6 space-y-4 transition-all">
                {query && results.length === 0 ? (
                    <p className="text-center">No results found.</p>
                ) : !query ? (
                    <SkeletonLoader/>
                ) : (
                    results.map((page) => (
                        <div key={page.route} className="transition-opacity duration-300 animate-fade-in">
                            <SearchResultCard page={page} query={query}/>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
