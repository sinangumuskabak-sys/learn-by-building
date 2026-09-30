import { afterEach, describe, expect, it } from 'vitest'
import { addMessages, deletePage, forModel, saveSummary, getTimeline, loadTimeline, mergeThreads, newChat, PAGE_TOKENS, paginate, projectOf, projectsOf, resetMemoryForTests } from './memory.ts'

afterEach(() => {
  resetMemoryForTests()
  localStorage.clear()
})

describe('Maymun memory', () => {
  it('knows the project and step of a page', () => {
    expect(projectOf('/games/flappy/03-gravity')).toEqual({ key: 'game:flappy', step: '03-gravity' })
    expect(projectOf('/games/flappy')).toEqual({ key: 'game:flappy' })
    expect(projectOf('/learn/loop-basics-quiz')).toEqual({ key: 'challenge:loop-basics-quiz' })
    expect(projectOf('/settings')).toEqual({ key: 'general' })
    expect(projectOf('/games')).toEqual({ key: 'general' })
  })

  it('keeps one conversation across projects, in pages that never lose a question from its answer', async () => {
    await loadTimeline()
    addMessages({ role: 'user', text: 'snake?', tag: { panel: 'code', step: '01-canvas', project: 'game:snake' } }, { role: 'assistant', text: 'yes' })
    addMessages({ role: 'user', text: 'pong?', tag: { panel: 'game', project: 'game:pong' } })
    const { messages } = getTimeline()
    expect(messages.map((m) => m.text)).toEqual(['snake?', 'yes', 'pong?'])
    expect(projectsOf(messages)).toEqual(['game:snake', 'game:snake', 'game:pong'])
    // A new chat keeps every message; only the window starts over.
    newChat()
    expect(getTimeline().windowFrom).toBe(3)
    expect(getTimeline().messages).toHaveLength(3)

    const long = 'x'.repeat(PAGE_TOKENS * 4)
    const { pages } = paginate([], [
      { role: 'user', text: 'q1' },
      { role: 'assistant', text: long },
      { role: 'assistant', text: 'still the same page: no question yet' },
      { role: 'user', text: 'q2' },
      { role: 'assistant', text: 'a2' },
    ])
    expect(pages.map((p) => [p.n, p.messages.map((m) => m.text.slice(0, 5))])).toEqual([
      [1, ['q1', 'xxxxx', 'still']],
      [2, ['q2', 'a2']],
    ])
  })

  it('deletes a page for good, keeping the other numbers, and starts the summary over when it held that page', async () => {
    await loadTimeline()
    const long = 'x'.repeat(PAGE_TOKENS * 4)
    for (const q of ['one', 'two', 'three']) addMessages({ role: 'user', text: q }, { role: 'assistant', text: long })
    newChat()
    saveSummary('knows about one and two', 2, { 1: 'One', 2: 'Two' })
    deletePage(3)
    expect(getTimeline().pages.map((p) => p.n)).toEqual([1, 2])
    expect(getTimeline().windowFrom).toBe(4)
    expect(getTimeline().summary).toBe('knows about one and two')
    deletePage(1)
    expect(getTimeline().pages.map((p) => [p.n, p.title])).toEqual([[2, 'Two']])
    expect(getTimeline().messages.map((m) => m.text)).toEqual(['two', long])
    expect(getTimeline()).toMatchObject({ windowFrom: 2, summary: '', foldedThrough: 0 })
  })

  it('tells the model where each question was asked', () => {
    const messages = [
      { role: 'user' as const, text: 'why?', tag: { panel: 'code', step: '02-grid', project: 'game:snake' }, at: 1 },
      { role: 'assistant' as const, text: 'because', at: 2, recalled: [1] },
      { role: 'user' as const, text: 'old, untagged' },
    ]
    expect(forModel(messages)).toEqual([
      { role: 'user', text: '[code panel, step 02-grid] why?' },
      { role: 'assistant', text: 'because' },
      { role: 'user', text: 'old, untagged' },
    ])
  })

  it('merges the old conversations, one per project with their earlier topics, into one in time order', () => {
    const merged = mergeThreads(
      [
        { project: 'game:snake', messages: [{ role: 'user', text: 's2', at: 30 }, { role: 'assistant', text: 's2a' }], archived: [{ endedAt: 15, messages: [{ role: 'user', text: 's1', at: 10 }] }] },
        { project: 'game:pong', messages: [{ role: 'user', text: 'p1', at: 20, tag: { panel: 'code' } }] },
      ],
      [{ role: 'user', text: 'legacy' }],
    )
    expect(merged.map((m) => m.text)).toEqual(['legacy', 's1', 'p1', 's2', 's2a'])
    expect(merged[2].tag).toEqual({ panel: 'code', project: 'game:pong' })
    expect(merged[1].tag).toEqual({ panel: 'page', project: 'game:snake' })
  })

  it('moves the conversation from before projects into the conversation, once', async () => {
    localStorage.setItem('lp.maymun.chat', JSON.stringify([{ role: 'user', text: 'old', shot: true }, { role: 'nope', text: 'x' }]))
    const timeline = await loadTimeline()
    expect(timeline.messages).toEqual([{ role: 'user', text: 'old', shot: true }])
    expect(localStorage.getItem('lp.maymun.chat')).toBeNull()
  })

  it('does not lose a message added before the conversation has loaded', async () => {
    addMessages({ role: 'user', text: 'early' })
    await loadTimeline()
    await Promise.resolve()
    expect(getTimeline().messages.map((m) => m.text)).toEqual(['early'])
  })
})
