/**
 * The two OS preferences the app has to read for itself.
 *
 * CSS motion is gated in @singz/ui — one `prefers-reduced-motion` sweep at the
 * end of the kit's primitives layer covers every animation and transition on
 * the page, the host's included, and a second copy in the app would make the
 * rule un-overridable. What the sweep cannot reach is motion driven from JS:
 * a requestAnimationFrame loop is not a transition.
 */

function query(q: string): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(q).matches
}

/** True when the machine asks for less movement. Read once at mount, not on
 *  every render — this changes about as often as the user changes their mind
 *  about it. */
export function prefersReducedMotion(): boolean {
  return query('(prefers-reduced-motion: reduce)')
}

/** True when the machine is set to a light appearance. */
export function prefersLight(): boolean {
  return query('(prefers-color-scheme: light)')
}
