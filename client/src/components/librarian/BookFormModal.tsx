import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { createBook } from '../../api/bookService';
import '../../components/auth/AuthModal.css';

interface BookFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BookFormModal: React.FC<BookFormModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        title: '', description: '', isbn: '', publicationYear: '2026', language: 'English', shelfLocation: 'A-1', coverImage: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await createBook({
                title: formData.title,
                description: formData.description,
                isbn: formData.isbn,
                publicationYear: parseInt(formData.publicationYear) || 2026,
                language: formData.language,
                shelfLocation: formData.shelfLocation,
                coverImage: formData.coverImage
            });
            onClose();
        } catch (error) {
            console.error("Failed to create book", error);
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
                                <h2>Add / Edit Book</h2>
                                <p>Manage catalog inventory bounds</p>
                            </div>
                            <form className="modal-form" onSubmit={handleSubmit}>
                                <Input label="Book Title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                <Input label="Description" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <Input label="ISBN" required value={formData.isbn} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} />
                                    <Input label="Publication Year" type="number" required value={formData.publicationYear} onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <Input label="Language" required value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} />
                                    <Input label="Shelf Location" required value={formData.shelfLocation} onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })} />
                                </div>
                                <Input label="Cover Image URL" value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })} placeholder="https://..." />

                                <Button type="submit" variant="primary" size="lg" style={{ marginTop: '1rem', opacity: isLoading ? 0.7 : 1 }} disabled={isLoading}>
                                    {isLoading ? <span className="center-flex"><Loader2 className="spinner" size={20} style={{ marginRight: '8px' }} /> Saving...</span> : 'Save Asset'}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
