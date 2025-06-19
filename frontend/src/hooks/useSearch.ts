import {useEffect, useState} from "react";
import type {Page} from "../data/allowedPages";

export function useSearch(query: string, data: Page[]) {
    const [results, setResults] = useState<Page[]>([]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const regex = new RegExp(query, "i");
            setResults(
                data.filter(({title, description}) =>
                    regex.test(title) || regex.test(description)
                )
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [query, data]);

    return results;
}
