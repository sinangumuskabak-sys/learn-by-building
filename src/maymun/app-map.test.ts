import { describe, expect, it } from 'vitest'
import { games } from '../games/catalog.ts'
import { stepKey } from '../games/schema.ts'
import { APP_MAP_MARKER, appMap, asksForMap, mayAskForMap } from './app-map.ts'

const empty = { version: 1 as const, challenges: {} }

describe('the app map for Maymun', () => {
  it('lists every page, project and game with a link, in the learner’s language', () => {
    const map = appMap('tr', empty)
    for (const page of ['/games', '/skills', '/memory', '/settings']) expect(map).toContain(page)
    expect(map).not.toContain('/learn/')
    expect(map).toContain('## Build projects')
    for (const game of games) expect(map).toContain(`${game.title.tr ?? game.title.en} (/games/${game.id})`)
    expect(appMap('en', empty)).toContain(`${games[0].title.en} (/games/${games[0].id})`)
    // Long enough to be worth sending only when asked for.
    expect(map.length).toBeGreaterThan(4000)
  })

  it('says how far the learner is', () => {
    const snake = games.find((g) => g.id === 'snake')!
    const progress = {
      version: 1 as const,
      challenges: {
        [stepKey('snake', snake.steps[0].id)]: { status: 'passed' as const, updatedAt: '2026-09-29T10:00:00Z' },
      },
    }
    const map = appMap('en', progress)
    expect(map).toContain(`[1/${snake.steps.length} steps done]`)
    expect(map).toContain('not started]')
  })

  it('recognises the request for the map, also while it is still arriving', () => {
    expect(asksForMap(` ${APP_MAP_MARKER}\n`)).toBe(true)
    expect(asksForMap('Try Snake first.')).toBe(false)
    expect(mayAskForMap('<app')).toBe(true)
    expect(mayAskForMap(APP_MAP_MARKER)).toBe(true)
    expect(mayAskForMap('<b>Hi')).toBe(false)
    expect(mayAskForMap('Snake')).toBe(false)
  })
})
