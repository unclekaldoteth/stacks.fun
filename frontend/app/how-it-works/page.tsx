'use client';

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-4">
            How <span className="text-[var(--accent-green)]">Stacks.fun</span> Works
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            Launch tokens on Stacks with bonding curves, powered by <span className="text-green-400">USDCx</span>
          </p>
        </div>

        {/* Get USDCx Banner */}
        <div className="pump-panel bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/50 mb-8">
          <h2 className="text-xl font-black uppercase mb-4 text-center text-green-400">
            💵 Get USDCx
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-black">1.</span>
              <div>
                <p className="text-white font-bold">Get USDC on Ethereum</p>
                <p className="text-[var(--text-muted)] text-sm">
                  Buy USDC on any exchange and withdraw to your Ethereum wallet
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-black">2.</span>
              <div>
                <p className="text-white font-bold">Bridge to Stacks</p>
                <p className="text-[var(--text-muted)] text-sm">
                  Use <a href="https://usdcx.stacks.co" target="_blank" className="text-blue-400 underline">usdcx.stacks.co</a> to bridge USDC from Ethereum → Stacks (Circle xReserve)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-black">3.</span>
              <div>
                <p className="text-white font-bold">Trade with USDCx! 🎉</p>
                <p className="text-[var(--text-muted)] text-sm">
                  Your USDCx will appear in your Stacks wallet (Leather/Xverse). Now you can trade on stacks.fun!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="pump-panel">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-green)] flex items-center justify-center text-black font-black text-xl shrink-0">
                1
              </div>
              <div>
                <h2 className="text-xl font-black uppercase mb-2">Create Your Token</h2>
                <p className="text-[var(--text-secondary)] mb-4">
                  Pick a name, symbol, and description for your token. No coding required.
                  Your token is deployed to the Stacks blockchain instantly.
                </p>
                <ul className="text-sm text-[var(--text-muted)] space-y-1">
                  <li>• Token follows SIP-010 standard</li>
                  <li>• Automatic liquidity via bonding curve</li>
                  <li>• Creator receives 1% of all trades</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="pump-panel">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-yellow)] flex items-center justify-center text-black font-black text-xl shrink-0">
                2
              </div>
              <div>
                <h2 className="text-xl font-black uppercase mb-2">Trade with USDCx</h2>
                <p className="text-[var(--text-secondary)] mb-4">
                  Buy and sell tokens using <span className="text-green-400 font-bold">USDCx</span> (bridged USDC).
                  Price increases as more tokens are bought.
                </p>
                <ul className="text-sm text-[var(--text-muted)] space-y-1">
                  <li>• Pay with USDCx (1:1 with USDC)</li>
                  <li>• Instant trades, no order books</li>
                  <li>• Always liquidity available for sells</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="pump-panel">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-orange)] flex items-center justify-center text-black font-black text-xl shrink-0">
                3
              </div>
              <div>
                <h2 className="text-xl font-black uppercase mb-2">Graduate to ALEX DEX</h2>
                <p className="text-[var(--text-secondary)] mb-4">
                  When market cap reaches $69,000, the token graduates!
                  Liquidity is automatically migrated to ALEX DEX.
                </p>
                <ul className="text-sm text-[var(--text-muted)] space-y-1">
                  <li>• Automatic liquidity pool creation</li>
                  <li>• Trading continues on ALEX DEX</li>
                  <li>• Bonding curve is permanently closed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bonding Curve Info */}
        <div className="mt-12 pump-panel bg-zinc-900/50">
          <h2 className="text-xl font-black uppercase mb-4 text-center">
            📈 Bonding Curve Mechanics
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-[var(--accent-green)]">$0.0001</div>
              <div className="text-sm text-[var(--text-muted)]">Starting Price</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[var(--accent-yellow)]">10,000</div>
              <div className="text-sm text-[var(--text-muted)]">Tokens per $1 USDC</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[var(--accent-orange)]">$69K</div>
              <div className="text-sm text-[var(--text-muted)]">Graduation Target</div>
            </div>
          </div>
        </div>

        {/* Fees */}
        <div className="mt-8 pump-panel">
          <h2 className="text-xl font-black uppercase mb-4 text-center">💰 Fee Structure</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-zinc-900 rounded-lg">
              <div className="text-2xl font-black text-[var(--accent-green)]">1%</div>
              <div className="text-sm text-[var(--text-muted)]">Platform Fee</div>
            </div>
            <div className="text-center p-4 bg-zinc-900 rounded-lg">
              <div className="text-2xl font-black text-[var(--accent-yellow)]">1%</div>
              <div className="text-sm text-[var(--text-muted)]">Creator Fee</div>
            </div>
          </div>
        </div>

        {/* USDCx Info */}
        <div className="mt-8 pump-panel bg-green-900/20 border-green-500/30">
          <h2 className="text-xl font-black uppercase mb-4 text-center text-green-400">
            🔗 About USDCx
          </h2>
          <p className="text-[var(--text-secondary)] text-center mb-4">
            USDCx is bridged USDC on Stacks via Circle xReserve, backed 1:1 by native USDC on Ethereum.
          </p>
          <div className="text-sm">
            <div className="bg-zinc-900 p-3 rounded text-center">
              <div className="text-green-400 font-bold">Mainnet Contract (Circle xReserve)</div>
              <code className="text-xs text-[var(--text-muted)] break-all">
                SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx
              </code>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="/create"
            className="inline-block px-8 py-4 bg-[var(--accent-green)] text-black font-black uppercase tracking-wider rounded hover:scale-105 transition-transform"
          >
            [Launch Your Token]
          </a>
        </div>
      </div>
    </main>
  );
}

