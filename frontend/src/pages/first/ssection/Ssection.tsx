import { CodeBracketIcon, UserIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import FeatureCard from "./components/futurecard/FeatureCard.tsx";

function Ssection() {
    return (
        <section className="py-16">
            <div className="flex flex-col md:flex-row justify-around space-y-8 md:space-y-0 md:space-x-8">
                <FeatureCard
                    icon={<CodeBracketIcon className="h-8 w-8 text-white" />}
                    title="LIVE CODE EDITOR"
                    description="WRITE AND EXECUTE CODE IN REAL TIME"
                />
                <FeatureCard
                    icon={<UserIcon className="h-8 w-8 text-white" />}
                    title="TEACHER DASHBOARD"
                    description="MANAGE CLASSES AND STUDENT PROGRESS"
                />
                <FeatureCard
                    icon={<ChatBubbleLeftIcon className="h-8 w-8 text-white" />}
                    title="MESSAGING SYSTEM"
                    description="COMMUNICATE WITH STUDENTS AND TEACHERS"
                />
            </div>
        </section>
    );
}

export default Ssection;