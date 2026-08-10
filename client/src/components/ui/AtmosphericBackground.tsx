import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AtmosphericBackground.css';

interface AtmosphericBackgroundProps {
    activeTab: 'home' | 'explore' | 'library' | 'profile';
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({ activeTab }) => {

    // Determine gradient overrides based on the active tab for subtle mood changes
    const getMoodColors = () => {
        switch (activeTab) {
            case 'explore':
                return { orb1: '#4c1d95', orb2: '#0f766e', orb3: '#1e3a8a' }; // Mysterious teal/purple
            case 'library':
                return { orb1: '#065f46', orb2: '#b45309', orb3: '#1d4ed8' }; // Earthy green/amber
            case 'profile':
                return { orb1: '#831843', orb2: '#431407', orb3: '#be185d' }; // Warm reds
            case 'home':
            default:
                return { orb1: '#4c1d95', orb2: '#1d4ed8', orb3: '#831843' }; // Default vibrant
        }
    };

    const colors = getMoodColors();

    return (
        <div className="atmospheric-bg-container">
            <div className="atmospheric-bg-glow" />

            <AnimatePresence>
                <motion.div
                    key={`orb1-${activeTab}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    className="orb orb-1"
                    style={{ background: `linear-gradient(to right, ${colors.orb1}, #7c3aed)` }}
                />
            </AnimatePresence>

            <AnimatePresence>
                <motion.div
                    key={`orb2-${activeTab}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    className="orb orb-2"
                    style={{ background: `linear-gradient(to right, ${colors.orb2}, #3b82f6)` }}
                />
            </AnimatePresence>

            <AnimatePresence>
                <motion.div
                    key={`orb3-${activeTab}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    className="orb orb-3"
                    style={{ background: `linear-gradient(to right, ${colors.orb3}, #be185d)` }}
                />
            </AnimatePresence>

            <div className="noise-overlay" />
        </div>
    );
};
