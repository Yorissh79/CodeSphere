import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, Download, Edit } from "lucide-react";
import { useGetAllUsersQuery } from "../../../services/userApi";
import { useAddMissMutation, useGetAllMissesQuery, useUpdateMissMutation } from "../../../services/missesApi";
import { Link } from "react-router-dom";

const MissesA = () => {
    const [selectedGroup, setSelectedGroup] = useState("");
    const [attendance, setAttendance] = useState<Record<string, number>>({});
    const [modalStudent, setModalStudent] = useState<{ id: string; name: string } | null>(null);
    const [editingMiss, setEditingMiss] = useState<{ missId: string; hoursPresent: number } | null>(null);
    const [isSending, setIsSending] = useState(false);
    const TOTAL_HOURS = 6;
    const MAX_MISS_HOURS = 24;

    const { data: usersData, isLoading, error } = useGetAllUsersQuery({ role: "student" });
    const { data: missesData, refetch: refetchMisses } = useGetAllMissesQuery({ page: 1, limit: 1000 });
    const [addMiss] = useAddMissMutation();
    const [updateMiss] = useUpdateMissMutation();

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
                const missHours = TOTAL_HOURS - (m.miss || 0);
                return sum + missHours;
            }, 0);
        return Math.min(totalMissHours, MAX_MISS_HOURS);
    };

    const getMissDetails = (studentId: string) =>
        allMisses
            .filter((m) => m.student._id === studentId && m.miss !== undefined)
            .map((m) => ({
                missId: m._id,
                date: new Date(m.date).toLocaleDateString(),
                hoursMissed: TOTAL_HOURS - (m.miss || 0),
                hoursPresent: m.miss,
            }))
            .filter((detail) => detail.hoursMissed > 0);

    const markAll = (hours: number) => {
        const updated = students.reduce((acc, s) => {
            if (attendance[s.id] === undefined) {
                acc[s.id] = hours;
            } else {
                acc[s.id] = attendance[s.id];
            }
            return acc;
        }, {} as Record<string, number>);
        setAttendance(updated);
        toast.success(`Students without selected hours marked as ${hours} hours present`);
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

        setIsSending(true);
        try {
            for (const student of relevantStudents) {
                const hoursPresent = attendance[student.id];
                await addMiss({
                    studentId: student.id,
                    miss: hoursPresent,
                    date: new Date().toISOString(),
                }).unwrap();
            }
            toast.success("All attendance records sent to DB");
            setAttendance({});
            refetchMisses();
        } catch {
            toast.error("Error sending attendance records to DB");
        } finally {
            setIsSending(false);
        }
    };

    const handleExportCSV = () => {
        if (!selectedGroup || students.length === 0) {
            toast.error("Select a group to export data.");
            return;
        }

        const csvRows = [
            ["Student Name", "Total Missed Hours", "Miss Details"],
            ...students.map((student) => [
                student.name,
                getMissHours(student.id).toString(),
                getMissDetails(student.id)
                    .map((detail) => `${detail.date}: ${detail.hoursMissed} hours`)
                    .join("; ") || "No misses",
            ]),
        ];

        try {
            const csvContent = csvRows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `misses_${selectedGroup}_${new Date().toISOString().split("T")[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("CSV exported successfully");
        } catch {
            toast.error("Error exporting CSV");
        }
    };

    const handleEditMiss = (missId: string, hoursPresent: number) => {
        setEditingMiss({ missId, hoursPresent });
    };

    const handleSaveEdit = async (missId: string, hoursPresent: number) => {
        try {
            await updateMiss({
                missId: missId,
                data: {
                    miss: hoursPresent,
                    date: new Date().toISOString(),
                },
            }).unwrap();
            toast.success("Miss record updated successfully");
            refetchMisses();
            setEditingMiss(null);
        } catch {
            toast.error("Error updating miss record");
        }
    };

    if (isLoading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-center text-red-500">Error loading students.</div>;

    return (
        <section className="px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10">
                Manage Attendance (Admin)
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
                        <div className="space-x-2 space-y-2">
                            <button onClick={() => markAll(TOTAL_HOURS)} className="px-4 py-2 bg-green-500 text-white rounded-md">
                                All Present (6h)
                            </button>
                            <button onClick={() => markAll(0)} className="px-4 py-2 bg-red-500 text-white rounded-md">
                                All Miss (0h)
                            </button>
                            <button
                                onClick={handleSendAllAttendance}
                                disabled={isSending}
                                className={`px-4 py-2 rounded-md text-white ${isSending ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500'}`}
                            >
                                {isSending ? 'Sending...' : 'Send All Attendance'}
                            </button>
                            <button onClick={handleExportCSV} className="px-4 py-2 bg-purple-500 text-white rounded-md flex items-center gap-2">
                                <Download size={18} />
                                Export CSV
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
                        <ul className="space-y-2 max-h-60 overflow-y-auto text-gray-700 dark:text-gray-200">
                            {getMissDetails(modalStudent.id).length > 0 ? (
                                getMissDetails(modalStudent.id).map((detail, i) => (
                                    <li key={i} className="border-b pb-2 dark:border-gray-700 flex justify-between items-center">
                                        <span>
                                            {detail.date}: {detail.hoursMissed} hours missed
                                        </span>
                                        {editingMiss?.missId === detail.missId ? (
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={editingMiss.hoursPresent}
                                                    onChange={(e) => setEditingMiss({ ...editingMiss, hoursPresent: Number(e.target.value) })}
                                                    className="p-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                                                >
                                                    {[...Array(TOTAL_HOURS + 1)].map((_, j) => (
                                                        <option key={j} value={j}>{j} hours present</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleSaveEdit(detail.missId, editingMiss.hoursPresent)}
                                                    className="px-2 py-1 bg-green-500 text-white rounded-md text-sm"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingMiss(null)}
                                                    className="px-2 py-1 bg-red-500 text-white rounded-md text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEditMiss(detail.missId, detail.hoursPresent)}
                                                className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm flex items-center gap-1"
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </button>
                                        )}
                                    </li>
                                ))
                            ) : (
                                <li>No missed hours</li>
                            )}
                        </ul>
                        <button
                            onClick={() => {
                                setModalStudent(null);
                                setEditingMiss(null);
                            }}
                            className="mt-4 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center mt-4">
                <Link
                    to="/user/admin"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md shadow hover:shadow-md transition duration-200"
                >
                    <ArrowLeft size={18} />
                    Back to Admin Dashboard
                </Link>
            </div>
        </section>
    );
};

export default MissesA;