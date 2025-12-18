'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getActivity, type Activity } from '@/lib/api';
import { formatAddress, getExplorerTxUrl } from '@/lib/stacks';

export default function ActivityPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const data = await getActivity(50);
                setActivities(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchActivities();

        const interval = setInterval(async () => {
            try {
                const data = await getActivity(50);
                setActivities(data);
            } catch (err) {
                console.error(err);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const formatTimeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'buy': return '💰';
            case 'sell': return '💸';
            case 'token_created': return '🚀';
            case 'graduated': return '🎓';
            default: return '📝';
        }
    };

    return (
        <main className="min-h-screen bg-[var(--bg-primary)] text-white pb-20">
            <div className="main-container py-12">
                {/* Back Nav */}
                <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white mb-12 transition-colors">
                    [← back to terminal]
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-black italic tracking-tighter mb-4 text-white">System Logs</h1>
                    <p className="text-[var(--text-secondary)] terminal-text text-sm max-w-xl">
                        real-time monitoring of all autonomous token launches and peer-to-peer exchanges occurring on the network.
                    </p>
                </div>

                {/* Activity Table */}
                <div className="pump-panel bg-black border-[var(--border-bright)] overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-4 py-3 border-b border-[var(--border)] bg-zinc-900/50">
                        <div className="col-span-1">type</div>
                        <div className="col-span-3">account</div>
                        <div className="col-span-5">action</div>
                        <div className="col-span-2 text-right">time</div>
                        <div className="col-span-1 text-right">explorer</div>
                    </div>

                    <div className="divide-y divide-[var(--border)] overflow-y-auto max-h-[70vh]">
                        {isLoading ? (
                            [...Array(10)].map((_, i) => (
                                <div key={i} className="px-4 py-6 animate-pulse flex gap-4">
                                    <div className="w-8 h-8 bg-zinc-900 rounded" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-2 bg-zinc-900 rounded w-1/4" />
                                        <div className="h-2 bg-zinc-900 rounded w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : activities.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="text-4xl mb-4 opacity-20">🛰️</div>
                                <h3 className="text-xl font-bold terminal-text">NO SIGNAL</h3>
                                <p className="text-[var(--text-secondary)] text-xs mt-2 uppercase">waiting for the next transmission...</p>
                            </div>
                        ) : (
                            activities.map((activity) => (
                                <div key={activity.id} className="grid grid-cols-1 md:grid-cols-12 items-center px-4 py-4 hover:bg-zinc-900 transition-colors group">
                                    <div className="col-span-1 flex items-center gap-3 md:block mb-2 md:mb-0">
                                        <span className="text-lg md:text-xl">{getActivityIcon(activity.event_type)}</span>
                                        <span className="md:hidden text-[11px] font-black uppercase text-[var(--text-muted)]">{activity.event_type}</span>
                                    </div>

                                    <div className="col-span-3 mb-2 md:mb-0">
                                        <span className="text-blue-400 font-bold terminal-text text-xs">{formatAddress(activity.address || '', 8, 8)}</span>
                                    </div>

                                    <div className="col-span-5 mb-2 md:mb-0">
                                        <span className="text-white text-xs lowercase">
                                            {activity.event_type === 'buy' ? 'purchased tokens on the bonding curve' :
                                                activity.event_type === 'sell' ? 'liquidated position on the marketplace' :
                                                    activity.event_type === 'token_created' ? 'initiated a new token project' :
                                                        activity.event_type === 'graduated' ? 'automated migration to alex lab complete' :
                                                            activity.event_type}
                                        </span>
                                    </div>

                                    <div className="col-span-2 text-right mb-2 md:mb-0">
                                        <span className="text-[10px] text-[var(--text-muted)] font-bold terminal-text">{formatTimeAgo(activity.created_at)}</span>
                                    </div>

                                    <div className="col-span-1 text-right">
                                        <a
                                            href={getExplorerTxUrl(activity.tx_id || '')}
                                            target="_blank"
                                            className="inline-flex items-center justify-center w-8 h-8 rounded border border-[var(--border)] hover:bg-white hover:text-black transition-all"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 flex justify-center">
                    <div className="px-6 py-2 bg-zinc-900/50 rounded-full border border-[var(--border)] text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-ping" />
                        listening for live blockchain events
                    </div>
                </div>
            </div>
        </main>
    );
}
