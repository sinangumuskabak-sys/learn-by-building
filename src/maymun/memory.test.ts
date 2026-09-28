import { afterEach, describe, expect, it } from 'vitest'
import { addToThread, forModel, getThread, loadThread, MAX_SENT, newTopic, projectOf, resetMemoryForTests } from './memory.ts'

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

  it('keeps projects apart and starts a new topic without losing the old one', async () => {
    await loadThread('game:snake')
    await loadThread('game:pong')
    addToThread('game:snake', { role: 'user', text: 'snake?', tag: { panel: 'code', step: '01-canvas' } })
    addToThread('game:pong', { role: 'user', text: 'pong?' })
    expect(getThread('game:snake').messages.map((m) => m.text)).toEqual(['snake?'])
    newTopic('game:snake')
    expect(getThread('game:snake').messages).toEqual([])
    expect(getThread('game:snake').archived[0].messages.map((m) => m.text)).toEqual(['snake?'])
    expect(getThread('game:pong').messages.map((m) => m.text)).toEqual(['pong?'])
  })

  it('tells the model where each question was asked, and sends only the latest messages', () => {
    const messages = [
      { role: 'user' as const, text: 'why?', tag: { panel: 'code', step: '02-grid' }, at: 1 },
      { role: 'assistant' as const, text: 'because', at: 2 },
      { role: 'user' as const, text: 'old, untagged' },
    ]
    expect(forModel(messages)).toEqual([
      { role: 'user', text: '[code panel, step 02-grid] why?' },
      { role: 'assistant', text: 'because' },
      { role: 'user', text: 'old, untagged' },
    ])
    const many = Array.from({ length: MAX_SENT + 5 }, (_, i) => ({ role: 'user' as const, text: String(i) }))
    expect(forModel(many)).toHaveLength(MAX_SENT)
    expect(forModel(many)[0].text).toBe('5')
  })

  it('moves the conversation from before projects into the first project opened, once', async () => {
    localStorage.setItem('lp.maymun.chat', JSON.stringify([{ role: 'user', text: 'old', shot: true }, { role: 'nope', text: 'x' }]))
    const thread = await loadThread('game:snake')
    expect(thread.messages).toEqual([{ role: 'user', text: 'old', shot: true }])
    expect(localStorage.getItem('lp.maymun.chat')).toBeNull()
    expect((await loadThread('game:pong')).messages).toEqual([])
  })

  it('does not lose a message added before the conversation has loaded', async () => {
    addToThread('game:life', { role: 'user', text: 'early' })
    await loadThread('game:life')
    await Promise.resolve()
    expect(getThread('game:life').messages.map((m) => m.text)).toEqual(['early'])
  })
})
