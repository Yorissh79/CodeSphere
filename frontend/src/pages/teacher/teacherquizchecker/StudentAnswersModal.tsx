import {motion, AnimatePresence} from 'framer-motion';
import {X, Check, AlertCircle} from 'lucide-react';
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

    const handleEvaluation = async (answerId: string, isCorrect: boolean, feedback: string) => {
        try {
            await updateEvaluation({answerId, isCorrect, teacherFeedback: feedback}).unwrap();
            setFeedbacks((prev) => ({...prev, [answerId]: feedback}));
        } catch (error) {
            console.error('Failed to update evaluation:', error);
        }
    };

    const modalVariants = {
        hidden: {opacity: 0, y: -50},
        visible: {opacity: 1, y: 0, transition: {duration: 0.3}},
        exit: {opacity: 0, y: -50, transition: {duration: 0.2}},
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                            Answers for {student.name} {student.surname}
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700"
                                aria-label="Close modal">
                            <X size={24}/>
                        </button>
                    </div>
                    <div className="space-y-4">
                        {questions.map((question) => {
                            const answer = studentAnswers.find((ans) => ans.questionId === question._id);
                            const feedback = feedbacks[answer?._id || ''] || answer?.teacherFeedback || '';

                            return (
                                <div key={question._id} className="border-b pb-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="font-semibold">{question.questionText}</span>
                                        {answer ? (
                                            <Check className="text-green-500" size={20}/>
                                        ) : (
                                            <AlertCircle className="text-red-500" size={20}/>
                                        )}
                                    </div>
                                    {answer ? (
                                        <div className="space-y-2">
                                            <p>
                                                <span className="font-medium">Answer: </span>
                                                {Array.isArray(answer.answer)
                                                    ? answer.answer.join(', ')
                                                    : answer.answer.toString()}
                                            </p>
                                            <p>
                                                <span className="font-medium">Time Spent: </span>
                                                {answer.timeSpent} seconds
                                            </p>
                                            <p>
                                                <span className="font-medium">Changed Count: </span>
                                                {answer.changedCount}
                                            </p>
                                            <p>
                                                <span className="font-medium">Status: </span>
                                                {question.type === 'short' && !answer.reviewed ? (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEvaluation(answer._id!, true, feedback)}
                                                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                        >
                                                            Mark Correct
                                                        </button>
                                                        <button
                                                            onClick={() => handleEvaluation(answer._id!, false, feedback)}
                                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                        >
                                                            Mark Incorrect
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span
                                                        className={`font-semibold ${
                                                            answer.isCorrect ? 'text-green-500' : 'text-red-500'
                                                        }`}
                                                    >
                            {answer.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                                                )}
                                            </p>
                                            {question.type === 'short' && (
                                                <div>
                                                    <label className="font-medium">Feedback: </label>
                                                    <textarea
                                                        value={feedback}
                                                        onChange={(e) =>
                                                            setFeedbacks((prev) => ({
                                                                ...prev,
                                                                [answer._id!]: e.target.value
                                                            }))
                                                        }
                                                        className="w-full p-2 border rounded"
                                                        placeholder="Enter feedback (optional)"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No answer submitted</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default StudentAnswersModal;