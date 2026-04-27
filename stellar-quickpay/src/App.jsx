/**
 * App.jsx — Root component.
 * Theme: Obsidian / Gold / Silver — always dark.
 *
 * Four-state onboarding flow:
 *   1 — No Extension       (freighterDetected === false)
 *   2 — Not Connected      (freighterDetected true, publicKey "")
 *   3 — Connected/Unfunded (publicKey set, isAccountFunded === false)
 *   4 — All Systems Go     (publicKey set, isAccountFunded === true)
 */
import { useState, useEffect, useCallback } from 'react'
import { useStellar }        from './hooks/useStellar'
import Header                from './components/Header'
import WalletCard            from './components/WalletCard'
import OnboardingSteps       from './components/OnboardingSteps'
import PaymentForm           from './components/PaymentForm'
import TransactionResult     from './components/TransactionResult'
import NetworkMismatchBanner from './components/NetworkMismatchBanner'

export default function App() {
  // Always-dark: force the class so Tailwind dark: variants apply.
  useEffect(() => { document.documentElement.classList.add('dark') }, [])

  const {
    freighterDetected, publicKey, balance, isAccountFunded,
    networkMismatch, connecting, waitingForPopup, isActivating,
    error, setError, connectWallet, disconnectWallet,
    fetchBalance, handleActivate, sendPayment,
  } = useStellar()

  const [txResult, setTxResult] = useState(null)

  const handleConnect = useCallback(() => connectWallet(), [connectWallet])

  const handleActivateAccount = useCallback(() => handleActivate(), [handleActivate])

  const handleSend = useCallback(async (params) => {
    setTxResult(null)
    const result = await sendPayment(params)
    setTxResult(result)
    if (result.success) await fetchBalance()
  }, [sendPayment, fetchBalance])

  const step = freighterDetected === false ? 1
    : !publicKey          ? 2
    : isAccountFunded !== true ? 3
    : 4

  const subtitles = {
    1: 'Install the Freighter browser extension to get started.',
    2: 'Connect your Freighter wallet to continue.',
    3: 'Activate your account to start using the Stellar testnet.',
    4: 'Your account is ready. Enter a destination and amount below.',
  }

  return (
    <div className="min-h-screen bg-obsidian-950">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Heading */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold tracking-tight text-silver-200">
            Stellar <span className="text-gold-gradient">QuickPay</span>
          </h1>
          <p className="text-sm text-silver-400 mt-1">{subtitles[step]}</p>
        </div>

        {/* Progress */}
        <OnboardingSteps
          freighterDetected={freighterDetected}
          publicKey={publicKey}
          isAccountFunded={isAccountFunded}
        />

        {/* Main card */}
        <WalletCard
          freighterDetected={freighterDetected}
          publicKey={publicKey}
          balance={balance}
          isAccountFunded={isAccountFunded}
          connecting={connecting}
          waitingForPopup={waitingForPopup}
          isActivating={isActivating}
          error={error}
          onConnect={handleConnect}
          onDisconnect={disconnectWallet}
          onRefreshBalance={fetchBalance}
          onActivate={handleActivateAccount}
          onDismissError={() => setError(null)}
        />

        {/* State 4: payment area */}
        {publicKey && isAccountFunded === true && (
          <>
            {networkMismatch && <NetworkMismatchBanner />}
            {txResult?.success ? (
              <TransactionResult result={txResult} onDismiss={() => setTxResult(null)} />
            ) : (
              <>
                <PaymentForm
                  onSend={handleSend}
                  disabled={networkMismatch}
                  networkMismatch={networkMismatch}
                  senderBalance={balance}
                />
                {txResult && !txResult.success && (
                  <TransactionResult result={txResult} onDismiss={() => setTxResult(null)} />
                )}
              </>
            )}
          </>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-silver-600 pt-2">
          Running on{' '}
          <a
            href="https://horizon-testnet.stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-500 hover:text-gold-400 underline-offset-2 hover:underline transition-colors"
          >
            Stellar Testnet
          </a>
          {' '}· Not for real funds
        </p>
      </main>
    </div>
  )
}
