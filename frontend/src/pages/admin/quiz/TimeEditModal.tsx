import { useState } from 'react';
import { X, Clock, Check } from 'lucide-react';

interface TimeEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTime: number;
    onSave: (newTime: number) => void;
}

const TimeEditModal: React.FC<TimeEditModalProps> = ({ isOpen, onClose, currentTime, onSave }) => {
    const [newTime, setNewTime] = useState(currentTime);

    const handleSave = () => {
        if (newTime && newTime > 0 && newTime <= 300) {
            onSave(newTime);
            onClose();
        }
    };

    const handleClose = () => {
        setNewTime(currentTime);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 transform transition-all duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Edit Time Limit
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="timeInput" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Time Limit (minutes)
                        </label>
                        <input
                            id="timeInput"
                            type="number"
                            min="1"
                            max="300"
                            value={newTime}
                            onChange={(e) => setNewTime(parseInt(e.target.value) || 1)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white text-center text-lg font-medium"
                            placeholder="Enter time in minutes"
                            autoFocus
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                            Range: 1 - 300 minutes
                        </p>
                    </div>

                    {/* Quick Time Options */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Quick Options:
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                            {[15, 30, 45, 60].map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setNewTime(time)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                        newTime === time
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {time}m
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!newTime || newTime <= 0 || newTime > 300}
                        className="flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimeEditModal;