import SignHeader from "../signHeader/SignHeader.tsx";
import {Outlet} from "react-router-dom";

const SignLayout = () => {
    return (
        <div>

            <SignHeader/>
            <Outlet/>

        </div>
    )
}
export default SignLayout
