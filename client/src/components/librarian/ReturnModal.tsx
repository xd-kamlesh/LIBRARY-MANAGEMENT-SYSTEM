import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { returnBook } from '../../api/transactionService';
import '../../components/auth/AuthModal.css';

interface ReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({ isOpen, onClose }) => {
    const [transactionId, setTransactionId] = useState('');
    const [fine, setFine] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleScan = async () => {
        if (transactionId.trim() !== '') {
            try {
                setIsLoading(true);
                const data = await returnBook(transactionId.trim());
                if (data.fineAmount > 0) {
                    setFine(data.fineAmount);
                } else {
                    onClose(); // Automatically close if no fine was incurred
                }
            } catch (error) {
                console.error("Failed to return book", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="modal-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                    <div className="modal-container">
                        <motion.div className="modal-content glass-panel" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}>
                            <button className="modal-close" onClick={onClose}><X size={20} /></button>
                            <div className="modal-header">
                                <h2>Process Return</h2>
                                <p>Scan Book Barcode or Input Transaction ID</p>
                            </div>
                            <div className="modal-form">
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <Input
                                        value={transactionId}
                                        onChange={e => setTransactionId(e.target.value)}
                                        placeholder="Transaction ID / Barcode"
                                    />
                                    <Button variant="outline" onClick={handleScan} disabled={isLoading}>
                                        {isLoading ? <Loader2 className="spinner" size={18} /> : <Search size={18} />}
                                    </Button>
                                </div>

                                {fine > 0 && (
                                    <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', marginTop: '1rem' }}>
                                        <h3 style={{ color: '#ef4444', margin: 0, fontSize: '1rem' }}>Overdue Fine Processed</h3>
                                        <p style={{ fontSize: '2rem', fontWeight: 600, color: '#b91c1c', margin: '0.5rem 0' }}>${fine}.00</p>
                                        <p style={{ fontSize: '0.875rem', color: '#7f1d1d' }}>Please collect fine before completing.</p>
                                    </div>
                                )}

                                <Button variant="primary" size="lg" style={{ marginTop: '1.5rem' }} onClick={onClose} disabled={isLoading && fine === 0}>
                                    {fine > 0 ? 'Collect Fine & Complete' : 'Close'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
