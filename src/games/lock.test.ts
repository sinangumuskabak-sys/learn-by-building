import { describe, expect, it } from 'vitest'
import { lockedLines, withEditableLine } from './lock.ts'

describe('lockedLines', () => {
  const start = 'a\nb\nc\n'
  it('locks the lines a step keeps above and below its change', () => {
    expect(lockedLines(start, 'a\nB\nc\n', start)).toEqual({ before: 1, after: 1 })
  })
  it('locks everything above lines added at the end', () => {
    expect(lockedLines(start, 'a\nb\nc\nd\n', start)).toEqual({ before: 3, after: 0 })
  })
  it('locks nothing once the learner changed a finished line', () => {
    expect(lockedLines(start, 'a\nB\nc\n', 'x\nb\nc\n')).toBeNull()
  })
  it('keeps the lock while the learner writes between the finished lines', () => {
    expect(lockedLines(start, 'a\nB\nc\n', 'a\nmy\nlines\nc\n')).toEqual({ before: 1, after: 1 })
  })
})

describe('withEditableLine', () => {
  it('adds an empty line to type into when the step only adds lines', () => {
    const start = 'a\nb\n'
    expect(withEditableLine(start, lockedLines(start, 'a\nx\nb\n', start))).toBe('a\n\nb\n')
    expect(withEditableLine(start, lockedLines(start, 'a\nb\nc\n', start))).toBe('a\nb\n\n')
  })
  it('leaves code that already has lines to edit alone', () => {
    expect(withEditableLine('a\nb\n', { before: 1, after: 0 })).toBe('a\nb\n')
  })
})
