import { describe, expect, it } from 'vitest'
import { readSections } from './sections.ts'
import { parseSummary, sessionNote, withSessionList } from './sessions.ts'

describe('session summaries', () => {
  it('reads the model’s JSON, even inside other text, and rejects empty or broken answers', () => {
    expect(parseSummary('Here: {"asked": ["What is ctx?"], "learned": [], "hard": ["x", 3], "done": [], "next": "Step 2"}')).toEqual({
      asked: ['What is ctx?'],
      learned: [],
      hard: ['x'],
      done: [],
      next: 'Step 2',
    })
    expect(parseSummary('{"asked": [], "learned": [], "hard": [], "done": [], "next": ""}')).toBeNull()
    expect(parseSummary('no json')).toBeNull()
    expect(parseSummary('{"asked": [')).toBeNull()
  })

  it('writes the session next to the project’s status note and lists it there, newest first', () => {
    const summary = { asked: ['What is ctx?'], learned: ['ctx is the brush'], hard: [], done: ['Painted the board'], next: 'Draw the grid' }
    const note = sessionNote('Oyunlar/Yılan/Güncel durum.md', 'Yılan', summary, new Date(2026, 8, 28, 20, 15), 'tr')
    expect(note.path).toBe('Oyunlar/Yılan/Oturumlar/2026-09-28 20.15.md')
    expect(note.content).toContain('## Sorulanlar\n- What is ctx?')
    expect(note.content).toContain('## Zorlanılanlar\n_(yok)_')
    expect(note.content).toContain('project: "[[Oyunlar/Yılan/Güncel durum]]"')

    const status = '# Yılan\n\n## Oturumlar\n<!-- auto:sessions -->\n_(henüz yok)_\n\n## Notlarım\n'
    const listed = withSessionList(status, ['Oyunlar/Yılan/Oturumlar/2026-09-27 10.00.md', note.path])
    expect(readSections(listed)[0].body.split('\n')).toEqual([
      '- [[Oyunlar/Yılan/Oturumlar/2026-09-28 20.15|2026-09-28 20.15]]',
      '- [[Oyunlar/Yılan/Oturumlar/2026-09-27 10.00|2026-09-27 10.00]]',
    ])
    // A challenge's sessions are named after it (its note is not a status note).
    expect(sessionNote('Katalog/01 X/01 Y/Döngü temelleri.md', 'Döngü temelleri', summary, new Date(2026, 8, 28, 9, 5), 'tr').path).toBe(
      'Katalog/01 X/01 Y/Oturumlar/2026-09-28 09.05 Döngü temelleri.md',
    )
  })
})
