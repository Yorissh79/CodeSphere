import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {useCheckAuthQuery} from "../../services/authCheck.ts";

export default function AppLayout() {
    const { data, error, isLoading } = useCheckAuthQuery();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && error) {
            navigate("/registration/login");
        }
        navigate("/student")
    }, [error, isLoading, navigate]);

    if (isLoading) return <div>Loading...</div>;
    if (!data) return null;
}
