import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Filter, TrendingUp, Clock as ClockIcon, Star, MapPin } from 'lucide-react';
import { searchBooks, getCategories } from '../../api/bookService';
import { RealBookCover } from './RealBookCover';
import type { Book } from './BookCard';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBookClick?: (book: Book) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onBookClick }) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<Book[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [categories, setCategories] = useState<{ id: string; name: string; bookCount: number }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load categories on open
    useEffect(() => {
        if (isOpen) {
            getCategories().then(setCategories).catch(console.error);
        }
    }, [isOpen]);

    // Debounced search
    const performSearch = useCallback(async (searchQuery: string, catFilter: string, langFilter: string) => {
        setIsSearching(true);
        try {
            const data = await searchBooks({
                q: searchQuery,
                category: catFilter || undefined,
                language: langFilter || undefined,
                limit: 20,
            });
            setResults(data.books);
            setTotalResults(data.total);
        } catch (err) {
            console.error('Search failed:', err);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (val.length >= 1) {
            debounceRef.current = setTimeout(() => performSearch(val, selectedCategory, selectedLanguage), 300);
        } else {
            setResults([]);
            setTotalResults(0);
        }
    };

    const handleCategoryClick = (catId: string) => {
        const newCat = selectedCategory === catId ? '' : catId;
        setSelectedCategory(newCat);
        if (query.length >= 1 || newCat) {
            performSearch(query, newCat, selectedLanguage);
        }
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value;
        setSelectedLanguage(lang);
        if (query.length >= 1 || selectedCategory) {
            performSearch(query, selectedCategory, lang);
        }
    };

    const handleQuickSearch = (term: string) => {
        setQuery(term);
        performSearch(term, selectedCategory, selectedLanguage);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <React.Fragment>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999 }}
                    />
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none', display: 'flex', justifyContent: 'center', paddingTop: '10vh' }}>
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            style={{ width: '90vw', maxWidth: '1000px', pointerEvents: 'auto', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
                        >
                            {/* Search Input */}
                            <div style={{ position: 'relative', marginBottom: '2rem', flexShrink: 0 }}>
                                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '2rem', display: 'flex', alignItems: 'center' }}>
                                    <Search size={32} color="#a1a1aa" />
                                </div>
                                <input
                                    autoFocus type="text"
                                    placeholder="Search by title, author, category, or ISBN..."
                                    value={query} onChange={handleQueryChange}
                                    style={{
                                        width: '100%', background: 'var(--bg-glass-strong)',
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
                                        padding: '1.5rem 2rem 1.5rem 5rem', fontSize: '1.5rem',
                                        color: '#fff', outline: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                    }}
                                />
                                <div style={{ position: 'absolute', top: 0, bottom: 0, right: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {isSearching && <Loader2 className="spinner" size={24} color="#3b82f6" />}
                                    {query && <span style={{ color: '#71717a', fontSize: '0.9rem' }}>{totalResults} results</span>}
                                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem', overflow: 'hidden', flex: 1 }}>
                                {/* Filters */}
                                <div style={{ background: 'var(--bg-glass)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem', height: 'fit-content', maxHeight: '60vh', overflowY: 'auto' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#fff', fontSize: '1.25rem', fontWeight: 600 }}>
                                        <Filter size={20} /> Filters
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <h4 style={{ color: '#71717a', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Category</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {categories.map(cat => (
                                                <span
                                                    key={cat.id}
                                                    onClick={() => handleCategoryClick(cat.id)}
                                                    style={{
                                                        background: selectedCategory === cat.id ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
                                                        border: selectedCategory === cat.id ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem',
                                                        color: '#e4e4e7', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {cat.name} ({cat.bookCount})
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <h4 style={{ color: '#71717a', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Language</h4>
                                        <select value={selectedLanguage} onChange={handleLanguageChange} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: '8px' }}>
                                            <option value="">All Languages</option>
                                            <option value="English">English</option>
                                            <option value="Spanish">Spanish</option>
                                            <option value="French">French</option>
                                            <option value="German">German</option>
                                            <option value="Mandarin">Mandarin</option>
                                            <option value="Japanese">Japanese</option>
                                            <option value="Hindi">Hindi</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Results */}
                                <div style={{ background: 'var(--bg-glass)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem', overflowY: 'auto', maxHeight: '60vh' }}>
                                    {results.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {results.map(book => (
                                                <div
                                                    key={book.id}
                                                    onClick={() => { onBookClick?.(book); onClose(); }}
                                                    style={{
                                                        display: 'flex', gap: '1.5rem', padding: '1.25rem',
                                                        background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
                                                        cursor: 'pointer', transition: 'background 0.2s',
                                                        border: '1px solid rgba(255,255,255,0.05)',
                                                    }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                                >
                                                    <div style={{ width: '60px', height: '90px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}>
                                                        <RealBookCover book={book} />
                                                    </div>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                        <h4 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>{book.title}</h4>
                                                        <p style={{ color: '#a1a1aa', margin: '0.25rem 0', fontSize: '0.9rem' }}>by {book.author}</p>
                                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                                            {book.averageRating && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontSize: '0.85rem' }}><Star size={14} fill="#f59e0b" /> {book.averageRating.toFixed(1)}</span>}
                                                            {book.category && <span style={{ color: '#71717a', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>{book.category}</span>}
                                                            {book.language && <span style={{ color: '#71717a', fontSize: '0.8rem' }}>{book.language}</span>}
                                                            {book.shelfLocation && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#71717a', fontSize: '0.8rem' }}><MapPin size={12} /> {book.shelfLocation}</span>}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span style={{ color: (book.availableCopies || 0) > 0 ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                                                            {(book.availableCopies || 0) > 0 ? `${book.availableCopies} avail` : 'Unavailable'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : query.length === 0 && !selectedCategory ? (
                                        <div>
                                            <div style={{ marginBottom: '3rem' }}>
                                                <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ClockIcon size={20} color="#71717a" /> Quick Searches</h3>
                                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                    {['Systems', 'Algorithms', 'Science', 'Psychology', 'History'].map(term => (
                                                        <span key={term} onClick={() => handleQuickSearch(term)} style={{ color: '#a1a1aa', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                            {term}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={20} color="#3b82f6" /> Popular Categories</h3>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    {categories.slice(0, 8).map((cat, i) => (
                                                        <div key={cat.id} onClick={() => handleCategoryClick(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <span style={{ color: '#3b82f6', fontWeight: 600 }}>{i + 1}</span>
                                                            <span style={{ color: '#fff', flex: 1 }}>{cat.name}</span>
                                                            <span style={{ color: '#71717a', fontSize: '0.8rem' }}>{cat.bookCount} books</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', opacity: isSearching ? 0.5 : 1 }}>
                                            <Search size={64} color="rgba(255,255,255,0.1)" style={{ marginBottom: '2rem' }} />
                                            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>No matches found</h3>
                                            <p style={{ color: '#71717a' }}>Try adjusting your filters or search terms.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </React.Fragment>
            )}
        </AnimatePresence>
    );
};
