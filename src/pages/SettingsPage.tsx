import clsx from 'clsx'
import { Download, Upload } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { ConfirmButton } from '../components/ConfirmButton.tsx'
import { Button, Page } from '../components/ui.tsx'
import { useI18n } from '../i18n/i18n.ts'
import { langs } from '../i18n/messages.ts'
import { useDocumentTitle } from '../lib/hooks.ts'
import { fontSizes, settingsStore, themeStore, useSettings, useTheme } from '../lib/settings.ts'
import { ProviderSetup } from '../maymun/Chat.tsx'
import { maymunStore, useMaymunSettings } from '../maymun/store.ts'
import { resetAllThreads } from '../maymun/memory.ts'
import { progressActions } from '../progress/progress.ts'
import { resetVault, restoreVault, startVault, vaultFiles, type VaultFile } from '../vault/store.ts'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface">
      <h2 className="border-b border-border px-5 py-3 font-semibold tracking-tight">{title}</h2>
      <div className="divide-y divide-border">{children}</div>
    </section>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-border bg-surface-2 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={clsx(
            'rounded-md px-3 py-1.5 text-sm transition-colors',
            value === option.value ? 'bg-surface font-medium text-fg shadow-sm' : 'text-muted hover:text-fg',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/** Progress, Maymun's conversations and the memory vault (back to its skeleton) all go at once. */
async function resetAllData() {
  progressActions.resetAll()
  await resetAllThreads()
  await resetVault()
}

export function SettingsPage() {
  const { t, lang, setLang } = useI18n()
  const theme = useTheme()
  const { fontSize } = useSettings()
  const maymun = useMaymunSettings()
  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  useDocumentTitle(t('settings.title'))

  // One backup file: the progress (with the code written in each step) and the memory vault's notes.
  const exportProgress = async () => {
    await startVault()
    const backup = { ...(JSON.parse(progressActions.exportJson()) as object), vault: vaultFiles() }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `learn-platform-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importProgress = async (file: File) => {
    const text = await file.text()
    const ok = progressActions.importJson(text)
    if (ok) {
      const vault = (JSON.parse(text) as { vault?: unknown }).vault
      const notes = Array.isArray(vault)
        ? vault.filter((note): note is VaultFile =>
            typeof note?.path === 'string' && typeof note.content === 'string' && typeof note.updatedAt === 'string')
        : []
      if (notes.length) await restoreVault(notes)
    }
    setMessage({ ok, text: ok ? t('settings.importDone') : t('settings.importFailed') })
  }

  return (
    <Page className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('settings.title')}</h1>

      <Section title={t('settings.appearance')}>
        <Row label={t('settings.theme')}>
          <Segmented
            label={t('settings.theme')}
            value={theme}
            onChange={(value) => themeStore.set(value)}
            options={[
              { value: 'light', label: t('settings.light') },
              { value: 'dark', label: t('settings.dark') },
            ]}
          />
        </Row>
        <Row label={t('settings.language')}>
          <Segmented
            label={t('settings.language')}
            value={lang}
            onChange={setLang}
            options={langs.map((code) => ({ value: code, label: code === 'en' ? 'English' : 'Türkçe' }))}
          />
        </Row>
        <Row label={t('settings.maymun')} hint={t('settings.maymunHint')}>
          <Segmented
            label={t('settings.maymun')}
            value={maymun.visible ? 'show' : 'hide'}
            onChange={(value) => maymunStore.set({ visible: value === 'show' })}
            options={[
              { value: 'show', label: t('settings.show') },
              { value: 'hide', label: t('settings.hide') },
            ]}
          />
        </Row>
        {maymun.visible && (
          <Row label={t('settings.maymunAi')} hint={t('settings.maymunAiHint')}>
            <div className="w-full max-w-xs">
              <ProviderSetup />
            </div>
          </Row>
        )}
      </Section>

      <Section title={t('settings.editor')}>
        <Row label={t('settings.fontSize')}>
          <select
            value={fontSize}
            onChange={(e) => settingsStore.set({ fontSize: Number(e.target.value) })}
            aria-label={t('settings.fontSize')}
            className="h-9 rounded-lg border border-border bg-surface px-3 text-sm"
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </Row>
      </Section>

      <Section title={t('settings.progress')}>
        <Row label={t('settings.progress')} hint={t('settings.progressHint')}>
          <Button size="sm" onClick={() => void exportProgress()}>
            <Download size={15} aria-hidden />
            {t('settings.export')}
          </Button>
          <Button size="sm" onClick={() => fileInput.current?.click()}>
            <Upload size={15} aria-hidden />
            {t('settings.import')}
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void importProgress(file)
              e.target.value = ''
            }}
          />
        </Row>
        {message && (
          <p role="status" className={clsx('px-5 py-3 text-sm', message.ok ? 'text-success' : 'text-danger')}>
            {message.text}
          </p>
        )}
        <Row label={t('settings.reset')}>
          <ConfirmButton variant="danger" confirmLabel={t('settings.resetConfirm')} onConfirm={resetAllData}>
            {t('settings.reset')}
          </ConfirmButton>
        </Row>
      </Section>
    </Page>
  )
}
