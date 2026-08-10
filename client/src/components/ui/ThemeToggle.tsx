import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 9999,
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--bg-glass-strong)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-lg)',
                backdropFilter: 'blur(12px)',
                cursor: 'pointer'
            }}
            aria-label="Toggle Theme"
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </motion.div>
        </motion.button>
    );
};
