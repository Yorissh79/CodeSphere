import {useEffect, useState} from "react";

export const DarkModeToggle = () => {
    const [enabled, setEnabled] = useState(() => localStorage.theme === "dark");

    useEffect(() => {
        const root = window.document.documentElement;
        if (enabled) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [enabled]);

    return (
        <button
            onClick={() => setEnabled(!enabled)}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-600"
            aria-label="Toggle Dark Mode"
        >
            {enabled ? "🌙" : "☀️"}
        </button>
    );
};
