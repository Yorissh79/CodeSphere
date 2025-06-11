import {Outlet} from "react-router-dom";
import AdminHeader from "../adminheader/AdminHeader.tsx";
import AdminFooter from "../adminfooter/AdminFooter.tsx";

const AdminLayout = () => {
    return (
        <div>
            <AdminHeader/>
            <Outlet/>
            <AdminFooter/>
        </div>
    )
}
export default AdminLayout
