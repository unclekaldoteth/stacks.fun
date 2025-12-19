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
            Launch tokens on Stacks with bonding curves, secured by Bitcoin
          </p>
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
                  <li>• Creator receives 2% of all trades</li>
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
                <h2 className="text-xl font-black uppercase mb-2">Trade on Bonding Curve</h2>
                <p className="text-[var(--text-secondary)] mb-4">
                  Buy and sell tokens directly through the bonding curve smart contract.
                  Price increases as more tokens are bought.
                </p>
                <ul className="text-sm text-[var(--text-muted)] space-y-1">
                  <li>• Instant trades, no order books</li>
                  <li>• Price follows mathematical curve: P = k × supply²</li>
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
                  When market cap reaches 100,000 STX, the token graduates!
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
              <div className="text-3xl font-black text-[var(--accent-green)]">0.01 STX</div>
              <div className="text-sm text-[var(--text-muted)]">Starting Price</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[var(--accent-yellow)]">1B</div>
              <div className="text-sm text-[var(--text-muted)]">Total Supply</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[var(--accent-orange)]">100K STX</div>
              <div className="text-sm text-[var(--text-muted)]">Graduation Target</div>
            </div>
          </div>
        </div>

        {/* Fees */}
        <div className="mt-8 pump-panel">
          <h2 className="text-xl font-black uppercase mb-4 text-center">💰 Fee Structure</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-zinc-900 rounded-lg">
              <div className="text-2xl font-black text-[var(--accent-green)]">2%</div>
              <div className="text-sm text-[var(--text-muted)]">Platform Fee</div>
            </div>
            <div className="text-center p-4 bg-zinc-900 rounded-lg">
              <div className="text-2xl font-black text-[var(--accent-yellow)]">2%</div>
              <div className="text-sm text-[var(--text-muted)]">Creator Fee</div>
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
