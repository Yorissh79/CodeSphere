import TeacherHeader from "../teacherheader/TeacherHeader.tsx";
import {Outlet} from "react-router-dom";
import TeacherFooter from "../teachefooter/TeacherFooter.tsx";

const TeacherLayout = () => {
    return (
        <div>

            <TeacherHeader/>
            <Outlet/>
            <TeacherFooter/>

        </div>
    )
}
export default TeacherLayout
