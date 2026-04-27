/**
 * ErrorBanner.jsx — Global hook-level error display (wallet / balance errors)
 */
import { AlertTriangle, X } from 'lucide-react'

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 flex items-start gap-3 animate-slide-up">
      <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-700 dark:text-amber-400 flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="text-amber-400 hover:text-amber-600 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
