import type {Page} from "../../../data/allowedPages";
import {highlightMatch} from "../../../utils/highlightMatch.tsx";
import {Link} from "react-router-dom";

interface Props {
    page: Page;
    query: string;
}

const SearchResultCard = ({page, query}: Props) => {
    return (
        <Link
            to={page.route}
            className="block p-4 rounded shadow bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition transform hover:scale-[1.02]"
        >
            <h2 className="font-bold text-lg">{highlightMatch(page.title, query)}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
                {highlightMatch(page.description, query)}
            </p>
        </Link>
    );
};

export default SearchResultCard;
