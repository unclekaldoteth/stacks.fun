'use client';

import { useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface PriceChartProps {
    tokenSymbol: string;
    currentPrice: number;
    historicalData?: PriceDataPoint[];
}

interface PriceDataPoint {
    timestamp: number;
    price: number;
    volume: number;
}

type TimeRange = '1H' | '24H' | '7D' | '30D' | 'ALL';

// Generate mock historical data
function generateMockData(currentPrice: number, range: TimeRange): PriceDataPoint[] {
    const now = Date.now();
    const points: PriceDataPoint[] = [];

    let numPoints: number;
    let interval: number;

    switch (range) {
        case '1H':
            numPoints = 60;
            interval = 60 * 1000; // 1 minute
            break;
        case '24H':
            numPoints = 96;
            interval = 15 * 60 * 1000; // 15 minutes
            break;
        case '7D':
            numPoints = 168;
            interval = 60 * 60 * 1000; // 1 hour
            break;
        case '30D':
            numPoints = 120;
            interval = 6 * 60 * 60 * 1000; // 6 hours
            break;
        case 'ALL':
            numPoints = 100;
            interval = 24 * 60 * 60 * 1000; // 1 day
            break;
        default:
            numPoints = 96;
            interval = 15 * 60 * 1000;
    }

    // Generate price with some volatility
    let price = currentPrice * (0.7 + Math.random() * 0.3);

    for (let i = numPoints - 1; i >= 0; i--) {
        const timestamp = now - (i * interval);

        // Random walk towards current price
        const targetDiff = currentPrice - price;
        const randomChange = (Math.random() - 0.5) * currentPrice * 0.05;
        price += targetDiff * 0.02 + randomChange;
        price = Math.max(price, currentPrice * 0.01); // Price floor

        points.push({
            timestamp,
            price,
            volume: Math.floor(Math.random() * 10000)
        });
    }

    // Ensure last point is current price
    if (points.length > 0) {
        points[points.length - 1].price = currentPrice;
    }

    return points;
}

export default function PriceChart({ tokenSymbol, currentPrice, historicalData }: PriceChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('24H');

    const chartData = useMemo(() => {
        if (historicalData && historicalData.length > 0) {
            return historicalData;
        }
        return generateMockData(currentPrice, timeRange);
    }, [currentPrice, timeRange, historicalData]);

    const priceChange = useMemo(() => {
        if (chartData.length < 2) return 0;
        const startPrice = chartData[0].price;
        const endPrice = chartData[chartData.length - 1].price;
        return ((endPrice - startPrice) / startPrice) * 100;
    }, [chartData]);

    const isPositive = priceChange >= 0;
    const chartColor = isPositive ? '#22c55e' : '#ef4444';

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        switch (timeRange) {
            case '1H':
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            case '24H':
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            case '7D':
            case '30D':
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            case 'ALL':
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            default:
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    const formatPrice = (value: number) => {
        if (value >= 1) return `$${value.toFixed(4)}`;
        if (value >= 0.0001) return `$${value.toFixed(6)}`;
        return `$${value.toFixed(8)}`;
    };

    return (
        <div className="pump-panel bg-black border-[var(--border-bright)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                        ${tokenSymbol} Price
                    </h3>
                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-black text-white terminal-text">
                            {currentPrice.toFixed(6)}
                        </span>
                        <span className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '↑' : '↓'}{Math.abs(priceChange).toFixed(2)}%
                        </span>
                    </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-[var(--border)]">
                    {(['1H', '24H', '7D', '30D', 'ALL'] as TimeRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all ${timeRange === range
                                    ? 'bg-white text-black'
                                    : 'text-[var(--text-muted)] hover:text-white'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`colorPrice-${tokenSymbol}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatTime}
                            stroke="rgba(255,255,255,0.2)"
                            fontSize={9}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                            minTickGap={50}
                        />
                        <YAxis
                            tickFormatter={(v) => v.toFixed(4)}
                            stroke="rgba(255,255,255,0.2)"
                            fontSize={9}
                            axisLine={false}
                            tickLine={false}
                            width={55}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0a0a0a',
                                border: '2px solid #262626',
                                borderRadius: '8px',
                                padding: '10px'
                            }}
                            labelFormatter={(value) => formatTime(value as number)}
                            formatter={(value) => [formatPrice(value as number), 'Price']}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke={chartColor}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#colorPrice-${tokenSymbol})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-[var(--border)]">
                <div>
                    <span className="pump-label">High</span>
                    <div className="text-xs font-bold text-green-400 terminal-text">
                        {Math.max(...chartData.map(d => d.price)).toFixed(6)}
                    </div>
                </div>
                <div>
                    <span className="pump-label">Low</span>
                    <div className="text-xs font-bold text-red-400 terminal-text">
                        {Math.min(...chartData.map(d => d.price)).toFixed(6)}
                    </div>
                </div>
                <div>
                    <span className="pump-label">Avg</span>
                    <div className="text-xs font-bold text-white terminal-text">
                        {(chartData.reduce((acc, d) => acc + d.price, 0) / chartData.length).toFixed(6)}
                    </div>
                </div>
                <div>
                    <span className="pump-label">Volume</span>
                    <div className="text-xs font-bold text-[var(--accent-orange)] terminal-text">
                        ${chartData.reduce((acc, d) => acc + d.volume, 0).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}
