/**
 * Header.jsx — Sticky app bar.
 * Obsidian bg · Gold logo · Silver title · TESTNET pill
 */
import { Zap } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 w-full
      border-b border-[rgba(229,228,226,0.08)]
      bg-obsidian-900/90 backdrop-blur-md">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo + wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center
            bg-gold-gradient shadow-gold-lift shrink-0">
            <Zap size={15} className="text-obsidian-950" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[17px] tracking-tight text-silver-200">
            Stellar <span className="text-gold-gradient">QuickPay</span>
          </span>
        </div>

        {/* Network badge */}
        <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full
          border border-gold-500/25 text-gold-500 bg-gold-500/8 uppercase">
          TESTNET
        </span>
      </div>
    </header>
  )
}
