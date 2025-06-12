import { useState, useEffect, type JSXElementConstructor, type ReactElement, type ReactNode, type ReactPortal} from "react";
import {Pencil, Download} from "lucide-react";
import {
    useGetAllGroupsQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeleteGroupMutation,
} from "../../../services/groupApi";
import {useGetAllTeachersQuery} from "../../../services/teacherApi";
import {useGetAllUsersQuery} from "../../../services/userApi";

interface Group {
    _id: string;
    group: string;
    teachers: string[];
}

interface Teacher {
    _id: string;
    name: string;
    surname: string;
}

interface User {
    _id: string;
    group: string;
}


const Groups = () => {
    const queryParams: { teachers?: string; group?: string } = {};
    const {data: groups = [], refetch} = useGetAllGroupsQuery(queryParams);
    const {data: teachers = []} = useGetAllTeachersQuery({});
    const {data: users = []} = useGetAllUsersQuery({role: "student"});
    const uniqueStudentGroups: any = Array.from(
        new Set(users.map((user: User) => user.group.trim().toLowerCase()).filter(Boolean))
    );
    const existingGroupNames = groups.map((g: Group) => g.group);
    const availableGroups = uniqueStudentGroups.filter((name: any) => !existingGroupNames.includes(name));

    const [createGroup] = useCreateGroupMutation();
    const [updateGroup] = useUpdateGroupMutation();
    const [deleteGroup] = useDeleteGroupMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [formData, setFormData] = useState<{ group: string; teachers: string[] }>({
        group: "",
        teachers: [],
    });

    console.log(groups)

    const [currentPage, setCurrentPage] = useState(1);
    const groupsPerPage = 5;

    const getStudentCount = (groupName: string) =>
        users.filter((user: User) => user.group === groupName).length;

    const openModal = (group?: Group) => {
        setEditingGroup(group || null);
        setFormData(
            group ? {group: group.group, teachers: group.teachers} : {group: "", teachers: []}
        );
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingGroup(null);
        setFormData({group: "", teachers: []});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            editingGroup
                ? await updateGroup({_id: editingGroup._id, ...formData}).unwrap()
                : await createGroup(formData).unwrap();
            refetch();
            closeModal();
        } catch (error) {
            console.error("Error saving group:", error);
        }
    };

    const handleExportCSV = () => {
        const csvRows = [
            ["Group", "Students", "Teachers"],
            ...groups.map((group: Group) => [
                group.group,
                getStudentCount(group.group).toString(),
                Array.isArray(group.teachers) ? group.teachers.join(" / ") : "",
            ]),
        ];

        const blob = new Blob([csvRows.map((e) => e.join(",")).join("\n")], {
            type: "text/csv",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "groups.csv";
        a.click();
    };

    // Pagination
    const indexOfLast = currentPage * groupsPerPage;
    const indexOfFirst = indexOfLast - groupsPerPage;
    const currentGroups = groups.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(groups.length / groupsPerPage);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return (
        <div className="p-6 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Groups</h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition"
                    >
                        <Download className="w-4 h-4"/>
                        Export CSV
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
                    >
                        + Create Group
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-gray-50 dark:bg-gray-800">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Group</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Students</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Teachers</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentGroups.map((group: Group) => (
                        <tr key={group._id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <td className="px-4 py-3">{group.group}</td>
                            <td className="px-4 py-3">{getStudentCount(group.group)}</td>
                            <td className="px-4 py-3">
                                {group.teachers && group.teachers.join(", ")}
                            </td>

                            <td className="px-4 py-3 flex gap-2">
                                <button
                                    onClick={() => openModal(group)}
                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 text-black rounded transition"
                                >
                                    <Pencil className="w-4 h-4"/> Edit
                                </button>
                                <button
                                    title={
                                        getStudentCount(group.group) > 0
                                            ? "Group has students. Cannot delete."
                                            : ""
                                    }
                                    onClick={async () => {
                                        if (confirm(`Are you sure you want to delete "${group.group}"?`)) {
                                            try {
                                                await deleteGroup(group._id).unwrap();
                                                refetch();
                                            } catch (err) {
                                                console.error("Delete failed:", err);
                                            }
                                        }
                                    }}
                                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition ${
                                        "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                                    }`}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {groups.length === 0 && (
                        <tr>
                            <td colSpan={4} className="text-center px-4 py-6 text-gray-500 dark:text-gray-400">
                                No groups found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {groups.length > groupsPerPage && (
                <div className="flex justify-center mt-6 gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 rounded ${
                                currentPage === i + 1
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div
                    tabIndex={-1}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onKeyDown={(e) => e.key === "Escape" && closeModal()}
                >
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold mb-4">
                            {editingGroup ? "Edit Group" : "Create Group"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Group Name</label>
                                <select
                                    value={formData.group}
                                    onChange={(e) => setFormData({...formData, group: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    required
                                >
                                    <option value="" disabled>Select a group name</option>
                                    {(editingGroup ? uniqueStudentGroups : availableGroups).map((groupName: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined) => (
                                        <option key={String(Math.random() * 20)} value={String(groupName)}>
                                            {groupName}
                                        </option>
                                    ))}
                                </select>

                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Teachers</label>
                                <select
                                    multiple
                                    value={formData.teachers}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            teachers: Array.from(e.target.selectedOptions, (option) => option.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                >
                                    {teachers.map((teacher: Teacher) => {
                                        const fullName = `${teacher.name} ${teacher.surname}`;
                                        return (
                                            <option key={teacher._id} value={fullName}>
                                                {fullName}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                                >
                                    {editingGroup ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;
