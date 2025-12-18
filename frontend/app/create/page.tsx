'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerToken } from '@/lib/contracts';
import { getExplorerTxUrl } from '@/lib/stacks';

export default function CreateTokenPage() {
    const router = useRouter();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTxId(null);

        try {
            await registerToken(
                formData.name,
                formData.symbol,
                formData.imageUrl || undefined,
                formData.description || undefined,
                {
                    onFinish: (data) => {
                        setTxId(data.txId);
                        setIsLoading(false);
                        // Show success message with link to explorer
                        alert(`Token registration submitted! Transaction: ${data.txId}`);
                    },
                    onCancel: () => {
                        setIsLoading(false);
                    },
                }
            );
        } catch (err) {
            console.error(err);
            alert('Failed to register token. Make sure you have a Stacks wallet connected.');
            setIsLoading(false);
        }
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
                        disabled={isLoading}
                        className="w-full btn-pump btn-pump-primary py-6 text-2xl"
                    >
                        {isLoading ? 'INITIATING DEPLOYMENT...' : '[CREATE COIN]'}
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
