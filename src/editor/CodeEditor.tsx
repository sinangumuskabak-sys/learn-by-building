import Editor, { type OnMount } from '@monaco-editor/react'
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
  /** Show the end of the file on open and whenever the code is replaced from outside (new work goes at the bottom). */
  startAtEnd?: boolean
}

/** Monaco editor; loaded lazily because it is by far the largest part of the app. */
export default function CodeEditor({ path, lang, value, onChange, onRun, readOnly, label, startAtEnd }: CodeEditorProps) {
  const { fontSize } = useSettings()
  const theme = useTheme()
  // The shortcut is registered once on mount, so read the latest callback through a ref.
  const onRunRef = useRef(onRun)
  useEffect(() => {
    onRunRef.current = onRun
  })
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const typed = useRef(value)
  const revealEnd = () => {
    const editor = editorRef.current
    const model = editor?.getModel()
    if (!editor || !model) return
    const line = model.getLineCount()
    editor.setPosition({ lineNumber: line, column: model.getLineMaxColumn(line) })
    // Scroll as far down as the editor allows (short code stays fully visible); before the first layout the
    // editor has no height yet, so do it again once it has one.
    const toBottom = () => editor.setScrollTop(editor.getScrollHeight())
    if (editor.getLayoutInfo().height > 0) toBottom()
    const once = editor.onDidLayoutChange((layout) => {
      if (layout.height === 0) return
      once.dispose()
      toBottom()
    })
    window.setTimeout(() => once.dispose(), 2000)
  }
  // A value that did not come from typing (a new step, the solution, a reset) is shown from its end.
  useEffect(() => {
    if (value === typed.current) return
    typed.current = value
    if (startAtEnd) revealEnd()
  })
  return (
    <Editor
      path={path}
      language={languages[lang] ?? 'plaintext'}
      value={value}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      onChange={(next) => {
        typed.current = next ?? ''
        onChange?.(next ?? '')
      }}
      onMount={(editor, monaco) => {
        editorRef.current = editor
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRunRef.current?.())
        if (startAtEnd) revealEnd()
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
