import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useMemo, type MouseEvent } from 'react'
import { openInApp } from '../app/site.ts'

/**
 * Renders challenge Markdown. Content comes from the repository, but it is still sanitized because forks and
 * pull requests can add arbitrary text.
 */
export function Markdown({ source, className }: { source: string; className?: string }) {
  // Code blocks and tables can scroll sideways, so they must be reachable with the keyboard too.
  const html = useMemo(
    () =>
      DOMPurify.sanitize(marked.parse(source, { async: false, gfm: true }))
        .replaceAll('<pre>', '<pre tabindex="0">')
        .replaceAll('<table>', '<table tabindex="0">'),
    [source],
  )
  return <div className={`markdown ${className ?? ''}`} onClick={followInApp} dangerouslySetInnerHTML={{ __html: html }} />
}

/** A plain click on a link into the app moves within it instead of loading the page again. */
function followInApp(event: MouseEvent) {
  const link = (event.target as HTMLElement).closest('a')
  const href = link?.getAttribute('href')
  if (!link || !href || link.target || link.hasAttribute('download') || event.button !== 0) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  if (openInApp(href)) event.preventDefault()
}

/** Inline Markdown (hint texts, quiz options) without wrapping paragraphs. */
export function InlineMarkdown({ source }: { source: string }) {
  const html = useMemo(() => DOMPurify.sanitize(marked.parseInline(source, { async: false })), [source])
  return <span className="markdown-inline" dangerouslySetInnerHTML={{ __html: html }} />
}
