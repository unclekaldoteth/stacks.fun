'use client';

import { useEffect, useState } from 'react';
import { getActivity, type Activity } from '@/lib/api';
import { formatAddress, getExplorerTxUrl, getExplorerAddressUrl } from '@/lib/stacks';

interface ActivityFeedProps {
    limit?: number;
    showHeader?: boolean;
}

export default function ActivityFeed({ limit = 20, showHeader = true }: ActivityFeedProps) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            setIsLoading(true);
            const data = await getActivity(limit);
            setActivities(data);
            setIsLoading(false);
        };

        fetchActivity();

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchActivity, 30000);
        return () => clearInterval(interval);
    }, [limit]);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'buy':
            case 'token_created':
                return (
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                );
            case 'sell':
                return (
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </div>
                );
            case 'graduated':
                return (
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="text-lg">🎓</span>
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 rounded-full bg-zinc-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const getActivityLabel = (type: string) => {
        switch (type) {
            case 'buy': return 'Bought';
            case 'sell': return 'Sold';
            case 'token_created': return 'Created';
            case 'graduated': return 'Graduated';
            default: return type;
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {showHeader && (
                    <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
                )}
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-zinc-800" />
                        <div className="flex-1">
                            <div className="h-4 bg-zinc-800 rounded w-1/3 mb-2" />
                            <div className="h-3 bg-zinc-800 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-12">
                {showHeader && (
                    <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
                )}
                <div className="text-zinc-500">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No activity yet</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {showHeader && (
                <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            )}
            <div className="space-y-3">
                {activities.map((activity) => (
                    <div
                        key={activity.id}
                        className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                        {getActivityIcon(activity.event_type)}

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-white">
                                    {getActivityLabel(activity.event_type)}
                                </span>
                                {activity.address && (
                                    <a
                                        href={getExplorerAddressUrl(activity.address)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 font-mono text-sm"
                                    >
                                        {formatAddress(activity.address)}
                                    </a>
                                )}
                            </div>
                            {activity.tx_id && (
                                <a
                                    href={getExplorerTxUrl(activity.tx_id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-500 hover:text-zinc-400 text-sm"
                                >
                                    View transaction →
                                </a>
                            )}
                        </div>

                        <span className="text-sm text-zinc-500 whitespace-nowrap">
                            {formatTimeAgo(activity.created_at)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
