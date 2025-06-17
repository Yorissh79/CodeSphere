import {Edit} from "lucide-react";

interface MissDetail {
    missId: string;
    date: string;
    hoursMissed: number;
    hoursPresent: number;
}

interface ModalStudent {
    id: string;
    name: string;
}

interface MissDetailsModalProps {
    modalStudent: ModalStudent | null;
    getMissHours: (studentId: string) => number;
    getMissDetails: (studentId: string) => MissDetail[];
    editingMiss: { missId: string; hoursPresent: number } | null;
    setEditingMiss: (miss: { missId: string; hoursPresent: number } | null) => void;
    handleSaveEdit: (missId: string, hoursPresent: number) => void;
    setModalStudent: (student: ModalStudent | null) => void;
    TOTAL_HOURS: number;
    MAX_MISS_HOURS: number;
}

const MissDetailsModal = ({
                              modalStudent,
                              getMissHours,
                              getMissDetails,
                              editingMiss,
                              setEditingMiss,
                              handleSaveEdit,
                              setModalStudent,
                              TOTAL_HOURS,
                              MAX_MISS_HOURS,
                          }: MissDetailsModalProps) => {
    if (!modalStudent) return null;

    return (
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
                            <li key={i}
                                className="border-b pb-2 dark:border-gray-700 flex justify-between items-center">
                <span>
                  {detail.date}: {detail.hoursMissed} hours missed
                </span>
                                {editingMiss?.missId === detail.missId ? (
                                    <div className="flex items-center space-x-2">
                                        <select
                                            value={editingMiss.hoursPresent}
                                            onChange={(e) => setEditingMiss({
                                                ...editingMiss,
                                                hoursPresent: Number(e.target.value)
                                            })}
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
                                        onClick={() => setEditingMiss({
                                            missId: detail.missId,
                                            hoursPresent: detail.hoursPresent
                                        })}
                                        className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm flex items-center gap-1"
                                    >
                                        <Edit size={14}/>
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
    );
};

export default MissDetailsModal;