import {useState} from 'react';
import {motion} from 'framer-motion';
import {useGetAllQuizzesQuery} from '../../../services/quizApi';
import {useGetQuestionsByQuizQuery} from '../../../services/questionApi';
import {useGetAllUsersQuery} from '../../../services/userApi';

// 1. Import both the hook and the correct AnswerPayload type from the API service
import {useGetQuizAnswersQuery} from '../../../services/answerApi';

import {StudentAnswerTable} from './StudentAnswerTable';
import StudentAnswersModal from './StudentAnswersModal';
import LoadingSkeleton from './LoadingSkeleton';
import ErrorFallback from './ErrorFallback';

// 2. Remove the conflicting AnswerPayload from the local types import
import type {Quiz, StudentEvaluation, User, Question} from './types';
import {Award, Clock, Lock, Unlock} from 'lucide-react';

const QuizAnalysisPage: React.FC = () => {
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const limit = 10; // Students per page

    const {data: quizzes, isLoading: quizzesLoading, error: quizzesError} = useGetAllQuizzesQuery();
    const {data: questions, isLoading: questionsLoading, error: questionsError} = useGetQuestionsByQuizQuery(
        selectedQuizId || '',
        {skip: !selectedQuizId}
    );
    const {data: users, isLoading: usersLoading, error: usersError} = useGetAllUsersQuery({role: 'student'});
    const {data: answers, isLoading: answersLoading, error: answersError} = useGetQuizAnswersQuery(
        selectedQuizId || '',
        {skip: !selectedQuizId}
    );

    // 3. Let TypeScript infer the type of `answer` from the `answers` array
    const participatingStudents = users?.filter((user: User) =>
        answers?.some(answer => answer.studentId === user._id)
    );

    // 4. Let TypeScript infer types for `answer` and `ans` here as well
    const studentAnswers: StudentEvaluation[] = participatingStudents?.map((student: User) => {
        const studentAnswersForCurrentStudent = answers?.filter(answer => answer.studentId === student._id) || [];
        return {
            studentId: student._id,
            studentName: `${student.name || ''} ${student.surname || ''}`.trim(),
            answers: questions?.map((question: Question) => {
                const answer = studentAnswersForCurrentStudent.find(ans => ans.questionId === question._id);
                // The new AnswerPayload type correctly handles a potentially undefined `answer`
                return answer || {
                    studentId: student._id,
                    questionId: question._id,
                    answer: '',
                    timeSpent: 0,
                    changedCount: 0,
                };
            }) || [],
            totalScore: 0,
        };
    }) || [];

    const selectedStudent = participatingStudents?.find((student: User) => student._id === selectedStudentId);

    const isQuizListLoading = quizzesLoading || usersLoading;
    const isQuizDetailsLoading = questionsLoading || answersLoading;
    const error = quizzesError || questionsError || usersError || answersError;

    const total = participatingStudents?.length || 0;
    const paginatedStudents = participatingStudents?.slice((page - 1) * limit, page * limit) || [];

    const containerVariants = {
        hidden: {opacity: 0},
        visible: {opacity: 1, transition: {duration: 0.5, staggerChildren: 0.1}},
    };

    const cardVariants = {
        hidden: {opacity: 0, y: 50, scale: 0.9},
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: i * 0.05,
            },
        }),
    };

    if (isQuizListLoading) {
        return <LoadingSkeleton/>;
    }

    if (error || !quizzes) {
        return <ErrorFallback message="Failed to load quiz data."/>;
    }

    return (
        <motion.div
            className="p-6 mx-auto w-full min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8 border-b-4 border-blue-500 pb-2 inline-block">Teacher
                Quiz Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {quizzes.map((quiz: Quiz, index: number) => (
                    <motion.div
                        key={quiz._id}
                        className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between
                            ${selectedQuizId === quiz._id
                            ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-2 border-blue-800 transform scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:scale-[1.02]'
                        }`}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                        onClick={() => {
                            setSelectedQuizId(quiz._id);
                            setSelectedStudentId(null);
                            setPage(1);
                        }}
                    >
                        <div>
                            <h2 className="text-xl font-bold mb-2 flex items-center">
                                <Award className="mr-2" size={20}/>
                                {quiz.title || 'Untitled Quiz'}
                            </h2>
                            <p className={`text-sm ${selectedQuizId === quiz._id ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'} mb-1 flex items-center`}>
                                <Clock className="mr-2" size={16}/>
                                Time Limit: {quiz.timeLimit || 0} minutes
                            </p>
                            <p className={`text-sm ${selectedQuizId === quiz._id ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'} flex items-center`}>
                                {quiz.opened ? <Unlock className="mr-2" size={16}/> :
                                    <Lock className="mr-2" size={16}/>}
                                Status: {quiz.opened ? 'Open' : 'Closed'}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {selectedQuizId && (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.3, duration: 0.5}}
                    className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-300"
                >
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-600 pb-3">
                        Analysis for {quizzes.find((q: Quiz) => q._id === selectedQuizId)?.title || 'Selected Quiz'}
                    </h2>
                    {isQuizDetailsLoading ? (
                        <LoadingSkeleton/>
                    ) : error || !questions || !paginatedStudents ? (
                        <ErrorFallback message="Failed to load quiz analysis data."/>
                    ) : (
                        <>
                            <StudentAnswerTable
                                students={paginatedStudents}
                                questions={questions}
                                studentAnswers={studentAnswers.filter((sa: StudentEvaluation) =>
                                    paginatedStudents.some((ps: User) => ps._id === sa.studentId)
                                )}
                                page={page}
                                total={total}
                                limit={limit}
                                setPage={setPage}
                                onStudentClick={(studentId: string) => setSelectedStudentId(studentId)}
                            />
                            {selectedStudent && answers && questions && (
                                <StudentAnswersModal
                                    student={selectedStudent}
                                    answers={answers}
                                    questions={questions}
                                    onClose={() => setSelectedStudentId(null)}
                                />
                            )}
                        </>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default QuizAnalysisPage;