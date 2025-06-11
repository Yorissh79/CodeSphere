import { useEffect, useState } from 'react';
import {
    useGetAllUsersQuery,
    useUpdateUserMutation,
    useDeleteUserMutation
} from "../../../services/userApi.ts";

interface User {
    _id: string;
    name: string;
    surname: string;
    email: string;
    group: string;
    role: string;
}

const Students = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const queryParams: { name?: string; group?: string } = {};
    if (searchQuery) queryParams.name = searchQuery;
    if (selectedGroup) queryParams.group = selectedGroup;

    const { data: users, isLoading, error, refetch } = useGetAllUsersQuery(queryParams);
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Refetch when searchQuery or selectedGroup changes
    useEffect(() => {
        refetch();
    }, [searchQuery, selectedGroup, refetch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGroup(e.target.value);
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        setFormData({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            await updateUser({ _id: selectedUser._id, ...formData }).unwrap();
            closeModal();
            refetch();
        } catch (err) {
            console.error('Failed to update user:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            await deleteUser(id).unwrap();
            refetch();
        } catch (err) {
            console.error('Failed to delete user:', err);
        }
    };

    const groups: any[] = [...new Set(users ? users.map((user: { group: string; }) => user.group).filter(Boolean) : [])];

    if (isLoading) return <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error fetching users</div>;

    return (
        <div className="p-6 bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-indigo-700 dark:text-indigo-400">All Students</h1>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full sm:w-1/2 px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
                <select
                    value={selectedGroup}
                    onChange={handleGroupChange}
                    className="w-full sm:w-1/3 px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                >
                    <option value="">All Groups</option>
                    {groups.map((group) => (
                        <option key={String(Math.random() * 20)} value={String(group)}>
                            {group}
                        </option>
                    ))}
                </select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-lg shadow border dark:border-gray-700">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Surname</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Group</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users?.map((user: User) => (
                        <tr key={user._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <td className="px-4 py-3">{user.name}</td>
                            <td className="px-4 py-3">{user.surname}</td>
                            <td className="px-4 py-3">{user.email}</td>
                            <td className="px-4 py-3">{user.group}</td>
                            <td className="px-4 py-3 capitalize">{user.role}</td>
                            <td className="px-4 py-3 text-center space-x-2">
                                <button
                                    onClick={() => openEditModal(user)}
                                    className="px-3 py-1 text-sm rounded bg-indigo-600 hover:bg-indigo-700 text-white transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(user._id)}
                                    disabled={isDeleting}
                                    className="px-3 py-1 text-sm rounded bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {users?.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-400">
                                No users found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit User</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Surname</label>
                                <input
                                    type="text"
                                    name="surname"
                                    value={formData.surname || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group</label>
                                <input
                                    type="text"
                                    name="group"
                                    value={formData.group || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                <select
                                    name="role"
                                    value={formData.role || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                    required
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-4 py-2 text-sm rounded bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50"
                                >
                                    {isUpdating ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
