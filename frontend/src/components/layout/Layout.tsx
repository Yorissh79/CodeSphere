import Header from "../header/Header.tsx";
import {Outlet} from "react-router-dom";
import Footer from "../footer/Footer.tsx";

const Layout = () => {
    return (
        <>
            <Header />
            <Outlet/>
            <Footer/>
        </>
    )
}
export default Layout
