import type {FC} from 'react';
import {Link} from 'react-router-dom';

const CTASection: FC = () => {
    return (
        <section className="py-16 px-4 sm:px-6">
            <div
                className="max-w-4xl mx-auto text-center bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-8 text-white">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Ready to Transform Your Classroom?
                </h2>
                <p className="text-lg mb-6">
                    Join CodeSphere today and experience the future of education.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/registration/teacher/signup"
                          className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300">
                        Sign Up as Teacher
                    </Link>
                    <Link to="/editor"
                          className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white/10 transition-all duration-300">
                        Try Code Editor
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CTASection;