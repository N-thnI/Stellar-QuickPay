/**
 * TransactionResult.jsx
 *
 * Success → Gold border + emerald icon, obsidian hash block, gold explorer link
 * Error   → Crimson border + crimson icon, obsidian bg
 */
import { CheckCircle2, XCircle, ExternalLink, X, Copy, CheckCheck, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function TransactionResult({ result, onDismiss }) {
  const [copied, setCopied] = useState(false)
  if (!result) return null

  const dismissBtn = (
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss"
      className="text-silver-600 hover:text-silver-300 transition-colors shrink-0"
    >
      <X size={16} />
    </button>
  )

  async function handleCopyCode(code) {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Success ───────────────────────────────────────────────
  if (result.success) {
    return (
      <div className="rounded-2xl border border-gold-500 bg-obsidian-800
        shadow-[0_2px_12px_rgba(212,175,55,0.12)] p-5 animate-slide-up">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={22} className="text-success-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-silver-200">Payment sent successfully!</p>
              <p className="text-xs text-silver-500 mt-0.5">
                Transaction confirmed on Stellar Testnet
              </p>

              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-bold text-silver-600 uppercase tracking-widest">
                  Transaction Hash
                </p>
                <code className="block text-xs font-mono text-silver-300
                  bg-obsidian-700 border border-[rgba(229,228,226,0.10)]
                  px-3 py-2 rounded-lg break-all leading-relaxed">
                  {result.hash}
                </code>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold
                    text-gold-400 hover:text-gold-300
                    underline-offset-2 hover:underline transition-colors"
                >
                  <ExternalLink size={12} />
                  View on Stellar.Expert
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 shrink-0">
          {dismissBtn}
          <button
            type="button"
            onClick={onDismiss}
            className="btn-silver mt-2 border-gold-500/30 text-gold-400 hover:border-gold-400 hover:text-gold-300 transition-colors"
          >
            <RefreshCw size={14} /> Make another payment
          </button>
        </div>
      </div>
    )
  }

  const isRawCode = result.error?.startsWith('__raw_code__:')
  const displayError = isRawCode ? 'Unknown Error' : result.error
  const rawCode = isRawCode ? result.error.replace('__raw_code__:', '') : null

  return (
    <div className="rounded-2xl border border-silver-500/50 bg-obsidian-800
      shadow-card p-5 animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 w-full">
          <XCircle size={22} className="text-crimson-400 shrink-0 mt-0.5" />
          <div className="w-full">
            <p className="font-bold text-silver-200">Transaction failed</p>
            <p className="text-sm text-crimson-300 mt-1">{displayError}</p>
            
            {rawCode && (
              <div className="mt-3 bg-obsidian-900 border border-silver-700/50 rounded-xl p-3">
                <p className="text-[11px] font-bold text-silver-500 uppercase tracking-widest mb-1.5">Raw Result Code</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-silver-300 bg-obsidian-700 border border-[rgba(229,228,226,0.10)] px-3 py-2 rounded-lg truncate">
                    {rawCode}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(rawCode)}
                    className="p-2 rounded-lg text-silver-500 hover:text-gold-400 hover:bg-obsidian-700 transition-colors shrink-0 flex items-center justify-center border border-silver-700/50"
                  >
                    {copied ? <CheckCheck size={15} className="text-success-400" /> : <Copy size={15} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {dismissBtn}
      </div>
    </div>
  )
}
