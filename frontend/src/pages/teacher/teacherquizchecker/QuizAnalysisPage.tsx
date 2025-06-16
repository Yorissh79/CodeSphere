import {useState} from 'react';
import {motion} from 'framer-motion';
import {useGetAllQuizzesQuery} from '../../../services/quizApi';
import {useGetQuestionsByQuizQuery} from '../../../services/questionApi';
import {useGetAllUsersQuery} from '../../../services/userApi';
import {useGetQuizAnswersQuery} from '../../../services/answerApi';
import StudentAnswerTable from './StudentAnswerTable';
import LoadingSkeleton from './LoadingSkeleton';
import ErrorFallback from './ErrorFallback';
import type {Quiz, StudentEvaluation} from './types';

const TeacherQuizDashboard: React.FC = () => {
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const limit = 10; // Students per page

    // Fetch all quizzes
    const {data: quizzes, isLoading: quizzesLoading, error: quizzesError} = useGetAllQuizzesQuery();

    // Fetch questions for the selected quiz (skip if no quiz selected)
    const {data: questions, isLoading: questionsLoading, error: questionsError} = useGetQuestionsByQuizQuery(
        selectedQuizId || '', // Convert null to empty string
        {skip: !selectedQuizId}
    );

    // Fetch all users (filter students)
    const {data: users, isLoading: usersLoading, error: usersError} = useGetAllUsersQuery({role: 'student'});

    // Fetch answers for the selected quiz
    const {data: answers, isLoading: answersLoading, error: answersError} = useGetQuizAnswersQuery(
        selectedQuizId || '', // Convert null to empty string
        {skip: !selectedQuizId}
    );

    // Filter students who have submitted (based on answers)
    const participatingStudents = users?.filter((user: { _id: string; }) =>
        answers?.some((answer) => answer.studentId === user._id)
    );

    // Transform answers into StudentEvaluation format
    const studentAnswers: StudentEvaluation[] = participatingStudents?.map((student: {
        _id: string;
        name: any;
        surname: any;
    }) => {
        const studentAnswers = answers?.filter((answer) => answer.studentId === student._id) || [];
        return {
            studentId: student._id,
            studentName: `${student.name || ''} ${student.surname || ''}`.trim(),
            answers: questions?.map((question) => {
                const answer = studentAnswers.find((ans) => ans.questionId === question._id);
                return answer || {
                    studentId: student._id,
                    questionId: question._id,
                    answer: '', // Use empty string instead of null
                    timeSpent: 0,
                    changedCount: 0,
                };
            }) || [],
            totalScore: 0, // Placeholder, as scoring logic is not provided
        };
    }) || [];

    // Loading state for quiz list
    const isQuizListLoading = quizzesLoading || usersLoading;

    // Loading state for quiz details
    const isQuizDetailsLoading = questionsLoading || answersLoading;

    // Error state
    const error = quizzesError || questionsError || usersError || answersError;

    // Calculate total students for pagination
    const total = participatingStudents?.length || 0;
    const paginatedStudents = participatingStudents?.slice((page - 1) * limit, page * limit) || [];

    // Animation variants
    const containerVariants = {
        hidden: {opacity: 0},
        visible: {opacity: 1, transition: {duration: 0.3}},
    };

    const cardVariants = {
        hidden: {opacity: 0, y: 20},
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {delay: i * 0.1},
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
            className="p-6 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <h1 className="text-2xl font-bold mb-6">Teacher Quiz Dashboard</h1>

            {/* Quiz List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {quizzes.map((quiz: Quiz, index: number) => (
                    <motion.div
                        key={quiz._id}
                        className={`p-4 rounded-lg shadow-md cursor-pointer transition-colors ${
                            selectedQuizId === quiz._id ? 'bg-blue-100 border-blue-500 border-2' : 'bg-white hover:bg-gray-50'
                        }`}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                        onClick={() => {
                            setSelectedQuizId(quiz._id);
                            setPage(1); // Reset pagination
                        }}
                    >
                        <h2 className="text-lg font-semibold">{quiz.title || 'Untitled Quiz'}</h2>
                        <p className="text-sm text-gray-600">Time Limit: {quiz.timeLimit || 0} minutes</p>
                        <p className="text-sm text-gray-600">Status: {quiz.opened ? 'Open' : 'Closed'}</p>
                    </motion.div>
                ))}
            </div>

            {/* Quiz Analysis */}
            {selectedQuizId && (
                <div>
                    <h2 className="text-xl font-bold mb-4">
                        Analysis for {quizzes.find((q) => q._id === selectedQuizId)?.title || 'Selected Quiz'}
                    </h2>
                    {isQuizDetailsLoading ? (
                        <LoadingSkeleton/>
                    ) : error || !questions || !paginatedStudents ? (
                        <ErrorFallback message="Failed to load quiz analysis data."/>
                    ) : (
                        <StudentAnswerTable
                            students={paginatedStudents}
                            questions={questions}
                            studentAnswers={studentAnswers.filter((sa) => paginatedStudents.some((ps: {
                                _id: string;
                            }) => ps._id === sa.studentId))}
                            page={page}
                            total={total}
                            limit={limit}
                            setPage={setPage}
                        />
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default TeacherQuizDashboard;