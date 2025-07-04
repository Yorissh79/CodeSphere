import {motion, AnimatePresence} from 'framer-motion';
import {X, Check, AlertCircle, CircleCheck, CircleX} from 'lucide-react';
import {useState} from 'react';
import {useUpdateTeacherEvaluationMutation} from '../../../services/answerApi';
import type {AnswerPayload, Question, User} from './types';

interface StudentAnswersModalProps {
    student: User;
    answers: AnswerPayload[];
    questions: Question[];
    onClose: () => void;
}

const StudentAnswersModal: React.FC<StudentAnswersModalProps> = ({student, answers, questions, onClose}) => {
    const [updateEvaluation] = useUpdateTeacherEvaluationMutation();
    const [feedbacks, setFeedbacks] = useState<{ [key: string]: string }>({});

    const studentAnswers = answers.filter((answer) => answer.studentId === student._id);

    useState(() => {
        const initialFeedbacks: { [key: string]: string } = {};
        studentAnswers.forEach(answer => {
            if (answer._id && answer.teacherFeedback) {
                initialFeedbacks[answer._id] = answer.teacherFeedback;
            }
        });
        setFeedbacks(initialFeedbacks);
    });

    const handleEvaluation = async (answerId: string, isCorrect: boolean, feedback: string) => {
        try {
            await updateEvaluation({answerId, isCorrect, teacherFeedback: feedback}).unwrap();
            setFeedbacks((prev) => ({...prev, [answerId]: feedback}));
        } catch (error) {
            console.error('Failed to update evaluation:', error);
        }
    };

    const modalVariants = {
        hidden: {opacity: 0, y: -100, scale: 0.9},
        visible: {opacity: 1, y: 0, scale: 1, transition: {type: "spring", stiffness: 150, damping: 20}},
        exit: {opacity: 0, y: -100, scale: 0.9, transition: {duration: 0.2}},
    };

    const sectionVariants = {
        hidden: {opacity: 0, y: 20},
        visible: {opacity: 1, y: 0, transition: {duration: 0.4, ease: "easeOut"}},
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative transition-colors duration-300"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
                            Answers for <span
                            className="text-blue-600 dark:text-blue-400">{student.name} {student.surname}</span>
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Close modal"
                        >
                            <X size={28}/>
                        </button>
                    </div>
                    <div className="space-y-6">
                        {questions.map((question, index) => {
                            const answer = studentAnswers.find((ans) => ans.questionId === question._id);
                            const feedback = feedbacks[answer?._id || ''] || answer?.teacherFeedback || '';

                            return (
                                <motion.div
                                    key={question._id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-700 shadow-sm transition-colors duration-300"
                                    variants={sectionVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{delay: index * 0.05}}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="font-semibold text-lg text-gray-900 dark:text-gray-100 pr-4">
                                            Q{index + 1}: {question.questionText}
                                        </p>
                                        <div className="flex-shrink-0">
                                            {answer ? (
                                                <motion.div
                                                    initial={{scale: 0.8, opacity: 0}}
                                                    animate={{scale: 1, opacity: 1}}
                                                    transition={{type: "spring", stiffness: 300, damping: 20}}
                                                >
                                                    <CircleCheck className="text-green-500" size={24}/>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    initial={{scale: 0.8, opacity: 0}}
                                                    animate={{scale: 1, opacity: 1}}
                                                    transition={{type: "spring", stiffness: 300, damping: 20}}
                                                >
                                                    <AlertCircle className="text-red-500" size={24}/>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                    {answer ? (
                                        <div className="space-y-2 text-gray-700 dark:text-gray-200">
                                            <p>
                                                <span
                                                    className="font-medium text-gray-800 dark:text-gray-100">Answer: </span>
                                                <span
                                                    className="bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded-md inline-block text-blue-800 dark:text-blue-200">
                                                    {Array.isArray(answer.answer)
                                                        ? answer.answer.join(', ')
                                                        : answer.answer.toString()}
                                                </span>
                                            </p>
                                            <p>
                                                <span className="font-medium text-gray-800 dark:text-gray-100">Time Spent: </span>
                                                {answer.timeSpent} seconds
                                            </p>
                                            <p>
                                                <span className="font-medium text-gray-800 dark:text-gray-100">Changed Count: </span>
                                                {answer.changedCount}
                                            </p>
                                            <p className="flex items-center">
                                                <span className="font-medium text-gray-800 dark:text-gray-100 mr-2">Evaluation Status: </span>
                                                {question.type === 'short' && !answer.reviewed ? (
                                                    <div className="flex space-x-3 mt-2">
                                                        <motion.button
                                                            whileHover={{scale: 1.05}}
                                                            whileTap={{scale: 0.95}}
                                                            onClick={() => handleEvaluation(answer._id!, true, feedback)}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md flex items-center"
                                                        >
                                                            <Check size={18} className="mr-1"/> Mark Correct
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{scale: 1.05}}
                                                            whileTap={{scale: 0.95}}
                                                            onClick={() => handleEvaluation(answer._id!, false, feedback)}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md flex items-center"
                                                        >
                                                            <X size={18} className="mr-1"/> Mark Incorrect
                                                        </motion.button>
                                                    </div>
                                                ) : (
                                                    <span
                                                        className={`font-bold flex items-center ${
                                                            answer.isCorrect ? 'text-green-600' : 'text-red-600'
                                                        }`}
                                                    >
                                                        {answer.isCorrect ? <CircleCheck size={20} className="mr-1"/> :
                                                            <CircleX size={20} className="mr-1"/>}
                                                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                                    </span>
                                                )}
                                            </p>
                                            {question.type === 'short' && (
                                                <div className="pt-2">
                                                    <label htmlFor={`feedback-${question._id}`}
                                                           className="font-medium text-gray-800 dark:text-gray-100 mb-1 block">Teacher
                                                        Feedback: </label>
                                                    <textarea
                                                        id={`feedback-${question._id}`}
                                                        value={feedback}
                                                        onChange={(e) =>
                                                            setFeedbacks((prev) => ({
                                                                ...prev,
                                                                [answer._id!]: e.target.value
                                                            }))
                                                        }
                                                        onBlur={() => handleEvaluation(answer._id!, answer.isCorrect || false, feedbacks[answer._id!])}
                                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 dark:bg-gray-600 dark:text-gray-50 dark:placeholder-gray-300"
                                                        placeholder="Enter feedback (optional)"
                                                        rows={3}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 italic py-2">No answer submitted
                                            for this question.</p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default StudentAnswersModal;