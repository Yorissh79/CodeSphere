import GoogleAuthHeader from "../googleHeader/GoogleAuthHeader.tsx";
import {Outlet} from "react-router-dom";
import StudentFooter from "../studentfooter/StudentFooter.tsx";

const GoogleLayout = () => {
    return (
        <>
            <GoogleAuthHeader/>
            <Outlet/>
            <StudentFooter/>
        </>
    )
}
export default GoogleLayout
