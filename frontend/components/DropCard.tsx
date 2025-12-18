'use client';

import Link from 'next/link';

interface DropCardProps {
    id: string;
    title: string;
    image?: string;
    price: string;
    status: 'Live' | 'Upcoming' | 'Sold Out';
    minted?: number;
    maxSupply?: number;
    chain?: string;
}

export default function DropCard({
    id,
    title,
    image,
    price,
    status,
    minted = 0,
    maxSupply = 1000,
    chain = 'Stacks',
}: DropCardProps) {
    const getStatusClass = () => {
        switch (status) {
            case 'Live':
                return 'status-live';
            case 'Upcoming':
                return 'status-upcoming';
            case 'Sold Out':
                return 'status-ended';
            default:
                return 'status-upcoming';
        }
    };

    return (
        <Link href={`/launch/${id}`} className="block">
            <div className="drop-card group">
                {/* Background */}
                <div className="drop-card-bg">
                    {image ? (
                        <img src={image} alt={title} className="transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                        <>
                            {/* Decorative elements for empty cards */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                <div className="text-8xl font-black">{title.charAt(0)}</div>
                            </div>
                        </>
                    )}
                </div>

                {/* Overlay */}
                <div className="drop-card-overlay">
                    {/* Top section */}
                    <div className="drop-card-top">
                        <span className="featured-tag text-xs py-1 px-2.5" style={{ marginBottom: 0 }}>
                            Featured
                        </span>
                        <span className={`status-badge ${getStatusClass()}`}>
                            {status}
                        </span>
                    </div>

                    {/* Bottom section */}
                    <div className="drop-card-bottom">
                        <h3 className="drop-card-title">{title}</h3>
                        <div className="drop-card-chain">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            {chain}
                        </div>
                        <div className="drop-card-info">
                            <span className="drop-card-price">{price} STX</span>
                            <span className="drop-card-supply">{maxSupply.toLocaleString()} items</span>
                            <span className="drop-card-supply">{minted.toLocaleString()} minted</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
