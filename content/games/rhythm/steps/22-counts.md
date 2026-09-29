---
title: Keep count
title_tr: Say
skills: [game.state]
---

# --goal--

The counts of perfect, good and missed notes are the whole story of a performance. We keep them together in one
object, `judged`.

# --goal-tr--

Bir şarkının sonunda "kaç kusursuz, kaç iyi, kaç ıska?" sorusu bütün performansı anlatır; notu da puanı da bunlardan
hesaplayacağız. Üç sayıyı tek bir **nesnede** tutuyoruz: `judged`. Bir maçtaki skor tabelası gibi.

# --code--

```js
let judged // counts: { perfect, good, miss }

  judged = { perfect: 0, good: 0, miss: 0 }

  if (off <= PERFECT) {
    judged.perfect += 1
    judge('Perfect', '#fde047')
  } else {
    judged.good += 1
    judge('Good', '#86efac')
  }
```

# --meaning--

- `judged` holds three counts, all 0 after `reset`.
- `judged.perfect += 1` adds one to the count inside the object.

# --meaning-tr--

- `let judged` → üç sayaç tek pakette. `reset` içinde `{ perfect: 0, good: 0, miss: 0 }`: hepsi sıfır.
- `judged.perfect += 1` → nesnenin **içindeki** `perfect` sayısına 1 ekler. Nokta, paketin içinden bir bilgiye ulaşır.
- `miss` (ıska) şimdilik hep 0; bir sonraki adımda sayacağız.

# --task--

1. Above `let feedback` write `let judged`.
2. In `reset`, above `feedback = null`, write the `judged = ...` line.
3. In `press`, write `judged.perfect += 1` and `judged.good += 1` at the top of the two blocks.

# --task-tr--

1. `let feedback ...` satırının **üstüne** `let judged ...` satırını yaz.
2. `reset` içinde `feedback = null` satırının **üstüne** `judged = { ... }` satırını yaz.
3. `press` içinde `if` bloğunun ilk satırı olarak `judged.perfect += 1`, `else` bloğunun ilk satırı olarak
   `judged.good += 1` yaz.
4. **Çalıştır**: ekran değişmez; sayılar arka planda tutuluyor.

# --tests--

`judged` should start at zero.
tr: `judged` sıfırdan başlamalı.

```js
assert.deepEqual(judged, { perfect: 0, good: 0, miss: 0 })
```

Perfect and good hits should be counted.
tr: Perfect ve Good vuruşlar sayılmalı.

```js
$.tick(LEAD)
$.press('d')
const second = notes.find((n) => n.lane === 1)
$.tick(second.time - frame + 6)
$.press('f')
assert.deepEqual(judged, { perfect: 1, good: 1, miss: 0 })
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
let judged // counts: { perfect, good, miss }
let feedback // { text, color, time } shown for a moment
let lit // frames each lane stays lit after a press

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
  frame = 0
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
    judge('Perfect', '#fde047')
  } else {
    judged.good += 1
    judge('Good', '#86efac')
  }
}

function update() {
  lit = lit.map((n) => Math.max(0, n - 1))
  if (feedback && --feedback.time === 0) feedback = null
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
  if (feedback) {
    ctx.fillStyle = feedback.color
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(feedback.text, canvas.width / 2, 300)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
