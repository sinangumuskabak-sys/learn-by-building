---
title: A message on the screen
title_tr: Ekranda bir mesaj
skills: [game.state]
---

# --goal--

The player should see how a press went. `feedback` holds a message `{ text, color, time }`; when there is one, `draw`
writes it big in the middle of the screen.

# --goal-tr--

Oyuncu basışının nasıl geçtiğini **görmeli**: "Vurdun!" gibi. Bunun için ekranın ortasında büyük, renkli bir mesaj
göstereceğiz.

Mesajı bir değişkende tutacağız: `feedback` (geri bildirim). İçinde yazı, renk ve ne kadar süre görüneceği olacak.
Mesaj yokken `null`. Bu adımda mesajı **çiziyoruz**; onu dolduran kodu bir sonraki adımda yazacağız.

# --code--

```js
let feedback // { text, color, time } shown for a moment

  feedback = null

  if (feedback) {
    ctx.fillStyle = feedback.color
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(feedback.text, canvas.width / 2, 300)
  }
```

# --meaning--

- `feedback` is `null` (no message) after `reset`.
- `if (feedback)` is true only when there is a message; then it is written in its color, centred at `y = 300`.

# --meaning-tr--

- `let feedback` → gösterilecek mesaj: `{ text, color, time }` (yazı, renk, kaç kare daha görünecek).
- `reset` içinde `feedback = null` → oyun başında mesaj yok.
- `if (feedback) {` → mesaj **varsa**. `null` yanlış sayılır; bir nesne doğru sayılır.
- `ctx.fillStyle = feedback.color` → mesajın kendi rengi. `feedback.text` → yazısı.
- `ctx.fillText(..., canvas.width / 2, 300)` → ekranın yatay ortasına (200), yukarıdan 300. piksele. Harfler zaten
  `center` hizada (bir önceki çizimden kaldı).

# --task--

1. Above `let lit` write `let feedback`.
2. In `reset`, above `lit = [0, 0, 0, 0]`, write `feedback = null`.
3. In `draw`, under the `['D', 'F', 'J', 'K']` line, write the `if (feedback)` block.

# --task-tr--

1. `let lit ...` satırının **üstüne** `let feedback ...` satırını yaz.
2. `reset` içinde `lit = [0, 0, 0, 0]` satırının **üstüne** `feedback = null` yaz.
3. `draw` içinde `;['D', 'F', 'J', 'K']...` satırının altına `if (feedback)` bloğunu yaz.
4. **Çalıştır**: henüz mesaj görünmez, çünkü `feedback` hep `null`.

# --tests--

`feedback` should start as `null`.
tr: `feedback` `null` başlamalı.

```js
assert.isNull(feedback)
```

A message in `feedback` should be drawn in its color, centred at `y = 300`.
tr: `feedback`'teki mesaj kendi renginde, `y = 300`'e ortalanmış çizilmeli.

```js
feedback = { text: 'Hello', color: '#fde047', time: 30 }
$.tick(1)
const call = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Hello')
assert.exists(call, 'the message is drawn')
assert.deepEqual(call.args.slice(1, 3), [200, 300])
assert.strictEqual(call.fill, '#fde047')
assert.strictEqual(call.font, 'bold 28px sans-serif')
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
let feedback // { text, color, time } shown for a moment
let lit // frames each lane stays lit after a press

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
  frame = 0
  feedback = null
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
