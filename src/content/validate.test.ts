import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadContentFromDisk } from './load-node.ts'
import type { Challenge } from './schema.ts'
import { validateChallenge, validateContent } from './validate.ts'

function challenge(overrides: Partial<Challenge>): Challenge {
  return {
    id: 'c',
    title: 'C',
    type: 'code-js',
    skills: ['s'],
    level: 1,
    lang: 'en',
    source: 'c.md',
    description: 'desc',
    instructions: '',
    tests: [{ text: 't', code: 'assert.ok(true)' }],
    setup: [],
    seed: [{ name: 'index.js', lang: 'js', contents: '' }],
    solutions: [[{ name: 'index.js', lang: 'js', contents: '' }]],
    questions: [],
    rubric: [],
    ...overrides,
  }
}

describe('validateChallenge', () => {
  it('accepts a complete runnable challenge', () => {
    expect(validateChallenge(challenge({}))).toEqual([])
  })

  it('requires seed, tests and a solution for runnable types', () => {
    const problems = validateChallenge(challenge({ seed: [], tests: [], solutions: [] }))
    expect(problems.join('\n')).toMatch(/seed/)
    expect(problems.join('\n')).toMatch(/test/)
    expect(problems.join('\n')).toMatch(/solution/)
  })

  it('flags solution files that differ from seed files', () => {
    const problems = validateChallenge(challenge({ solutions: [[{ name: 'main.js', lang: 'js', contents: '' }]] }))
    expect(problems).toHaveLength(1)
  })

  it('flags a wrong seed language', () => {
    expect(validateChallenge(challenge({ type: 'sql' }))).toEqual([
      'c.md: seed file "index.js" uses "js", expected sql',
    ])
  })

  it('needs at least one correct and one wrong quiz option', () => {
    const quiz = challenge({
      type: 'quiz',
      tests: [],
      seed: [],
      solutions: [],
      questions: [{ prompt: 'q', options: [{ text: 'a', correct: true }, { text: 'b', correct: true }] }],
    })
    expect(validateChallenge(quiz)).toHaveLength(1)
  })

  it('needs a rubric for design challenges and no tests', () => {
    const design = challenge({ type: 'design', seed: [], solutions: [] })
    expect(validateChallenge(design)).toHaveLength(2)
  })
})

describe('validateContent', () => {
  const curriculum = {
    categories: [
      {
        id: 'cat',
        title: { en: 'Cat' },
        description: { en: 'd' },
        icon: 'code',
        modules: [{ id: 'mod', title: { en: 'Mod' }, challenges: ['c', 'ghost'] }],
      },
    ],
  }

  it('reports missing, unplaced and unknown-skill challenges', () => {
    const problems = validateContent({
      curriculum,
      skills: [{ id: 's', title: { en: 'S' }, category: 'nowhere' }],
      challenges: [challenge({}), challenge({ id: 'orphan', source: 'o.md', skills: ['nope'] })],
    })
    expect(problems.join('\n')).toMatch(/missing challenge "ghost"/)
    expect(problems.join('\n')).toMatch(/o\.md: not listed/)
    expect(problems.join('\n')).toMatch(/unknown skill "nope"/)
    expect(problems.join('\n')).toMatch(/unknown category "nowhere"/)
  })
})

describe('repository content', () => {
  it('is valid', () => {
    const { content, problems } = loadContentFromDisk(resolve(import.meta.dirname, '../../content'))
    expect([...problems, ...validateContent(content)]).toEqual([])
  })
})
