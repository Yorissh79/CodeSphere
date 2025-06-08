import {Link} from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-800 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8">
                    <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:underline">About</Link>
                    <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:underline">Contact</Link>
                    <Link to="/faq" className="text-gray-700 dark:text-gray-300 hover:underline">FAQ</Link>
                    <Link to="/pp" className="text-gray-700 dark:text-gray-300 hover:underline">Privacy Policy</Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;