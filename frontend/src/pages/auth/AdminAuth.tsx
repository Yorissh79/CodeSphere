import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {useCheckAdminAuthQuery} from "../../services/authCheck.ts";

interface User {
    _id: string;
    name: string;
    email: string;
    surname: string;
    role: string;
}

export default function AdminAuth() {

    const {data, error, isLoading} = useCheckAdminAuthQuery();
    const navigate = useNavigate();

    const user: User | undefined = data?.user;

    useEffect(() => {

        const handleAuthCheck = async () => {
            if (isLoading) {
                return;
            }

            if (error) {
                navigate("/registration/login", {replace: true});
            } else if (user?.role === "admin") {
                navigate("/user/admin", {replace: true});
            }
        };

        handleAuthCheck()

    }, [isLoading, error, data, navigate, user]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen font-sans text-xl text-gray-600">
                Loading...
            </div>
        );
    }
    return null;
}
