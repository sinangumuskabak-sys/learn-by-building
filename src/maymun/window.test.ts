import { describe, expect, it } from 'vitest'
import { parseFold, pendingPages } from './fold.ts'
import { paginate, type ChatPage, type StoredMessage, type Timeline } from './memory.ts'
import { asksForPages, conversationPrompt, mayAskForPages, pageIndex, pagesBefore, recalled, relatedPage, searchPages, stems, WINDOW_TOKENS, windowStart } from './window.ts'

const DAY = 86_400_000
const at = (d: number) => Date.UTC(2026, 8, 1) + d * DAY
/** Characters that make about this many tokens. */
const T = (n: number) => Math.ceil(n * 3.5)

/** A conversation of `n` questions and answers; question i is about `topics[i]`. */
function timeline(topics: string[], filler = 0, meta: Partial<Timeline> = {}): Timeline {
  const messages: StoredMessage[] = topics.flatMap((topic, i) => [
    { role: 'user', text: `question ${i}: ${topic}`, tag: { panel: 'code', page: i % 2 ? 'Pong' : 'Snake', project: i % 2 ? 'game:pong' : 'game:snake' }, at: at(i) },
    { role: 'assistant', text: `answer ${i} ${'x'.repeat(filler)}`, at: at(i) + 1 },
  ])
  const { pages } = paginate([], messages)
  return { pages, messages: pages.flatMap((p) => p.messages), windowFrom: 0, sessionFrom: 0, summary: '', foldedThrough: 0, ...meta }
}

describe('the conversation window', () => {
  it('sends the latest messages that fit, always the last two exchanges, starting at a question', () => {
    const short = timeline(['a', 'b', 'c'])
    expect(windowStart(short)).toBe(0)
    // Long answers: only the last two exchanges fit.
    const long = timeline(Array.from({ length: 20 }, (_, i) => `t${i}`), T(WINDOW_TOKENS / 2))
    const from = windowStart(long)
    expect(long.messages.length - from).toBe(4)
    expect(long.messages[from].role).toBe('user')
    // After a new chat, nothing before it goes word for word.
    const fresh = timeline(['a', 'b', 'c'], 0, { windowFrom: 6 })
    expect(windowStart(fresh, [{ role: 'user', text: 'new' }])).toBe(6)
  })

  it('lists the pages before the window, folding old days into one line when the list gets long', () => {
    const t = timeline(Array.from({ length: 40 }, (_, i) => `topic ${i}`), T(1_600))
    const earlier = pagesBefore(t, windowStart(t))
    expect(earlier.length).toBeGreaterThan(30)
    const index = pageIndex(earlier)
    expect(index.length).toBeLessThanOrEqual(3_600)
    expect(index.split('\n')[0]).toMatch(/^- p\.1 · 2026-09-01 · Snake/)
    expect(index.split('\n').at(-1)).toContain(`p.${earlier.at(-1)!.n} ·`)
    const titled: ChatPage = { n: 9, title: 'Collision counted twice', messages: [{ role: 'user', text: 'x', at: at(3), tag: { panel: 'code', page: 'Snake', step: '03-food' } }] }
    expect(pageIndex([titled])).toBe('- p.9 · 2026-09-04 · Snake/03-food · Collision counted twice')
  })

  it('finds pages by their words, Turkish endings and letters included, the current project first', () => {
    expect(stems('Çarpışmalar neden İKİ kez sayılıyor?')).toEqual(['carpi', 'iki', 'kez', 'sayil'])
    const t = timeline(['çarpışma iki kez sayılıyor', 'renkler', 'skor tablosu', 'çarpışma kutusu', 'yılan hızı'], T(1_600))
    const found = searchPages(t.pages, 'çarpışmayı nasıl düzeltmiştik', 'game:pong')
    expect(found.map((r) => r.page.messages[0].text)).toEqual(['question 3: çarpışma kutusu', 'question 0: çarpışma iki kez sayılıyor'])
    expect(relatedPage(t.pages, 'iki kez sayılan çarpışma', 'game:snake')?.messages[0].text).toBe('question 0: çarpışma iki kez sayılıyor')
    expect(relatedPage(t.pages, 'bugün hava güzel')).toBeNull()
  })

  it('reads Maymun’s requests for pages, and sends at most three', () => {
    expect(mayAskForPages('<rec')).toBe(true)
    expect(mayAskForPages('<recall pages')).toBe(true)
    expect(mayAskForPages('Sure')).toBe(false)
    expect(asksForPages('<recall pages="1, 3-5"/>')).toEqual({ pages: [1, 3, 4, 5] })
    expect(asksForPages(' <recall q="çarpışma"/>')).toEqual({ q: 'çarpışma' })
    expect(asksForPages('I think <recall pages="1"/>')).toBeNull()
    const t = timeline(['a', 'b', 'c', 'd', 'e'], T(1_600))
    const sent = recalled(t, { pages: [5, 1, 99, 2, 3] })
    expect(sent.pages.map((p) => p.n)).toEqual([1, 2, 5])
    expect(sent.text).toContain('<page n="1" date="2026-09-01">')
    expect(sent.text).toContain('Learner: [code panel, page "Snake"] question 0: a')
    expect(recalled(t, { q: 'zzz' }).text).toContain('No page matched')
  })

  it('tells the model about earlier pages only when there are some', () => {
    expect(conversationPrompt(timeline(['a']), 0, null)).toBe('')
    const t = timeline(['a', 'b', 'c', 'd'], T(1_600), { summary: '**Now:** snake' })
    const text = conversationPrompt(t, windowStart(t), t.pages[0])
    expect(text).toContain('## Summary of the earlier pages')
    expect(text).toContain('**Now:** snake')
    expect(text).toContain('- p.1 · 2026-09-01 · Snake')
    expect(text).toContain('Maybe related to this question (found by its words): page 1')
    expect(text).toContain('<recall pages="3,7"/>')
  })
})

describe('the running summary', () => {
  it('folds the pages wholly before the window, a few at a time, after the last folded one', () => {
    const t = timeline(Array.from({ length: 12 }, (_, i) => `t${i}`), T(1_600))
    const pending = pendingPages(t)
    expect(pending.map((p) => p.n)).toEqual([1, 2, 3, 4])
    expect(pendingPages({ ...t, foldedThrough: 4 })[0].n).toBe(5)
    expect(pendingPages(timeline(['a']))).toEqual([])
  })

  it('reads the summary and titles, and nothing else', () => {
    expect(parseFold('```json\n{"summary": "**Now:** x", "titles": {"3": "Colours", "x": "no", "4": 5}}\n```')).toEqual({ summary: '**Now:** x', titles: { 3: 'Colours' } })
    expect(parseFold('{"summary": ""}')).toBeNull()
    expect(parseFold('no json')).toBeNull()
  })
})
