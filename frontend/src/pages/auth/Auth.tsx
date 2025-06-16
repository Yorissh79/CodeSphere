import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {useCheckAuthQuery} from "../../services/authCheck.ts";

interface User {
    _id: string;
    name: string;
    email: string;
    surname: string;
    group: string;
    role: string;
}

export default function AppLayout() {

    const {data, error, isLoading} = useCheckAuthQuery();
    const navigate = useNavigate();

    const user: User | undefined = data?.user;

    useEffect(() => {

        const handleAuthCheck = async () => {
            if (isLoading) {
                return;
            }

            if (error) {
                navigate("/registration/login", {replace: true});
            } else if (user?.role === "student") {
                navigate("/user/student", {replace: true});
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
