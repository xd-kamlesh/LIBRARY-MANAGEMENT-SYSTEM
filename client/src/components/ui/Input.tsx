import React from 'react';
import clsx from 'clsx';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="input-group">
                {label && <label className="input-label">{label}</label>}
                <input
                    ref={ref}
                    className={clsx('input-base', error && 'input-error', className)}
                    {...props}
                />
                {error && <span className="input-error-msg">{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
