import Header from "../header/Header.tsx";
import {Outlet} from "react-router-dom";
import Footer from "../footer/Footer.tsx";

const Layout = () => {
    return (
        <div className={"min-h-screen bg-white dark:bg-gray-900"}>
            <Header />
            <Outlet/>
            <Footer/>
        </div>
    )
}
export default Layout
