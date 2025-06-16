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

    // Animation variants for table rows
    const rowVariants = {
        hidden: {opacity: 0, x: -20},
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {delay: i * 0.05},
        }),
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Student</th>
                    {questions.map((question, index) => (
                        <th
                            key={question._id}
                            className="px-4 py-3 border-b text-center text-sm font-semibold text-gray-700 relative group"
                        >
                            <span className="cursor-help">Q{index + 1}</span>
                            {/* Tooltip for question text */}
                            <div
                                className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 z-10 -top-10 left-1/2 transform -translate-x-1/2">
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
                            className="hover:bg-gray-50"
                        >
                            <td
                                className="px-6 py-4 border-b text-blue-600 hover:underline cursor-pointer text-sm"
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
                                    <td key={question._id} className="px-4 py-4 border-b text-center">
                                        {answer?.answer !== '' ? (
                                            <Check className="text-green-500 mx-auto" size={18} aria-label="Answered"/>
                                        ) : (
                                            <X className="text-red-500 mx-auto" size={18} aria-label="Not answered"/>
                                        )}
                                    </td>
                                );
                            })}
                        </motion.tr>
                    );
                })}
                </tbody>
            </table>
            <div className="flex justify-between items-center mt-4">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                    aria-label="Previous page"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                    aria-label="Next page"
                >
                    Next
                </button>
            </div>
        </div>
    );
};