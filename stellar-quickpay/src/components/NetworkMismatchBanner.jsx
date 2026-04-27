/**
 * NetworkMismatchBanner.jsx
 * ─────────────────────────────────────────────────────────────
 * Shown when Freighter's active network is not Stellar Testnet.
 * Blocks the Send form and tells the user exactly how to fix it.
 * ─────────────────────────────────────────────────────────────
 */
import { AlertTriangle, ArrowRight } from 'lucide-react'

export default function NetworkMismatchBanner() {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-300 dark:border-red-700/60 bg-red-50 dark:bg-red-900/20 px-5 py-4 shadow-sm animate-slide-up"
    >
      {/* Heading row */}
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={20}
          className="text-red-500 dark:text-red-400 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
            ⚠️ Network Mismatch — Freighter is not on Testnet
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            Please switch Freighter to{' '}
            <span className="font-bold">TESTNET</span> to sign this
            transaction. Sending on the wrong network will fail.
          </p>
        </div>
      </div>

      {/* How-to breadcrumb */}
      <div className="mt-3 ml-8 flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400">
        <span className="bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-700/40 rounded px-2 py-0.5">
          Settings
        </span>
        <ArrowRight size={11} />
        <span className="bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-700/40 rounded px-2 py-0.5">
          Network
        </span>
        <ArrowRight size={11} />
        <span className="bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-700/40 rounded px-2 py-0.5">
          Testnet
        </span>
        <span className="ml-1 text-red-400 dark:text-red-500 font-normal">
          — then refresh this page
        </span>
      </div>
    </div>
  )
}
