interface Student {
    id: string;
    name: string;
}

interface StudentListProps {
    students: Student[];
    attendance: Record<string, number>;
    markSingle: (studentId: string, hours: number) => void;
    getMissHours: (studentId: string) => number;
    setModalStudent: (student: Student | null) => void;
    TOTAL_HOURS: number;
    MAX_MISS_HOURS: number;
}

const StudentList = ({
                         students,
                         attendance,
                         markSingle,
                         getMissHours,
                         setModalStudent,
                         TOTAL_HOURS,
                         MAX_MISS_HOURS,
                     }: StudentListProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
                <div key={student.id} className="border rounded-lg p-4 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-800 dark:text-white font-medium">{student.name}</span>
                        <div className="space-x-2 flex items-center">
                            <select
                                value={attendance[student.id] ?? ""}
                                onChange={(e) => markSingle(student.id, Number(e.target.value))}
                                className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                            >
                                <option value="" disabled>Select Hours</option>
                                {[...Array(TOTAL_HOURS + 1)].map((_, i) => (
                                    <option key={i} value={i}>{i} hours</option>
                                ))}
                            </select>
                            <button
                                onClick={() => setModalStudent(student)}
                                className={`px-2 py-1 text-white rounded-md text-sm ${
                                    getMissHours(student.id) === MAX_MISS_HOURS ? 'bg-red-500' : 'bg-purple-500'
                                }`}
                            >
                                Misses: {getMissHours(student.id)}/{MAX_MISS_HOURS}h
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StudentList;