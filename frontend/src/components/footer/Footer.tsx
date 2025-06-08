import {Link} from "react-router-dom";

const Footer = () => {
    return (
        <div className="flex align-middle justify-center bg-gray-600">

            <div>
                <Link to={"/about"}>About</Link>
            </div>

            <div>
                <Link to={"/contact"}>Contact</Link>
            </div>

            <div>
                <Link to={"/faq"}>FAQ</Link>
            </div>

            <div>
                <Link to={"/pp"}>Privacy Policy</Link>
            </div>

        </div>
    )
}
export default Footer
