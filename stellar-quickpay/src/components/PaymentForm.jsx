/**
 * PaymentForm.jsx — Send XLM form.
 *
 * Design spec:
 *   Card    → #161616 bg, 1px rgba(229,228,226,0.10) border
 *   Inputs  → #1C1C1C bg, silver border, gold focus ring + ring-offset-[#0B0B0B]
 *   Button  → gold-gradient, #0B0B0B text, shadow-gold-lift
 *   Errors  → crimson on obsidian
 */
import { useState } from 'react'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import { StrKey } from '@stellar/stellar-sdk'

export default function PaymentForm({ onSend, disabled, networkMismatch, senderBalance }) {
  const [destination, setDestination] = useState('')
  const [amount,      setAmount]      = useState('')
  const [memo,        setMemo]        = useState('')
  const [pending,     setPending]     = useState(false)
  const [fieldError,  setFieldError]  = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setFieldError('')

    if (!destination.trim()) {
      setFieldError('Destination address is required.')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setFieldError('Enter a valid XLM amount greater than 0.')
      return
    }
    if (senderBalance !== null && senderBalance !== '' &&
        parseFloat(amount) > parseFloat(senderBalance) - 1) {
      setFieldError(
        `Insufficient balance. You need at least ${(parseFloat(amount) + 1).toFixed(2)} XLM (amount + 1 XLM reserve).`
      )
      return
    }

    setPending(true)
    await onSend({ destination: destination.trim(), amount, memo })
    setPending(false)
  }

  // Spec: obsidian input bg, silver border, gold focus ring offset on #0B0B0B
  const inputCls = [
    'w-full px-4 py-2.5 rounded-xl text-sm',
    'bg-[#0B0B0B] text-silver-200 font-mono',
    'border border-silver-500/50',
    'placeholder:text-silver-600',
    'focus:outline-none',
    'focus:ring-2 focus:ring-gold-500/70',
    'focus:ring-offset-2 focus:ring-offset-[#0B0B0B]',
    'focus:border-gold-500/40',
    'transition-all duration-150',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' ')

  const labelCls = 'block text-[11px] font-bold text-silver-500 uppercase tracking-widest mb-1.5'

  const isValidAddress = destination.length === 0 || StrKey.isValidEd25519PublicKey(destination)
  const isSendDisabled = disabled || pending || (destination.length > 0 && !isValidAddress)

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-6 space-y-5 animate-fade-in"
    >
      {/* Title */}
      <h2 className="font-bold text-silver-200 text-base flex items-center gap-2">
        <Send size={16} className="text-gold-500" />
        Send XLM
      </h2>

      {/* Destination */}
      <div>
        <label className={labelCls}>Destination Address</label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="G…"
          spellCheck={false}
          autoComplete="off"
          disabled={disabled || pending}
          className={`${inputCls} ${!isValidAddress ? 'border-crimson-500/50 focus:border-crimson-500/50 focus:ring-crimson-500/50' : ''}`}
        />
        {destination.length > 0 && !isValidAddress && (
          <p className="text-xs text-crimson-400 mt-1.5 font-medium">Invalid Ed25519 public key</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className={labelCls}>Amount (XLM)</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.0000001"
            step="any"
            disabled={disabled || pending}
            className={`${inputCls} pr-14`}
          />
          {/* Gold XLM badge */}
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2
            text-[11px] font-bold text-gold-500 pointer-events-none tracking-wide">
            XLM
          </span>
        </div>

        {senderBalance !== null && senderBalance !== '' && (
          <p className="mt-1.5 text-xs text-silver-500">
            Available:{' '}
            <button
              type="button"
              onClick={() => setAmount(Math.max(0, parseFloat(senderBalance) - 1).toFixed(7))}
              className="text-gold-400 hover:text-gold-300 font-semibold
                underline-offset-2 hover:underline transition-colors"
            >
              {Math.max(0, parseFloat(senderBalance) - 1).toFixed(2)} XLM
            </button>
            {' '}(after 1 XLM reserve)
          </p>
        )}
      </div>

      {/* Memo */}
      <div>
        <label className={labelCls}>
          Memo{' '}
          <span className="normal-case font-normal text-silver-600 tracking-normal">
            (optional, max 28 chars)
          </span>
        </label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value.slice(0, 28))}
          placeholder="Payment note…"
          disabled={disabled || pending}
          className={inputCls}
        />
      </div>

      {/* Field error */}
      {fieldError && (
        <div className="flex items-start gap-2 rounded-xl
          bg-crimson-900/50 border border-crimson-500/30
          px-4 py-3 animate-slide-up">
          <AlertCircle size={15} className="text-crimson-400 mt-0.5 shrink-0" />
          <p className="text-sm text-crimson-300">{fieldError}</p>
        </div>
      )}

      {/* Submit — gold gradient, obsidian text, lift shadow */}
      <button
        type="submit"
        disabled={isSendDisabled}
        className="btn-gold w-full"
      >
        {pending ? (
          <><Loader2 size={17} className="animate-spin" /> Broadcasting transaction…</>
        ) : networkMismatch ? (
          <><AlertCircle size={16} /> Wrong Network — Switch to Testnet</>
        ) : (
          <><Send size={16} /> Send Payment</>
        )}
      </button>
    </form>
  )
}
