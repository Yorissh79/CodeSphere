import {useEffect} from "react";
import {Link} from "react-router-dom";
import {useCheckAdminAuthQuery} from "../../../services/authCheck.ts";

const Admin = () => {
    const { data, error, isLoading, refetch, isError } = useCheckAdminAuthQuery();

    useEffect(() => {
        refetch();
    }, [])

    if (isLoading) return <p>Loading...</p>;
    if (error || !data?.user || isError)

        return (
            <div className="flex justify-center items-center h-screen font-sans text-xl text-gray-600">
                <div className="text-xl text-gray-600">
                    Unauthorized access token.
                </div>

                <div className="text-xl text-gray-600">
                    <Link to={"/registration/login"} >Go login page</Link>
                </div>
            </div>
        );


    const { name, surname, email, role } = data.user;

    return (
        <div className="bg-white dark:bg-gray-600 flex flex-col w-full h-screen p-4 text-black dark:text-white">
            <h1 className="text-xl font-bold mb-4">Welcome, {name} {surname}</h1>
            <p>Email: {email}</p>
            <p>Role: {role}</p>
        </div>
    );
};

export default Admin;
