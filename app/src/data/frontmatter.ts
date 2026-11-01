import { parse } from 'yaml'

export interface Split<T> {
  data: T | null
  yaml: string
  body: string
}

// Splits "---\n<yaml>\n---\n<body>". Files without front matter get data: null and the whole text as body.
export function splitFrontMatter<T>(text: string): Split<T> {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/)
  if (!m) return { data: null, yaml: '', body: text }
  try {
    return { data: parse(m[1]) as T, yaml: m[1], body: m[2] }
  } catch {
    return { data: null, yaml: m[1], body: m[2] }
  }
}

export function joinFrontMatter(yaml: string, body: string): string {
  return `---\n${yaml.replace(/\n+$/, '')}\n---\n${body}`
}
