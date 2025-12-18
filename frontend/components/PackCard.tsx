'use client';

import Link from 'next/link';

interface PackCardProps {
    id: string;
    title: string;
    image?: string;
    price: string;
    status: 'Live' | 'Upcoming' | 'Sold Out';
    minted?: number;
    maxSupply?: number;
}

export default function PackCard({
    id,
    title,
    image,
    price,
    status,
    minted = 0,
    maxSupply = 1000,
}: PackCardProps) {
    const getBadgeClass = () => {
        switch (status) {
            case 'Live':
                return 'badge-live';
            case 'Upcoming':
                return 'badge-upcoming';
            case 'Sold Out':
                return 'badge-sold-out';
            default:
                return 'badge-upcoming';
        }
    };

    return (
        <Link href={`/launch/${id}`} className="block">
            <div className="pack-card">
                <div className="pack-card-image">
                    {image ? (
                        <img src={image} alt={title} />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white/10 text-6xl font-black">
                                {title.charAt(0)}
                            </div>
                        </div>
                    )}

                    {/* Badge */}
                    <span className={`pack-card-badge ${getBadgeClass()}`}>
                        {status === 'Live' && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-black mr-1.5 animate-pulse" />
                        )}
                        {status}
                    </span>

                    {/* Overlay with info */}
                    <div className="pack-card-overlay">
                        <h3 className="pack-card-title">{title}</h3>
                        <div className="flex items-center justify-between">
                            <span className="pack-card-price">{price} STX</span>
                            <span className="text-xs text-[var(--text-muted)]">
                                {minted}/{maxSupply}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
