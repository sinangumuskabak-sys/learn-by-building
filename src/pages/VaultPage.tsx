import clsx from 'clsx'
import { Download, FileText, Folder } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Markdown } from '../components/Markdown.tsx'
import { Button } from '../components/ui.tsx'
import { useI18n } from '../i18n/i18n.ts'
import { useDocumentTitle } from '../lib/hooks.ts'
import { useStore } from '../lib/store.ts'
import { mirrorStatus, mirrorStore, pullNotes, setMirror } from '../vault/mirror.ts'
import { obsidianSettings, skillsFolderOf } from '../vault/obsidian.ts'
import { splitMyNotes, writeMyNotes } from '../vault/sections.ts'
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

function download(files: VaultFile[]) {
  // Ready for Obsidian's "Open folder as vault" on the unzipped folder.
  const settings = obsidianSettings(skillsFolderOf(files.map((f) => f.path)))
  const entries = [
    ...files.map((f) => ({ path: `${ROOT}/${f.path}`, content: f.content })),
    ...Object.entries(settings).map(([name, content]) => ({ path: `${ROOT}/.obsidian/${name}`, content })),
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
    // Phones: one scrolling column (the tree has its own height); wide screens: tree and note side by side.
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:p-6 lg:h-full lg:flex-row">
      <aside className="flex shrink-0 flex-col gap-3 lg:min-h-0 lg:w-80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('vault.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('vault.intro')}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => download(files)} disabled={!files.length}>
          <Download size={15} aria-hidden />
          {t('vault.download')}
        </Button>
        <p className="text-xs text-muted">{t('vault.obsidian')}</p>
        <MirrorCard />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('vault.search')}
          aria-label={t('vault.search')}
          className="h-9 rounded-lg border border-border bg-surface px-3 text-sm"
        />
        <nav
          aria-label={t('vault.title')}
          className="max-h-[50vh] overflow-y-auto rounded-xl border border-border bg-surface p-2 lg:max-h-none lg:min-h-0 lg:flex-1"
        >
          {files.length ? renderFolder(root, 0) : <p className="p-2 text-sm text-muted">…</p>}
          <p className="px-1.5 pt-2 text-xs text-muted">{t('vault.count', { n: files.length })}</p>
        </nav>
      </aside>
      <main className="rounded-xl border border-border bg-surface p-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {selected ? <Note key={selected.path} file={selected} /> : <p className="text-muted">{t('vault.pick')}</p>}
      </main>
    </div>
  )
}

/** The live mirror into an Obsidian vault on this computer, through the Maymun bridge. */
function MirrorCard() {
  const { t } = useI18n()
  const { enabled, key: savedKey } = useStore(mirrorStore)
  const status = useStore(mirrorStatus)
  const [busy, setBusy] = useState(false)
  const [key, setKey] = useState(savedKey ?? '')
  // Coming back to this page brings in what was written in Obsidian meanwhile.
  useEffect(() => {
    if (enabled) void pullNotes()
  }, [enabled])
  const toggle = async () => {
    setBusy(true)
    await setMirror(!enabled)
    setBusy(false)
  }
  const message = enabled ? t(`vault.mirror.${status.state}` as 'vault.mirror.on', { folder: status.folder ?? '' }) : ''
  return (
    <div className="space-y-2 rounded-xl border border-border bg-surface p-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="flex-1 font-semibold">{t('vault.mirror.title')}</span>
        <Button variant={enabled ? 'secondary' : 'primary'} size="sm" onClick={() => void toggle()} disabled={busy}>
          {enabled ? t('vault.mirror.stop') : t('vault.mirror.start')}
        </Button>
      </div>
      <p className="text-muted">{t('vault.mirror.help')}</p>
      <a href={`${import.meta.env.BASE_URL}maymun-bridge.mjs`} download className="text-accent underline">
        maymun-bridge.mjs
      </a>
      <code className="block rounded bg-surface-2 px-2 py-1 font-mono break-all">node maymun-bridge.mjs --vault "…/Obsidian/…"</code>
      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          mirrorStore.set((value) => ({ ...value, key: key.trim() || undefined }))
          if (enabled) void setMirror(true)
        }}
      >
        <label className="block flex-1 font-medium">
          {t('vault.mirror.key')}
          <input
            type="password"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="mt-1 h-8 w-full rounded-lg border border-border bg-surface-2 px-2 font-mono"
          />
        </label>
        <Button type="submit" variant="secondary" size="sm">
          {t('vault.mirror.save')}
        </Button>
      </form>
      {message && (
        <p role="status" className={status.state === 'on' ? 'text-success' : 'text-danger'}>
          {message}
        </p>
      )}
    </div>
  )
}

function Note({ file }: { file: VaultFile }) {
  const { t } = useI18n()
  const parts = splitMyNotes(file.content)
  const heading = parts?.heading ?? ''
  const stored = parts?.notes ?? ''
  const [notes, setNotes] = useState(stored)
  const [saved, setSaved] = useState(false)
  // Notes written elsewhere (in Obsidian, through the mirror) show up, unless the learner is typing here.
  const [dirty, setDirty] = useState(false)
  const [shown, setShown] = useState(stored)
  if (stored !== shown) {
    setShown(stored)
    if (!dirty) setNotes(stored)
  }
  return (
    <article>
      <p className="mb-3 font-mono text-xs text-muted">{`${ROOT}/${file.path}`}</p>
      <Markdown source={forDisplay(parts ? parts.before.slice(0, parts.before.length - heading.length - 4) : file.content)} />
      {parts && (
        <form
          className="mt-6 border-t border-border pt-4"
          onSubmit={(event) => {
            event.preventDefault()
            void writeVaultFile(file.path, writeMyNotes(file.content, notes)).then(() => {
              setSaved(true)
              setDirty(false)
            })
          }}
        >
          <label className="block text-sm font-semibold">
            {heading}
            <textarea
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value)
                setDirty(true)
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
