import React, {useState} from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import {Bar, Line, Doughnut} from 'react-chartjs-2';
import domtoimage from 'dom-to-image-more';
import {useGetAllUsersQuery} from '../../../services/userApi';
import {useGetAllTeachersQuery} from '../../../services/teacherApi';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);
const Charts: React.FC = () => {
    const {data: users = [], isLoading, isError} = useGetAllUsersQuery(undefined, {
        pollingInterval: 10000,
    });

    const {data: teachers = []} = useGetAllTeachersQuery({});
    const [chartType, setChartType] = useState<'bar' | 'doughnut' | 'line'>('bar');
    const [selectedTeacher, setSelectedTeacher] = useState<string>('All');
    const [showPercentage, setShowPercentage] = useState(false);

    const filteredUsers = selectedTeacher === 'All'
        ? users
        : users.filter((u: any) => u.teacher === selectedTeacher);

    const groupCounts: Record<string, number> = {};
    filteredUsers.forEach((user: any) => {
        const groupName = user.group || 'Unassigned';
        groupCounts[groupName] = (groupCounts[groupName] || 0) + 1;
    });

    const total = Object.values(groupCounts).reduce((a, b) => a + b, 0);
    const labels = Object.keys(groupCounts);
    const dataValues = Object.values(groupCounts);
    const percentages = dataValues.map(val => parseFloat(((val / total) * 100).toFixed(1)));

    const datasetColors = [
        '#3b82f6', '#10b981', '#ef4444', '#eab308',
        '#a855f7', '#f43f5e', '#fbbf24', '#6366f1'
    ];

    const chartData = {
        labels,
        datasets: [
            {
                label: showPercentage ? 'Student %' : 'Number of Students',
                data: showPercentage ? percentages : dataValues,
                backgroundColor: datasetColors,
                borderColor: '#ffffff',
                borderWidth: 1,
            },
        ],
    };

    const isDark = document.documentElement.classList.contains('dark');

    const downloadChartAsImage = async () => {
        const node = document.getElementById('chart-container');
        if (!node) return;

        try {
            const dataUrl = await domtoimage.toPng(node, {
                style: {
                    background: isDark ? '#111827' : '#ffffff',
                    color: isDark ? '#f3f4f6' : '#1f2937',
                },
                filter: (node: Element) => {
                    const style = window.getComputedStyle(node);
                    return !(style && style.display === 'none');
                },
            });

            const link = document.createElement('a');
            link.download = 'chart.png';
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export failed:', err);
        }
    };

    const ChartComponent = {
        bar: Bar,
        doughnut: Doughnut,
        line: Line,
    }[chartType];

    if (isLoading) return <div className="p-4 text-gray-700 dark:text-gray-300">Loading chart...</div>;
    if (isError) return <div className="p-4 text-red-500">Error loading chart data.</div>;

    return (
        <div className="p-6 w-full mx-auto text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-center">Student Group Distribution</h2>

            <div className="flex flex-wrap justify-center gap-4 mb-6">
                <select
                    className="px-4 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                    <option value="All">All Teachers</option>
                    {teachers.map((teacher: any) => (
                        <option
                            key={teacher._id}
                            value={`${teacher.name} ${teacher.surname}`}
                        >
                            {teacher.name} {teacher.surname}
                        </option>
                    ))}
                </select>

                <select
                    className="px-4 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as any)}
                >
                    <option value="bar">Bar</option>
                    <option value="doughnut">Doughnut</option>
                    <option value="line">Line</option>
                </select>

                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    onClick={() => setShowPercentage(!showPercentage)}
                >
                    {showPercentage ? "Show Count" : "Show %"}
                </button>

                <button
                    onClick={downloadChartAsImage}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                    Export as PNG
                </button>
            </div>

            <div
                id="chart-container"
                className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
                <ChartComponent data={chartData}/>
            </div>
        </div>
    );
};

export default Charts;
