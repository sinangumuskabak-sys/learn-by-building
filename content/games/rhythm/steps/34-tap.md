---
title: Lanes you can tap
title_tr: Dokunulabilen şeritler
skills: [game.input]
---

# --goal--

On a phone the lanes themselves become the buttons: a tap anywhere in a lane presses it, through the same `press`.
After the song, a tap plays again.

# --goal-tr--

Telefonda klavye yok; **şeritlerin kendisi düğme** olsun: bir şeridin herhangi bir yerine dokunmak ona basmak
demek. Dokunuş da klavyeyle **aynı** `press(lane)`'i çağıracak; böylece zamanlama, puan ve kombo her cihazda aynı.
Şarkı bittikten sonra bir dokunuş yeniden başlatsın.

# --code--

```js
// On a touch screen, each lane is its own big button.
canvas.addEventListener('pointerdown', (event) => {
  if (state === 'done') return reset()
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const lane = Math.floor((x - LEFT) / LANE_W)
  if (lane >= 0 && lane < LANES) press(lane)
})

    ctx.fillText('Space or tap to play again', canvas.width / 2, 318)
```

# --meaning--

- `pointerdown` fires for a mouse button or a finger going down on the canvas.
- `getBoundingClientRect()` gives the canvas's box on the screen; the formula turns the page position into canvas
  pixels, even when the canvas is shown smaller on a phone.
- `Math.floor((x - LEFT) / LANE_W)` is the lane under the tap; outside 0 to 3 nothing happens.

# --meaning-tr--

- `canvas.addEventListener('pointerdown', ...)` → canvas'a fareyle ya da parmakla **basıldığında**.
- `if (state === 'done') return reset()` → şarkı bittiyse yeniden başlat.
- `canvas.getBoundingClientRect()` → canvas'ın ekrandaki kutusu: `left` (sol kenarı), `width` (ekranda göründüğü
  eni).
- `((event.clientX - rect.left) * canvas.width) / rect.width` → `event.clientX` dokunuşun **sayfadaki** yeri. Önce
  canvas'ın sol kenarını çıkarırız, sonra ekran pikselini canvas pikseline çeviririz (telefonda canvas küçültülmüş
  olabilir).
- `Math.floor((x - LEFT) / LANE_W)` → hangi şerit: soldaki boşluğu çıkar, şerit enine böl, aşağı yuvarla.
  `x = 150` → (150 − 60) / 70 = 1.28 → **1**.
- `if (lane >= 0 && lane < LANES) press(lane)` → yalnız dört şeritten birine dokunulduysa bas; kenar boşluklarına
  dokunmak hiçbir şey yapmaz.
- Kartın son satırı artık dokunmayı da söylüyor.

# --task--

1. Above `function draw() {` write the comment and the `pointerdown` listener, with an empty line after it.
2. In the panel, change the last text to `'Space or tap to play again'`.

# --task-tr--

1. `function draw() {` satırının **üstüne** yorum satırını ve `pointerdown` dinleyicisini yaz; altında bir boş satır
   kalsın.
2. Sonuç kartının son satırındaki yazıyı `'Space or tap to play again'` yap.
3. **Çalıştır** ve şeritlere tıklayarak oyna. Oyun tamam!

# --tests--

A tap on a lane should press it.
tr: Bir şeride dokunmak ona basmalı.

```js
$.tick(LEAD)
$.click(LEFT + LANE_W / 2, 400)
assert.isTrue(notes[0].hit, 'a tap on the lane hits its note')
$.click(LEFT + 2 * LANE_W + LANE_W / 2, 400)
assert.strictEqual(lit[2], 8)
```

A tap outside the lanes should do nothing.
tr: Şeritlerin dışına bir dokunuş hiçbir şey yapmamalı.

```js
$.click(20, 400)
$.click(390, 400)
assert.deepEqual(lit, [0, 0, 0, 0], 'outside the lanes: nothing')
```

A tap after the song should play again, and the panel should say so.
tr: Şarkıdan sonra bir dokunuş yeniden oynatmalı ve kart bunu söylemeli.

```js
$.tick(50)
state = 'done'
$.tick(1)
assert.include($.texts(), 'Space or tap to play again')
$.click(200, 300)
assert.strictEqual(state, 'playing', 'a tap plays again')
assert.strictEqual(frame, 0)
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
let best = Number(localStorage.getItem('rhythm-best')) || 0

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
  if (state !== 'playing') return
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

const accuracy = () => {
  const total = judged.perfect + judged.good + judged.miss
  return total === 0 ? 100 : Math.round((100 * (judged.perfect + judged.good * 0.5)) / total)
}

function grade() {
  const a = accuracy()
  return a >= 95 ? 'S' : a >= 85 ? 'A' : a >= 70 ? 'B' : a >= 50 ? 'C' : 'D'
}

function update() {
  lit = lit.map((n) => Math.max(0, n - 1))
  if (feedback && --feedback.time === 0) feedback = null
  if (state !== 'playing') return
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
    if (score > best) {
      best = score
      localStorage.setItem('rhythm-best', best)
    }
  }
}

document.addEventListener('keydown', (event) => {
  if (event.repeat) return // holding a key down is not a new press
  if (state === 'done' && (event.key === ' ' || event.key === 'Enter')) return reset()
  const lane = KEYS[event.key] ?? KEYS[event.key.toLowerCase()]
  if (lane === undefined) return
  event.preventDefault()
  press(lane)
})

// On a touch screen, each lane is its own big button.
canvas.addEventListener('pointerdown', (event) => {
  if (state === 'done') return reset()
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const lane = Math.floor((x - LEFT) / LANE_W)
  if (lane >= 0 && lane < LANES) press(lane)
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
  if (state === 'done') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
    ctx.fillRect(40, 170, canvas.width - 80, 170)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 48px sans-serif'
    ctx.fillText(grade(), canvas.width / 2, 228)
    ctx.font = '16px sans-serif'
    ctx.fillText(accuracy() + '% accurate, best ' + best, canvas.width / 2, 262)
    ctx.fillText(judged.perfect + ' perfect, ' + judged.good + ' good, ' + judged.miss + ' missed', canvas.width / 2, 288)
    ctx.fillText('Space or tap to play again', canvas.width / 2, 318)
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
