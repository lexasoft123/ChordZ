import { Button, SegmentedControl } from '@singz/ui'

export type ThemeMode = 'atelier' | 'studio' | 'compare'

const OPTIONS: { value: ThemeMode; label: string; hint: string }[] = [
  { value: 'atelier', label: 'Atelier', hint: 'Warm paper' },
  { value: 'studio', label: 'Studio', hint: 'Night studio' },
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
      <SegmentedControl
        options={OPTIONS.map((o) => ({ ...o, title: o.hint }))}
        value={value}
        onChange={onChange}
        aria-label="Visual direction"
      />
      <Button
        type="button"
        className="theme-switcher-dark"
        aria-pressed={dark}
        onClick={() => onDarkChange(!dark)}
        title={dark ? 'Switch to light' : 'Switch to dark'}
      >
        {dark ? '◐' : '◑'}
      </Button>
    </div>
  )
}
