import Editor from '@monaco-editor/react'
import { useEffect, useRef } from 'react'
import './monaco-setup.ts'
import { useSettings, useTheme } from '../lib/settings.ts'

const languages: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  html: 'html',
  css: 'css',
  sql: 'sql',
  json: 'json',
}

export interface CodeEditorProps {
  /** Unique per file so Monaco keeps a separate model (and undo history) for each. */
  path: string
  lang: string
  value: string
  onChange?: (value: string) => void
  onRun?: () => void
  readOnly?: boolean
  label: string
}

/** Monaco editor; loaded lazily because it is by far the largest part of the app. */
export default function CodeEditor({ path, lang, value, onChange, onRun, readOnly, label }: CodeEditorProps) {
  const { fontSize } = useSettings()
  const theme = useTheme()
  // The shortcut is registered once on mount, so read the latest callback through a ref.
  const onRunRef = useRef(onRun)
  useEffect(() => {
    onRunRef.current = onRun
  })
  return (
    <Editor
      path={path}
      language={languages[lang] ?? 'plaintext'}
      value={value}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      onChange={(next) => onChange?.(next ?? '')}
      onMount={(editor, monaco) => {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRunRef.current?.())
      }}
      options={{
        readOnly,
        fontSize,
        fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        tabSize: 2,
        automaticLayout: true,
        padding: { top: 12, bottom: 12 },
        renderLineHighlight: readOnly ? 'none' : 'line',
        ariaLabel: label,
        wordWrap: 'on',
      }}
      loading={<div className="p-4 text-sm text-muted">…</div>}
    />
  )
}
