import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useCheckAuthQuery } from "../../services/authCheck.ts";

interface User {
    id: string;
    name: string;
    email: string;
    surname: string;
    group: string;
    role: string;
}

export default function AppLayout() {
    const { data, error, isLoading } = useCheckAuthQuery();
    const navigate = useNavigate();

    const user: User | undefined = data?.user;

    useEffect(() => {
        if (error) {
            navigate("/registration/login", { replace: true });
        } else if (data) {
            navigate("/student", { replace: true });
        } else if (user?.role === "teacher") {
            navigate("/teacher", { replace: true });
        }
    }, [isLoading, error, data, navigate, user]);

    if (isLoading) return <div>Loading...</div>;

    return null;
}
