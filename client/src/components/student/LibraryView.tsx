import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, BookmarkCheck, History, Loader2, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getWishlist, getBorrowHistory, getRecentlyViewed } from '../../api/transactionService';
import type { Book } from '../ui/BookCard';
import { RealBookCover } from '../ui/RealBookCover';

interface BorrowRecord {
    id: string;
    bookId: string;
    title: string;
    author: string;
    coverImageUrl: string;
    status: string;
    borrowDate: string;
    dueDate: string;
    returnDate: string | null;
    category: string;
}

interface WishlistBook {
    id: string;
    title: string;
    author: string;
    coverImageUrl: string;
    description?: string;
    category: string;
    averageRating?: number;
    addedAt: string;
}

interface RecentBook {
    id: string;
    title: string;
    author: string;
    coverImageUrl: string;
    description?: string;
    category: string;
    lastViewedAt: string;
}

export const LibraryView: React.FC<{ books: Book[], onBookClick: (b: Book) => void }> = ({ onBookClick }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'borrowed' | 'wishlist' | 'recent'>('borrowed');
    const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
    const [wishlist, setWishlist] = useState<WishlistBook[]>([]);
    const [recent, setRecent] = useState<RecentBook[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [borrowData, wishData, recentData] = await Promise.all([
                    getBorrowHistory(user.id),
                    getWishlist(user.id),
                    getRecentlyViewed(user.id),
                ]);
                setBorrows(borrowData);
                setWishlist(wishData);
                setRecent(recentData);
            } catch (err) {
                console.error('Library data error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user]);

    const tabs = [
        { key: 'borrowed' as const, label: 'Borrow History', icon: <History size={20} />, count: borrows.length },
        { key: 'wishlist' as const, label: 'My Wishlist', icon: <BookmarkCheck size={20} />, count: wishlist.length },
        { key: 'recent' as const, label: 'Recently Viewed', icon: <BookOpen size={20} />, count: recent.length },
    ];

    const handleItemClick = (item: { id: string; title: string; author: string; coverImageUrl: string; description?: string }) => {
        onBookClick({ ...item } as Book);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ paddingTop: '120px', paddingBottom: '4rem', color: '#fff', padding: '120px 4rem 4rem' }}
        >
            <h1 className="font-serif" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>My Library</h1>
            <p style={{ color: '#a1a1aa', fontSize: '1.25rem', marginBottom: '3rem' }}>
                Your complete reading journey — borrows, wishlist, and recently viewed books.
            </p>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            background: activeTab === tab.key ? 'rgba(59,130,246,0.15)' : 'transparent',
                            border: activeTab === tab.key ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                            color: activeTab === tab.key ? '#fff' : '#a1a1aa',
                            padding: '0.75rem 1.5rem', borderRadius: '12px 12px 0 0',
                            cursor: 'pointer', fontSize: '1rem', fontWeight: 500,
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                        }}
                    >
                        {tab.icon} {tab.label}
                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.8rem' }}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '4rem', justifyContent: 'center', color: '#a1a1aa' }}>
                    <Loader2 className="spinner" size={28} /> Loading your library...
                </div>
            ) : (
                <>
                    {/* Borrow History */}
                    {activeTab === 'borrowed' && (
                        <div>
                            {borrows.length === 0 ? (
                                <EmptyState message="You haven't borrowed any books yet. Start exploring!" />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {borrows.map(record => (
                                        <div key={record.id} onClick={() => handleItemClick(record)} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                        >
                                            <div style={{ width: '70px', height: '100px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden' }}>
                                                <RealBookCover book={record as any} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>{record.title}</h3>
                                                <p style={{ margin: '0.25rem 0', color: '#a1a1aa', fontSize: '0.9rem' }}>by {record.author}</p>
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.85rem', color: '#71717a', flexWrap: 'wrap' }}>
                                                    <span>Borrowed: {new Date(record.borrowDate).toLocaleDateString()}</span>
                                                    <span>Due: {new Date(record.dueDate).toLocaleDateString()}</span>
                                                    {record.returnDate && <span>Returned: {new Date(record.returnDate).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                                                    background: record.status === 'ACTIVE' ? 'rgba(59,130,246,0.15)' : record.status === 'RETURNED' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                                    color: record.status === 'ACTIVE' ? '#3b82f6' : record.status === 'RETURNED' ? '#10b981' : '#ef4444',
                                                }}>
                                                    {record.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Wishlist */}
                    {activeTab === 'wishlist' && (
                        <div>
                            {wishlist.length === 0 ? (
                                <EmptyState message="Your wishlist is empty. Bookmark books to save them here!" />
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                    {wishlist.map(book => (
                                        <div key={book.id} onClick={() => handleItemClick(book)} style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                        >
                                            <div style={{ width: '60px', height: '90px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}>
                                                <RealBookCover book={book as any} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{book.title}</h4>
                                                <p style={{ margin: '0.25rem 0', color: '#a1a1aa', fontSize: '0.85rem' }}>{book.author}</p>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                                    {book.averageRating && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontSize: '0.8rem' }}><Star size={12} fill="#f59e0b" /> {book.averageRating.toFixed(1)}</span>}
                                                    <span style={{ color: '#71717a', fontSize: '0.75rem' }}>{book.category}</span>
                                                </div>
                                            </div>
                                            <ArrowRight size={18} color="#71717a" style={{ alignSelf: 'center' }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recently Viewed */}
                    {activeTab === 'recent' && (
                        <div>
                            {recent.length === 0 ? (
                                <EmptyState message="No recently viewed books yet. Browse books to populate this section!" />
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    {recent.map(book => (
                                        <div key={book.id} onClick={() => handleItemClick(book)} style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', transition: 'transform 0.2s' }}>
                                            <RealBookCover book={book as any} style={{ width: '100%', aspectRatio: '2/3' }} />
                                            <div style={{ padding: '1rem' }}>
                                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h4>
                                                <p style={{ margin: '0.25rem 0 0', color: '#71717a', fontSize: '0.75rem' }}>Viewed {new Date(book.lastViewedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', color: '#71717a' }}>
        <BookOpen size={64} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
        <p style={{ fontSize: '1.2rem', textAlign: 'center' }}>{message}</p>
    </div>
);
