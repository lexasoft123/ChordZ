import { useEffect, useRef } from 'react'

/**
 * Plain textarea editor for ChordPro. We layer a subtle highlight via a
 * mirror element underneath — directives, chords, comments get color while
 * the user types in a fully native textarea (preserves OS spellcheck,
 * IME, undo, accessibility).
 */
export default function Editor({
  source,
  onChange,
}: {
  source: string
  onChange: (s: string) => void
}) {
  const ta = useRef<HTMLTextAreaElement>(null)
  const mirror = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const a = ta.current
    const m = mirror.current
    if (!a || !m) return
    function sync() {
      if (!m || !a) return
      m.scrollTop = a.scrollTop
      m.scrollLeft = a.scrollLeft
    }
    a.addEventListener('scroll', sync)
    return () => a.removeEventListener('scroll', sync)
  }, [])

  return (
    <div className="editor">
      <pre className="editor-mirror" ref={mirror} aria-hidden>
        {highlight(source)}
        {/* trailing newline so caret-at-end stays in view */}
        {'\n '}
      </pre>
      <textarea
        ref={ta}
        className="editor-textarea"
        value={source}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
      />
    </div>
  )
}

function highlight(src: string): React.ReactNode {
  // Lex-light: directives {…}, chords […], comments lines starting with #
  const out: React.ReactNode[] = []
  const lines = src.split('\n')
  lines.forEach((line, li) => {
    if (line.trim().startsWith('#')) {
      out.push(<span className="hl-comment" key={li}>{line}</span>)
    } else {
      const re = /(\{[^}]*\})|(\[[^\]]+\])/g
      let last = 0
      let m: RegExpExecArray | null
      let pieces: React.ReactNode[] = []
      while ((m = re.exec(line)) !== null) {
        if (m.index > last) pieces.push(line.slice(last, m.index))
        if (m[1]) pieces.push(<span className="hl-directive" key={`${li}-${m.index}`}>{m[1]}</span>)
        else if (m[2]) pieces.push(<span className="hl-chord" key={`${li}-${m.index}`}>{m[2]}</span>)
        last = re.lastIndex
      }
      if (last < line.length) pieces.push(line.slice(last))
      out.push(<span key={li}>{pieces}</span>)
    }
    out.push('\n')
  })
  return out
}
