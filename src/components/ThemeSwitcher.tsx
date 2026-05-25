export type ThemeMode = 'atelier' | 'studio' | 'compare'

const OPTIONS: { value: ThemeMode; label: string; hint: string }[] = [
  { value: 'atelier', label: 'Atelier', hint: 'Warm paper' },
  { value: 'studio', label: 'Studio', hint: 'Cool editorial' },
  { value: 'compare', label: 'Compare', hint: 'Side-by-side' },
]

export default function ThemeSwitcher({
  value,
  onChange,
  dark,
  onDarkChange,
}: {
  value: ThemeMode
  onChange: (t: ThemeMode) => void
  dark: boolean
  onDarkChange: (v: boolean) => void
}) {
  return (
    <div className="theme-switcher">
      <div className="theme-switcher-group" role="tablist" aria-label="Visual direction">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={value === o.value}
            data-active={value === o.value ? '1' : '0'}
            onClick={() => onChange(o.value)}
            title={o.hint}
            className="theme-switcher-btn"
          >
            {o.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="theme-switcher-dark"
        aria-pressed={dark}
        onClick={() => onDarkChange(!dark)}
        title={dark ? 'Switch to light' : 'Switch to dark'}
      >
        {dark ? '◐' : '◑'}
      </button>
    </div>
  )
}
