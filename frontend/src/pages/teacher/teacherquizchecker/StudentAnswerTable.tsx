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
}

const StudentAnswerTable: React.FC<StudentAnswerTableProps> = ({
                                                                   students,
                                                                   questions,
                                                                   studentAnswers,
                                                                   page,
                                                                   total,
                                                                   limit,
                                                                   setPage,
                                                               }) => {
    // Animation variants for table rows
    const rowVariants = {
        hidden: {opacity: 0, y: 20},
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {delay: i * 0.05},
        }),
    };

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200">
                <tr>
                    <th className="py-3 px-4 text-left">Student</th>
                    {questions.map((question, index) => (
                        <th key={question._id} className="py-3 px-4 text-center">
                            Q{index + 1}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {students.map((student, rowIndex) => {
                    const studentEvaluation = studentAnswers.find(
                        (evaluation) => evaluation.studentId === student._id
                    );
                    return (
                        <motion.tr
                            key={student._id}
                            className="border-t"
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            custom={rowIndex}
                        >
                            <td className="py-3 px-4">{`${student.name} ${student.surname}`}</td>
                            {questions.map((question) => {
                                const answer = studentEvaluation?.answers.find(
                                    (ans) => ans.questionId === question._id
                                );
                                return (
                                    <td key={question._id} className="py-3 px-4 text-center">
                                        {answer ? (
                                            <Check className="text-green-500 mx-auto h-5 w-5"/>
                                        ) : (
                                            <X className="text-red-500 mx-auto h-5 w-5"/>
                                        )}
                                    </td>
                                );
                            })}
                        </motion.tr>
                    );
                })}
                </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center space-x-2">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentAnswerTable;