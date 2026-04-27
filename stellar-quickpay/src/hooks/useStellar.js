/**
 * useStellar.js
 * ─────────────────────────────────────────────────────────────
 * Encapsulates all Stellar / Freighter logic so UI components
 * stay clean and free of SDK details.
 *
 * Freighter detection lifecycle
 * ─────────────────────────────
 * Browser extensions inject into the page asynchronously — the
 * window object may not be fully decorated by the time the first
 * render fires.  We therefore run a two-pass detection:
 *
 *   Pass 1 — immediate check on mount
 *   Pass 2 — retry after 500 ms (covers slow injection)
 *
 * freighterDetected values:
 *   null  — still checking (show a neutral loading skeleton)
 *   false — extension absent after both passes (show install CTA)
 *   true  — extension present (show Connect button)
 *
 * Dependency ordering note
 * ────────────────────────
 * fetchBalance MUST be defined before connectWallet because
 * connectWallet calls fetchBalance internally and lists it in its
 * useCallback dep array.  Defining it after would put fetchBalance
 * in the temporal dead zone at the time useCallback runs, crashing
 * the app on mount (white screen in StrictMode).
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  isConnected,
  requestAccess,
  signTransaction,
  getNetworkDetails,
} from '@stellar/freighter-api'
import {
  Horizon,
  TransactionBuilder,
  Networks,
  Asset,
  Operation,
  Memo,
  StrKey,
} from '@stellar/stellar-sdk'

// ── Constants ────────────────────────────────────────────────
const HORIZON_URL        = 'https://horizon-testnet.stellar.org'
const NETWORK_PASSPHRASE = Networks.TESTNET   // "Test SDF Network ; September 2015"
const BASE_FEE           = '100'              // stroops
const TX_TIMEOUT_SEC     = 30
const DETECTION_RETRY_MS = 500               // extension injection lag budget

const server = new Horizon.Server(HORIZON_URL)

// ── Safe isConnected wrapper ─────────────────────────────────
// Freighter's isConnected() can throw if the extension context
// isn't ready yet.  We swallow those errors and return false.
async function safeIsConnected() {
  try {
    return await isConnected()
  } catch {
    return false
  }
}

// ── Human-readable error mapper ──────────────────────────────
function parseError(err) {
  const msg = (err?.message || String(err)).toLowerCase()

  if (msg.includes('user declined') || msg.includes('rejected') || msg.includes('cancel'))
    return 'Transaction cancelled — you declined the request in Freighter.'

  if (msg.includes('insufficient'))
    return 'Insufficient funds. Make sure your account has enough XLM (plus ~1 XLM reserve).'

  if (msg.includes('invalid') && msg.includes('address'))
    return 'Invalid destination address. Please double-check the Stellar public key.'

  if (msg.includes('network'))
    return 'Network error. Check your internet connection and try again.'

  const codes = err?.response?.data?.extras?.result_codes
  if (codes) {
    const code = codes.operations?.[0] || codes.transaction || 'unknown_error'
    if (code === 'op_no_destination') return "Recipient account does not exist. Try the 'Create Account' toggle."
    if (code === 'op_underfunded') return "Insufficient XLM balance for this transaction + fee."
    if (code === 'tx_bad_seq') return "Sequence error. Please refresh and try again."
    if (code === 'tx_too_late') return "Transaction expired. Please resubmit."
    return `__raw_code__:${code}`
  }

  // Generic fallback — intentionally does NOT mention 404 / account-not-found
  // because those are handled silently in fetchBalance.
  return err?.message || 'An unexpected error occurred. Please try again.'
}

// ── Hook ─────────────────────────────────────────────────────
export function useStellar() {
  console.log('useStellar: hook initialising')

  // null = still probing, false = absent, true = present
  const [freighterDetected, setFreighterDetected] = useState(null)

  const [publicKey,       setPublicKey]       = useState('')
  const [balance,         setBalance]         = useState('')
  // null = unknown, false = unfunded (404), true = funded
  const [isAccountFunded, setIsAccountFunded] = useState(null)
  const [connecting,      setConnecting]      = useState(false)
  const [waitingForPopup, setWaitingForPopup] = useState(false)
  const [isActivating,    setIsActivating]    = useState(false)
  const [error,           setError]           = useState(null)
  // true when Freighter is on a network other than Testnet
  const [networkMismatch, setNetworkMismatch] = useState(false)

  // Keep a ref to the latest publicKey so fetchBalance never needs
  // publicKey in its dep array — eliminating the circular recreation
  // chain: publicKey change → new fetchBalance → new connectWallet.
  const publicKeyRef = useRef('')
  useEffect(() => { publicKeyRef.current = publicKey }, [publicKey])

  // ── Network check ─────────────────────────────────────────
  // Compares Freighter's active networkPassphrase against the
  // canonical TESTNET passphrase.  Called after connect and after
  // every balance refresh so a mid-session network switch is caught.
  // Swallows errors silently — a failed check leaves the previous
  // mismatch state in place rather than crashing.
  const checkNetwork = useCallback(async () => {
    try {
      const details = await getNetworkDetails()
      const onTestnet = details.networkPassphrase === NETWORK_PASSPHRASE
      setNetworkMismatch(!onTestnet)
      console.log(`useStellar: network check — passphrase="${details.networkPassphrase}" onTestnet=${onTestnet}`)
      return onTestnet
    } catch {
      // Extension not ready or call failed — don't change mismatch state
      return null
    }
  }, [])

  // ── Freighter detection heartbeat ────────────────────────
  // Pass 1: immediate.  Pass 2: after DETECTION_RETRY_MS.
  useEffect(() => {
    let cancelled = false

    async function detect() {
      console.log('useStellar: starting Freighter detection')

      // Pass 1 — immediate
      const found = await safeIsConnected()
      if (cancelled) return

      if (found) {
        console.log('useStellar: Freighter detected (pass 1)')
        setFreighterDetected(true)
        return
      }

      // Pass 2 — wait for extension injection lag
      await new Promise((r) => setTimeout(r, DETECTION_RETRY_MS))
      if (cancelled) return

      const foundRetry = await safeIsConnected()
      console.log('useStellar: Freighter detection result (pass 2):', foundRetry)
      if (!cancelled) setFreighterDetected(foundRetry)
    }

    detect()
    return () => { cancelled = true }
  }, [])

  // ── Fetch XLM balance ─────────────────────────────────────
  // IMPORTANT: defined BEFORE connectWallet so connectWallet can
  // safely reference it in its useCallback dep array without hitting
  // the temporal dead zone.
  //
  // Uses publicKeyRef instead of publicKey state to avoid being
  // recreated every time the key changes (which would cascade into
  // connectWallet being recreated too).
  //
  // Also re-checks the active network on every call so a mid-session
  // network switch in Freighter is caught immediately.
  //
  // 404 → new-user state (isAccountFunded = false, balance = '0').
  // Never surfaces a 404 as a visible error.
  const fetchBalance = useCallback(async (key) => {
    const target = key || publicKeyRef.current
    if (!target) return null
    setError(null)

    // Re-validate network on every balance fetch
    await checkNetwork()

    try {
      const account = await server.loadAccount(target)
      const xlmBalance = account.balances.find((b) => b.asset_type === 'native')
      const bal = xlmBalance ? parseFloat(xlmBalance.balance).toFixed(7) : '0.0000000'
      setBalance(bal)
      setIsAccountFunded(true)
      return bal
    } catch (err) {
      // 404 → account not yet on-chain; treat as new-user state, not an error
      const is404 =
        err?.response?.status === 404 ||
        (err?.message || '').toLowerCase().includes('not found') ||
        (err?.message || '').toLowerCase().includes('404')

      if (is404) {
        setBalance('0')
        setIsAccountFunded(false)
        return '0'
      }

      // Any other error (network, etc.) → surface it
      setError(parseError(err))
      setBalance('')
      return null
    }
  }, [checkNetwork]) // stable — reads publicKey via ref, not closure

  // ── Connect wallet ────────────────────────────────────────
  // Two-phase handshake:
  //   Phase 1 (connecting)      — confirm extension is present via
  //                               isConnected(); fast, no popup.
  //   Phase 2 (waitingForPopup) — call requestAccess(), which opens
  //                               the Freighter "Allow" popup and
  //                               resolves to the public key string
  //                               on approval, or "" on denial.
  //
  // Why requestAccess() instead of getPublicKey():
  //   getPublicKey() returns "" silently when the site hasn't been
  //   granted permission yet — the Allow popup never appears.
  //   requestAccess() is the explicit permission-request call that
  //   triggers the Allow/Deny UI in the extension.
  //
  // fetchBalance is listed as a dep here — it must be defined above.
  const connectWallet = useCallback(async () => {
    console.log('useStellar: connectWallet called')
    setConnecting(true)
    setWaitingForPopup(false)
    setError(null)

    try {
      // ── Phase 1: confirm extension is present ─────────────
      const found = await safeIsConnected()
      if (!found) {
        setFreighterDetected(false)
        throw new Error('__no_extension__')
      }

      // ── Phase 2: request access (opens Allow popup) ───────
      setConnecting(false)
      setWaitingForPopup(true)

      let key
      try {
        // requestAccess() triggers the Freighter permission popup.
        // Resolves with the public key string on approval.
        // Resolves with "" on denial — does NOT throw on user reject.
        // May throw if the extension context is broken/locked.
        key = await requestAccess()
      } catch (accessErr) {
        const msg = (accessErr?.message || String(accessErr)).toLowerCase()
        if (msg.includes('locked') || msg.includes('lock'))
          throw new Error('__locked__')
        // Any other extension-level error
        throw accessErr
      }

      // Empty string = user clicked "Deny" or wallet is locked
      if (!key) throw new Error('__denied__')

      console.log(`useStellar: access granted — ${key.slice(0, 6)}…${key.slice(-4)}`)
      setPublicKey(key)
      publicKeyRef.current = key

      // Check network before fetching balance — sets networkMismatch
      await checkNetwork()

      // Auto-fetch balance; 404 → isAccountFunded = false (silent)
      await fetchBalance(key)

      return key
    } catch (err) {
      const raw = err?.message || ''

      let friendly
      if (raw === '__no_extension__')
        friendly = 'Freighter extension not found. Please install it to continue.'
      else if (raw === '__locked__')
        friendly = 'Please unlock Freighter to continue.'
      else if (raw === '__denied__')
        friendly = 'Connection dismissed by user.'
      else
        friendly = parseError(err)

      setError(friendly)
      return null
    } finally {
      setConnecting(false)
      setWaitingForPopup(false)
    }
  }, [fetchBalance])

  // ── Disconnect wallet (clears local state only) ───────────
  const disconnectWallet = useCallback(() => {
    setPublicKey('')
    publicKeyRef.current = ''
    setBalance('')
    setIsAccountFunded(null)
    setNetworkMismatch(false)
    setError(null)
  }, [])

  // ── Activate account via Friendbot ───────────────────────
  // Calls server.friendbot(publicKey).call(), then silently
  // re-fetches balance to flip isAccountFunded → true.
  const handleActivate = useCallback(async (key) => {
    const target = key || publicKeyRef.current
    if (!target) return { success: false, error: 'No public key available.' }

    setIsActivating(true)
    setError(null)
    try {
      await server.friendbot(target).call()
      // Silent re-fetch — transitions UI to State 4 (funded)
      await fetchBalance(target)
      return { success: true }
    } catch (err) {
      // Friendbot returns 400 if the account is already funded
      const alreadyFunded =
        err?.response?.status === 400 ||
        (err?.message || '').toLowerCase().includes('already')

      if (alreadyFunded) {
        await fetchBalance(target)
        return { success: true }
      }

      const friendly = parseError(err)
      setError(friendly)
      return { success: false, error: friendly }
    } finally {
      setIsActivating(false)
    }
  }, [fetchBalance])

  // ── Send XLM ──────────────────────────────────────────────
  const sendPayment = useCallback(async ({ destination, amount, memo }) => {
    setError(null)

    if (!StrKey.isValidEd25519PublicKey(destination)) {
      const msg = 'Invalid destination address. Please enter a valid Stellar public key.'
      setError(msg)
      return { success: false, error: msg }
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      const msg = 'Amount must be a positive number.'
      setError(msg)
      return { success: false, error: msg }
    }

    try {
      // 1. Load sender account (sequence number)
      const sourceAccount = await server.loadAccount(publicKeyRef.current)

      // 2. Build transaction
      const txBuilder = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          Operation.payment({
            destination,
            asset: Asset.native(),
            amount: parsedAmount.toFixed(7),
          })
        )
        .setTimeout(TX_TIMEOUT_SEC)

      if (memo && memo.trim()) {
        txBuilder.addMemo(Memo.text(memo.trim().slice(0, 28)))
      }

      const transaction = txBuilder.build()

      // 3. Sign via Freighter
      const signedXdr = await signTransaction(transaction.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
      })

      // 4. Submit to Horizon
      const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)
      const result   = await server.submitTransaction(signedTx)

      return { success: true, hash: result.hash }
    } catch (err) {
      const friendly = parseError(err)
      setError(friendly)
      return { success: false, error: friendly }
    }
  }, []) // stable — reads publicKey via ref

  return {
    freighterDetected,
    publicKey,
    balance,
    isAccountFunded,
    networkMismatch,
    connecting,
    waitingForPopup,
    isActivating,
    error,
    setError,
    connectWallet,
    disconnectWallet,
    fetchBalance,
    handleActivate,
    sendPayment,
  }
}
