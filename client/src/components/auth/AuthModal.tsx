import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api';
import './AuthModal.css';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        identifier: '',
        password: '',
        role: 'STUDENT'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';

            const payload = isLogin
                ? { identifier: formData.identifier, password: formData.password }
                : formData;

            const { data } = await apiClient.post(endpoint, payload);
            login(data);
            onClose();
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Authentication failed. Please check credentials.'); // MVP error handling
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <React.Fragment>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-backdrop"
                        onClick={onClose}
                    />
                    <div className="modal-container">
                        <motion.div
                            layoutId="auth-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="modal-content glass-panel"
                        >
                            <button className="modal-close" onClick={onClose}>
                                <X size={20} />
                            </button>

                            <div className="modal-header">
                                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                                <p>Unlock the digital library experience</p>
                            </div>

                            <form onSubmit={handleSubmit} className="modal-form">
                                {!isLogin && (
                                    <Input
                                        label="Full Name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                )}

                                <Input
                                    label="Identifier (PIN for Librarian, Mobile for Student)"
                                    placeholder="12345"
                                    value={formData.identifier}
                                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                    required
                                />

                                <Input
                                    type="password"
                                    label="Password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />

                                {!isLogin && (
                                    <div className="role-selector" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <div
                                            onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                                            style={{ flex: 1, padding: '1rem', textAlign: 'center', borderRadius: '12px', background: formData.role === 'STUDENT' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)', border: formData.role === 'STUDENT' ? '2px solid #3b82f6' : '1px solid transparent', cursor: 'pointer', transition: 'all 0.3s' }}
                                        >
                                            <h4 className="font-serif" style={{ margin: 0, color: formData.role === 'STUDENT' ? '#fff' : '#a1a1aa' }}>Student</h4>
                                        </div>
                                        <div
                                            onClick={() => setFormData({ ...formData, role: 'LIBRARIAN' })}
                                            style={{ flex: 1, padding: '1rem', textAlign: 'center', borderRadius: '12px', background: formData.role === 'LIBRARIAN' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)', border: formData.role === 'LIBRARIAN' ? '2px solid #8b5cf6' : '1px solid transparent', cursor: 'pointer', transition: 'all 0.3s' }}
                                        >
                                            <h4 className="font-serif" style={{ margin: 0, color: formData.role === 'LIBRARIAN' ? '#fff' : '#a1a1aa' }}>Librarian</h4>
                                        </div>
                                    </div>
                                )}

                                <Button type="submit" variant="primary" size="lg" isLoading={isLoading} style={{ marginTop: '1rem' }}>
                                    {isLogin ? 'Sign In' : 'Sign Up'}
                                </Button>
                            </form>

                            <div className="modal-footer">
                                <p>
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <button className="text-gradient" onClick={() => setIsLogin(!isLogin)}>
                                        {isLogin ? 'Sign up' : 'Sign in'}
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </React.Fragment>
            )}
        </AnimatePresence>
    );
};
