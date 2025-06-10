import logo from '../../assets/Codesphere_icon.png'
import {Link} from "react-router-dom";
import {useDarkMode} from "../../hooks/useDarkMode.ts";
import * as React from "react";


const Header: React.FC = () => {
    const { isDark, toggleDarkMode } = useDarkMode()

    return (

        <header className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-900 via-blue-900 to-black text-white">
            <Link to={"/"}>
                <div className="flex items-center">
                    <img src={logo} alt="CodeSphere Logo" className="h-12 mr-2" />
                </div>
            </Link>
            <div className="flex space-x-4">
                <Link to={"/registration/login"} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">Login</Link>
                <button onClick={toggleDarkMode} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>
        </header>
    )
}
export default Header