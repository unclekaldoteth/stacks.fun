'use client';

import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    ReferenceDot
} from 'recharts';
import { generateBondingCurveData, getProgressToGraduation } from '@/lib/api';

interface BondingCurveChartProps {
    tokensSold: number;
    marketCap: number;
    currentPrice: number;
    symbol: string;
}

export default function BondingCurveChart({
    tokensSold,
    marketCap,
    currentPrice,
    symbol
}: BondingCurveChartProps) {
    const chartData = useMemo(() =>
        generateBondingCurveData(tokensSold, 100),
        [tokensSold]
    );

    const progressToGraduation = getProgressToGraduation(marketCap);
    const graduationThreshold = 69000;

    const formatPrice = (value: number) => {
        if (value >= 1) return `$${value.toFixed(2)}`;
        if (value >= 0.01) return `$${value.toFixed(4)}`;
        return `$${value.toFixed(6)}`;
    };

    const formatTokens = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toFixed(0);
    };

    return (
        <div className="pump-panel bg-black border-[var(--border-bright)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)]">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">bonding curve progress</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white terminal-text">{progressToGraduation.toFixed(1)}%</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">to graduation</span>
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">current price</h3>
                    <div className="text-2xl font-black text-[var(--accent-orange)] terminal-text">
                        ${currentPrice.toFixed(6)}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-72 mb-8 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05)_0%,transparent_70%)] pointer-events-none" />
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f7931a" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f7931a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="sold"
                            tickFormatter={formatTokens}
                            stroke="rgba(255,255,255,0.2)"
                            fontSize={10}
                            axisLine={false}
                            tickLine={false}
                            fontFamily="JetBrains Mono"
                        />
                        <YAxis
                            tickFormatter={(v) => `${v.toFixed(3)}`}
                            stroke="rgba(255,255,255,0.2)"
                            fontSize={10}
                            axisLine={false}
                            tickLine={false}
                            width={50}
                            fontFamily="JetBrains Mono"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0a0a0a',
                                border: '2px solid #262626',
                                borderRadius: '8px',
                                padding: '10px'
                            }}
                            labelFormatter={(value) => `Supply: ${formatTokens(value as number)}`}
                            formatter={(value) => [formatPrice(value as number), 'Price']}
                        />
                        <Area
                            type="stepAfter"
                            dataKey="price"
                            stroke="#f7931a"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                        />
                        {/* Current position marker */}
                        <ReferenceLine
                            x={tokensSold}
                            stroke="rgba(255,255,255,0.3)"
                            strokeDasharray="4 4"
                            strokeWidth={1}
                        />
                        <ReferenceDot
                            x={tokensSold}
                            y={currentPrice}
                            r={6}
                            fill="#f7931a"
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[var(--border)]">
                <div>
                    <span className="pump-label">tokens sold</span>
                    <div className="text-lg font-black text-white terminal-text">
                        {formatTokens(tokensSold)}
                    </div>
                </div>
                <div>
                    <span className="pump-label">market cap</span>
                    <div className="text-lg font-black text-[var(--accent-orange)] terminal-text">
                        ${marketCap.toLocaleString()}
                    </div>
                </div>
                <div>
                    <span className="pump-label">reserve</span>
                    <div className="text-lg font-black text-white terminal-text">
                        ${(marketCap * 0.8).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Graduation Gauge */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">graduation progress</span>
                    <span className="text-[10px] font-black text-white terminal-text">$69,000 TARGET</span>
                </div>
                <div className="h-2 bg-black border border-[var(--border)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[var(--accent-yellow)] via-[var(--accent-orange)] to-white transition-all duration-1000"
                        style={{ width: `${progressToGraduation}%` }}
                    />
                </div>
                <p className="mt-2 text-[10px] text-[var(--text-secondary)] italic leading-tight">
                    when the market cap reaches $69K, all liquidity will be migrated to ALEX lab and the token will graduate.
                </p>
            </div>
        </div>
    );
}
