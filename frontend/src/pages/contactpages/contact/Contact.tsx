import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {Link} from "react-router-dom";

const Contact = () => {
    const initialValues = { name: "", email: "", message: "" };

    const validationSchema = Yup.object({
        name: Yup.string().required("Required"),
        email: Yup.string().email("Invalid email").required("Required"),
        message: Yup.string().required("Required"),
    });

    const handleSubmit = async (values: typeof initialValues, { resetForm }: any) => {
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (res.ok) {
                alert("Message sent!");
                resetForm();
            } else {
                alert("Failed to send message.");
            }
        } catch (err) {
            alert("Something went wrong.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 px-6">
            <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">Contact Us</h1>
                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                    <Form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Name</label>
                            <Field name="name" className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:text-white" />
                            <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Email</label>
                            <Field name="email" type="email" className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:text-white" />
                            <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Message</label>
                            <Field name="message" as="textarea" rows={4} className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:text-white" />
                            <ErrorMessage name="message" component="div" className="text-red-500 text-sm" />
                        </div>

                        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                            Send Message
                        </button>
                    </Form>
                </Formik>
            </div>
            <div className="text-center mt-12">
                <Link
                    to="/"
                    className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    ⬅ Go to Home
                </Link>
            </div>
        </div>
    );
};

export default Contact;
