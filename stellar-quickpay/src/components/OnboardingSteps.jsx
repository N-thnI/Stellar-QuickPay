/**
 * OnboardingSteps.jsx — Four-stage progress bar.
 *
 * Active  → Gold bubble + gold ring-offset on obsidian
 * Done    → Silver-filled bubble + silver connector
 * Future  → Obsidian bubble with silver border
 */
import { Download, Wallet, Zap, Send, Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Install',  icon: Download },
  { id: 2, label: 'Connect',  icon: Wallet   },
  { id: 3, label: 'Activate', icon: Zap      },
  { id: 4, label: 'Send',     icon: Send     },
]

function getActiveStep(freighterDetected, publicKey, isAccountFunded) {
  if (!freighterDetected)       return 1
  if (!publicKey)               return 2
  if (isAccountFunded !== true) return 3
  return 4
}

export default function OnboardingSteps({ freighterDetected, publicKey, isAccountFunded }) {
  const active = getActiveStep(freighterDetected, publicKey, isAccountFunded)

  return (
    <div className="flex items-center animate-fade-in" role="list" aria-label="Onboarding progress">
      {STEPS.map((step, idx) => {
        const done    = step.id < active
        const current = step.id === active
        const Icon    = step.icon

        return (
          <div key={step.id} className="flex items-center flex-1 min-w-0" role="listitem">
            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">

              {/* Bubble */}
              <div
                aria-current={current ? 'step' : undefined}
                className={[
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                  'transition-all duration-300',
                  done
                    ? 'bg-silver-600 text-obsidian-950'
                    : current
                    // Spec: gold fill, ring-offset on obsidian background
                    ? 'bg-gold-gradient text-obsidian-950 shadow-gold-lift ring-[3px] ring-gold-500/40 ring-offset-2 ring-offset-[#0B0B0B]'
                    : 'bg-obsidian-700 text-silver-500 border border-silver-700/60',
                ].join(' ')}
              >
                {done
                  ? <Check size={15} strokeWidth={2.5} />
                  : <Icon size={15} />}
              </div>

              {/* Label */}
              <span className={[
                'text-[11px] font-semibold text-center leading-tight truncate w-full px-1 tracking-wide',
                done    ? 'text-silver-500'
                : current ? 'text-gold-400'
                : 'text-silver-700',
              ].join(' ')}>
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                aria-hidden="true"
                className={[
                  'h-px flex-1 mx-1 mb-5 rounded-full transition-all duration-500',
                  done ? 'bg-silver-600' : 'bg-obsidian-500',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
