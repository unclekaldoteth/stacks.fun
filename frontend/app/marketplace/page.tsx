'use client';

import { useEffect, useState } from 'react';
import DropCard from '@/components/DropCard';
import { getLaunches, type Launch } from '@/lib/api';

export default function MarketplacePage() {
    const [launches, setLaunches] = useState<Launch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'sold_out'>('all');

    useEffect(() => {
        const fetchLaunches = async () => {
            setIsLoading(true);
            const data = await getLaunches();
            setLaunches(data);
            setIsLoading(false);
        };
        fetchLaunches();
    }, []);

    const filteredLaunches = launches.filter(launch => {
        if (filter === 'all') return true;
        return launch.status === filter;
    });

    const getStatusLabel = (status: string): 'Live' | 'Upcoming' | 'Sold Out' => {
        switch (status) {
            case 'live': return 'Live';
            case 'upcoming': return 'Upcoming';
            case 'sold_out': return 'Sold Out';
            default: return 'Upcoming';
        }
    };

    const filters = [
        { value: 'all', label: 'All Drops' },
        { value: 'live', label: 'Live' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'sold_out', label: 'Ended' },
    ] as const;

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
                <p className="text-[var(--text-secondary)]">Discover and mint exclusive NFT collections on Stacks</p>
            </div>

            {/* Filters */}
            <div className="section-header mb-6">
                <div className="tabs">
                    {filters.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`tab ${filter === f.value ? 'active' : ''}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                    {filteredLaunches.length} {filteredLaunches.length === 1 ? 'drop' : 'drops'}
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="drops-grid">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="drop-card shimmer" style={{ aspectRatio: '1.9/1' }} />
                    ))}
                </div>
            ) : filteredLaunches.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                        <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <p className="text-[var(--text-secondary)]">No drops found</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Try a different filter</p>
                </div>
            ) : (
                <div className="drops-grid">
                    {filteredLaunches.map((launch) => (
                        <DropCard
                            key={launch.id}
                            id={launch.id}
                            title={launch.title}
                            image={launch.image_url || ''}
                            price={String(launch.price_stx)}
                            status={getStatusLabel(launch.status)}
                            minted={launch.minted_count}
                            maxSupply={launch.max_supply}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
