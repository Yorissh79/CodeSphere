import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Charts: React.FC = () => {
    const data = {
        labels: ['Group A', 'Group B', 'Group C', 'Group D'],
        datasets: [
            {
                label: 'Number of Students',
                data: [30, 45, 25, 50],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Student Distribution by Group',
            },
        },
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Student Group Distribution</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

export default Charts;