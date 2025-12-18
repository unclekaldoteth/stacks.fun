'use client';

import { useEffect, useState } from 'react';
import { getAccountNFTs, getNFTMetadata } from '@/lib/hiro';
import { useWallet } from './WalletProvider';

interface NFT {
    asset_identifier: string;
    tokenId: string;
    contractAddress: string;
    contractName: string;
    metadata?: {
        name?: string;
        description?: string;
        image?: string;
    };
}

interface NFTGalleryProps {
    address?: string;
    limit?: number;
    showHeader?: boolean;
}

export default function NFTGallery({ address: propAddress, limit = 12, showHeader = true }: NFTGalleryProps) {
    const { address: walletAddress } = useWallet();
    const address = propAddress || walletAddress;

    const [nfts, setNfts] = useState<NFT[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNFTs = async () => {
            if (!address) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const holdings = await getAccountNFTs(address);

                if (!holdings || holdings.length === 0) {
                    setNfts([]);
                    setIsLoading(false);
                    return;
                }

                // Parse NFT holdings and fetch metadata
                const parsedNFTs: NFT[] = await Promise.all(
                    holdings.slice(0, limit).map(async (holding) => {
                        // Parse asset identifier: SP123...::contract-name::token-name
                        const parts = holding.asset_identifier.split('::');
                        const contractId = parts[0]; // SP123...
                        const contractParts = contractId.split('.');
                        const contractAddress = contractParts[0];
                        const contractName = contractParts[1] || '';
                        const tokenId = holding.value.repr.replace('u', '');

                        // Try to fetch metadata
                        let metadata = undefined;
                        try {
                            const meta = await getNFTMetadata(contractAddress, contractName, parseInt(tokenId));
                            if (meta?.metadata) {
                                metadata = meta.metadata;
                            }
                        } catch {
                            // Metadata fetch failed, continue without it
                        }

                        return {
                            asset_identifier: holding.asset_identifier,
                            tokenId,
                            contractAddress,
                            contractName,
                            metadata,
                        };
                    })
                );

                setNfts(parsedNFTs);
            } catch (err) {
                console.error('Error fetching NFTs:', err);
                setError('Failed to load NFTs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNFTs();
    }, [address, limit]);

    if (!address) {
        return (
            <div className="text-center py-12">
                <div className="text-zinc-500">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Connect wallet to view NFTs</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div>
                {showHeader && <h2 className="text-2xl font-bold mb-6">My NFTs</h2>}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-square bg-zinc-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-400">{error}</div>
            </div>
        );
    }

    if (nfts.length === 0) {
        return (
            <div className="text-center py-12">
                {showHeader && <h2 className="text-2xl font-bold mb-6">My NFTs</h2>}
                <div className="text-zinc-500">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No NFTs found</p>
                    <p className="text-sm mt-1">Mint your first collectible!</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {showHeader && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">My NFTs</h2>
                    <span className="text-sm text-zinc-500">{nfts.length} items</span>
                </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {nfts.map((nft, index) => (
                    <div
                        key={`${nft.asset_identifier}-${index}`}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-purple-500/30 transition-all"
                    >
                        {/* Image or Placeholder */}
                        {nft.metadata?.image ? (
                            <img
                                src={nft.metadata.image}
                                alt={nft.metadata.name || `NFT #${nft.tokenId}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                                <span className="text-white/20 text-4xl font-bold">#{nft.tokenId}</span>
                            </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <div className="text-sm font-medium text-white truncate">
                                    {nft.metadata?.name || `Token #${nft.tokenId}`}
                                </div>
                                <div className="text-xs text-zinc-400 truncate">
                                    {nft.contractName}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
