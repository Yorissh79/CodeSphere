import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button onClick={toggleTheme}>
            {theme === 'light' ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </button>
    );
}
