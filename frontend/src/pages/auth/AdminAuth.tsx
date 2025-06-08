import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {useCheckAuthQuery} from "../../services/authCheck.ts";

interface Admin {
    id: string;
    name: string;
    email: string;
    surname: string;
    role: string;
}

export default function AdminAuth() {
    const { data, error, isLoading } = useCheckAuthQuery();
    const navigate = useNavigate();

    const user: Admin | undefined = data?.user;

    useEffect(() => {
        if (error) {
            navigate("/registration/login", { replace: true });
        } else if (data) {
            navigate("/student", { replace: true });
        }
    }, [isLoading, error, data, navigate, user]);

    if (isLoading) return <div>Loading...</div>;

    return null;
}
