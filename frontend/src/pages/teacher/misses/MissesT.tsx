import {useState} from "react";
import toast from "react-hot-toast";
import {ArrowLeft} from "lucide-react";
import {useGetAllUsersQuery} from "../../../services/userApi";
import {useAddMissMutation, useGetAllMissesQuery, useUpdateMissMutation} from "../../../services/missesApi";
import {Link} from "react-router-dom";
import GroupSelector from "./components/GroupSelector";
import StudentList from "./components/StudentList";
import MissDetailsModal from "./components/MissDetailsModal";
import ActionButtons from "./components/ActionButtons";

const MissesT = () => {
    const [selectedGroup, setSelectedGroup] = useState("");
    const [attendance, setAttendance] = useState<Record<string, number>>({});
    const [modalStudent, setModalStudent] = useState<{ id: string; name: string } | null>(null);
    const [editingMiss, setEditingMiss] = useState<{ missId: string; hoursPresent: number } | null>(null);
    const [isSending, setIsSending] = useState(false);
    const TOTAL_HOURS = 6;
    const MAX_MISS_HOURS = 24;

    const {data: usersData, isLoading, error} = useGetAllUsersQuery({role: "student"});
    const {data: missesData, refetch: refetchMisses} = useGetAllMissesQuery({page: 1, limit: 1000});
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
        setAttendance((prev) => ({...prev, [studentId]: hours}));
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
            const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
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
                Add Attendance
            </h2>

            {!selectedGroup ? (
                <GroupSelector groups={groups} onSelectGroup={setSelectedGroup}/>
            ) : (
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex justify-start">
                        <button
                            onClick={() => setSelectedGroup("")}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md mb-4 shadow hover:shadow-md transition"
                        >
                            <ArrowLeft size={18}/>
                            Back to Groups
                        </button>
                    </div>

                    <div className="flex justify-between flex-wrap gap-4 items-center">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Students in {selectedGroup}
                        </h3>
                        <ActionButtons
                            markAll={markAll}
                            handleSendAllAttendance={handleSendAllAttendance}
                            handleExportCSV={handleExportCSV}
                            isSending={isSending}
                            TOTAL_HOURS={TOTAL_HOURS}
                        />
                    </div>

                    <StudentList
                        students={students}
                        attendance={attendance}
                        markSingle={markSingle}
                        getMissHours={getMissHours}
                        setModalStudent={setModalStudent}
                        TOTAL_HOURS={TOTAL_HOURS}
                        MAX_MISS_HOURS={MAX_MISS_HOURS}
                    />
                </div>
            )}

            <MissDetailsModal
                modalStudent={modalStudent}
                getMissHours={getMissHours}
                getMissDetails={getMissDetails}
                editingMiss={editingMiss}
                setEditingMiss={setEditingMiss}
                handleSaveEdit={handleSaveEdit}
                setModalStudent={setModalStudent}
                TOTAL_HOURS={TOTAL_HOURS}
                MAX_MISS_HOURS={MAX_MISS_HOURS}
            />

            <div className="w-full flex justify-center mt-4">
                <Link
                    to="/user/teacher"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md shadow hover:shadow-md transition duration-200"
                >
                    <ArrowLeft size={18}/>
                    Back to Main Page
                </Link>
            </div>
        </section>
    );
};

export default MissesT;