import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {useCheckTeacherAuthQuery} from "../../services/authCheck.ts";

interface User {
    id: string;
    name: string;
    email: string;
    surname: string;
    role: string;
}

export default function TeacherAppLayout() {
    const { data, error, isLoading } = useCheckTeacherAuthQuery();
    const navigate = useNavigate();

    const user: User | undefined = data?.user;

    useEffect(() => {
        if (error) {
            navigate("/registration/login", { replace: true });
        } else if (data) {
            navigate("/teacher", { replace: true });
        }
    }, [isLoading, error, data, navigate, user]);

    if (isLoading) return <div>Loading...</div>;

    return null;
}
