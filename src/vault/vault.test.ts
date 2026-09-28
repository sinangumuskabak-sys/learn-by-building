import { describe, expect, it } from 'vitest'
import { catalog } from '../content/catalog.ts'
import { games } from '../games/catalog.ts'
import { stepKey } from '../games/schema.ts'
import type { Progress } from '../progress/progress.ts'
import { readSections, writeSection } from './sections.ts'
import { applyAuto, journalNotes, reviewOf, vaultNotes, type VaultSource } from './skeleton.ts'
import { crc32, zip } from './zip.ts'

const source = (lang: 'tr' | 'en'): VaultSource => ({
  categories: catalog.curriculum.categories,
  challenges: new Map([...catalog.challenges.values()].map(({ challenge }) => [challenge.id, challenge])),
  games,
  skills: catalog.skills,
  lang,
})

const empty: Progress = { version: 1, challenges: {} }

describe('vault skeleton', () => {
  const notes = vaultNotes(source('tr'))
  const paths = notes.map((n) => n.path)

  it('has a note for everything the learner can work on, each path once', () => {
    const steps = games.reduce((n, g) => n + g.steps.length, 0)
    const modules = catalog.curriculum.categories.reduce((n, c) => n + c.modules.length, 0)
    const categories = catalog.curriculum.categories.length
    const overview = 4 // Güncel durum, Öğrenci profili, Beni oku, Maymun talimatı
    expect(notes).toHaveLength(steps + games.length + catalog.challenges.size + modules + categories + catalog.skills.length + overview)
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths).toContain('Güncel durum.md')
    expect(paths).toContain('Oyunlar/Yılan/Güncel durum.md')
    expect(paths.filter((p) => p.startsWith('Oyunlar/Yılan/Adımlar/'))).toHaveLength(games.find((g) => g.id === 'snake')!.steps.length)
    expect(paths.every((p) => p.endsWith('.md') && !/[\\:*?"<>|#^[\]]/.test(p))).toBe(true)
  })

  it('marks who writes each section and leaves the learner a place of their own', () => {
    const step = notes.find((n) => n.path.startsWith('Oyunlar/Yılan/Adımlar/03 '))!
    const sections = readSections(step.template)
    expect(sections.map((s) => `${s.owner}:${s.id}`)).toEqual(['auto:status', 'maymun:learned', 'maymun:struggled', 'maymun:asked'])
    expect(step.template.trimEnd().endsWith('## Notlarım')).toBe(true)
    expect(step.template).toContain('[[Beceriler/')
  })

  it('follows progress in the app-owned parts only, keeping what Maymun and the learner wrote', () => {
    const snake = games.find((g) => g.id === 'snake')!
    const key = stepKey('snake', snake.steps[0].id)
    const spec = notes.find((n) => n.path.startsWith('Oyunlar/Yılan/Adımlar/01 '))!
    let content = applyAuto(spec.template, spec, empty)
    expect(content).toContain('status: not-started')
    content = writeSection(content, 'maymun', 'learned', '- `ctx` fırçadır, `canvas` kâğıt.')
    content += 'Kendi notum\n'
    const progress: Progress = {
      version: 1,
      challenges: { [key]: { status: 'passed', passedAt: '2026-09-28T10:00:00.000Z', updatedAt: '2026-09-28T10:00:00.000Z' } },
    }
    const after = applyAuto(content, spec, progress)
    expect(after).toContain('status: done')
    expect(readSections(after).find((s) => s.id === 'status')!.body).toBe('✅ Tamamlandı (2026-09-28)')
    expect(after).toContain('- `ctx` fırçadır, `canvas` kâğıt.')
    expect(after.endsWith('Kendi notum\n')).toBe(true)

    const game = notes.find((n) => n.path === 'Oyunlar/Yılan/Güncel durum.md')!
    const table = readSections(applyAuto(game.template, game, progress)).find((s) => s.id === 'progress')!.body
    expect(table.startsWith(`1/${snake.steps.length}`)).toBe(true)
    const overview = notes.find((n) => n.path === 'Güncel durum.md')!
    expect(applyAuto(overview.template, overview, progress)).toContain('Oyun adımları: 1/')

    const journal = journalNotes(source('tr'), progress, notes)
    expect(journal.map((j) => j.path)).toEqual(['Günlük/2026-09-28.md'])
    expect(applyAuto(journal[0].template, journal[0], progress)).toContain('[[Oyunlar/Yılan/Adımlar/01 ')
  })

  it('is written in the interface language', () => {
    const en = vaultNotes(source('en')).map((n) => n.path)
    expect(en).toContain('Current status.md')
    expect(en).toContain('Games/Snake/Current status.md')
    expect(en).toContain('00 Read me.md')
  })
})

describe('vault zip', () => {
  it('computes the standard CRC-32', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926)
  })

  it('writes a ZIP with UTF-8 names that ends in the central directory', () => {
    const data = zip([{ path: 'Learn Platform/Güncel durum.md', content: '# Merhaba' }])
    const view = new DataView(data.buffer)
    expect(view.getUint32(0, true)).toBe(0x04034b50)
    expect(view.getUint32(data.length - 22, true)).toBe(0x06054b50)
    expect(view.getUint16(data.length - 22 + 10, true)).toBe(1)
    expect(new TextDecoder().decode(data.slice(30, 30 + 'Learn Platform/Güncel durum.md'.length + 2))).toContain('Güncel')
  })
})

describe('skill reviews', () => {
  it('spaces reviews out the more days a skill was practised', () => {
    expect(reviewOf([])).toBeNull()
    expect(reviewOf(['2026-09-28'])).toEqual({ last: '2026-09-28', next: '2026-09-29', times: 1 })
    expect(reviewOf(['2026-09-20', '2026-09-28', '2026-09-28'])).toEqual({ last: '2026-09-28', next: '2026-10-01', times: 2 })
    expect(reviewOf(['2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01', '2026-06-01'])!.next).toBe('2026-07-01')
  })

  it('shows the review in the skill note once the skill is practised', () => {
    const snake = games.find((g) => g.id === 'snake')!
    const step = snake.steps[0]
    const skill = catalog.skills.find((s) => s.id === step.skills[0])!
    const notes = vaultNotes(source('en'))
    const spec = notes.find((n) => n.path === `Skills/${skill.title.en}.md`)!
    const progress: Progress = {
      version: 1,
      challenges: { [stepKey('snake', step.id)]: { status: 'passed', passedAt: '2026-09-20T10:00:00.000Z', updatedAt: '2026-09-20T10:00:00.000Z' } },
    }
    const content = applyAuto(spec.template, spec, progress)
    expect(content).toContain('next_review: 2026-09-21')
    expect(content).toContain('Practised on 1 day, last on 2026-09-20. Next review: 2026-09-21.')
  })
})
