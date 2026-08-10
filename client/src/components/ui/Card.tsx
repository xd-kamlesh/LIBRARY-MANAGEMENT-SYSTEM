import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import './Card.css';

interface CardProps extends HTMLMotionProps<'div'> {
    variant?: 'flat' | 'elevated' | 'glass';
}

export const Card: React.FC<CardProps> = ({ className, variant = 'elevated', children, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
            className={clsx('card-base', `card-${variant}`, className)}
            {...props}
        >
            {children}
        </motion.div>
    );
};
