import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, BookOpen, Heart, MessageSquare, Award, Loader2, LogOut, Settings, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserStats, getBorrowHistory } from '../../api/transactionService';
import { getRecommendations } from '../../api/bookService';
import { BookCarousel } from '../ui/BookCarousel';
import type { Book } from '../ui/BookCard';

interface Stats {
    totalBorrows: number;
    activeBorrows: number;
    totalWishlist: number;
    totalReviews: number;
}

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

export const ProfileView: React.FC<{ books: Book[], onBookClick: (b: Book) => void }> = ({ onBookClick }) => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [recommendations, setRecommendations] = useState<Book[]>([]);
    const [readHistory, setReadHistory] = useState<BorrowRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const loadProfile = async () => {
            setLoading(true);
            try {
                const [statsData, recsData, historyData] = await Promise.all([
                    getUserStats(user.id),
                    getRecommendations(user.id),
                    getBorrowHistory(user.id),
                ]);
                setStats(statsData);
                setRecommendations(recsData);
                setReadHistory(historyData);
            } catch (err) {
                console.error('Profile load error:', err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [user]);

    const statCards = stats ? [
        { label: 'Books Borrowed', value: stats.totalBorrows, icon: <BookOpen size={28} />, color: '#3b82f6' },
        { label: 'Active Borrows', value: stats.activeBorrows, icon: <TrendingUp size={28} />, color: '#10b981' },
        { label: 'Wishlist Items', value: stats.totalWishlist, icon: <Heart size={28} />, color: '#ec4899' },
        { label: 'Reviews Written', value: stats.totalReviews, icon: <MessageSquare size={28} />, color: '#f59e0b' },
    ] : [];

    // Compute reading insights
    const categoryCounts: Record<string, number> = {};
    readHistory.forEach(r => {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ paddingTop: '120px', paddingBottom: '4rem', color: '#fff', padding: '120px 4rem 4rem' }}
        >
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#a1a1aa', gap: '1rem' }}>
                    <Loader2 className="spinner" size={32} /> Loading profile...
                </div>
            ) : (
                <>
                    {/* Profile Header */}
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '4rem' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={56} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h1 className="font-serif" style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>{user?.name || 'Student'}</h1>
                            <p style={{ color: '#a1a1aa', fontSize: '1.15rem', marginBottom: '0.5rem' }}>{user?.identifier || 'student@campus.edu'} · {user?.role || 'STUDENT'}</p>
                            <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Member since joining Lumina Library Network</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Settings size={18} /> Settings
                            </button>
                            <button onClick={logout} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
                        {statCards.map((card, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ color: card.color }}>{card.icon}</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{card.value}</div>
                                <div style={{ color: '#71717a', fontSize: '0.95rem' }}>{card.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Reading Insights */}
                    {topCategories.length > 0 && (
                        <div style={{ marginBottom: '4rem' }}>
                            <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Reading Insights</h2>
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem' }}>
                                <h3 style={{ color: '#a1a1aa', marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Top Categories</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {topCategories.map(([category, count]) => {
                                        const maxCount = topCategories[0][1];
                                        const percentage = (count / maxCount) * 100;
                                        return (
                                            <div key={category}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ color: '#e4e4e7' }}>{category}</span>
                                                    <span style={{ color: '#71717a' }}>{count} books</span>
                                                </div>
                                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                                        style={{ height: '100%', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', borderRadius: '999px' }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Achievements */}
                    <div style={{ marginBottom: '4rem' }}>
                        <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Achievements</h2>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            {[
                                { name: 'First Borrow', earned: (stats?.totalBorrows || 0) >= 1, icon: '📚' },
                                { name: 'Bookworm (5+)', earned: (stats?.totalBorrows || 0) >= 5, icon: '🐛' },
                                { name: 'Critic (1 review)', earned: (stats?.totalReviews || 0) >= 1, icon: '✍️' },
                                { name: 'Collector (3 wishlist)', earned: (stats?.totalWishlist || 0) >= 3, icon: '💎' },
                                { name: 'Scholar (10+)', earned: (stats?.totalBorrows || 0) >= 10, icon: '🎓' },
                            ].map((badge, i) => (
                                <div key={i} style={{
                                    background: badge.earned ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)',
                                    border: badge.earned ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '140px',
                                    opacity: badge.earned ? 1 : 0.4,
                                }}>
                                    <span style={{ fontSize: '2rem' }}>{badge.icon}</span>
                                    <Award size={20} color={badge.earned ? '#fcd34d' : '#52525b'} />
                                    <span style={{ color: badge.earned ? '#fcd34d' : '#52525b', fontSize: '0.8rem', textAlign: 'center', fontWeight: 500 }}>{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Personalized Recommendations */}
                    {recommendations.length > 0 && (
                        <div style={{ marginBottom: '4rem' }}>
                            <BookCarousel title="Recommended For You" books={recommendations} onBookClick={onBookClick} />
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};
