---
title: One press, one hit
title_tr: Bir basış, bir vuruş
skills: [game.input]
---

# --goal--

When you hold a key down, the computer repeats the `keydown` event many times a second. In a rhythm game one press
must be one hit, so repeated events are ignored.

# --goal-tr--

Bir tuşu basılı tutunca bilgisayar `keydown` olayını saniyede birçok kez **tekrarlar** (bir yazı alanında bir harfe
basılı tutunca `aaaaaa` olması gibi). Birçok oyunda bu işe yarar; ama ritim oyununda **bir basış bir vuruş**
olmalı. Yoksa D'ye basılı tutan biri bütün kırmızı notaları hiç çabalamadan vururdu.

# --code--

```js
document.addEventListener('keydown', (event) => {
  if (event.repeat) return // holding a key down is not a new press
```

# --meaning--

- `event.repeat` is `true` for the repeated events of a held key; we `return` before doing anything.

# --meaning-tr--

- `event.repeat` → tuş basılı tutulduğu için gelen **tekrar** olaylarında `true`, gerçek bir basışta `false`.
- `if (event.repeat) return` → tekrar ise hiçbir şey yapmadan çık.

# --task--

Write the line at the top of the `keydown` listener.

# --task-tr--

`keydown` dinleyicisinin **ilk satırı** olarak (`document.addEventListener('keydown', (event) => {` satırının hemen
altına) yeni satırı yaz. **Çalıştır**.

# --tests--

A key held down should not count again, but a new press should.
tr: Basılı tutulan tuş yeniden sayılmamalı, ama yeni bir basış sayılmalı.

```js
$.tick(LEAD)
$.press('d', { repeat: true })
assert.isFalse(notes[0].hit, 'a key held down does not count')
assert.strictEqual(lit[0], 0)
$.press('d')
assert.isTrue(notes[0].hit, 'a real press does')
```

# --solution--

```js
// Rhythm game, step by step.
// The page already has <canvas id="game" width="400" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LANES = 4
const LANE_W = 70
const LEFT = (canvas.width - LANES * LANE_W) / 2
const HIT_Y = 480 // where a note should be when you press
const SPEED = 4 // pixels a note falls per frame
const STEP = 15 // frames between rows of the chart (an eighth note at 120 beats a minute)
const LEAD = 120 // frames before the first row reaches the line
const GOOD = 9
const KEYS = { d: 0, f: 1, j: 2, k: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 }
const COLORS = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6']
// The song, one row per eighth note: a 1 is a note in that lane.
const CHART = [
  '1000', '0000', '0100', '0000', '0010', '0000', '0001', '0000',
  '1000', '0100', '0010', '0001', '1001', '0000', '0110', '0000',
  '1000', '0010', '0100', '0001', '1000', '0010', '0100', '0001',
  '1100', '0000', '0011', '0000', '1100', '0000', '0011', '0000',
  '1000', '0100', '0010', '0001', '0010', '0100', '1000', '0000',
  '1010', '0101', '1010', '0101', '1001', '0110', '1001', '0000',
]

let notes // { lane, time, hit }
let frame
let lit // frames each lane stays lit after a press

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
  frame = 0
  lit = [0, 0, 0, 0]
}

// Where a note is drawn: on the line at its time, higher up the earlier it is.
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED

// A key press hits the closest note in its lane, if it is close enough in time.
function press(lane) {
  lit[lane] = 8
  let closest = null
  for (const n of notes) {
    if (n.hit || n.lane !== lane) continue
    if (!closest || Math.abs(n.time - frame) < Math.abs(closest.time - frame)) closest = n
  }
  if (!closest) return
  const off = Math.abs(closest.time - frame)
  if (off > GOOD) return // too early: nothing happens, and the note is still there
  closest.hit = true
}

function update() {
  lit = lit.map((n) => Math.max(0, n - 1))
  frame += 1
}

document.addEventListener('keydown', (event) => {
  if (event.repeat) return // holding a key down is not a new press
  const lane = KEYS[event.key] ?? KEYS[event.key.toLowerCase()]
  if (lane === undefined) return
  event.preventDefault()
  press(lane)
})

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let lane = 0; lane < LANES; lane++) {
    const x = LEFT + lane * LANE_W
    ctx.fillStyle = lit[lane] > 0 ? '#334155' : '#1e293b'
    ctx.fillRect(x + 2, 0, LANE_W - 4, canvas.height)
    ctx.fillStyle = COLORS[lane]
    ctx.fillRect(x + 6, HIT_Y - 4, LANE_W - 12, 8)
  }
  for (const n of notes) {
    if (n.hit) continue
    const y = noteY(n)
    if (y < -20 || y > canvas.height + 20) continue
    ctx.fillStyle = COLORS[n.lane]
    ctx.fillRect(LEFT + n.lane * LANE_W + 8, y - 10, LANE_W - 16, 20)
  }

  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.font = 'bold 14px sans-serif'
  ;['D', 'F', 'J', 'K'].forEach((k, lane) => ctx.fillText(k, LEFT + lane * LANE_W + LANE_W / 2, HIT_Y + 40))
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
