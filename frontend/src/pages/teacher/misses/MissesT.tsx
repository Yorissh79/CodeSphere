import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Check, X, ArrowLeft } from "lucide-react";
import { useGetAllUsersQuery } from "../../../services/userApi";
import { useAddMissMutation, useGetAllMissesQuery } from "../../../services/missesApi";
import {Link} from "react-router-dom";

const MissesT = () => {
    const [selectedGroup, setSelectedGroup] = useState("");
    const [attendance, setAttendance] = useState<Record<string, "present" | "miss">>({});
    const [modalStudent, setModalStudent] = useState<{ id: string; name: string } | null>(null);

    const { data: usersData, isLoading, error } = useGetAllUsersQuery({ role: "student" });
    const { data: missesData } = useGetAllMissesQuery({ page: 1, limit: 1000 });
    const [addMiss] = useAddMissMutation();

    const users = Array.isArray(usersData) ? usersData : [];

    const groups = Array.from(new Set(users.map((u) => u.group).filter(Boolean))).map((g) => ({
        id: g,
        name: g,
    }));

    const students = selectedGroup
        ? users.filter((u) => u.group === selectedGroup && u.role === "student").map((u) => ({
            id: u._id,
            name: u.name,
        }))
        : [];

    const allMisses = Array.isArray(missesData?.data) ? missesData.data : [];

    const getMissCount = (studentId: string) =>
        allMisses.filter((m) => m.student._id === studentId && m.miss === "Missed class").length;

    const getMissDates = (studentId: string) =>
        allMisses
            .filter((m) => m.student._id === studentId && m.miss === "Missed class")
            .map((m) => new Date(m.date).toLocaleDateString());

    const markAll = (type: "present" | "miss") => {
        const updated = students.reduce((acc, s) => {
            acc[s.id] = type;
            return acc;
        }, {} as Record<string, "present" | "miss">);
        setAttendance(updated);
        toast.success(`All students marked as ${type}`);
    };

    const markSingle = (studentId: string, type: "present" | "miss") => {
        setAttendance((prev) => ({ ...prev, [studentId]: type }));
        const name = students.find((s) => s.id === studentId)?.name;
        toast.success(`${name} marked as ${type}`);
    };

    const handleSendAllAttendance = async () => {
        const relevantStudents = students.filter((s) => attendance[s.id]);

        if (relevantStudents.length === 0) {
            toast.error("No students marked.");
            return;
        }

        try {
            for (const student of relevantStudents) {
                const status = attendance[student.id];
                await addMiss({
                    studentId: student.id,
                    miss: status === "miss" ? "Missed class" : "Present",
                    date: new Date().toISOString(),
                }).unwrap();
            }
            toast.success("All attendance records sent to DB");
        } catch {
            toast.error("Error sending attendance records to DB");
        }
    };

    if (isLoading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-center text-red-500">Error loading students.</div>;

    return (
        <section className="px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10">
                Add Missed Class
            </h2>


            {!selectedGroup ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {groups.map((group) => (
                        <motion.div
                            key={group.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div
                                onClick={() => setSelectedGroup(group.id)}
                                className="cursor-pointer border p-6 rounded-lg text-center hover:shadow-md hover:scale-105 transition-all duration-300 dark:border-gray-700"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{group.name}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Back Button */}
                    <div className="flex justify-start">
                        <button
                            onClick={() => setSelectedGroup("")}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md mb-4 shadow hover:shadow-md transition"
                        >
                            <ArrowLeft size={18} />
                            Back to Teachers
                        </button>
                    </div>

                    <div className="flex justify-between flex-wrap gap-4 items-center">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Students in {selectedGroup}
                        </h3>
                        <div className="space-x-2">
                            <button onClick={() => markAll("present")} className="px-4 py-2 bg-green-500 text-white rounded-md">
                                All Present
                            </button>
                            <button onClick={() => markAll("miss")} className="px-4 py-2 bg-red-500 text-white rounded-md">
                                All Miss
                            </button>
                            <button onClick={handleSendAllAttendance} className="px-4 py-2 bg-blue-500 text-white rounded-md">
                                Send All Attendance
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {students.map((student) => (
                            <div key={student.id} className="border rounded-lg p-4 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-800 dark:text-white font-medium">{student.name}</span>
                                    <div className="space-x-2 flex items-center">
                                        <button
                                            onClick={() => markSingle(student.id, "present")}
                                            className={`p-2 rounded-full ${
                                                attendance[student.id] === "present"
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-200 dark:bg-gray-700"
                                            }`}
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => markSingle(student.id, "miss")}
                                            className={`p-2 rounded-full ${
                                                attendance[student.id] === "miss"
                                                    ? "bg-red-500 text-white"
                                                    : "bg-gray-200 dark:bg-gray-700"
                                            }`}
                                        >
                                            <X size={16} />
                                        </button>
                                        <button
                                            onClick={() => setModalStudent(student)}
                                            className="px-2 py-1 bg-purple-500 text-white rounded-md text-sm"
                                        >
                                            Misses: {getMissCount(student.id)}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            {modalStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                            {modalStudent.name}'s Missed Dates
                        </h3>
                        <ul className="space-y-1 max-h-60 overflow-y-auto text-gray-700 dark:text-gray-200">
                            {getMissDates(modalStudent.id).length > 0 ? (
                                getMissDates(modalStudent.id).map((date, i) => (
                                    <li key={i} className="border-b pb-1 dark:border-gray-700">
                                        {date}
                                    </li>
                                ))
                            ) : (
                                <li>No missed classes</li>
                            )}
                        </ul>
                        <button
                            onClick={() => setModalStudent(null)}
                            className="mt-4 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center mt-4">
                <Link
                    to="/user/teacher"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md shadow hover:shadow-md transition duration-200"
                >
                    <ArrowLeft size={18} />
                    Back to Main Page
                </Link>
            </div>

        </section>
    );
};

export default MissesT;
