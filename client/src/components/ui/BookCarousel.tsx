import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BookCard } from './BookCard';
import type { Book } from './BookCard';
import './BookCarousel.css';

interface BookCarouselProps {
    title: string;
    books: Book[];
    onBookClick?: (book: Book) => void;
    icon?: React.ReactNode;
}

export const BookCarousel: React.FC<BookCarouselProps> = ({ title, books, onBookClick, icon }) => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [books]);

    const scroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'left' ? -carouselRef.current.clientWidth + 100 : carouselRef.current.clientWidth - 100;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!books?.length) return null;

    return (
        <div className="carousel-section">
            <h2 className="carousel-title" style={{ display: 'flex', alignItems: 'center' }}>
                {icon && <span style={{ marginRight: '0.2rem', display: 'flex' }}>{icon}</span>}
                {title}
            </h2>

            <div className="carousel-container-wrapper">
                {canScrollLeft && (
                    <button className="carousel-control control-left glass-panel" onClick={() => scroll('left')}>
                        <ChevronLeft />
                    </button>
                )}

                <div
                    className="carousel-track"
                    ref={carouselRef}
                    onScroll={checkScroll}
                >
                    {books.map((book, idx) => (
                        <motion.div
                            key={book.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
                            className="carousel-item"
                        >
                            <BookCard book={book} onClick={onBookClick} />
                        </motion.div>
                    ))}
                </div>

                {canScrollRight && (
                    <button className="carousel-control control-right glass-panel" onClick={() => scroll('right')}>
                        <ChevronRight />
                    </button>
                )}
            </div>
        </div>
    );
};
