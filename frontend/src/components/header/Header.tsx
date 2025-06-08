import logo from '../../assets/Codesphere_icon.png'
import {Link} from "react-router-dom";


const Header = () => {
    return (
        <div className="flex items-center justify-between w-full bg-gray-600 h-20">

            <div className="flex items-center justify-between">
                <Link to="/">
                    <img className="w-32 pl-8" src={logo}/>
                </Link>
            </div>

            <div>
                <Link to="/check" className="flex items-center justify-between text-white pr-8 text-2xl">Login</Link>
            </div>



        </div>
    )
}
export default Header
