/**
 * WalletCard.jsx — Four render states.
 *
 * Skeleton  freighterDetected === null   → spinner
 * State 1   freighterDetected === false  → Download Freighter
 * State 2   !publicKey                  → Connect Wallet
 * State 3   publicKey, !isAccountFunded → Activate Account
 * State 4   funded                      → Balance display
 *
 * Design spec:
 *   Cards    → #161616 bg, 1px rgba(229,228,226,0.10) border, shadow-card
 *   Buttons  → gold-gradient bg, #0B0B0B text, shadow-gold-lift
 *   Inputs   → #1C1C1C bg, silver border, gold focus ring + ring-offset-[#0B0B0B]
 *   Spinners → gold (#D4AF37)
 */
import {
  Wallet, LogOut, RefreshCw, Copy, CheckCheck,
  ExternalLink, Zap, Loader2, ShieldCheck,
  AlertTriangle, X, Download,
} from 'lucide-react'
import { useState } from 'react'

// ── Shared primitives ─────────────────────────────────────────

function truncate(key) {
  if (!key) return ''
  return `${key.slice(0, 6)}…${key.slice(-6)}`
}

/** Obsidian card shell — matches spec exactly */
function Card({ children, className = '' }) {
  return (
    <div className={`card animate-fade-in ${className}`}>
      {children}
    </div>
  )
}

/** Gold gradient primary button */
function GoldBtn({ onClick, disabled, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn-gold w-full ${className}`}
    >
      {children}
    </button>
  )
}

/** Silver-outlined with Gold text on hover for Connect */
function ConnectBtn({ onClick, disabled, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border border-silver-500 text-silver-200 hover:border-gold-500 hover:text-gold-400 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed w-full ${className}`}
    >
      {children}
    </button>
  )
}

/** Silver outline secondary button */
function SilverBtn({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="btn-silver">
      {children}
    </button>
  )
}

/** Crimson inline error — obsidian bg */
function InlineError({ message, onDismiss }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2.5 rounded-xl
      bg-crimson-900/50 border border-crimson-500/30
      px-4 py-3 animate-slide-up">
      <AlertTriangle size={15} className="text-crimson-400 shrink-0 mt-0.5" />
      <p className="text-sm text-crimson-300 flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-crimson-500 hover:text-crimson-300 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

/** Monospace address with copy + explorer */
function AddressRow({ publicKey }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(publicKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate text-sm font-mono
        text-silver-300 bg-obsidian-700
        border border-[rgba(229,228,226,0.10)]
        px-3 py-1.5 rounded-lg">
        {truncate(publicKey)}
      </code>

      <button
        type="button"
        onClick={handleCopy}
        title="Copy address"
        className="p-1.5 rounded-lg text-silver-500
          hover:text-gold-400 hover:bg-obsidian-700 transition-colors"
      >
        {copied
          ? <CheckCheck size={15} className="text-success-400" />
          : <Copy size={15} />}
      </button>

      <a
        href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
        target="_blank"
        rel="noopener noreferrer"
        title="View on Stellar.Expert"
        className="p-1.5 rounded-lg text-silver-500
          hover:text-gold-400 hover:bg-obsidian-700 transition-colors"
      >
        <ExternalLink size={15} />
      </a>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

export default function WalletCard({
  freighterDetected, publicKey, balance, isAccountFunded,
  connecting, waitingForPopup, isActivating, error,
  onConnect, onDisconnect, onRefreshBalance, onActivate, onDismissError,
}) {
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefresh() {
    setRefreshing(true)
    await onRefreshBalance()
    setRefreshing(false)
  }

  // ── Skeleton ──────────────────────────────────────────────
  if (freighterDetected === null) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-4 py-10 px-6">
          <div className="w-14 h-14 rounded-full bg-obsidian-700
            border border-[rgba(229,228,226,0.08)] flex items-center justify-center">
            <Loader2 size={22} className="text-gold-500 animate-spin" />
          </div>
          <p className="text-sm text-silver-500">Detecting Freighter wallet…</p>
        </div>
      </Card>
    )
  }

  // ── State 1: No extension ─────────────────────────────────
  if (freighterDetected === false) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-5 py-10 px-6">
          <div className="w-16 h-16 rounded-full bg-obsidian-700
            border border-[rgba(229,228,226,0.08)] flex items-center justify-center">
            <Wallet size={28} className="text-silver-500" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="font-bold text-silver-200 text-lg tracking-tight">
              Freighter not detected
            </h2>
            <p className="text-sm text-silver-400 max-w-xs leading-relaxed">
              Freighter is a free browser extension for signing Stellar
              transactions — your private keys never leave your device.
            </p>
          </div>

          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold w-full max-w-xs"
          >
            <Download size={16} />
            Download Freighter
          </a>

          <p className="text-xs text-silver-600 text-center">
            After installing, refresh this page to continue.
          </p>
        </div>
      </Card>
    )
  }

  // ── State 2: Extension present, not connected ─────────────
  if (!publicKey) {
    const isBusy = connecting || waitingForPopup

    return (
      <Card>
        <div className="flex flex-col items-center gap-5 py-10 px-6">
          {/* Icon ring — gold tint when ready */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center
            bg-gold-500/10 border border-gold-500/25">
            <Wallet size={28} className="text-gold-400" />
          </div>

          <div className="text-center space-y-1.5">
            <h2 className="font-bold text-silver-200 text-lg tracking-tight">
              Connect your wallet
            </h2>
            <p className="text-sm text-silver-400">
              {waitingForPopup
                ? 'Check the Freighter popup and approve the connection.'
                : 'Freighter is ready — click below to authorise the connection.'}
            </p>
          </div>

          {/* Popup-open hint */}
          {waitingForPopup && (
            <div className="w-full flex items-center gap-2.5 rounded-xl
              bg-gold-500/8 border border-gold-500/20 px-4 py-3 animate-slide-up">
              <Loader2 size={14} className="text-gold-500 animate-spin shrink-0" />
              <p className="text-sm text-gold-300">
                Freighter popup is open — approve the connection request.
              </p>
            </div>
          )}

          <InlineError message={error} onDismiss={onDismissError} />

          <ConnectBtn onClick={onConnect} disabled={isBusy} className="max-w-xs">
            {connecting && !waitingForPopup
              ? <><Loader2 size={16} className="animate-spin" /> Connecting…</>
              : waitingForPopup
              ? <><Loader2 size={16} className="animate-spin" /> Waiting for Freighter…</>
              : <><Wallet size={16} /> Connect Freighter</>}
          </ConnectBtn>
        </div>
      </Card>
    )
  }

  // ── State 3: Connected, unfunded ──────────────────────────
  if (isAccountFunded === false) {
    return (
      <Card>
        {/* Header strip */}
        <div className="px-5 py-3 flex items-center justify-between
          bg-obsidian-700/70 border-b border-[rgba(229,228,226,0.08)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse-gold" />
            <span className="text-[11px] font-bold text-gold-400 uppercase tracking-widest">
              Setup Testnet Account
            </span>
          </div>
          <SilverBtn onClick={onDisconnect}>
            <LogOut size={12} /> Disconnect
          </SilverBtn>
        </div>

        <div className="p-5 space-y-4">
          <AddressRow publicKey={publicKey} />

          {/* Info box */}
          <div className="rounded-xl bg-obsidian-700/60
            border border-[rgba(229,228,226,0.08)] px-4 py-3 space-y-1.5">
            <p className="text-sm font-semibold text-silver-200">
              Your account needs to be activated before you can send XLM.
            </p>
            <p className="text-xs text-silver-400 leading-relaxed">
              On Stellar Testnet, every new address must receive at least{' '}
              <span className="font-semibold text-silver-200">1 XLM</span>{' '}
              to exist on the ledger. Click below to claim{' '}
              <span className="font-semibold text-gold-400">10,000 test XLM</span>{' '}
              from the Friendbot faucet — instant and free.
            </p>
          </div>

          <InlineError message={error} onDismiss={onDismissError} />

          <GoldBtn onClick={onActivate} disabled={isActivating}>
            {isActivating
              ? <><Loader2 size={17} className="animate-spin" /> Activating account…</>
              : <><Zap size={17} /> Activate Account (Get 10,000 Testnet XLM)</>}
          </GoldBtn>

          {isActivating && (
            <div className="flex items-center gap-2.5 rounded-lg
              bg-obsidian-700/60 border border-[rgba(229,228,226,0.08)]
              px-3 py-2.5 animate-slide-up">
              <Loader2 size={13} className="text-gold-500 animate-spin shrink-0" />
              <p className="text-xs text-silver-400">
                Waiting for the Stellar ledger to confirm — usually{' '}
                <span className="font-semibold text-silver-300">3–5 seconds</span>. Hang tight…
              </p>
            </div>
          )}

          <p className="flex items-center gap-1.5 text-xs text-silver-600">
            <ShieldCheck size={12} className="shrink-0" />
            Friendbot is the official Stellar testnet faucet. No private keys are shared.
          </p>
        </div>
      </Card>
    )
  }

  // ── State 4: Connected + funded ───────────────────────────
  return (
    <Card>
      <div className="p-6">
        {/* Status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success-400
              shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />
            <span className="text-[11px] font-bold text-success-400 uppercase tracking-widest">
              Connected · Testnet
            </span>
          </div>
          <SilverBtn onClick={onDisconnect}>
            <LogOut size={12} /> Disconnect
          </SilverBtn>
        </div>

        {/* Address */}
        <div className="mt-4">
          <AddressRow publicKey={publicKey} />
        </div>

        {/* Balance */}
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold text-silver-500 uppercase tracking-widest mb-1">
              XLM Balance
            </p>
            <p className="text-4xl font-bold text-silver-200 tabular-nums leading-none">
              {balance !== '' ? (
                <>
                  {parseFloat(balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 7,
                  })}
                  <span className="text-lg font-bold text-gold-gradient ml-2">XLM</span>
                </>
              ) : (
                <span className="text-silver-600 text-2xl">—</span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh balance"
            className="p-2 rounded-lg text-silver-500
              hover:text-gold-400 hover:bg-obsidian-700
              transition-colors disabled:opacity-40"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </Card>
  )
}
