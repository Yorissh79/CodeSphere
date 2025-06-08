import {useUserLogoutMutation} from "../../services/userApi.ts";
import {useNavigate} from "react-router-dom";

const StudentHeader = () => {

    const [logoutTrigger, { isLoading: logoutLoading, error: logoutError }] = useUserLogoutMutation();
    const navigate = useNavigate();


    const handleLogout = async () => {
        try {
            await logoutTrigger().unwrap();
            navigate("/registration/login");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <div>
            <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                {logoutLoading ? "Logging out..." : "Logout"}
            </button>
            {logoutError && <p className="text-red-500 mt-2">Logout failed</p>}

        </div>
    )
}
export default StudentHeader

