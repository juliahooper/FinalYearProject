import { useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MarkdownView } from '../components/MarkdownView'
import { useRepo } from '../data/RepoContext'

// The guides in docs/ (PLAN.md §6.6), with a table of contents and copy buttons on code boxes
// (e.g. the prompt for asking Claude Code to summarise a reading).
const GUIDES = [
  { id: 'reading-workflow', path: 'docs/reading-workflow.md', label: 'Reading workflow' },
  { id: 'using-the-app', path: 'docs/using-the-app.md', label: 'Using the app' },
]

const plain = (s: string) => s.replace(/[*_`[\]]/g, '').replace(/\(([^)]*)\)/g, '($1)').trim()
const slug = (s: string) => plain(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// The ## and ### headings of a markdown file, outside code blocks.
export function headings(md: string): { level: 2 | 3; text: string; id: string }[] {
  const out: { level: 2 | 3; text: string; id: string }[] = []
  let inFence = false
  const seen = new Map<string, number>()
  for (const line of md.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    const m = !inFence && line.match(/^(##|###)\s+(.+)$/)
    if (!m) continue
    const base = slug(m[2]) || 'section'
    const n = seen.get(base) ?? 0
    seen.set(base, n + 1)
    out.push({ level: m[1].length as 2 | 3, text: plain(m[2]), id: n ? `${base}-${n + 1}` : base })
  }
  return out
}

export function Guide() {
  const { data } = useRepo()
  const [params] = useSearchParams()
  const wrap = useRef<HTMLDivElement>(null)
  const guide = GUIDES.find((g) => g.id === params.get('doc')) ?? GUIDES[0]
  const source = data?.files.get(guide.path)?.text ?? ''
  const toc = useMemo(() => headings(source), [source])

  // Gives the rendered headings their ids, and code boxes a Copy button. Runs again if the
  // text is redrawn (e.g. when the theme changes).
  useEffect(() => {
    const root = wrap.current
    if (!root) return
    const decorate = () => {
      const hs = root.querySelectorAll<HTMLElement>('.markdown h2, .markdown h3')
      hs.forEach((h, i) => {
        if (toc[i]) h.id = toc[i].id
      })
      for (const pre of root.querySelectorAll<HTMLElement>('.markdown pre')) {
        if (pre.querySelector('.copy-btn')) continue
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'btn btn-small copy-btn'
        button.textContent = 'Copy'
        button.addEventListener('click', () => {
          const text = pre.querySelector('code')?.textContent ?? pre.textContent ?? ''
          void navigator.clipboard
            ?.writeText(text.trim())
            .then(() => {
              button.textContent = 'Copied'
              window.setTimeout(() => (button.textContent = 'Copy'), 1500)
            })
            .catch(() => window.prompt('Copy this:', text.trim()))
        })
        pre.append(button)
      }
    }
    decorate()
    const observer = new MutationObserver(decorate)
    observer.observe(root, { childList: true })
    return () => observer.disconnect()
  }, [source, toc])

  if (!data) return null

  return (
    <div className="page-pad guide">
      <h1 className="page-title">Guide</h1>
      <p className="page-sub">How to find, save and summarise readings, and how to use this app.</p>

      <div className="tabs" role="tablist" aria-label="Guides">
        {GUIDES.map((g) => (
          <Link key={g.id} role="tab" aria-selected={g.id === guide.id} className={`tab${g.id === guide.id ? ' active' : ''}`} to={`/guide?doc=${g.id}`}>
            {g.label}
          </Link>
        ))}
      </div>

      {!source ? (
        <p className="muted">{guide.path} isn’t in the repo yet.</p>
      ) : (
        <div className="guide-layout">
          {toc.length > 0 && (
            <nav className="guide-toc" aria-label="Contents">
              <div className="section-label">Contents</div>
              <ul>
                {toc.map((h) => (
                  <li key={h.id} className={h.level === 3 ? 'toc-sub' : ''}>
                    <a
                      href={`#${h.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div ref={wrap} className="guide-body">
            <MarkdownView key={guide.id} source={source} />
          </div>
        </div>
      )}
    </div>
  )
}
