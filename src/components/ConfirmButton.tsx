import clsx from 'clsx'
import { useEffect, useState, type ReactNode } from 'react'
import { buttonClass } from './button-class.ts'

/**
 * A button that asks for a second click instead of opening a blocking browser dialog. The confirmation
 * message replaces the label for a few seconds.
 */
export function ConfirmButton({
  children,
  confirmLabel,
  label,
  onConfirm,
  variant = 'ghost',
  size = 'sm',
  className,
}: {
  children: ReactNode
  confirmLabel: string
  /** Accessible name for buttons whose visible content can shrink to an icon. */
  label?: string
  onConfirm: () => void
  variant?: 'ghost' | 'secondary' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), 4000)
    return () => clearTimeout(timer)
  }, [armed])

  return (
    <button
      type="button"
      aria-live="polite"
      aria-label={armed ? undefined : label}
      title={armed ? undefined : label}
      onClick={() => {
        if (armed) {
          setArmed(false)
          onConfirm()
        } else setArmed(true)
      }}
      className={clsx(buttonClass(armed ? 'danger' : variant, size), className)}
    >
      {armed ? confirmLabel : children}
    </button>
  )
}
