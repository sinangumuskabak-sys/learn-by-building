import { describe, expect, it } from 'vitest'
import { applyOps, memoryPrompt, parseMemory, visibleText } from './maymun-memory.ts'
import { readSections } from './sections.ts'

const EMPTY = /^_\((henüz boş|henüz yok|empty so far|none yet)\)_$/
const note = [
  '---',
  'type: step',
  '---',
  '# Step',
  '',
  '## Status',
  '<!-- auto:status -->',
  '✅ Done',
  '',
  '## What you learned',
  '<!-- maymun:learned -->',
  '_(empty so far)_',
  '',
  '## Where you are now',
  '<!-- maymun:now -->',
  '_(empty so far)_',
  '',
  '## My notes',
  'mine',
  '',
].join('\n')
const path = 'Games/Snake/Steps/01.md'
const notes = new Map([[path, note]])
const allowed = new Set([path])
const body = (content: string, id: string) => readSections(content).find((s) => s.id === id)!.body

describe('Maymun memory block', () => {
  it('hides the block while the answer streams, even half typed', () => {
    expect(visibleText('Try it.\n\n<memory>[{"file"')).toBe('Try it.')
    expect(visibleText('Try it.\n\n<mem')).toBe('Try it.\n\n')
    expect(visibleText('a < b')).toBe('a < b')
  })

  it('splits the answer from its operations; a broken block writes nothing', () => {
    const answer = 'Good.\n<memory>[{"file": "a.md", "section": "learned", "add": "x"}, {"nope": 1}]</memory>'
    expect(parseMemory(answer)).toEqual({ visible: 'Good.', ops: [{ file: 'a.md', section: 'learned', add: 'x' }] })
    expect(parseMemory('Good.\n<memory>[{"file": </memory>')).toEqual({ visible: 'Good.', ops: [] })
    expect(parseMemory('No block.')).toEqual({ visible: 'No block.', ops: [] })
    expect(parseMemory('Fenced.\n<memory>```json\n[]\n```</memory>').ops).toEqual([])
  })

  it('adds bullets and sets present-tense sections, only where allowed', () => {
    const [changed] = applyOps(
      [
        { file: path, section: 'learned', add: 'ctx is the brush' },
        { file: path, section: 'learned', add: '- ctx is the brush' },
        { file: path, section: 'now', set: 'Drawing the board.' },
        { file: path, section: 'status', set: 'hacked' },
        { file: path, section: 'learned', set: 'not settable' },
        { file: 'other.md', section: 'learned', add: 'elsewhere' },
        { file: path, section: 'learned', add: 'my key is sk-ant-abcdef123456' },
      ],
      notes,
      allowed,
      EMPTY,
    )
    expect(body(changed.content, 'learned')).toBe('- ctx is the brush')
    expect(body(changed.content, 'now')).toBe('Drawing the board.')
    expect(body(changed.content, 'status')).toBe('✅ Done')
    expect(changed.content.endsWith('## My notes\nmine\n')).toBe(true)
  })

  it('keeps to six operations and a size limit', () => {
    const ops = Array.from({ length: 10 }, (_, i) => ({ file: path, section: 'learned', add: `point ${i}` }))
    const [changed] = applyOps(ops, notes, allowed, EMPTY)
    expect(body(changed.content, 'learned').split('\n')).toHaveLength(6)
    expect(applyOps([{ file: path, section: 'learned', add: 'x'.repeat(301) }], notes, allowed, EMPTY)).toEqual([])
  })

  it('tells the model the notes and where it may write, within a budget', () => {
    const big = { path: 'big.md', content: '# Big\n' + 'y'.repeat(20_000) }
    const { text, allowed } = memoryPrompt([{ path, content: note }, big, { path: 'late.md', content: '# Late' }], 'Keep it short.')
    expect(text).toContain('Keep it short.')
    expect(text).toContain(`- ${path}: learned (add), now (set)`)
    expect(text).toContain(`<note path="${path}">`)
    expect(text).not.toContain('type: step')
    expect([...allowed]).toEqual([path])
    expect(text.length).toBeLessThan(16_000)
  })
})
