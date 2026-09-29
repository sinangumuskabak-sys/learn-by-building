---
title: The multiplier
title_tr: Çarpan
skills: [game.state]
---

# --goal--

Every ten hits in a row raise the score **multiplier** by one, up to four. Late in a long streak every note matters
four times as much, and one miss costs the multiplier too.

# --goal-tr--

Seri uzadıkça puan da katlansın: art arda her **10 vuruş** puan **çarpanını** bir artırır, en fazla **4**'e kadar.
Uzun bir serinin sonunda her nota dört kat değerlidir; tek bir ıska hem notayı hem çarpanı kaybettirir. Heyecan tek
bir küçük formülden çıkar.

Kombo ve çarpan sağ üstte görünecek: `Combo 12  x2`.

# --code--

```js
const multiplier = () => Math.min(4, 1 + Math.floor(combo / 10))

    score += 300 * multiplier()

    score += 100 * multiplier()

  ctx.textAlign = 'right'
  ctx.fillText('Combo ' + combo + '  x' + multiplier(), canvas.width - 12, 24)
```

# --meaning--

- `Math.floor(combo / 10)` is how many full tens the combo has (`Math.floor` rounds down); plus 1 it is the multiplier.
- `Math.min(4, ...)` takes the smaller number, so it never goes above 4.
- Points are multiplied by `multiplier()` at the moment of the hit, after the combo grew.
- `textAlign = 'right'` puts the text's right end at `x`, 12 pixels from the right edge.

# --meaning-tr--

- `Math.floor(combo / 10)` → kombonun içinde **kaç tam onluk** var: `Math.floor` aşağı yuvarlar. Kombo 25 ise
  25 / 10 = 2.5 → **2**.
- `1 + ...` → çarpan 1'den başlar: 0-9 kombo x1, 10-19 x2, 20-29 x3...
- `Math.min(4, ...)` → iki sayıdan **küçüğü**: çarpan 4'ü asla geçmez.
- `300 * multiplier()` → puan, vuruş anındaki çarpanla çarpılır. `combo += 1` daha önce çalıştığı için 10. vuruş zaten
  x2 sayılır.
- `ctx.textAlign = 'right'` → yazının **sağ ucu** `x`'e gelsin; `canvas.width - 12` sağ kenardan 12 piksel içeri.
- `'Combo ' + combo + '  x' + multiplier()` → `'Combo 12  x2'`.

# --task--

1. Under `noteY`, after an empty line, write `multiplier`.
2. In `press`, multiply the two scores by `multiplier()`.
3. In `draw`, under the `Score` line, write the two combo lines.

# --task-tr--

1. `const noteY = ...` satırının altında bir boş satır bırak ve `multiplier` satırını yaz.
2. `press` içinde `score += 300` ve `score += 100` satırlarının sonuna ` * multiplier()` ekle.
3. `draw` içinde `ctx.fillText('Score ' ...` satırının altına iki kombo satırını yaz.
4. **Çalıştır** ve oyna: sağ üstte kombo ve çarpan görünmeli.

# --tests--

Every ten in a row should raise the multiplier, up to four.
tr: Art arda her on, çarpanı dörde kadar yükseltmeli.

```js
combo = 9
assert.strictEqual(multiplier(), 1)
combo = 10
assert.strictEqual(multiplier(), 2, 'every ten in a row raises it')
combo = 25
assert.strictEqual(multiplier(), 3)
combo = 99
assert.strictEqual(multiplier(), 4, 'up to four')
```

A hit should score times the multiplier.
tr: Bir vuruş çarpan kadar katlanmış puan getirmeli.

```js
combo = 10
$.tick(LEAD)
$.press('d')
assert.strictEqual(score, 600, 'perfect at x2')
```

The combo and multiplier should be drawn at the top right.
tr: Kombo ve çarpan sağ üste yazılmalı.

```js
$.tick(1)
assert.include($.texts(), 'Combo 0 x1')
const call = $.screen().find((c) => c.op === 'fillText' && String(c.args[0]).startsWith('Combo'))
assert.deepEqual(call.args.slice(1, 3), [388, 24])
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
