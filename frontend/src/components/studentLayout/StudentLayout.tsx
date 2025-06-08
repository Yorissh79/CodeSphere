import StudentHeader from "../studentHeader/StudentHeader.tsx";
import {Outlet} from "react-router-dom";
import StudentFooter from "../studentfooter/StudentFooter.tsx";

const StudentLayout = () => {
    return (
        <div>

            <StudentHeader/>
            <Outlet/>
            <StudentFooter/>

        </div>
    )
}
export default StudentLayout
