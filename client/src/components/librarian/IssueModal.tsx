import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { issueBook } from '../../api/transactionService';
import '../../components/auth/AuthModal.css'; // Reusing modal structural CSS

interface IssueModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({ studentId: '', bookId: '', expectedReturn: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await issueBook(formData.bookId, formData.studentId, formData.expectedReturn);
            onClose();
        } catch (error) {
            console.error("Failed to issue book", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="modal-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                    <div className="modal-container">
                        <motion.div className="modal-content glass-panel" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                            <button className="modal-close" onClick={onClose}><X size={20} /></button>
                            <div className="modal-header">
                                <h2>Issue Library Asset</h2>
                                <p>Register a new circulation process</p>
                            </div>
                            <form className="modal-form" onSubmit={handleSubmit}>
                                <Input label="Student Identifier" required value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} placeholder="e.g. S-2026-90" />
                                <Input label="Book ISBN / Asset ID" required value={formData.bookId} onChange={(e) => setFormData({ ...formData, bookId: e.target.value })} placeholder="e.g. B-001" />
                                <Input label="Expected Return Date" required type="date" value={formData.expectedReturn} onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })} />

                                <Button type="submit" variant="primary" size="lg" style={{ marginTop: '1rem', opacity: isLoading ? 0.7 : 1 }} disabled={isLoading}>
                                    {isLoading ? <span className="center-flex"><Loader2 className="spinner" size={20} style={{ marginRight: '8px' }} /> Processing...</span> : 'Confirm Issue'}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
