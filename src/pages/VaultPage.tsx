import clsx from 'clsx'
import { Download, FileText, Folder } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Markdown } from '../components/Markdown.tsx'
import { Button } from '../components/ui.tsx'
import { useI18n } from '../i18n/i18n.ts'
import { useDocumentTitle } from '../lib/hooks.ts'
import { useVault, writeVaultFile, type VaultFile } from '../vault/store.ts'
import { zip } from '../vault/zip.ts'

const ROOT = 'Learn Platform'

interface Folder {
  name: string
  path: string
  folders: Folder[]
  files: VaultFile[]
}

function tree(files: VaultFile[]): Folder {
  const root: Folder = { name: ROOT, path: '', folders: [], files: [] }
  for (const file of files) {
    const parts = file.path.split('/')
    let folder = root
    parts.slice(0, -1).forEach((name, i) => {
      let next = folder.folders.find((f) => f.name === name)
      if (!next) {
        next = { name, path: parts.slice(0, i + 1).join('/'), folders: [], files: [] }
        folder.folders.push(next)
      }
      folder = next
    })
    folder.files.push(file)
  }
  return root
}

/** The note as it is shown: no front matter or section markers, wiki links as links to other notes. */
function forDisplay(content: string): string {
  return content
    .replace(/^---\n[\s\S]*?\n---\n?/, '')
    .replace(/^<!-- (auto|maymun):[a-z-]+ -->\n?/gm, '')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, path: string, label: string) => `[${label}](#/memory?f=${encodeURIComponent(`${path}.md`)})`)
}

/** The learner's own section: everything under the last heading, which is always "My notes". */
function splitNotes(content: string, heading: string) {
  const at = content.lastIndexOf(`\n## ${heading}\n`)
  if (at < 0) return null
  const start = at + heading.length + 5
  return { before: content.slice(0, start), notes: content.slice(start).trim() }
}

function download(files: VaultFile[], graphFolder: string) {
  const entries = [
    ...files.map((f) => ({ path: `${ROOT}/${f.path}`, content: f.content })),
    // Ready for Obsidian's "Open folder as vault": links update with renames; skills stand out in the graph.
    { path: `${ROOT}/.obsidian/app.json`, content: JSON.stringify({ alwaysUpdateLinks: true, showFrontmatter: false }, null, 2) },
    {
      path: `${ROOT}/.obsidian/graph.json`,
      content: JSON.stringify({ colorGroups: [{ query: `path:"${graphFolder}"`, color: { a: 1, rgb: 16092476 } }] }, null, 2),
    },
  ]
  const blob = new Blob([zip(entries)], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${ROOT}.zip`
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function VaultPage() {
  const { t } = useI18n()
  useDocumentTitle(t('vault.title'))
  const files = useVault()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const selected = files.find((f) => f.path === params.get('f')) ?? files.find((f) => !f.path.includes('/') && f.path.startsWith('00'))
  const root = useMemo(() => tree(files), [files])
  const q = query.trim().toLowerCase()
  const shown = (file: VaultFile) => !q || file.path.toLowerCase().includes(q)
  const skillsFolder = root.folders.find((f) => f.name === 'Beceriler' || f.name === 'Skills')?.name ?? ''

  const renderFolder = (folder: Folder, depth: number) => {
    const visible = folder.files.filter(shown)
    const children = folder.folders.map((f) => renderFolder(f, depth + 1)).filter(Boolean)
    if (!visible.length && !children.length) return null
    const open = depth === 0 || !!q || (selected?.path.startsWith(`${folder.path}/`) ?? false)
    const body = (
      <ul className={clsx('space-y-0.5', depth > 0 && 'ml-3 border-l border-border pl-2')}>
        {visible.map((file) => (
          <li key={file.path}>
            <button
              type="button"
              onClick={() => setParams({ f: file.path })}
              aria-current={file === selected ? 'true' : undefined}
              className={clsx(
                'flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left text-sm',
                file === selected ? 'bg-accent/15 text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              <FileText size={13} className="shrink-0" aria-hidden />
              <span className="truncate">{file.path.split('/').at(-1)!.replace(/\.md$/, '')}</span>
            </button>
          </li>
        ))}
        {children.map((child, i) => (
          <li key={i}>{child}</li>
        ))}
      </ul>
    )
    if (depth === 0) return body
    return (
      <details open={open}>
        <summary className="flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-0.5 text-sm hover:bg-surface-2">
          <Folder size={13} className="shrink-0 text-accent" aria-hidden />
          <span className="truncate">{folder.name}</span>
        </summary>
        {body}
      </details>
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 p-4 sm:p-6 lg:flex-row">
      <aside className="flex max-h-[40vh] min-h-0 shrink-0 flex-col gap-3 lg:max-h-none lg:w-80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('vault.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('vault.intro')}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => download(files, skillsFolder)} disabled={!files.length}>
          <Download size={15} aria-hidden />
          {t('vault.download')}
        </Button>
        <p className="text-xs text-muted">{t('vault.obsidian')}</p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('vault.search')}
          aria-label={t('vault.search')}
          className="h-9 rounded-lg border border-border bg-surface px-3 text-sm"
        />
        <nav aria-label={t('vault.title')} className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-surface p-2">
          {files.length ? renderFolder(root, 0) : <p className="p-2 text-sm text-muted">…</p>}
          <p className="px-1.5 pt-2 text-xs text-muted">{t('vault.count', { n: files.length })}</p>
        </nav>
      </aside>
      <main className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-surface p-5">
        {selected ? <Note key={selected.path} file={selected} /> : <p className="text-muted">{t('vault.pick')}</p>}
      </main>
    </div>
  )
}

function Note({ file }: { file: VaultFile }) {
  const { t } = useI18n()
  const heading = file.content.includes(`\n## Notlarım\n`) ? 'Notlarım' : 'My notes'
  const parts = splitNotes(file.content, heading)
  const [notes, setNotes] = useState(parts?.notes ?? '')
  const [saved, setSaved] = useState(false)
  return (
    <article>
      <p className="mb-3 font-mono text-xs text-muted">{`${ROOT}/${file.path}`}</p>
      <Markdown source={forDisplay(parts ? parts.before.replace(new RegExp(`\\n## ${heading}\\n$`), '\n') : file.content)} />
      {parts && (
        <form
          className="mt-6 border-t border-border pt-4"
          onSubmit={(event) => {
            event.preventDefault()
            void writeVaultFile(file.path, `${parts.before}\n${notes.trim()}\n`).then(() => setSaved(true))
          }}
        >
          <label className="block text-sm font-semibold">
            {heading}
            <textarea
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value)
                setSaved(false)
              }}
              rows={5}
              className="mt-2 w-full rounded-lg border border-border bg-surface-2 p-3 font-mono text-sm"
            />
          </label>
          <div className="mt-2 flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm">
              {t('vault.saveNotes')}
            </Button>
            {saved && (
              <span role="status" className="text-sm text-success">
                {t('vault.saved')}
              </span>
            )}
          </div>
        </form>
      )}
    </article>
  )
}
