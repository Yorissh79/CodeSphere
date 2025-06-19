import React from "react";

export function highlightMatch(text: string, query: string): React.ReactNode {
    if (!query) return text;

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, "ig");
    const parts = text.split(regex);

    return parts.map((part, index) => {
        const isMatch = part.toLowerCase() === query.toLowerCase();

        return isMatch
            ? React.createElement('mark', {key: index}, part)
            : React.createElement('span', {key: index}, part);
    });
}