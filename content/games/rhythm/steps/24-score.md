---
title: Score
title_tr: Puan
skills: [game.state]
---

# --goal--

A perfect is worth 300 points and a good 100. The score is shown at the top left.

# --goal-tr--

Şimdi **puan**. Kusursuz bir vuruş 300, iyi bir vuruş 100 puan getirir. Puanı sol üste yazacağız: `Score 1200`.

# --code--

```js
let score

  score = 0

    judged.perfect += 1
    score += 300

    judged.good += 1
    score += 100

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 12, 24)
```

# --meaning--

- `score` starts at 0 in `reset`, and each hit adds its points.
- `textAlign = 'left'` puts the text's left end at `x = 12`. `'Score ' + score` joins a text and a number.

# --meaning-tr--

- `let score` → puan. `reset` içinde `score = 0`.
- `score += 300` / `score += 100` → vuruşun puanını ekle.
- `ctx.textAlign = 'left'` → yazının **sol ucu** `x`'e gelsin (önceki yazılar ortalıydı; kalem ayarı değişmeden
  kalır, o yüzden yeniden söylüyoruz).
- `'Score ' + score` → `+` bir yazıyla bir sayıyı yan yana ekler: `'Score 400'`. Tırnaktaki boşluk olmasa
  `Score400` olurdu.

# --task--

1. Under `let frame` write `let score`; in `reset`, under `frame = 0`, write `score = 0`.
2. In `press`, write the two `score += ...` lines under the `judged` lines.
3. In `draw`, under the `if (feedback)` block, write the four score lines.

# --task-tr--

1. `let frame` satırının altına `let score` yaz; `reset` içinde `frame = 0` satırının altına `score = 0` yaz.
2. `press` içinde `judged.perfect += 1` satırının altına `score += 300`, `judged.good += 1` satırının altına
   `score += 100` yaz.
3. `draw` içinde `if (feedback) { ... }` bloğunun altına dört puan satırını yaz (fonksiyonun son `}`'sinden önce).
4. **Çalıştır**: sol üstte `Score 0`; vurdukça artmalı.

# --tests--

Perfect and good should score 300 and 100.
tr: Perfect ve Good 300 ve 100 puan getirmeli.

```js
assert.strictEqual(score, 0)
$.tick(LEAD)
$.press('d')
assert.strictEqual(score, 300)
const second = notes.find((n) => n.lane === 1)
$.tick(second.time - frame + 6)
$.press('f')
assert.strictEqual(score, 400)
```

The score should be drawn at the top left.
tr: Puan sol üste yazılmalı.

```js
score = 1200
$.tick(1)
const call = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Score 1200')
assert.exists(call)
assert.deepEqual(call.args.slice(1, 3), [12, 24])
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
const PERFECT = 4 // frames either side of the exact moment
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
let score
let judged // counts: { perfect, good, miss }
let feedback // { text, color, time } shown for a moment
let lit // frames each lane stays lit after a press

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
  frame = 0
  score = 0
  judged = { perfect: 0, good: 0, miss: 0 }
  feedback = null
  lit = [0, 0, 0, 0]
}

// Where a note is drawn: on the line at its time, higher up the earlier it is.
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED

function judge(text, color) {
  feedback = { text, color, time: 30 }
}

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
  if (off <= PERFECT) {
    judged.perfect += 1
    score += 300
    judge('Perfect', '#fde047')
  } else {
    judged.good += 1
    score += 100
    judge('Good', '#86efac')
  }
}

function update() {
  lit = lit.map((n) => Math.max(0, n - 1))
  if (feedback && --feedback.time === 0) feedback = null
  frame += 1
  // A note that has gone past the window without being hit is a miss.
  for (const n of notes) {
    if (!n.hit && frame - n.time > GOOD) {
      n.hit = true
      judged.miss += 1
      judge('Miss', '#f87171')
    }
  }
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
  if (feedback) {
    ctx.fillStyle = feedback.color
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(feedback.text, canvas.width / 2, 300)
  }
  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 12, 24)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
