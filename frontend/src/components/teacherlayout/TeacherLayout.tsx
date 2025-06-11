import {Outlet} from "react-router-dom";
import TeacherHeader from "../teacherheader/TeacherHeader.tsx";
import TeacherFooter from "../teacherfooter/TeacherFooter.tsx";

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
