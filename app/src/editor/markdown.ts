import type { Editor } from '@tiptap/core'
import { fromEditorMarkdown, toEditorMarkdown } from './mathBridge'
import { restoreFormatting } from './restore'

// Markdown body -> what the editor loads.
export const toEditor = toEditorMarkdown

// Editor contents -> markdown body to save, keeping the original's formatting for unedited lines.
export function fromEditor(editor: Editor, original: string): string {
  const raw = (editor.storage as unknown as { markdown: { getMarkdown(): string } }).markdown.getMarkdown()
  return restoreFormatting(original, fromEditorMarkdown(raw))
}
