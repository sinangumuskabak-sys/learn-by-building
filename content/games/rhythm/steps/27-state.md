---
title: The song ends
title_tr: Şarkı biter
skills: [game.state]
---

# --goal--

When the last note has gone by, the song is over. `state` is `'playing'` during the song and becomes `'done'` a second
after the last row.

# --goal-tr--

Her şarkının bir sonu var. Son satırın zamanından **bir saniye** (60 kare) sonra şarkı biter. Oyunun şu an hangi
durumda olduğunu bir değişkende tutacağız: `state` (durum). Şarkı sürerken `'playing'`, bitince `'done'`.

# --code--

```js
let state // 'playing' or 'done'

  state = 'playing'

  if (frame > LEAD + CHART.length * STEP + 60) {
    state = 'done'
  }
```

# --meaning--

- `CHART.length` is the number of rows (48). The last row's time is about `LEAD + CHART.length * STEP`; 60 frames
  more is a second of silence.
- After that frame, `state` becomes `'done'`.

# --meaning-tr--

- `let state` → oyunun durumu: bir yazı, `'playing'` ya da `'done'`. `reset` içinde `'playing'`.
- `CHART.length` → dizinin eleman sayısı: **48** satır.
- `LEAD + CHART.length * STEP + 60` → 120 + 48 × 15 + 60 = **900**. Son satır 825. karede gelir; 900. kareden sonra
  şarkı bitmiş sayılır.
- `state = 'done'` → bitti.

# --task--

1. Under `let lit` write `let state`; at the end of `reset`, write `state = 'playing'`.
2. At the end of `update`, under the miss loop, write the `if` block.

# --task-tr--

1. `let lit ...` satırının altına `let state ...` yaz; `reset`'in sonunda `lit = [0, 0, 0, 0]` satırının altına
   `state = 'playing'` yaz.
2. `update`'in sonunda, ıska döngüsünün kapanan `}`'sinin altına `if` bloğunu yaz.
3. **Çalıştır**: şimdilik bitişte ekranda bir şey değişmez.

# --tests--

The song should end one second after the last row.
tr: Şarkı son satırdan bir saniye sonra bitmeli.

```js
assert.strictEqual(state, 'playing')
$.tick(900)
assert.strictEqual(state, 'playing')
$.tick(1)
assert.strictEqual(state, 'done', 'the song is over')
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
let combo
let judged // counts: { perfect, good, miss }
let feedback // { text, color, time } shown for a moment
let lit // frames each lane stays lit after a press
let state // 'playing' or 'done'

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
  frame = 0
  score = 0
  combo = 0
  judged = { perfect: 0, good: 0, miss: 0 }
  feedback = null
  lit = [0, 0, 0, 0]
  state = 'playing'
}

// Where a note is drawn: on the line at its time, higher up the earlier it is.
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED

const multiplier = () => Math.min(4, 1 + Math.floor(combo / 10))

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
  combo += 1
  if (off <= PERFECT) {
    judged.perfect += 1
    score += 300 * multiplier()
    judge('Perfect', '#fde047')
  } else {
    judged.good += 1
    score += 100 * multiplier()
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
      combo = 0
      judge('Miss', '#f87171')
    }
  }
  if (frame > LEAD + CHART.length * STEP + 60) {
    state = 'done'
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
  ctx.textAlign = 'right'
  ctx.fillText('Combo ' + combo + '  x' + multiplier(), canvas.width - 12, 24)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
