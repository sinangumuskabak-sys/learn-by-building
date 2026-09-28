import { describe, expect, it } from 'vitest'
import { runGameTests } from './run.ts'

const canvas = { width: 200, height: 100 }

const game = `
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
let x = 0
let dir = 1
let score = 0
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') dir = -1
  if (e.key === 'ArrowRight') dir = 1
})
canvas.addEventListener('click', (e) => { score += e.offsetX })
setInterval(() => { score++ }, 1000)
function loop() {
  x += dir
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'LIME'
  ctx.fillRect(x, 10, 5, 5)
  ctx.fillText('Score: ' + score, 4, 90)
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
`

const run = (code: string, test: string) => runGameTests({ code, canvas, tests: [{ text: 't', code: test }] })

describe('runGameTests', () => {
  it('drives frames, keys, clicks, timers and reads the screen', () => {
    const result = run(
      game,
      `
      assert.equal(x, 0)
      $.tick(3)
      assert.equal(x, 3)
      $.press('ArrowLeft')
      $.tick(2)
      assert.equal(x, 1)
      assert.deepEqual($.rects('lime'), [{ x: 1, y: 10, w: 5, h: 5, color: 'lime' }])
      assert.equal($.rects().length, 2)
      $.run(1)
      assert.equal(score, 1)
      $.click(7, 3)
      assert.equal(score, 8)
      $.tick()
      assert.include($.texts(), 'Score: 8')
      assert.equal($.frames, 66)
      `,
    )
    expect(result.error).toBeUndefined()
    expect(result.tests[0]).toEqual({ text: 't', passed: true })
  })

  it('gives every test a fresh page', () => {
    const result = runGameTests({
      code: game,
      canvas,
      tests: [
        { text: 'a', code: '$.tick(5); assert.equal(x, 5)' },
        { text: 'b', code: '$.tick(2); assert.equal(x, 2)' },
      ],
    })
    expect(result.tests.map((t) => t.passed)).toEqual([true, true])
  })

  it('reads text with runs of spaces as one, so the spacing a learner types does not fail a check', () => {
    const code = "const ctx = document.getElementById('game').getContext('2d'); ctx.fillText('  Score 3   Best 9 ', 0, 0)"
    expect(run(code, "assert.deepEqual($.texts(), ['Score 3 Best 9'])").tests[0].passed).toBe(true)
  })

  it('lets learners use names like game, assert and $ without clashing', () => {
    const result = run('let game = 1; const assert = 2; var $ = 3', 'assert.equal(game, 1)')
    expect(result.tests[0].passed).toBe(true)
  })

  it('reports syntax errors once and runtime errors per test', () => {
    expect(run('let = ', '').error).toMatch(/SyntaxError/)
    const runtime = run('requestAnimationFrame(() => missing())', '$.tick()')
    expect(runtime.tests[0].passed).toBe(false)
    expect(runtime.tests[0].error).toMatch(/missing is not defined/)
  })

  it('rejects top-level names the browser does not allow, like let top', () => {
    expect(run('let top = 0', '').error).toMatch(/Identifier 'top' has already been declared/)
    expect(run('const location = 1', '').error).toMatch(/'location'/)
    expect(run('let topRow = 0\nfunction f() {\n  let top = 1\n}', '').error).toBeUndefined()
  })

  it('makes Math.random deterministic and seedable', () => {
    const code = 'const first = Math.random()'
    const result = runGameTests({
      code,
      canvas,
      tests: [
        { text: 'a', code: 'globalThis.__a = first' },
        { text: 'b', code: 'assert.equal(first, globalThis.__a); $.seed(2); assert.notEqual(Math.random(), first)' },
      ],
    })
    expect(result.tests.every((t) => t.passed)).toBe(true)
  })

  it('captures console output from the first test only', () => {
    const result = runGameTests({
      code: 'console.log("hi", 1)',
      canvas,
      tests: [
        { text: 'a', code: '' },
        { text: 'b', code: '' },
      ],
    })
    expect(result.logs).toEqual(['hi 1'])
  })

  it('keeps save/restore style state and localStorage', () => {
    const result = run(
      `const ctx = document.querySelector('canvas').getContext('2d')
       ctx.fillStyle = 'red'; ctx.save(); ctx.fillStyle = 'blue'; ctx.restore(); ctx.fillRect(1, 1, 1, 1)
       localStorage.setItem('best', 5)`,
      `assert.equal($.rects()[0].color, 'red'); assert.equal(localStorage.getItem('best'), '5')`,
    )
    expect(result.tests[0]).toEqual({ text: 't', passed: true })
  })
})
