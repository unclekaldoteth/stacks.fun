"use client";

import Link from 'next/link';
import { useState } from 'react';

interface LaunchProps {
    id: string;
    title: string;
    image: string;
    price: string;
    status: 'Live' | 'Upcoming' | 'Sold Out';
    minted?: number;
    maxSupply?: number;
}

export default function LaunchCard({
    id,
    title,
    image,
    price,
    status,
    minted = 0,
    maxSupply = 1000
}: LaunchProps) {
    const [isHovered, setIsHovered] = useState(false);
    const progressPercent = maxSupply > 0 ? (minted / maxSupply) * 100 : 0;

    return (
        <Link
            href={`/launch/${id}`}
            className="block group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 backdrop-blur-sm border border-white/10 transition-all duration-500 hover:-translate-y-3 hover:border-purple-500/40 card-hover">
                {/* Animated border glow on hover */}
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-[-2px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl blur-sm animate-pulse" />
                </div>

                {/* Inner container */}
                <div className="relative bg-zinc-900 rounded-2xl overflow-hidden">
                    <div className="aspect-[4/5] relative overflow-hidden">
                        {/* Background gradient or image */}
                        {image ? (
                            <img
                                src={image}
                                alt={title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-indigo-900/80 to-black transition-all duration-700 group-hover:scale-105">
                                {/* Decorative elements */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-2xl transition-transform duration-500 ${isHovered ? 'scale-150' : 'scale-100'}`} />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white/10 text-8xl font-black">
                                        {title.charAt(0)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                        {/* Status Badge with glow */}
                        <div className="absolute top-4 right-4 z-10">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${status === 'Live'
                                ? 'bg-orange-500 text-black shadow-[0_0_20px_rgba(247,147,26,0.6)]'
                                : status === 'Upcoming'
                                    ? 'bg-blue-500 text-black shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                    : 'bg-zinc-700 text-zinc-300'
                                }`}>
                                {status === 'Live' && (
                                    <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
                                )}
                                {status}
                            </span>
                        </div>

                        {/* Floating icon on hover */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>

                        {/* Content at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 transition-all duration-300">
                                {title}
                            </h3>

                            {/* Progress bar */}
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                    <span>{minted.toLocaleString()} minted</span>
                                    <span>{progressPercent.toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-pink-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="block text-xs text-zinc-500 uppercase tracking-wider">Price</span>
                                    <span className="text-white font-mono text-lg font-bold">{price} <span className="text-purple-400 text-sm">STX</span></span>
                                </div>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isHovered ? 'bg-purple-500 scale-110' : 'bg-white/10'}`}>
                                    <svg className={`w-5 h-5 transition-all duration-300 ${isHovered ? 'text-white translate-x-0.5' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
