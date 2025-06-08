import image from '../../assets/Codesphere_icon.png'
import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useUserSignupMutation} from "../../services/userApi.ts";

const Signup = () => {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [password, setPassword] = useState('');

    const [createPost, { isLoading, error }] = useUserSignupMutation();

    const signUp = async (e: React.FormEvent) => {
        e.preventDefault();
        await createPost({
            email,
            name,
            surname,
            password,
            role: "teacher",
        })
        if (!isLoading){
            navigate("/registration/login");
        }
    }

    return (

        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-blue-200 h-screen">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="Your Company"
                    src={image}
                    className="mx-auto h-48 w-auto"
                />
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                    Sign up to an account
                </h2>
            </div>


            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {error && <p className="text-red-500 text-sm mb-4">"There was an error creating a post"</p>}

                <form onSubmit={signUp} className="space-y-6">

                    <div>
                        <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">
                            Name
                        </label>
                        <div className="mt-2">
                            <input
                                id="name"
                                name="name"
                                type="name"
                                required
                                autoComplete="name"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-black placeholder:text-black focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 border-solid border-black border-2"
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="surname" className="block text-sm/6 font-medium text-gray-900">
                            Surname
                        </label>
                        <div className="mt-2">
                            <input
                                id="surname"
                                name="surname"
                                type="name"
                                required
                                autoComplete="surname"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-black placeholder:text-black focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 border-solid border-black border-2"
                                onChange={(e) => setSurname(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-black placeholder:text-black focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 border-solid border-black border-2"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                            Password
                        </label>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="new-password"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-black placeholder:text-black focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 border-solid border-black border-2"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signup ...' : 'Signup'}
                        </button>
                    </div>

                    {/*<div className="flex items-center justify-center">*/}
                    {/*    <button*/}
                    {/*        onClick={signUpWithGoogle}*/}
                    {/*        className="w-full align-middle justify-center py-2 border flex gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150">*/}
                    {/*        <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg"*/}
                    {/*             loading="lazy" alt="google logo"/>*/}
                    {/*        <span className="text-black">Login with Google</span>*/}
                    {/*    </button>*/}
                    {/*</div>*/}

                    <div className="flex items-center justify-center">
                        <p >Do you have an account? <Link  className="text-blue-600 hover:text-green-500" to={"/registration/login"}>Login</Link></p>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default Signup
