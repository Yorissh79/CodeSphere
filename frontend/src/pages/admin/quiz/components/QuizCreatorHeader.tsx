interface QuizCreatorHeaderProps {
    editingQuestionId: string | null;
    quizTitle: string;
    quizTime: number;
}

const QuizCreatorHeader = ({
                               editingQuestionId,
                               quizTitle,
                               quizTime,
                           }: QuizCreatorHeaderProps) => {
    return (
        <div className="space-y-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {editingQuestionId ? "Edit Question" : "Add Question"}
            </h2>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                Quiz: {quizTitle} • {quizTime} minutes
            </p>
        </div>
    );
};

export default QuizCreatorHeader;