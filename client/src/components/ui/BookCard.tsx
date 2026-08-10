import React from 'react';
import { motion } from 'framer-motion';
import { RealBookCover } from './RealBookCover';

export interface Book {
    id: string;
    title: string;
    subtitle?: string;
    author: string;
    authorIds?: string[];
    coverImageUrl: string;
    description?: string;
    isbn?: string;
    publicationYear?: number;
    language?: string;
    edition?: string;
    shelfLocation?: string;
    availableCopies?: number;
    totalCopies?: number;
    averageRating?: number;
    reviewCount?: number;
    borrowCount?: number;
    popularityScore?: number;
    category?: string;
    categoryId?: string;
    publisher?: string;
    publisherId?: string;
    reviews?: { id: string; content: string; userName: string; createdAt: string }[];
    galleryImages?: string[];
}

interface BookCardProps {
    book: Book;
    onClick?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
    return (
        <motion.div
            className="book-card-wrapper"
            style={{
                perspective: '1500px',
                width: '180px',
                aspectRatio: '2/3',
                cursor: 'pointer',
                flexShrink: 0
            }}
            whileHover={{ scale: 1.05, y: -8, zIndex: 50 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => onClick && onClick(book)}
        >
            <motion.div
                className="book-card-inner"
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                    background: '#1a1a1a'
                }}
            >
                <RealBookCover
                    book={book}
                    style={{
                        position: 'absolute',
                        inset: 0,
                    }}
                />

                {/* Constant gradient exactly for text readability */}
                <div style={{
                    position: 'absolute',
                    inset: '0',
                    background: 'linear-gradient(to top, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0.5) 40%, transparent 100%)',
                    pointerEvents: 'none'
                }} />

                <motion.div
                    className="book-details-overlay"
                    style={{
                        position: 'absolute',
                        inset: '0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        zIndex: 10
                    }}
                >
                    {/* Top badging */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        {book.averageRating && (
                            <span style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
                                ★ {book.averageRating.toFixed(1)}
                            </span>
                        )}
                    </div>

                    {/* Bottom Metadata */}
                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.2, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            {book.title}
                        </h3>
                        <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: '0 0 0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {book.author}
                        </p>

                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {book.category && (
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#e4e4e7' }}>
                                    {book.category}
                                </span>
                            )}
                            {book.availableCopies !== undefined && book.availableCopies > 0 && (
                                <span style={{ height: '6px', width: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} title="In Stock" />
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};
