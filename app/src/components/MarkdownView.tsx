import 'katex/dist/katex.min.css'
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRepo } from '../data/RepoContext'
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

// Renders a markdown body (reading notes, decisions, guides) with maths, Mermaid diagrams and
// @mentions of readings linked.
export function MarkdownView({ source, className = 'reading-text' }: { source: string; className?: string }) {
  const { data } = useRepo()
  const navigate = useNavigate()
  const mentions = useMemo(() => new Map((data?.readings ?? []).map((r) => [r.meta.key, r.meta.title])), [data?.readings])
  const html = useMemo(() => renderMarkdown(source, mentions), [source, mentions])
  const ref = useRef<HTMLDivElement>(null)
  const dark = useDarkMode()

  useEffect(() => {
    if (ref.current) void renderDiagrams(ref.current, dark)
  }, [html, dark])

  // Links to other pages of the app (mentions) open inside the app, without reloading it.
  function onClick(e: MouseEvent<HTMLDivElement>) {
    const a = (e.target as HTMLElement).closest('a[data-internal]')
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return
    e.preventDefault()
    navigate(a.getAttribute('href') ?? '/')
  }

  // The HTML comes from markdown-it with raw HTML disabled, so it can't contain scripts or event handlers.
  return <div ref={ref} className={`markdown ${className}`} key={`${dark}`} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
}
