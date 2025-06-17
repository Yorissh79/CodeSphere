import {motion} from "framer-motion";

interface Group {
    id: string;
    name: string;
}

interface GroupSelectorProps {
    groups: Group[];
    onSelectGroup: (groupId: string) => void;
}

const GroupSelector = ({groups, onSelectGroup}: GroupSelectorProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {groups.map((group) => (
                <motion.div
                    key={group.id}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3}}
                >
                    <div
                        onClick={() => onSelectGroup(group.id)}
                        className="cursor-pointer border p-6 rounded-lg text-center hover:shadow-md hover:scale-105 transition-all duration-300 dark:border-gray-700"
                    >
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{group.name}</h3>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default GroupSelector;