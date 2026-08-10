import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import './CommandPalette.css';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<{ id: string; title: string; type: string }[]>([]);

    // Simulated search backend call
    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }
        setIsSearching(true);
        const timeoutId = setTimeout(() => {
            // Mock search results
            setResults([
                { id: '1', title: `Result for "${query}" - The Midnight Library`, type: 'Book' },
                { id: '2', title: `Result for "${query}" - Dune`, type: 'Book' },
            ]);
            setIsSearching(false);
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Handle Cmd+K / Ctrl+K globally
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                onClose(); // In a real app we toggle the global state instead, for this demo we'll just toggle it where it's called
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="cmd-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <div className="cmd-container">
                        <motion.div
                            className="cmd-dialog glass-panel"
                            initial={{ opacity: 0, scale: 0.98, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="cmd-input-wrapper">
                                <Search className="cmd-search-icon" size={20} />
                                <input
                                    type="text"
                                    className="cmd-input"
                                    placeholder="Search books, authors, or ISBN..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    autoFocus
                                />
                                {isSearching && <Loader2 className="cmd-loading-icon" size={20} />}
                                <div className="cmd-shortcut">ESC</div>
                            </div>

                            <div className="cmd-results">
                                {query === '' ? (
                                    <div className="cmd-empty">
                                        <p>Start typing to search...</p>
                                    </div>
                                ) : results.length > 0 ? (
                                    <ul className="cmd-list">
                                        {results.map((r, i) => (
                                            <motion.li
                                                key={r.id}
                                                className="cmd-list-item"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <Search size={16} />
                                                <div className="cmd-item-content">
                                                    <span className="cmd-item-title">{r.title}</span>
                                                    <span className="cmd-item-type">{r.type}</span>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </ul>
                                ) : !isSearching ? (
                                    <div className="cmd-empty">
                                        <p>No results found for "{query}"</p>
                                    </div>
                                ) : null}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
