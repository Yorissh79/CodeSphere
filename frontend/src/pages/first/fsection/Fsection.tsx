import {Link} from "react-router-dom";

function Fsection() {
    return (
        <section className="text-center py-16">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Learn, Code, and Collaborate – <span className="uppercase">ALL</span> in One Platform.
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                CodeSphere is your all-in-one learning platform with real-time coding, messaging, and quizzes – perfect for students and teachers.
            </p>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
                    GET STARTED
                </button>
                <button className="px-6 py-2 border border-gray-300 text-gray-800 dark:text-white dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    TRY ONLINE EDITOR
                </button>
                <Link to={"/registration/teacher/signup"} className="px-6 py-2 border border-gray-300 text-gray-800 dark:text-white dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    JOIN AS TEACHER
                </Link>
            </div>
        </section>
    );
}

export default Fsection;