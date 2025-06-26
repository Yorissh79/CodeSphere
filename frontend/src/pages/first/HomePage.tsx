import type {FC} from 'react';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import CodePreviewSection from './components/CodePreviewSection';
import BenefitsSection from './components/BenefitsSection';
import TestimonialsSection from './components/TestimonialsSection';
import CTASection from './components/CTASection';

const HomePage: FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 font-['Space_Mono'] transition-colors duration-300">
            <HeroSection/>
            <FeaturesSection/>
            <CodePreviewSection/>
            <BenefitsSection/>
            <TestimonialsSection/>
            <CTASection/>
        </div>
    );
};

export default HomePage;