'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Token, getTokens } from '@/lib/api';
import { formatAddress } from '@/lib/stacks';

interface AdvancedSearchProps {
    onResultClick?: () => void;
}

type SortOption = 'market_cap' | 'created_at' | 'name' | 'price';
type FilterOption = 'all' | 'active' | 'graduated';

export default function AdvancedSearch({ onResultClick }: AdvancedSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Token[]>([]);
    const [allTokens, setAllTokens] = useState<Token[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('market_cap');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [showFilters, setShowFilters] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch all tokens on mount
    useEffect(() => {
        const fetchTokens = async () => {
            setLoading(true);
            try {
                const tokens = await getTokens();
                setAllTokens(tokens);
            } catch (error) {
                console.error('Error fetching tokens:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTokens();
    }, []);

    // Filter and sort results
    useEffect(() => {
        let filtered = [...allTokens];

        // Apply text search
        if (query) {
            const q = query.toLowerCase();
            filtered = filtered.filter(token =>
                token.name.toLowerCase().includes(q) ||
                token.symbol.toLowerCase().includes(q) ||
                token.creator.toLowerCase().includes(q)
            );
        }

        // Apply filter
        if (filterBy === 'active') {
            filtered = filtered.filter(t => !t.is_graduated);
        } else if (filterBy === 'graduated') {
            filtered = filtered.filter(t => t.is_graduated);
        }

        // Apply sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'market_cap':
                    return b.market_cap - a.market_cap;
                case 'created_at':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return b.current_price - a.current_price;
                default:
                    return 0;
            }
        });

        setResults(filtered.slice(0, 10));
    }, [query, allTokens, sortBy, filterBy]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowFilters(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-full max-w-xl">
            {/* Search Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search tokens by name, symbol, or creator..."
                    className="w-full bg-black border-2 border-[var(--border)] rounded-lg px-4 py-3 pl-10 text-sm font-medium focus:outline-none focus:border-[var(--accent-orange)] transition-all"
                />
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-800 transition-colors ${showFilters ? 'text-[var(--accent-orange)]' : 'text-[var(--text-muted)]'}`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-black border-2 border-[var(--border)] rounded-lg p-4 z-50">
                    <div className="flex flex-wrap gap-4">
                        {/* Sort By */}
                        <div>
                            <label className="pump-label mb-2 block">Sort By</label>
                            <div className="flex gap-2">
                                {[
                                    { id: 'market_cap', label: 'Market Cap' },
                                    { id: 'created_at', label: 'Newest' },
                                    { id: 'price', label: 'Price' },
                                    { id: 'name', label: 'Name' },
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSortBy(opt.id as SortOption)}
                                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${sortBy === opt.id
                                                ? 'bg-[var(--accent-orange)] text-black'
                                                : 'bg-zinc-900 text-white hover:bg-zinc-800'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter By */}
                        <div>
                            <label className="pump-label mb-2 block">Status</label>
                            <div className="flex gap-2">
                                {[
                                    { id: 'all', label: 'All' },
                                    { id: 'active', label: 'Active' },
                                    { id: 'graduated', label: 'Graduated' },
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setFilterBy(opt.id as FilterOption)}
                                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${filterBy === opt.id
                                                ? 'bg-white text-black'
                                                : 'bg-zinc-900 text-white hover:bg-zinc-800'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Results Dropdown */}
            {isOpen && (query || results.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-black border-2 border-[var(--border)] rounded-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-[var(--text-muted)]">
                            <div className="animate-spin w-5 h-5 border-2 border-[var(--accent-orange)] border-t-transparent rounded-full mx-auto" />
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-4 text-center">
                            <p className="text-[var(--text-muted)] text-sm">No tokens found</p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1">Try a different search term</p>
                        </div>
                    ) : (
                        results.map((token) => (
                            <Link
                                key={token.id}
                                href={`/token/${token.symbol}`}
                                onClick={() => {
                                    setIsOpen(false);
                                    setQuery('');
                                    onResultClick?.();
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-zinc-900 transition-colors border-b border-[var(--border)] last:border-0"
                            >
                                {/* Token Icon */}
                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                                    {token.image_uri ? (
                                        <img src={token.image_uri} alt={token.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-[var(--text-muted)]">{token.symbol[0]}</span>
                                    )}
                                </div>

                                {/* Token Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white truncate">{token.name}</span>
                                        <span className="text-[10px] text-[var(--text-muted)] terminal-text">${token.symbol}</span>
                                        {token.is_graduated && (
                                            <span className="text-[8px] bg-[var(--accent-orange)] text-black px-1 rounded font-bold">GRAD</span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-[var(--text-muted)]">
                                        by {formatAddress(token.creator, 4, 4)}
                                    </div>
                                </div>

                                {/* Price & Market Cap */}
                                <div className="text-right">
                                    <div className="text-xs font-bold text-[var(--accent-orange)] terminal-text">
                                        ${token.market_cap.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-[var(--text-muted)]">
                                        ${token.current_price.toFixed(6)}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}

                    {/* View All Link */}
                    {results.length > 0 && (
                        <Link
                            href="/"
                            className="block p-3 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors bg-zinc-950"
                        >
                            [view all {allTokens.length} tokens]
                        </Link>
                    )}
                </div>
            )}

            {/* Keyboard Hint */}
            {isOpen && (
                <div className="absolute -bottom-6 left-0 text-[9px] text-[var(--text-muted)]">
                    Press ESC to close
                </div>
            )}
        </div>
    );
}
