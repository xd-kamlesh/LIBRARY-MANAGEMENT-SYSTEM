import React, { useState } from 'react';

interface RealBookCoverProps {
    book: {
        id: string;
        title: string;
        author: string;
        category?: string;
        coverImageUrl?: string;
    };
    alt?: string;
    style?: React.CSSProperties;
    className?: string;
}

const getHashColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

// Generates a darker more aesthetic color for the elegant fallback
const getElegantGradients = (title: string) => {
    const color1 = getHashColor(title);
    const color2 = getHashColor(title.split('').reverse().join(''));
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
};

export const RealBookCover: React.FC<RealBookCoverProps> = ({ book, alt, style, className }) => {
    const [imageError, setImageError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // If it has a URL and we haven't failed loading it
    if (book.coverImageUrl && !imageError) {
        return (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', ...style }} className={className}>
                {!isLoaded && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ opacity: 0.3, color: '#fff', fontSize: '0.8rem' }}>Loading...</span>
                    </div>
                )}
                <img
                    src={book.coverImageUrl}
                    alt={alt || book.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)', ...style }}
                    className={`real-book-image ${className || ''}`}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => {
                        console.warn(`Failed to load cover for ${book.title}. Falling back.`);
                        setImageError(true);
                    }}
                />
            </div>
        );
    }

    // Elegant fallback if no cover exists or if image failed to load
    return (
        <div
            className={className}
            style={{
                ...style,
                width: '100%',
                height: '100%',
                background: getElegantGradients(book.title),
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '10%',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, opacity: 0.15, mixBlendMode: 'overlay', pointerEvents: 'none' as const }} />

            <div style={{ zIndex: 1, borderTop: '2px solid rgba(255,255,255,0.4)', paddingTop: '10%' }}>
                <h3 style={{ margin: 0, fontSize: '1.25em', fontWeight: 700, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: 1.2, wordBreak: 'break-word' }}>
                    {book.title}
                </h3>
            </div>

            <div style={{ zIndex: 1 }}>
                {book.category && (
                    <div style={{ fontSize: '0.65em', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>
                        {book.category}
                    </div>
                )}
                <div style={{ fontSize: '0.85em', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                    {book.author}
                </div>
            </div>

            {/* Spine accent line */}
            <div style={{ position: 'absolute', left: '8%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.2)', boxShadow: '1px 0 3px rgba(0,0,0,0.5)' }} />
        </div>
    );
};
