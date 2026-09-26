import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useMemo } from 'react'

/**
 * Renders challenge Markdown. Content comes from the repository, but it is still sanitized because forks and
 * pull requests can add arbitrary text.
 */
export function Markdown({ source, className }: { source: string; className?: string }) {
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(source, { async: false, gfm: true })), [source])
  return <div className={`markdown ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Inline Markdown (hint texts, quiz options) without wrapping paragraphs. */
export function InlineMarkdown({ source }: { source: string }) {
  const html = useMemo(() => DOMPurify.sanitize(marked.parseInline(source, { async: false })), [source])
  return <span className="markdown-inline" dangerouslySetInnerHTML={{ __html: html }} />
}
