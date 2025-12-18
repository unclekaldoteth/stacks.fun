'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import TokenCard from '@/components/TokenCard';
import KingOfTheHill from '@/components/KingOfTheHill';
import RecentTrades from '@/components/RecentTrades';
import { Token, getTokens, getTrendingTokens, Activity, getActivity } from '@/lib/api';
import { formatAddress, getExplorerTxUrl } from '@/lib/stacks';

type FilterTab = 'trending' | 'new' | 'graduated';

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('trending');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      let tokenData: Token[] = [];

      switch (activeTab) {
        case 'trending':
          tokenData = await getTrendingTokens(12);
          break;
        case 'new':
          tokenData = await getTokens({ orderBy: 'created_at', order: 'desc', graduated: false });
          break;
        case 'graduated':
          tokenData = await getTokens({ graduated: true });
          break;
      }

      setTokens(tokenData);

      // Fetch activity
      const activityData = await getActivity(5);
      setActivity(activityData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const kothToken = useMemo(() => {
    if (tokens.length === 0) return null;
    // For now, just pick the top trending or the first one approaching graduation
    return tokens[0];
  }, [tokens]);

  const filteredTokens = useMemo(() => {
    if (!search) return tokens;
    const s = search.toLowerCase();
    return tokens.filter(t =>
      t.name.toLowerCase().includes(s) ||
      t.symbol.toLowerCase().includes(s)
    );
  }, [tokens, search]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'token_created': return '🚀';
      case 'buy': return '💰';
      case 'sell': return '💸';
      case 'graduated': return '🎓';
      default: return '📝';
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-white font-sans selection:bg-[var(--accent-orange)] selection:text-black">
      <div className="main-container py-8 sm:py-12">

        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16">
          <Link
            href="/create"
            className="text-4xl sm:text-5xl font-black mb-4 hover:scale-105 transition-transform hover:text-[var(--accent-orange)] italic tracking-tighter"
          >
            [start a new coin]
          </Link>
          <div className="flex gap-4 text-sm font-bold terminal-text">
            <a href="https://docs.alexlab.co" target="_blank" className="hover:underline text-[var(--accent-yellow)]">[how it works]</a>
            <span className="text-[var(--text-muted)]">|</span>
            <span className="text-[var(--text-secondary)]">graduates to ALEX lab</span>
          </div>
        </div>

        {/* King of the Hill */}
        {kothToken && (
          <div className="mb-16">
            <KingOfTheHill token={kothToken} />
          </div>
        )}

        {/* Filter & Search Panel */}
        <div className="pump-panel mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 p-1 bg-black rounded-lg border border-[var(--border)]">
            {[
              { id: 'trending', label: 'trending' },
              { id: 'new', label: 'new' },
              { id: 'graduated', label: 'graduated' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`px-4 py-1 rounded font-bold text-xs uppercase tracking-tight transition-all ${activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'text-[var(--text-muted)] hover:text-white'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="search for token..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pump-input text-xs"
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="stats-grid">
          <div className="stat-item">
            <span className="pump-label">tokens launched</span>
            <div className="stat-val">{tokens.length}</div>
          </div>
          <div className="stat-item">
            <span className="pump-label">daily volume</span>
            <div className="stat-val text-[var(--accent-orange)]">124K STX</div>
          </div>
          <div className="stat-item">
            <span className="pump-label">graduated</span>
            <div className="stat-val text-[var(--accent-yellow)]">12</div>
          </div>
          <div className="stat-item">
            <span className="pump-label">active traders</span>
            <div className="stat-val">2,482</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main List */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="token-grid">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="pump-card h-40 animate-pulse bg-zinc-900" />
                ))}
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="pump-panel text-center py-20 border-dashed border-4">
                <div className="text-4xl mb-4 opacity-20">📡</div>
                <h3 className="text-xl font-bold terminal-text">NO COINS FOUND</h3>
                <p className="text-[var(--text-secondary)] mb-6">the signal is lost in space...</p>
                <button onClick={() => fetchData()} className="btn-pump btn-pump-primary">RESCAN GRID</button>
              </div>
            ) : (
              <div className="token-grid">
                {filteredTokens.map((token, index) => (
                  <TokenCard
                    key={token.id}
                    token={token}
                    rank={activeTab === 'trending' ? index + 1 : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed (Terminal Style) */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="pump-panel sticky top-24 bg-black border-[var(--border-bright)]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--accent-orange)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                  Live Activity
                </h3>
              </div>

              <div className="space-y-4 overflow-hidden">
                {activity.map((item) => (
                  <div key={item.id} className="text-[11px] leading-tight hover:bg-zinc-900 p-2 rounded transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[var(--accent-orange)] font-bold">{getActivityIcon(item.event_type)}</span>
                      <span className="text-[var(--text-muted)] terminal-text">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-white">
                      <span className="text-blue-400 font-bold">{item.address && formatAddress(item.address, 4, 4)}</span>
                      {' '}<span className="text-[var(--text-secondary)]">{item.event_type.replace('_', ' ')}</span>
                    </div>
                    {item.tx_id && (
                      <a
                        href={getExplorerTxUrl(item.tx_id)}
                        target="_blank"
                        className="text-[var(--text-muted)] hover:text-white underline mt-1 block opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        [view transaction]
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <Link href="/activity" className="block mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-white transition-colors py-2 border-t border-[var(--border)]">
                [view system logs]
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Trades Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Trades
            </h2>
            <Link
              href="/activity"
              className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors"
            >
              [view all →]
            </Link>
          </div>
          <RecentTrades limit={8} showTitle={false} />
        </div>
      </div>
    </main>
  );
}
