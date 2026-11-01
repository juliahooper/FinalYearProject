import 'katex/dist/katex.min.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { renderDiagrams, renderMarkdown } from '../render/markdown'

function isDark() {
  const set = document.documentElement.dataset.theme
  if (set) return set === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Follows the light/dark theme, so diagrams can be redrawn to match.
function useDarkMode() {
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const update = () => setDark(isDark())
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', update)
    return () => {
      observer.disconnect()
      media.removeEventListener('change', update)
    }
  }, [])
  return dark
}

// Renders a markdown body (reading notes, guides) with maths and Mermaid diagrams.
export function MarkdownView({ source, className = 'reading-text' }: { source: string; className?: string }) {
  const html = useMemo(() => renderMarkdown(source), [source])
  const ref = useRef<HTMLDivElement>(null)
  const dark = useDarkMode()

  useEffect(() => {
    if (ref.current) void renderDiagrams(ref.current, dark)
  }, [html, dark])

  // The HTML comes from markdown-it with raw HTML disabled, so it can't contain scripts or event handlers.
  return <div ref={ref} className={`markdown ${className}`} key={`${dark}`} dangerouslySetInnerHTML={{ __html: html }} />
}
