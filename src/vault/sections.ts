/**
 * Sections of a vault note. A section is a `## Heading` whose first line is a marker comment saying who writes it:
 *
 *     ## What you learned
 *     <!-- maymun:learned -->
 *     - …
 *
 * `auto:` sections are rewritten by the app from progress, `maymun:` sections by the AI, and a heading without a marker
 * (the learner's "My notes") by nobody but the learner. A section runs until the next `## ` heading.
 */

export type Owner = 'auto' | 'maymun'

const MARKER = /^<!-- (auto|maymun):([a-z-]+) -->\s*$/

export interface Section {
  owner: Owner
  id: string
  heading: string
  body: string
}

/** Placeholder of an empty section (translated by the caller). */
export const EMPTY_MARK = '_'

export function marker(owner: Owner, id: string) {
  return `<!-- ${owner}:${id} -->`
}

/** The marked sections of a note, in order. */
export function readSections(content: string): Section[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const sections: Section[] = []
  for (let i = 0; i < lines.length; i++) {
    const heading = /^## (.+)$/.exec(lines[i])
    const mark = heading ? MARKER.exec(lines[i + 1] ?? '') : null
    if (!heading || !mark) continue
    let end = i + 2
    while (end < lines.length && !lines[end].startsWith('## ')) end++
    sections.push({ owner: mark[1] as Owner, id: mark[2], heading: heading[1], body: lines.slice(i + 2, end).join('\n').trim() })
  }
  return sections
}

/** The note with one marked section's body replaced; unchanged when the section is not there. */
export function writeSection(content: string, owner: Owner, id: string, body: string): string {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const at = lines.findIndex((line) => line === marker(owner, id))
  if (at < 1 || !lines[at - 1].startsWith('## ')) return content
  let end = at + 1
  while (end < lines.length && !lines[end].startsWith('## ')) end++
  const next = end < lines.length ? [''] : []
  return [...lines.slice(0, at + 1), ...body.trim().split('\n'), ...next, ...lines.slice(end)].join('\n')
}

/** The YAML front matter replaced (it belongs to the app). */
export function writeFrontMatter(content: string, frontMatter: string): string {
  const body = content.replace(/\r\n/g, '\n').replace(/^---\n[\s\S]*?\n---\n?/, '')
  return `---\n${frontMatter.trim()}\n---\n${body.startsWith('\n') ? body : `\n${body}`}`
}

/** The learner's own section is always the last one, under one of these headings. */
const MY_NOTES = ['Notlarım', 'My notes']

/** The note split at the learner's section: what comes before it (heading included) and the notes themselves. */
export function splitMyNotes(content: string): { before: string; heading: string; notes: string } | null {
  for (const heading of MY_NOTES) {
    const at = content.lastIndexOf(`\n## ${heading}\n`)
    if (at < 0) continue
    const start = at + heading.length + 5
    return { before: content.slice(0, start), heading, notes: content.slice(start).trim() }
  }
  return null
}

/** The note with the learner's section replaced. */
export function writeMyNotes(content: string, notes: string): string {
  const parts = splitMyNotes(content)
  return parts ? `${parts.before}${notes.trim() ? `${notes.trim()}\n` : ''}` : content
}
