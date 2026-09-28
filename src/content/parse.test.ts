import { describe, expect, it } from 'vitest'
import { localizeChallenge } from './localize.ts'
import { ContentError, parseChallenge } from './parse.ts'

const fence = '```'

function doc(frontmatter: string, body: string) {
  return `---\n${frontmatter}\n---\n\n${body}`
}

const base = 'id: sample\ntitle: Sample\ntype: code-js\nskills: [prog.loops]\nlevel: 2'

describe('parseChallenge', () => {
  it('parses a runnable challenge with tests, seed and alternative solutions', () => {
    const raw = doc(
      base,
      [
        '# --description--',
        'Intro with an example:',
        `${fence}js`,
        '# --hints-- inside code is not a heading',
        fence,
        '# --instructions--',
        'Do it.',
        '# --hints--',
        'First requirement.',
        `${fence}js`,
        'assert.equal(x, 1)',
        fence,
        'Second requirement.',
        `${fence}js`,
        'assert.ok(true)',
        fence,
        '# --seed--',
        `${fence}js`,
        'let x',
        fence,
        '# --solutions--',
        `${fence}js`,
        'let x = 1',
        fence,
        '---',
        `${fence}js`,
        'let x = 2 - 1',
        fence,
      ].join('\n'),
    )
    const challenge = parseChallenge('sample.md', raw)
    expect(challenge).toMatchObject({ id: 'sample', type: 'code-js', level: 2, lang: 'en', instructions: 'Do it.' })
    expect(challenge.description).toContain('# --hints-- inside code is not a heading')
    expect(challenge.tests).toEqual([
      { text: 'First requirement.', code: 'assert.equal(x, 1)' },
      { text: 'Second requirement.', code: 'assert.ok(true)' },
    ])
    expect(challenge.seed).toEqual([{ name: 'index.js', lang: 'js', contents: 'let x\n' }])
    expect(challenge.solutions).toHaveLength(2)
  })

  it('uses file= to name code files', () => {
    const raw = doc(
      base.replace('code-js', 'web'),
      ['# --description--', 'd', '# --seed--', `${fence}html`, '<p></p>', fence, `${fence}css file=theme.css`, 'p{}', fence].join('\n'),
    )
    expect(parseChallenge('w.md', raw).seed.map((f) => f.name)).toEqual(['index.html', 'theme.css'])
  })

  it('parses quiz questions and rubric items', () => {
    const quiz = parseChallenge(
      'q.md',
      doc(base.replace('code-js', 'quiz'), ['# --questions--', '## Pick one', '- [ ] a', '- [x] b'].join('\n')),
    )
    expect(quiz.questions).toEqual([
      { prompt: 'Pick one', options: [{ text: 'a', correct: false }, { text: 'b', correct: true }] },
    ])
    const design = parseChallenge('d.md', doc(base.replace('code-js', 'design'), '# --rubric--\n- Clear\n- Safe'))
    expect(design.rubric).toEqual(['Clear', 'Safe'])
  })

  it.each([
    ['missing frontmatter', '# --description--\nx', /missing frontmatter/],
    ['bad level', doc(base.replace('level: 2', 'level: 9'), ''), /level/],
    ['unknown type', doc(base.replace('code-js', 'video'), ''), /type/],
    ['unknown section', doc(base, '# --notes--\nx'), /unknown section/],
    ['duplicate section', doc(base, '# --description--\na\n# --description--\nb'), /duplicate section/],
    ['text before sections', doc(base, 'stray\n# --description--\nx'), /before the first/],
    ['hint without code', doc(base, '# --hints--\nOnly text'), /has no test code/],
    ['unclosed fence', doc(base, `# --seed--\n${fence}js\nlet x`), /unclosed/],
    ['prose in seed', doc(base, `# --seed--\nhello`), /only code blocks/],
  ])('rejects %s', (_, raw, message) => {
    expect(() => parseChallenge('bad.md', raw)).toThrow(ContentError)
    expect(() => parseChallenge('bad.md', raw)).toThrow(message)
  })

  it('accepts Windows line endings', () => {
    const raw = doc(base, '# --description--\nHello').replace(/\n/g, '\r\n')
    expect(parseChallenge('crlf.md', raw).description).toBe('Hello')
  })

  it('reads Turkish texts and swaps them in for Turkish', () => {
    const raw = doc(
      `${base}\ntitle_tr: Örnek`,
      [
        '# --description--',
        'Hello',
        '# --description-tr--',
        'Merhaba',
        '# --hints--',
        'First requirement.',
        'tr: İlk koşul.',
        `${fence}js`,
        'assert.ok(true)',
        fence,
        '# --questions--',
        '## Pick one',
        '- [x] yes',
        '- [ ] no',
        '# --questions-tr--',
        '## Birini seç',
        '- [x] evet',
        '- [ ] hayır',
      ].join('\n'),
    )
    const challenge = parseChallenge('tr.md', raw)
    expect(challenge.tests[0]).toMatchObject({ text: 'First requirement.', tr: 'İlk koşul.' })
    expect(localizeChallenge(challenge, 'en')).toBe(challenge)
    const tr = localizeChallenge(challenge, 'tr')
    expect(tr).toMatchObject({ title: 'Örnek', description: 'Merhaba', instructions: '' })
    expect(tr.tests[0].text).toBe('İlk koşul.')
    expect(tr.questions[0]).toEqual({ prompt: 'Birini seç', options: [{ text: 'evet', correct: true }, { text: 'hayır', correct: false }] })
  })
})
