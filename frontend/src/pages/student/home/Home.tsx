import { useCheckAuthQuery } from "../../../services/authCheck.ts";

const Home = () => {
    const { data, error, isLoading } = useCheckAuthQuery();

    if (isLoading) return <p>Loading...</p>;
    if (error || !data?.user) return <p>Error</p>;

    const { name, surname, email, group, role } = data.user;


    return (
        <div className="bg-white dark:bg-gray-600 flex flex-col w-full h-screen p-4 text-black dark:text-white">
            <h1 className="text-xl font-bold mb-4">Welcome, {name} {surname}</h1>
            <p>Email: {email}</p>
            <p>Group: {group}</p>
            <p>Role: {role}</p>

        </div>
    );
};

export default Home;
