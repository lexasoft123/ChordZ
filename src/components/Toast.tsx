import { useEffect } from 'react'
import { LinkButton } from '@singz/ui'

/*
 * The kit ships a `.toast` class and no component to put it on, so this is the
 * ~20 lines that host it. If SingZ wants the same thing — it has toasts too —
 * this is the shape to propose upstream.
 *
 * One message, replaced, never stacked: two errors at once is a pile to read
 * rather than a thing to fix. role="status" and aria-live="polite" because
 * these announce a failure that has already happened; they do not interrupt.
 */
export default function Toast({
  message,
  onDismiss,
  ms = 8000,
}: {
  message: string
  onDismiss: () => void
  ms?: number
}) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, ms)
    return () => window.clearTimeout(t)
  }, [message, ms, onDismiss])

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-message">{message}</span>
      <LinkButton className="toast-dismiss" onClick={onDismiss}>
        Dismiss
      </LinkButton>
    </div>
  )
}
