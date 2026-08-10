import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookCarousel } from '../components/ui/BookCarousel';
import type { Book } from '../components/ui/BookCard';
import { BookDetailModal } from '../components/ui/BookDetailModal';
import { SearchModal } from '../components/ui/SearchModal';
import { ProfileView } from '../components/student/ProfileView';
import { ExploreView } from '../components/student/ExploreView';
import { LibraryView } from '../components/student/LibraryView';
import { getExploreBooks } from '../api/bookService';
import { toggleWishlist } from '../api/transactionService';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, Clock, Flame, Brain, Code, Globe, Trophy, Search, User, Bookmark } from 'lucide-react';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';

const FadeInRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: '4rem', position: 'relative', zIndex: 20 }}
    >
        {children}
    </motion.div>
);

export const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'library' | 'profile'>('home');
    const [books, setBooks] = useState<Record<string, Book[]>>({});
    const { scrollY } = useScroll();
    const navBackground = useTransform(scrollY, [0, 100], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']);
    const navBackdropFilter = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(20px)']);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const data = await getExploreBooks();
                setBooks(data);
            } catch (error) {
                console.error("Error fetching heavily normalized explore state:", error);
            }
        };
        fetchBooks();
    }, []);

    if (Object.keys(books).length === 0) return <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: '#fff' }}>Loading Digital Library...</div>;

    return (
        <div className="student-dashboard" style={{ paddingBottom: '0', background: 'transparent', overflowX: 'hidden', minHeight: '100vh' }}>

            <AtmosphericBackground activeTab={activeTab} />

            {/* Premium Floating Navigation */}
            <motion.nav
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 4rem',
                    zIndex: 9000,
                    background: navBackground,
                    backdropFilter: navBackdropFilter as any,
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}
            >
                <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }} className="font-serif">
                    Lumina.
                </div>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <button onClick={() => setActiveTab('library')} style={{ background: 'transparent', border: 'none', color: activeTab === 'library' ? '#fff' : '#a1a1aa', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '1rem', fontWeight: activeTab === 'library' ? 600 : 500 }}>My Library</button>
                    <button onClick={() => setActiveTab('explore')} style={{ background: 'transparent', border: 'none', color: activeTab === 'explore' ? '#fff' : '#a1a1aa', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '1rem', fontWeight: activeTab === 'explore' ? 600 : 500 }}>Explore</button>
                    <button onClick={() => setActiveTab('home')} style={{ background: 'transparent', border: 'none', color: activeTab === 'home' ? '#fff' : '#a1a1aa', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '1rem', fontWeight: activeTab === 'home' ? 600 : 500 }}>Home</button>

                    <button
                        onClick={() => setIsSearchOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '999px', color: '#a1a1aa', cursor: 'pointer', minWidth: '250px' }}
                    >
                        <Search size={18} /> <span style={{ flex: 1, textAlign: 'left' }}>Search Lumina...</span>
                    </button>
                    <div onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: activeTab === 'profile' ? '2px solid #fff' : 'none' }}>
                        <User size={20} />
                    </div>
                </div>
            </motion.nav>

            <AnimatePresence mode="wait">
                {activeTab === 'home' && (
                    <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Featured Hero Banner */}
                        {books.trending && books.trending[0] && (
                            <div
                                style={{
                                    width: '100%',
                                    height: '80vh',
                                    background: `linear-gradient(to right, #000 10%, transparent 80%), url(${books.trending[0].coverImageUrl}) center top/cover`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '4rem 6rem',
                                    position: 'relative'
                                }}
                            >
                                {/* Vignette fade out to body bg */}
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40vh', background: 'linear-gradient(to top, var(--bg-primary), transparent)', zIndex: 1 }} />

                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    style={{ maxWidth: '800px', zIndex: 10, marginTop: '10vh' }}
                                >
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <Sparkles size={24} color="#fcd34d" />
                                        <span style={{ color: '#fcd34d', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{user?.name ? `${user.name}'s Recommended Pick` : `Editor's Choice`}</span>
                                    </div>

                                    <h1 style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: 1.1, textShadow: '0 10px 30px rgba(0,0,0,0.8)' }} className="font-serif">
                                        {books.trending[0].title}
                                    </h1>
                                    <h3 style={{ fontSize: '1.75rem', color: '#a1a1aa', marginBottom: '2rem', textShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>{books.trending[0].author}</h3>

                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', marginBottom: '3rem', maxWidth: '600px', lineHeight: 1.6, textShadow: '0 5px 15px rgba(0,0,0,0.8)' }}>
                                        {books.trending[0].description}
                                    </p>

                                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                                        <button className="btn-base btn-primary btn-lg" onClick={() => setSelectedBook(books.trending[0])} style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
                                            <Activity size={18} style={{ marginRight: '0.5rem' }} /> View Details
                                        </button>
                                        <button className="btn-base btn-ghost btn-lg" onClick={async () => {
                                            if (!user) { alert('Please log in to add to wishlist'); return; }
                                            try {
                                                const res = await toggleWishlist(books.trending[0].id, user.id);
                                                alert(res.status === 'added' ? '✅ Added to your Wishlist!' : '❌ Removed from Wishlist');
                                            } catch { alert('Failed to toggle wishlist'); }
                                        }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
                                            <Bookmark size={18} style={{ marginRight: '0.5rem' }} /> My List
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Netflix Style Rows Container */}
                        <div style={{ marginTop: '-15vh', paddingLeft: '4rem', paddingRight: '4rem', maxWidth: '1600px', marginLeft: 'auto', marginRight: 'auto' }}>
                            <FadeInRow>
                                <BookCarousel title="Continue Reading" books={books.continueReading} onBookClick={setSelectedBook} icon={<Clock size={24} style={{ marginRight: '0.5rem' }} />} />
                            </FadeInRow>

                            <FadeInRow>
                                <BookCarousel title="Trending Right Now" books={books.trending} onBookClick={setSelectedBook} icon={<Flame size={24} style={{ marginRight: '0.5rem' }} />} />
                            </FadeInRow>

                            <FadeInRow>
                                <BookCarousel title="Recently Added" books={books.recentlyAdded} onBookClick={setSelectedBook} />
                            </FadeInRow>

                            <FadeInRow>
                                <BookCarousel title="Most Borrowed by Students" books={books.mostBorrowed} onBookClick={setSelectedBook} icon={<Trophy size={24} style={{ marginRight: '0.5rem' }} />} />
                            </FadeInRow>

                            <FadeInRow>
                                <BookCarousel title="AI Recommended For You" books={books.aiRecs} onBookClick={setSelectedBook} icon={<Brain size={24} style={{ marginRight: '0.5rem' }} />} />
                            </FadeInRow>

                            {/* Genre Breakouts */}
                            <FadeInRow>
                                <BookCarousel title="Programming & Engineering" books={books.programming} onBookClick={setSelectedBook} icon={<Code size={24} style={{ marginRight: '0.5rem' }} />} />
                            </FadeInRow>

                            <FadeInRow>
                                <BookCarousel title="Scientific Discovery" books={books.science} onBookClick={setSelectedBook} icon={<Globe size={24} style={{ marginRight: '0.5rem' }} />} />
                            </FadeInRow>

                            <FadeInRow>
                                <BookCarousel title="History & Civilization" books={books.history} onBookClick={setSelectedBook} />
                            </FadeInRow>

                            <FadeInRow>
                                <BookCarousel title="Fantasy & Sci-Fi" books={books.fantasy} onBookClick={setSelectedBook} />
                            </FadeInRow>

                            <FadeInRow>
                                <BookCarousel title="Self Help & Psychology" books={books.selfHelp} onBookClick={setSelectedBook} />
                            </FadeInRow>

                            <FadeInRow>
                                <BookCarousel title="New Releases" books={books.newReleases} onBookClick={setSelectedBook} />
                            </FadeInRow>

                        </div>

                        {/* Premium Footer */}
                        <footer style={{ background: '#0a0a0f', padding: '6rem 4rem 4rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4rem', maxWidth: '1400px', margin: '0 auto' }}>
                                <div>
                                    <h3 className="font-serif" style={{ fontSize: '2rem', color: '#fff', marginBottom: '1.5rem' }}>Lumina</h3>
                                    <p style={{ color: '#71717a', lineHeight: 1.6 }}>The world's most cinematic Library Management System engineered entirely in WebGL & React.</p>
                                </div>
                                <div>
                                    <h4 style={{ color: '#fff', marginBottom: '1.5rem' }}>Explore</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#71717a', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <li style={{ cursor: 'pointer' }} onClick={() => setActiveTab('explore')}>Trending</li>
                                        <li style={{ cursor: 'pointer' }} onClick={() => setActiveTab('explore')}>New Arrivals</li>
                                        <li style={{ cursor: 'pointer' }} onClick={() => setActiveTab('home')}>Events</li>
                                        <li style={{ cursor: 'pointer' }} onClick={() => setActiveTab('explore')}>Leaderboard</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 style={{ color: '#fff', marginBottom: '1.5rem' }}>Account</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#71717a', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <li style={{ cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>Settings</li>
                                        <li style={{ cursor: 'pointer' }} onClick={() => setActiveTab('library')}>My History</li>
                                        <li style={{ cursor: 'pointer' }} onClick={() => setActiveTab('library')}>Wishlist</li>
                                        <li style={{ cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>Support</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 style={{ color: '#fff', marginBottom: '1.5rem' }}>Legal</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#71717a', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <li style={{ cursor: 'pointer' }}>Privacy Policy</li>
                                        <li style={{ cursor: 'pointer' }}>Terms of Service</li>
                                        <li style={{ cursor: 'pointer' }}>Cookie Settings</li>
                                    </ul>
                                </div>
                            </div>
                        </footer>
                    </motion.div>
                )}

                {activeTab === 'profile' && (
                    <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ProfileView books={books.continueReading || Object.values(books).flat()} onBookClick={setSelectedBook} />
                    </motion.div>
                )}
                {activeTab === 'explore' && (
                    <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ExploreView books={books} onBookClick={setSelectedBook} />
                    </motion.div>
                )}
                {activeTab === 'library' && (
                    <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <LibraryView books={books.trending || Object.values(books).flat()} onBookClick={setSelectedBook} />
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedBook && (
                <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} onBookClick={(b) => setSelectedBook(b)} />
            )}

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onBookClick={(b) => { setIsSearchOpen(false); setSelectedBook(b); }} />

        </div>
    );
};
