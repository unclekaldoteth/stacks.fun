'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useWallet } from './WalletProvider';
import { formatAddress } from '@/lib/stacks';

export default function Navbar() {
    const pathname = usePathname();
    const { isConnected, address, balance, connect, disconnect, isConnecting } = useWallet();
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <nav className="navbar bg-black border-b border-[var(--border)] sticky top-0 z-[100]">
            <div className="main-container h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-[var(--accent-orange)] border-2 border-white rounded-md flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                        <span className="text-black font-black text-lg">S</span>
                    </div>
                    <span className="text-xl font-black italic tracking-tighter hidden sm:block">stacks.fun</span>
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-6 terminal-text text-[10px] font-bold uppercase tracking-widest">
                    <Link href="/how-it-works" className="text-[var(--text-muted)] hover:text-[var(--accent-yellow)] transition-colors">
                        [how it works]
                    </Link>
                    <Link href="/leaderboard" className="text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors">
                        [rewards]
                    </Link>
                    <Link href="/activity" className="text-[var(--text-muted)] hover:text-white transition-colors">
                        [support]
                    </Link>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {isConnected && address ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="btn-pump border-white text-white text-xs terminal-text flex items-center gap-2"
                            >
                                <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                                {formatAddress(address, 4, 4)}
                                <span className="text-[var(--text-muted)] ml-1">▼</span>
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-black border-2 border-[var(--border-bright)] rounded-lg shadow-2xl py-2 z-50 terminal-text text-[10px]">
                                    {balance && (
                                        <div className="px-4 py-2 border-b border-[var(--border)] text-[var(--accent-orange)]">
                                            BALANCE: {balance} STX
                                        </div>
                                    )}
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 hover:bg-[var(--bg-card)] text-white"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        [VIEW PROFILE]
                                    </Link>
                                    <button
                                        onClick={() => {
                                            disconnect();
                                            setShowDropdown(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-[var(--bg-card)] text-red-500"
                                    >
                                        [DISCONNECT]
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={connect}
                            disabled={isConnecting}
                            className="btn-pump btn-pump-primary text-xs"
                        >
                            {isConnecting ? 'CONNECTING...' : '[connect wallet]'}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
