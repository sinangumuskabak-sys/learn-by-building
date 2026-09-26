// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { Challenge, CodeFile } from '../content/schema.ts'
import { buildDocument, gradeQuiz } from './challenge-input.ts'
import { runJsTests } from './js-core.ts'
import { runChallengeInNode } from './node.ts'
import { allPassed } from './types.ts'

function challenge(overrides: Partial<Challenge>): Challenge {
  return {
    id: 'c',
    title: 'C',
    type: 'code-js',
    skills: ['s'],
    level: 1,
    lang: 'en',
    source: 'c.md',
    description: 'd',
    instructions: '',
    tests: [],
    setup: [],
    seed: [],
    solutions: [],
    questions: [],
    rubric: [],
    ...overrides,
  }
}

const file = (lang: string, contents: string, name = `index.${lang}`): CodeFile => ({ name, lang, contents })

describe('runJsTests', () => {
  const tests = [
    { text: 'x is 2', code: 'assert.strictEqual(x, 2)' },
    { text: 'uses const', code: "assert.match(code, /const/)" },
  ]

  it('passes and fails individual tests with messages', async () => {
    const result = await runJsTests({ code: 'const x = 3', rawCode: 'const x = 3', setup: '', tests })
    expect(result.tests.map((t) => t.passed)).toEqual([false, true])
    expect(result.tests[0].error).toMatch(/expected 3 to equal 2/)
  })

  it('reports a syntax error once instead of per test', async () => {
    const result = await runJsTests({ code: 'const x = ', rawCode: 'const x = ', setup: '', tests })
    expect(result.error).toMatch(/SyntaxError/)
    expect(allPassed(result)).toBe(false)
  })

  it('captures console output from the first run only', async () => {
    const code = "console.log('hi', { a: 1 }); const x = 2"
    const result = await runJsTests({ code, rawCode: code, setup: '', tests })
    expect(result.logs).toEqual(['hi {"a":1}'])
  })

  it('lets a learner variable named code coexist with the raw source', async () => {
    const code = "const code = 'mine'; const x = 2"
    const result = await runJsTests({ code, rawCode: code, setup: '', tests })
    expect(allPassed(result)).toBe(true)
  })
})

describe('runChallengeInNode', () => {
  it('strips TypeScript types', async () => {
    const c = challenge({ type: 'code-ts', tests: [{ text: 't', code: 'assert.strictEqual(double(2), 4)' }] })
    const result = await runChallengeInNode(c, [file('ts', 'const double = (n: number): number => n * 2')])
    expect(allPassed(result)).toBe(true)
  })

  it('runs SQL against the setup and exposes rows, columns and query()', async () => {
    const c = challenge({
      type: 'sql',
      setup: [file('sql', 'create table t (n int); insert into t values (1), (2);')],
      tests: [
        { text: 'rows', code: 'assert.deepEqual(rows, [{ total: 3 }])' },
        { text: 'columns', code: "assert.deepEqual(columns, ['total'])" },
        { text: 'query', code: "assert.lengthOf(await query('select * from t'), 2)" },
      ],
    })
    const result = await runChallengeInNode(c, [file('sql', 'select sum(n)::int as total from t;')])
    expect(result.tests.map((t) => t.error)).toEqual([undefined, undefined, undefined])
    expect(result.table).toEqual({ columns: ['total'], rows: [[3]] })
  })

  it('reports SQL errors', async () => {
    const c = challenge({ type: 'sql', tests: [{ text: 't', code: 'assert.ok(true)' }] })
    const result = await runChallengeInNode(c, [file('sql', 'select * from missing;')])
    expect(result.error).toMatch(/missing/)
  })

  it('runs web tests against the rendered document', async () => {
    const c = challenge({
      type: 'web',
      tests: [{ text: 'styled', code: "assert.strictEqual(document.querySelector('p').textContent, 'hi')" }],
    })
    const result = await runChallengeInNode(c, [
      file('html', '<html><head></head><body><p></p></body></html>'),
      file('js', "document.querySelector('p').textContent = 'hi'; console.log('done')"),
    ])
    expect(allPassed(result)).toBe(true)
    expect(result.logs).toContain('done')
  })
})

describe('buildDocument', () => {
  it('puts styles in head and scripts at the end of body', () => {
    const html = buildDocument([
      file('html', '<html><head><title>t</title></head><body><p>x</p></body></html>'),
      file('css', 'p{}'),
      file('js', 'let a = "</script>"'),
    ])
    expect(html.indexOf('<style')).toBeLessThan(html.indexOf('</head>'))
    expect(html.indexOf('<script')).toBeGreaterThan(html.indexOf('<p>x</p>'))
    expect(html).toContain('<\\/script>')
  })
})

describe('gradeQuiz', () => {
  it('requires exactly the correct options', () => {
    const questions = [
      { prompt: 'a', options: [{ text: '1', correct: true }, { text: '2', correct: false }] },
      { prompt: 'b', options: [{ text: '1', correct: true }, { text: '2', correct: true }] },
    ]
    expect(gradeQuiz(questions, { 0: [0], 1: [0] })).toEqual([true, false])
    expect(gradeQuiz(questions, { 0: [0, 1], 1: [0, 1] })).toEqual([false, true])
  })
})
