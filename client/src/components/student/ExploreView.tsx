import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layers, Loader2, Search, Plus, Info } from 'lucide-react';
import { BookCarousel } from '../ui/BookCarousel';
import type { Book } from '../ui/BookCard';
import { getCategories, getBooksByCategory } from '../../api/bookService';
import { Button } from '../ui/Button';
import { RealBookCover } from '../ui/RealBookCover';

interface Category {
    id: string;
    name: string;
    bookCount: number;
}

const CATEGORY_COLORS = [
    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'linear-gradient(135deg, #b45309, #78350f)',
    'linear-gradient(135deg, #ec4899, #be185d)',
    'linear-gradient(135deg, #10b981, #047857)',
    'linear-gradient(135deg, #8b5cf6, #5b21b6)',
    'linear-gradient(135deg, #ef4444, #991b1b)',
    'linear-gradient(135deg, #06b6d4, #0e7490)',
    'linear-gradient(135deg, #f59e0b, #b45309)',
];

export const ExploreView: React.FC<{ books: Record<string, Book[]>, onBookClick: (b: Book) => void }> = ({ books, onBookClick }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryBooks, setCategoryBooks] = useState<Book[]>([]);
    const [loadingCategory, setLoadingCategory] = useState(false);

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, []);

    const handleCategoryClick = async (cat: Category) => {
        if (selectedCategory?.id === cat.id) {
            setSelectedCategory(null);
            setCategoryBooks([]);
            return;
        }
        setSelectedCategory(cat);
        setLoadingCategory(true);
        try {
            const data = await getBooksByCategory(cat.id);
            setCategoryBooks(data.books);
        } catch (err) {
            console.error('Failed to load category books:', err);
        } finally {
            setLoadingCategory(false);
        }
    };

    const handleBack = () => {
        setSelectedCategory(null);
        setCategoryBooks([]);
    };

    const featuredBook = useMemo(() => {
        if (books.trending && books.trending.length > 0) return books.trending[0];
        if (books.newReleases && books.newReleases.length > 0) return books.newReleases[0];
        return null;
    }, [books]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ color: '#fff', minHeight: '100vh', background: 'var(--bg-primary)' }}
        >
            {/* Premium Hero Section */}
            {!selectedCategory && featuredBook && (
                <div style={{
                    position: 'relative',
                    height: '75vh',
                    minHeight: '600px',
                    width: '100%',
                    marginBottom: '3rem',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${featuredBook.coverImageUrl})`,
                        backgroundPosition: 'center 20%',
                        backgroundSize: 'cover',
                        filter: 'blur(5px) brightness(0.6)',
                        transform: 'scale(1.05)'
                    }} />

                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 40%)'
                    }} />

                    <div style={{
                        position: 'absolute',
                        bottom: '15%',
                        left: '4rem',
                        maxWidth: '600px',
                        zIndex: 10
                    }}>
                        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <span style={{ background: '#e11d48', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                    Featured
                                </span>
                                {featuredBook.category && (
                                    <span style={{ fontSize: '0.85rem', color: '#e4e4e7', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {featuredBook.category}
                                    </span>
                                )}
                            </div>

                            <RealBookCover
                                book={books.trending[0]}
                                style={{
                                    width: '240px', aspectRatio: '2/3', borderRadius: '16px',
                                    boxShadow: '0 40px 100px rgba(0,0,0,0.6)', marginBottom: '1.5rem'
                                }}
                            />
                            <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.75rem', textShadow: '0 4px 12px rgba(0,0,0,0.5)', fontFamily: 'serif' }}>
                                {featuredBook.title}
                            </h1>

                            <p style={{ fontSize: '1.1rem', color: '#d4d4d8', marginBottom: '2rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                {featuredBook.description || "Discover a cinematic journey through pages. Explore the critically acclaimed masterpiece now available in the campus digital reserve."}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Button size="lg" onClick={() => onBookClick(featuredBook)} style={{ padding: '0.6rem 1.5rem', fontSize: '1rem', background: '#fff', color: '#000', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                    <Info fill="#000" size={18} /> Details
                                </Button>
                                <Button size="lg" variant="ghost" style={{ padding: '0.6rem 1.5rem', fontSize: '1rem', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: '#fff', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                    <Plus size={18} /> Wishlist
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            <div style={{ padding: '0 4rem 4rem 4rem', marginTop: selectedCategory ? '80px' : '-4rem', position: 'relative', zIndex: 20 }}>
                {/* Quick Filters */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                        onClick={handleBack}
                        style={{ background: !selectedCategory ? '#fff' : 'rgba(255,255,255,0.1)', color: !selectedCategory ? '#000' : '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.6rem 1.25rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s' }}
                    >
                        All
                    </button>
                    {categories.slice(0, 8).map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat)}
                            style={{ background: selectedCategory?.id === cat.id ? '#fff' : 'rgba(255,255,255,0.1)', color: selectedCategory?.id === cat.id ? '#000' : '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.6rem 1.25rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s' }}
                        >
                            {cat.name}
                        </button>
                    ))}
                    <button style={{ background: 'transparent', color: '#a1a1aa', border: 'none', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={16} /> Search Categories
                    </button>
                </div>

                {/* Category Grid */}
                <AnimatePresence mode="wait">
                    {selectedCategory ? (
                        <motion.div
                            key="category-view"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{selectedCategory.name}</h2>
                            <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '2rem' }}>Showing {selectedCategory.bookCount} carefully curated books</p>

                            {loadingCategory ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '4rem 0', color: '#a1a1aa', justifyContent: 'center' }}>
                                    <Loader2 className="spinner" size={24} /> Loading...
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '2rem 1.5rem' }}>
                                    {categoryBooks.map(book => (
                                        <div key={book.id} onClick={() => onBookClick(book)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} className="hover:scale-105">
                                            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '2/3', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', marginBottom: '0.75rem' }}>
                                                <RealBookCover book={book as any} style={{ width: '100%', height: '100%' }} />
                                            </div>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#e4e4e7', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</h4>
                                            <p style={{ margin: '0.2rem 0 0', color: '#a1a1aa', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.author}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="default-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                {books.trending && books.trending.length > 0 && <BookCarousel title="Trending Now" books={books.trending} onBookClick={onBookClick} />}
                                {books.continueReading && books.continueReading.length > 0 && <BookCarousel title="Continue Reading" books={books.continueReading} onBookClick={onBookClick} />}
                                {books.newReleases && books.newReleases.length > 0 && <BookCarousel title="New Arrivals" books={books.newReleases} onBookClick={onBookClick} />}
                                {books.aiRecs && books.aiRecs.length > 0 && <BookCarousel title="Recommended for You" books={books.aiRecs} onBookClick={onBookClick} icon={<Sparkles size={24} style={{ marginRight: '0.5rem', color: '#e11d48' }} />} />}
                                {books.mostBorrowed && books.mostBorrowed.length > 0 && <BookCarousel title="Most Borrowed" books={books.mostBorrowed} onBookClick={onBookClick} />}
                                {books.science && books.science.length > 0 && <BookCarousel title="Top in Science" books={books.science} onBookClick={onBookClick} />}
                            </div>

                            {/* Popular Categories Footer Grid */}
                            <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4rem' }}>
                                <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Layers size={24} color="#8b5cf6" /> Popular Genres
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                    {categories.map((cat, i) => (
                                        <div key={cat.id} onClick={() => handleCategoryClick(cat)} style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length], borderRadius: '8px', padding: '1.5rem', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minHeight: '120px', display: 'flex', alignItems: 'flex-start' }} className="hover:scale-105">
                                            <span style={{ fontSize: '1.25rem', fontWeight: 700, zIndex: 10, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{cat.name}</span>
                                            <span style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{cat.bookCount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
