'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerToken, createPool, getPoolInfo } from '@/lib/contracts';
import { getExplorerTxUrl } from '@/lib/stacks';
import { useWallet } from '@/components/WalletProvider';

export default function CreateTokenPage() {
    const router = useRouter();
    const { address, isConnected } = useWallet();
    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        description: '',
        imageUrl: '',
        twitter: '',
        telegram: '',
        website: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [txId, setTxId] = useState<string | null>(null);
    const [poolExists, setPoolExists] = useState<boolean | null>(null);
    const [step, setStep] = useState<'idle' | 'creating-pool' | 'registering' | 'done'>('idle');

    const DEPLOYER = process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER || 'ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM';
    const tokenContractId = `${DEPLOYER}.launchpad-token`;

    // Check if pool exists on mount
    useEffect(() => {
        async function checkPool() {
            try {
                const pool = await getPoolInfo(tokenContractId);
                setPoolExists(pool !== null);
            } catch {
                setPoolExists(false);
            }
        }
        checkPool();
    }, [tokenContractId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            alert('Please connect your wallet first.');
            return;
        }

        setIsLoading(true);
        setTxId(null);

        try {
            // If pool doesn't exist, create it first (only needed once ever)
            if (poolExists === false) {
                setStep('creating-pool');
                await createPool(
                    tokenContractId,
                    address || DEPLOYER,
                    {
                        onFinish: async (data) => {
                            console.log('Pool created:', data.txId);
                            setPoolExists(true);
                            // Now register the token
                            await registerTokenStep();
                        },
                        onCancel: () => {
                            setIsLoading(false);
                            setStep('idle');
                        },
                    }
                );
            } else {
                // Pool exists, just register the token
                await registerTokenStep();
            }
        } catch (err) {
            console.error(err);
            alert('Transaction failed. Please try again.');
            setIsLoading(false);
            setStep('idle');
        }
    };

    const registerTokenStep = async () => {
        setStep('registering');
        await registerToken(
            formData.name,
            formData.symbol,
            formData.imageUrl || undefined,
            formData.description || undefined,
            {
                onFinish: async (data) => {
                    setTxId(data.txId);
                    setStep('done');
                    setIsLoading(false);

                    // Save social links to backend (after token syncs)
                    if (formData.twitter || formData.telegram || formData.website) {
                        // Wait a bit for backend to sync the token, then save social links
                        setTimeout(async () => {
                            try {
                                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                                await fetch(`${API_URL}/api/tokens/${formData.symbol}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        creator: address,
                                        twitter: formData.twitter || undefined,
                                        telegram: formData.telegram || undefined,
                                        website: formData.website || undefined,
                                    }),
                                });
                            } catch (err) {
                                console.error('Failed to save social links:', err);
                            }
                        }, 35000); // Wait 35 seconds for sync to complete
                    }

                    alert(`Token "${formData.symbol}" created successfully! It will appear on the homepage in about 30 seconds.`);
                    router.push('/');
                },
                onCancel: () => {
                    setIsLoading(false);
                    setStep('idle');
                },
            }
        );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <main className="min-h-screen bg-[var(--bg-primary)] text-white pb-20">
            <div className="main-container max-w-2xl py-12">
                {/* Back Nav */}
                <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white mb-12 transition-colors">
                    [← back to terminal]
                </Link>

                <div className="flex flex-col items-center text-center mb-12">
                    <h1 className="text-5xl font-black italic tracking-tighter mb-4 text-white">
                        Launch a new coin
                    </h1>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] terminal-text">
                        Cost to deploy: ~10 STX + Network Fees
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="pump-panel space-y-6">
                        <div>
                            <label className="pump-label">Token Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Quantum Frog"
                                className="pump-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="pump-label">Symbol (ticker)</label>
                            <input
                                type="text"
                                name="symbol"
                                value={formData.symbol}
                                onChange={handleChange}
                                placeholder="FROG"
                                className="pump-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="pump-label">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="The most quantum frog in the stacks universe..."
                                className="pump-input resize-none py-3"
                                required
                            />
                        </div>
                        <div>
                            <label className="pump-label">Image URL</label>
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="pump-input"
                            />
                            <p className="mt-2 text-[10px] text-[var(--text-muted)] italic">Tip: Use IPFS or a permanent image link for better visibility.</p>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="pump-panel space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Socials (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="pump-label">Twitter/X</label>
                                <input
                                    type="text"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                    placeholder="@..."
                                    className="pump-input text-xs"
                                />
                            </div>
                            <div>
                                <label className="pump-label">Telegram</label>
                                <input
                                    type="text"
                                    name="telegram"
                                    value={formData.telegram}
                                    onChange={handleChange}
                                    placeholder="t.me/..."
                                    className="pump-input text-xs"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="pump-label">Website</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="pump-input text-xs"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading || step === 'done' || poolExists === null}
                        className="w-full btn-pump btn-pump-primary py-6 text-2xl"
                    >
                        {poolExists === null
                            ? 'CHECKING...'
                            : isLoading
                                ? step === 'creating-pool'
                                    ? 'SETTING UP TRADING POOL...'
                                    : 'CREATING TOKEN...'
                                : step === 'done'
                                    ? '[DONE! ✓]'
                                    : '[CREATE COIN]'
                        }
                    </button>

                    <div className="text-center">
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)]" />
                            Secure deployment on Stacks Blockchain
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)]" />
                        </p>
                    </div>
                </form>
            </div>
        </main>
    );
}
