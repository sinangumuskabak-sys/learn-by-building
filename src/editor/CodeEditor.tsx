import Editor, { type OnMount } from '@monaco-editor/react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
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
  /**
   * Lines at the top (`before`) and bottom (`after`) that cannot be edited: the finished parts of a step's code. They are
   * greyed out; the cursor opens on the first line in between.
   */
  locked?: { before: number; after: number } | null
  /** Shown next to the cursor when a key would change a locked line. */
  lockedMessage?: string
}

type MonacoEditor = Parameters<OnMount>[0]
type Monaco = Parameters<OnMount>[1]

/** Keys that move the cursor or copy, and so never change the text. */
const SAFE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Escape', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'F1', 'F3'])

/** Keeps edits between the locked lines: keys that would change a locked line are dropped, anything else is undone. */
function guardLocked(
  editor: MonacoEditor,
  lock: () => { before: number; after: number } | null | undefined,
  message: () => string | undefined,
) {
  const range = () => {
    const current = lock()
    const model = editor.getModel()
    if (!current || !model) return null
    return { first: current.before + 1, last: model.getLineCount() - current.after, model }
  }
  const keys = editor.onKeyDown((event) => {
    const r = range()
    if (!r) return
    const key = event.browserEvent.key
    const ctrl = event.ctrlKey || event.metaKey
    if (SAFE_KEYS.has(key)) return
    if (ctrl && ['c', 'a', 'f', 'z', 'y', 'Enter'].includes(key.toLowerCase())) return
    for (const selection of editor.getSelections() ?? []) {
      const outside = selection.startLineNumber < r.first || selection.endLineNumber > r.last
      const empty = selection.isEmpty()
      const joinsAbove = empty && key === 'Backspace' && selection.startLineNumber === r.first && selection.startColumn === 1
      const joinsBelow =
        empty && key === 'Delete' && selection.endLineNumber === r.last && selection.endColumn === r.model.getLineMaxColumn(r.last)
      if (outside || joinsAbove || joinsBelow) {
        event.preventDefault()
        event.stopPropagation()
        const text = message()
        const messages = editor.getContribution('editor.contrib.messageController') as { showMessage?: (text: string, at: unknown) => void } | null
        if (text) messages?.showMessage?.(text, selection.getPosition())
        return
      }
    }
  })
  // Paste from the menu, drag and drop or anything the keys above missed: take the change back.
  let lines = editor.getModel()?.getLinesContent() ?? []
  const changes = editor.onDidChangeModelContent((event) => {
    const r = range()
    const now = r?.model.getLinesContent() ?? []
    if (r && !event.isUndoing && !event.isFlush && lines.length > 0) {
      const current = lock()!
      const kept =
        now.length >= current.before + current.after + 1 &&
        lines.slice(0, current.before).every((line, i) => line === now[i]) &&
        lines.slice(lines.length - current.after).every((line, i) => line === now[now.length - current.after + i])
      if (!kept) {
        queueMicrotask(() => editor.trigger('lock', 'undo', null))
        return
      }
    }
    lines = now
  })
  return () => {
    keys.dispose()
    changes.dispose()
  }
}

/** Monaco editor; loaded lazily because it is by far the largest part of the app. */
export default function CodeEditor({ path, lang, value, onChange, onRun, readOnly, label, startAtEnd, locked, lockedMessage }: CodeEditorProps) {
  const { fontSize } = useSettings()
  const theme = useTheme()
  // The shortcut is registered once on mount, so read the latest callback through a ref.
  const onRunRef = useRef(onRun)
  const onChangeRef = useRef(onChange)
  const rendered = useRef(value)
  const lockRef = useRef(locked)
  const lockedMessageRef = useRef(lockedMessage)
  useLayoutEffect(() => {
    lockedMessageRef.current = lockedMessage
    onRunRef.current = onRun
    onChangeRef.current = onChange
    rendered.current = value
    lockRef.current = locked
  })
  const editorRef = useRef<MonacoEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const typed = useRef(value)
  const decorations = useRef<ReturnType<MonacoEditor['createDecorationsCollection']> | null>(null)
  /** Grey out the locked lines. */
  const paintLocked = () => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    const model = editor?.getModel()
    const current = lockRef.current
    if (!editor || !monaco || !model) return
    const last = model.getLineCount()
    const ranges = !current
      ? []
      : [
          ...(current.before > 0 ? [new monaco.Range(1, 1, current.before, 1)] : []),
          ...(current.after > 0 ? [new monaco.Range(last - current.after + 1, 1, last, 1)] : []),
        ]
    decorations.current?.set(
      ranges.map((range) => ({ range, options: { isWholeLine: true, className: 'lp-locked-line', inlineClassName: 'lp-locked-text' } })),
    )
  }
  useEffect(paintLocked)
  /** Put the cursor at the end of the first line that can be edited. */
  const revealEditable = () => {
    const editor = editorRef.current
    const model = editor?.getModel()
    const current = lockRef.current
    if (!editor || !model || !current) return false
    const line = Math.min(current.before + 1, model.getLineCount())
    editor.setPosition({ lineNumber: line, column: model.getLineMaxColumn(line) })
    editor.revealLineInCenter(line)
    return true
  }
  const revealEnd = () => {
    if (revealEditable()) return
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
        monacoRef.current = monaco
        decorations.current = editor.createDecorationsCollection()
        paintLocked()
        const unguard = guardLocked(editor, () => lockRef.current, () => lockedMessageRef.current)
        editor.onDidDispose(unguard)
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
          // Typing reaches React as a non-urgent update, so a quick Ctrl+Enter can come before the last keystrokes
          // are rendered; hand the text over synchronously first so the run sees what is on screen.
          const current = editor.getValue()
          if (current !== rendered.current) flushSync(() => onChangeRef.current?.(current))
          onRunRef.current?.()
        })
        if (startAtEnd) revealEnd()
        else revealEditable()
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
        dragAndDrop: !locked,
      }}
      loading={<div className="p-4 text-sm text-muted">…</div>}
    />
  )
}
