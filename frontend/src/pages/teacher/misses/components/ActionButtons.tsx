interface ActionButtonsProps {
    markAll: (hours: number) => void;
    handleSendAllAttendance: () => void;
    handleExportCSV: () => void;
    isSending: boolean;
    TOTAL_HOURS: number;
}

const ActionButtons = ({
                           markAll,
                           handleSendAllAttendance,
                           handleExportCSV,
                           isSending,
                           TOTAL_HOURS,
                       }: ActionButtonsProps) => {
    return (
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
            <button onClick={handleExportCSV}
                    className="px-4 py-2 bg-purple-500 text-white rounded-md flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4v-7"/>
                </svg>
                Export CSV
            </button>
        </div>
    );
};

export default ActionButtons;