import type {FC} from 'react';
import {Star} from 'lucide-react';

interface Testimonial {
    quote: string;
    author: string;
    role: string;
}

const TestimonialsSection: FC = () => {
    const testimonials: Testimonial[] = [
        {
            quote: "CodeSphere transformed my classroom with its intuitive tools and real-time collaboration features.",
            author: "Sarah Johnson",
            role: "Computer Science Teacher"
        },
        {
            quote: "The live code editor makes learning to code fun and interactive. Highly recommend!",
            author: "Michael Chen",
            role: "Student"
        }
    ];

    return (
        <section
            className="py-16 px-4 sm:px-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
                    What Our Users Say
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                    Hear from teachers and students who love CodeSphere.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div key={index}
                             className="p-6 rounded-xl bg-white/5 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200/20 dark:border-gray-800/50 animate-in fade-in duration-500"
                             style={{animationDelay: `${index * 100}ms`}}>
                            <Star className="h-5 w-5 text-yellow-400 mb-4"/>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">{testimonial.quote}</p>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-indigo-400 font-semibold">{testimonial.author[0]}</span>
                                </div>
                                <div>
                                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{testimonial.author}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;