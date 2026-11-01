// Changes to repo files that keep their existing layout: YAML is edited through the yaml
// Document API, so comments, key order and [flow, lists] stay as they were.
import { isMap, isSeq, parseDocument, type Document } from 'yaml'
import { TAG_PALETTE } from '../config'
import { joinFrontMatter, splitFrontMatter } from './frontmatter'
import type { Tag } from './types'

// Never re-wrap long lines, and write lists as [a, b] like the repo's files.
const YAML_OUT = { lineWidth: 0, minContentWidth: 0, flowCollectionPadding: false }

function setValue(doc: Document, path: (string | number)[], value: unknown) {
  // Lists are written in flow style, [a, b], like the rest of the repo's front matter.
  const node = Array.isArray(value) ? doc.createNode(value, { flow: true }) : value
  doc.setIn(path, node)
}

// Updates front matter fields in a markdown file, leaving the body untouched (or replacing it).
export function updateMarkdownFile(text: string, changes: Record<string, unknown>, body?: string): string {
  const split = splitFrontMatter(text)
  const doc = parseDocument(split.yaml)
  for (const [key, value] of Object.entries(changes)) setValue(doc, [key], value)
  return joinFrontMatter(doc.toString(YAML_OUT), body ?? split.body)
}

// Updates fields of one entry in a YAML list file (follow-up.yml), keeping comments.
export function updateListEntry(text: string, index: number, changes: Record<string, unknown>): string {
  const doc = parseDocument(text)
  if (!isSeq(doc.contents) || !isMap(doc.contents.items[index])) throw new Error(`No entry ${index + 1} in the list`)
  for (const [key, value] of Object.entries(changes)) setValue(doc, [index, key], value)
  return doc.toString(YAML_OUT)
}

export function slugifyTag(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Appends a new tag to tags.yml with the next unused pastel (PLAN.md §3.3), cycling if all are used.
export function addTag(tagsText: string, existing: Tag[], label: string): { text: string; tag: Tag } {
  const id = slugifyTag(label)
  if (!id) throw new Error('A tag needs at least one letter or number.')
  if (existing.some((t) => t.id === id)) throw new Error(`There's already a tag called “${label}”.`)
  const used = new Set(existing.map((t) => t.bg.toUpperCase()))
  const unused = TAG_PALETTE.find((c) => !used.has(c.toUpperCase()))
  const bg = unused ?? TAG_PALETTE[existing.length % TAG_PALETTE.length]
  const tag: Tag = { id, label: label.trim(), group: 'project area', bg }
  const entry = `- id: ${id}\n  label: ${JSON.stringify(tag.label)}\n  group: project area\n  bg: "${bg}"\n`
  return { text: tagsText.replace(/\n*$/, '\n') + entry, tag }
}
