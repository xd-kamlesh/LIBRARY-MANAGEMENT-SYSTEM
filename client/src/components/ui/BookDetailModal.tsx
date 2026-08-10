import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, Globe, Hash, Check, MapPin, Share2, Bookmark, Building, Loader2, Info } from 'lucide-react';
import type { Book } from './BookCard';
import { RealBookCover } from './RealBookCover';
import { BookCarousel } from './BookCarousel';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import { getBookById, getRelatedBooks } from '../../api/bookService';
import { issueBook, reserveBook, toggleWishlist, trackBookView } from '../../api/transactionService';
import './BookDetailModal.css';

interface BookDetailModalProps {
    book: Book | null;
    onClose: () => void;
    onBookClick?: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book: initialBook, onClose, onBookClick }) => {
    const { user } = useAuth();
    const [book, setBook] = useState<Book | null>(initialBook);
    const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    const [status, setStatus] = useState({
        borrowing: false, reserving: false, wishlisting: false,
        borrowed: false, reserved: false, wishlisted: false, error: ''
    });

    // Fetch full details + related books + track view
    useEffect(() => {
        if (!initialBook) return;
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const [fullBook, related] = await Promise.all([
                    getBookById(initialBook.id),
                    getRelatedBooks(initialBook.id),
                ]);
                setBook(fullBook);
                setRelatedBooks(related);

                // Track view
                if (user) {
                    trackBookView(initialBook.id, user.id).catch(() => { });
                }
            } catch (err) {
                console.error('Failed to load book details', err);
                setBook(initialBook); // fallback to partial data
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [initialBook?.id]);

    const handleBorrow = async () => {
        if (!user || !book) return;
        try {
            setStatus(s => ({ ...s, borrowing: true, error: '' }));
            await issueBook(book.id, user.id);
            setStatus(s => ({ ...s, borrowing: false, borrowed: true }));
        } catch {
            setStatus(s => ({ ...s, borrowing: false, error: 'Failed: Out of stock or limit reached.' }));
        }
    };

    const handleReserve = async () => {
        if (!user || !book) return;
        try {
            setStatus(s => ({ ...s, reserving: true, error: '' }));
            await reserveBook(book.id, user.id);
            setStatus(s => ({ ...s, reserving: false, reserved: true }));
        } catch {
            setStatus(s => ({ ...s, reserving: false, error: 'Failed to reserve.' }));
        }
    };

    const handleWishlist = async () => {
        if (!user || !book) return;
        try {
            setStatus(s => ({ ...s, wishlisting: true, error: '' }));
            const res = await toggleWishlist(book.id, user.id);
            setStatus(s => ({ ...s, wishlisting: false, wishlisted: res.status === 'added' }));
        } catch {
            setStatus(s => ({ ...s, wishlisting: false, error: 'Wishlist toggle failed.' }));
        }
    };

    if (!book) return null;

    return (
        <AnimatePresence>
            <React.Fragment>
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                    exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    className="book-modal-backdrop" onClick={onClose}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999 }}
                />
                <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, pointerEvents: 'none' }}>
                    <motion.div
                        layoutId={`book-card-${book.id}`}
                        initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        transition={{ type: "spring", bounce: 0.15, duration: 0.7 }}
                        style={{
                            width: '90vw', maxWidth: '1200px', maxHeight: '90vh',
                            background: 'var(--bg-glass-strong)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '32px', display: 'flex', overflow: 'hidden',
                            pointerEvents: 'auto', boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
                        }}
                    >
                        {/* Left: Beautiful Large Book Cover */}
                        <div style={{ flex: '1', position: 'relative', overflow: 'hidden', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${book.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px) opacity(0.5)' }} />

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                style={{
                                    position: 'relative',
                                    zIndex: 10,
                                    width: '70%',
                                    aspectRatio: '2/3',
                                    borderRadius: '16px',
                                    boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 100px rgba(255,255,255,0.05)',
                                    overflow: 'hidden',
                                    background: '#000'
                                }}
                            >
                                <RealBookCover book={book} style={{ width: '100%', height: '100%' }} />
                            </motion.div>

                            <button onClick={onClose} style={{ position: 'absolute', top: '2rem', left: '2rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 50, transition: 'background 0.2s' }} className="hover:bg-white/20">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Right: Data & Interactions */}
                        <div style={{ flex: '1.2', background: 'var(--bg-primary)', padding: '4rem', overflowY: 'auto' }}>
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a1a1aa' }}>
                                    <Loader2 className="spinner" size={32} style={{ marginRight: '1rem' }} /> Loading extra details...
                                </div>
                            ) : (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                                {book.category && (
                                                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8b5cf6', fontWeight: 700 }}>
                                                        {book.category}
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="font-serif" style={{ fontSize: '3rem', color: '#fff', marginBottom: '0.5rem', lineHeight: 1.1 }}>{book.title}</h2>
                                            <p style={{ fontSize: '1.2rem', color: '#a1a1aa' }}>by <span style={{ color: '#e4e4e7' }}>{book.author}</span></p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button onClick={() => navigator.clipboard.writeText(window.location.origin + '/book/' + book.id).then(() => alert('Link copied!'))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-white/20"><Share2 size={20} /></button>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div style={{ display: 'flex', gap: '3rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <span style={{ color: '#71717a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Ratings</span>
                                            <span style={{ color: '#fff', fontWeight: 600, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Star size={18} color="#fbbf24" fill="#fbbf24" /> {book.averageRating?.toFixed(1) || 'N/A'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <span style={{ color: '#71717a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Year</span>
                                            <span style={{ color: '#fff', fontWeight: 600, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={16} color="#a1a1aa" /> {book.publicationYear || 'Unknown'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <span style={{ color: '#71717a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Language</span>
                                            <span style={{ color: '#fff', fontWeight: 600, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Globe size={16} color="#a1a1aa" /> {book.language || 'EN'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <span style={{ color: '#71717a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</span>
                                            <span style={{ color: (book.availableCopies || 0) > 0 ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {(book.availableCopies || 0) > 0 ? '✓ In Stock' : '✕ Out'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                                        <Button size="lg" variant={status.borrowed ? "ghost" : "primary"} onClick={handleBorrow} disabled={status.borrowing || status.borrowed || (book.availableCopies || 0) < 1} style={{ flex: 1, padding: '1.25rem', fontSize: '1.1rem', background: status.borrowed ? '#10b981' : '#fff', color: status.borrowed ? '#fff' : '#000', fontWeight: 700, borderRadius: '12px' }}>
                                            {status.borrowing ? <Loader2 className="spinner" size={24} /> : status.borrowed ? <><Check size={24} style={{ marginRight: '0.5rem' }} /> Borrowed</> : 'Borrow Book'}
                                        </Button>
                                        <Button size="lg" variant="ghost" onClick={handleReserve} disabled={status.reserving || status.reserved} style={{ flex: 1, padding: '1.25rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)', color: status.reserved ? '#fcd34d' : '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                            {status.reserving ? <Loader2 className="spinner" size={24} /> : status.reserved ? <><Check size={24} style={{ marginRight: '0.5rem' }} /> Reserved</> : 'Reserve'}
                                        </Button>
                                        <Button size="lg" variant="ghost" onClick={handleWishlist} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                            {status.wishlisting ? <Loader2 className="spinner" size={24} /> : <Bookmark size={24} color={status.wishlisted ? '#3b82f6' : '#fff'} fill={status.wishlisted ? '#3b82f6' : 'transparent'} />}
                                        </Button>
                                    </div>

                                    {status.error && (
                                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Info size={20} /> {status.error}</div>
                                    )}

                                    {/* Synopsis */}
                                    <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '1rem', fontFamily: 'serif' }}>Synopsis</h3>
                                    <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2.5rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                        {book.description || 'No description available for this title.'}
                                    </p>

                                    {/* Metadata */}
                                    <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '1rem', fontFamily: 'serif' }}>Information</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Building size={14} /> Publisher</span>
                                            <span style={{ color: '#e4e4e7', fontWeight: 500 }}>{book.publisher || 'Unknown'}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> Location</span>
                                            <span style={{ color: '#e4e4e7', fontWeight: 500 }}>{book.shelfLocation || 'Main Stack'}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Hash size={14} /> ISBN</span>
                                            <span style={{ color: '#a1a1aa', fontFamily: 'monospace', fontWeight: 500 }}>{book.isbn || 'N/A'}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Total Borrows</span>
                                            <span style={{ color: '#e4e4e7', fontWeight: 500 }}>{book.borrowCount || 0} times</span>
                                        </div>
                                    </div>

                                    {/* Reviews */}
                                    {book.reviews && book.reviews.length > 0 && (
                                        <>
                                            <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '1rem', fontFamily: 'serif' }}>Student Reviews</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                                                {book.reviews.slice(0, 3).map(r => (
                                                    <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem' }}>
                                                        <p style={{ color: '#d4d4d8', marginBottom: '0.75rem', lineHeight: 1.6, fontStyle: 'italic' }}>"{r.content}"</p>
                                                        <span style={{ color: '#71717a', fontSize: '0.85rem', fontWeight: 500 }}>— {r.userName} • {new Date(r.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Related Books */}
                                    {relatedBooks.length > 0 && (
                                        <div style={{ marginTop: '2rem' }}>
                                            <BookCarousel title="More Like This" books={relatedBooks.slice(0, 8)} onBookClick={(b) => { onBookClick?.(b); }} />
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </React.Fragment>
        </AnimatePresence>
    );
};
