import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useGetAllUsersQuery } from "../../../services/userApi";
import { useAddMissMutation, useGetAllMissesQuery } from "../../../services/missesApi";
import { Link } from "react-router-dom";

const MissesT = () => {
    const [selectedGroup, setSelectedGroup] = useState("");
    const [attendance, setAttendance] = useState<Record<string, number>>({});
    const [modalStudent, setModalStudent] = useState<{ id: string; name: string } | null>(null);
    const TOTAL_HOURS = 6;
    const MAX_MISS_HOURS = 24;

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

    const getMissHours = (studentId: string) => {
        const totalMissHours = allMisses
            .filter((m) => m.student._id === studentId && m.miss !== undefined)
            .reduce((sum, m) => {
                const missHours = TOTAL_HOURS - (m.miss || 0); // 6 hours means 0 missed, 5 hours means 1 missed, etc.
                return sum + missHours;
            }, 0);
        return Math.min(totalMissHours, MAX_MISS_HOURS); // Cap at 24 hours
    };

    const getMissDetails = (studentId: string) =>
        allMisses
            .filter((m) => m.student._id === studentId && m.miss !== undefined)
            .map((m) => ({
                date: new Date(m.date).toLocaleDateString(),
                hoursMissed: TOTAL_HOURS - (m.miss || 0), // Convert to missed hours
            }))
            .filter((detail) => detail.hoursMissed > 0); // Only show records with actual misses

    const markAll = (hours: number) => {
        const updated = students.reduce((acc, s) => {
            acc[s.id] = hours;
            return acc;
        }, {} as Record<string, number>);
        setAttendance(updated);
        toast.success(`All students marked as ${hours} hours present`);
    };

    const markSingle = (studentId: string, hours: number) => {
        setAttendance((prev) => ({ ...prev, [studentId]: hours }));
        const name = students.find((s) => s.id === studentId)?.name;
        toast.success(`${name} marked as ${hours} hours present`);
    };

    const handleSendAllAttendance = async () => {
        const relevantStudents = students.filter((s) => attendance[s.id] !== undefined);

        if (relevantStudents.length === 0) {
            toast.error("No students marked.");
            return;
        }

        try {
            for (const student of relevantStudents) {
                const hoursPresent = attendance[student.id];
                await addMiss({
                    studentId: student.id,
                    miss: hoursPresent, // Store hours present (6 = present, 0 = full miss)
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
                Add Attendance
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
                    <div className="flex justify-start">
                        <button
                            onClick={() => setSelectedGroup("")}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md mb-4 shadow hover:shadow-md transition"
                        >
                            <ArrowLeft size={18} />
                            Back to Groups
                        </button>
                    </div>

                    <div className="flex justify-between flex-wrap gap-4 items-center">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Students in {selectedGroup}
                        </h3>
                        <div className="space-x-2">
                            <button onClick={() => markAll(TOTAL_HOURS)} className="px-4 py-2 bg-green-500 text-white rounded-md">
                                All Present (6h)
                            </button>
                            <button onClick={() => markAll(0)} className="px-4 py-2 bg-red-500 text-white rounded-md">
                                All Miss (0h)
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
                                            className="px-2 py-1 bg-purple-500 text-white rounded-md text-sm"
                                        >
                                            Misses: {getMissHours(student.id)}/{MAX_MISS_HOURS}h
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {modalStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                            {modalStudent.name}'s Missed Hours
                        </h3>
                        <p className="text-gray-700 dark:text-gray-200 mb-2">
                            Total Missed: {getMissHours(modalStudent.id)}/{MAX_MISS_HOURS} hours
                        </p>
                        <ul className="space-y-1 max-h-60 overflow-y-auto text-gray-700 dark:text-gray-200">
                            {getMissDetails(modalStudent.id).length > 0 ? (
                                getMissDetails(modalStudent.id).map((detail, i) => (
                                    <li key={i} className="border-b pb-1 dark:border-gray-700">
                                        {detail.date}: {detail.hoursMissed} hours missed
                                    </li>
                                ))
                            ) : (
                                <li>No missed hours</li>
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