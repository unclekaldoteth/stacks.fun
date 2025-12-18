'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useWallet } from './WalletProvider';
import { formatAddress } from '@/lib/stacks';

const navItems = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/marketplace', label: 'Marketplace', icon: 'grid' },
    { href: '/activity', label: 'Activity', icon: 'activity' },
    { href: '/leaderboard', label: 'Leaderboard', icon: 'trophy' },
];

const icons: { [key: string]: React.ReactNode } = {
    home: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    grid: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    ),
    activity: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    trophy: (
        <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 3h14a2 2 0 012 2v2a5 5 0 01-5 5h-1.1a5 5 0 004.9-4H19V5H5v3h-.8A5 5 0 009 12h1.1A5 5 0 015 7V5a2 2 0 012-2zm7 9a1 1 0 011 1v2h2a1 1 0 110 2h-2v2a3 3 0 01-3 3H8a1 1 0 110-2h2a1 1 0 001-1v-2h-2a1 1 0 110-2h2v-2a1 1 0 011-1z" />
        </svg>
    ),
    user: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
};

export default function Sidebar() {
    const pathname = usePathname();
    const { isConnected, address, connect, disconnect } = useWallet();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="mobile-menu-btn"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMobileOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${isMobileOpen ? 'visible' : ''}`}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="px-5 mb-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="text-lg font-bold text-white">StacksPad</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                        >
                            {icons[item.icon]}
                            {item.label}
                        </Link>
                    ))}

                    {isConnected && (
                        <Link
                            href="/profile"
                            onClick={() => setIsMobileOpen(false)}
                            className={`nav-link ${pathname === '/profile' ? 'active' : ''}`}
                        >
                            {icons.user}
                            Profile
                        </Link>
                    )}
                </nav>

                {/* Divider */}
                <div className="my-6 mx-5 border-t border-white/10" />

                {/* Wallet section */}
                <div className="px-5">
                    {isConnected && address ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                        {address.slice(2, 4).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-white truncate">
                                        {formatAddress(address)}
                                    </div>
                                    <div className="text-xs text-[var(--text-muted)]">Connected</div>
                                </div>
                            </div>
                            <button
                                onClick={disconnect}
                                className="w-full btn btn-secondary text-sm"
                            >
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={connect}
                            className="w-full btn btn-primary"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Connect Wallet
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span>Powered by Stacks</span>
                        <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-[10px] font-medium">
                            Mainnet
                        </span>
                    </div>
                </div>
            </aside>
        </>
    );
}
