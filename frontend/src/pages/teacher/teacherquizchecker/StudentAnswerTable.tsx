import {motion} from 'framer-motion';
import {Check, X} from 'lucide-react';
import type {User, Question, StudentEvaluation} from './types';

interface StudentAnswerTableProps {
    students: User[];
    questions: Question[];
    studentAnswers: StudentEvaluation[];
    page: number;
    total: number;
    limit: number;
    setPage: (page: number) => void;
    onStudentClick: (studentId: string) => void;
}

export const StudentAnswerTable: React.FC<StudentAnswerTableProps> = ({
                                                                          students,
                                                                          questions,
                                                                          studentAnswers,
                                                                          page,
                                                                          total,
                                                                          limit,
                                                                          setPage,
                                                                          onStudentClick,
                                                                      }) => {
    const totalPages = Math.ceil(total / limit);

    const rowVariants = {
        hidden: {opacity: 0, x: -20},
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {delay: i * 0.05},
        }),
    };

    return (
        <div
            className="overflow-x-auto relative bg-white dark:bg-gray-800 rounded-xl shadow-xl transition-colors duration-300">
            <table
                className="min-w-full bg-white dark:bg-gray-800 border-separate [border-spacing:0] rounded-xl overflow-hidden">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider">Student</th>
                    {questions.map((question, index) => (
                        <th
                            key={question._id}
                            className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider relative group"
                        >
                            <span className="cursor-help">Q{index + 1}</span>
                            <div
                                className="absolute hidden group-hover:block bg-gray-800 dark:bg-gray-900 text-white text-xs rounded-md p-3 w-48 z-10 -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none after:content-[''] after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-gray-800 dark:after:border-t-gray-900">
                                {question.questionText}
                            </div>
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {students.map((student, rowIndex) => {
                    const studentEvaluation = studentAnswers.find((sa) => sa.studentId === student._id);
                    return (
                        <motion.tr
                            key={student._id}
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            custom={rowIndex}
                            className="group hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                            <td
                                className="px-8 py-4 border-b border-gray-200 dark:border-gray-700 text-blue-700 dark:text-blue-300 font-medium hover:underline cursor-pointer text-sm group-last:border-b-0"
                                onClick={() => onStudentClick(student._id)}
                                role="button"
                                tabIndex={0}
                                aria-label={`View answers for ${studentEvaluation?.studentName}`}
                                onKeyDown={(e) => e.key === 'Enter' && onStudentClick(student._id)}
                            >
                                {studentEvaluation?.studentName || 'Unknown Student'}
                            </td>
                            {questions.map((question) => {
                                const answer = studentEvaluation?.answers.find((ans) => ans.questionId === question._id);
                                return (
                                    <td key={question._id}
                                        className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 text-center group-last:border-b-0">
                                        {answer?.answer !== '' ? (
                                            <Check
                                                className="text-green-500 mx-auto transform scale-100 group-hover:scale-110 transition-transform"
                                                size={20} aria-label="Answered"/>
                                        ) : (
                                            <X className="text-red-500 mx-auto transform scale-100 group-hover:scale-110 transition-transform"
                                               size={20} aria-label="Not answered"/>
                                        )}
                                    </td>
                                );
                            })}
                        </motion.tr>
                    );
                })}
                </tbody>
            </table>
            <div
                className="flex justify-between items-center mt-6 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-b-xl transition-colors duration-300">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-5 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                    aria-label="Previous page"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
          Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
        </span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-5 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                    aria-label="Next page"
                >
                    Next
                </button>
            </div>
        </div>
    );
};