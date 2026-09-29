---
title: "Build it yourself: a speed setting"
title_tr: "Kendin yap: hız ayarı"
skills: [game.input, game.state]
---

# --goal--

Some players like notes that come fast and far apart, others slow and close together. Add a speed setting: `+` makes
the notes fall faster, `-` slower. The timing must not change: every note still reaches the line at its moment.

# --goal-tr--

Kimi oyuncu notaların **hızlı** ve seyrek gelmesini sever, kimi **yavaş** ve sık. Bir hız ayarı ekle: `+` notaları
hızlandırsın, `-` yavaşlatsın.

Dikkat: **zamanlama değişmemeli**. Hız ne olursa olsun her nota çizgiye yine tam kendi zamanında ulaşmalı. Notaların
yerini saatten hesapladığın için bu sandığından kolay. Bu adımda kod verilmiyor; kontroller çalıştığında yeşile döner.

# --task--

`+` (or `=`) raises the fall speed by 1 pixel per frame, `-` lowers it, between 2 and 8 (it starts at 4). Show it as
`Speed 4` somewhere on the screen.

# --task-tr--

- `+` (ya da aynı tuştaki `=`) düşme hızını kare başına 1 piksel artırsın, `-` azaltsın.
- Hız 4'ten başlasın; 2'nin altına inmesin, 8'in üstüne çıkmasın.
- Ekranın bir yerine (örneğin sol alta) `Speed 4` yaz.
- Bir notaya vurmak için zamanlama aynı kalsın: tam zamanında basış yine Perfect.

İpucu: şu an hız bir **sabit**; artık değişmesi gerekiyor. Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

Turn `SPEED` into a variable (`let speed = 4`) and use it in `noteY`. In the `keydown` listener, change it before the
lane is looked up, with `Math.min` and `Math.max` to keep it between 2 and 8.

# --hint-tr--

`SPEED` sabitini bir değişkene çevir (`let speed = 4`) ve `noteY`'de onu kullan. `keydown` dinleyicisinde, şerit
aranmadan önce `event.key === '+'` ise artır, `'-'` ise azalt; `Math.min(8, ...)` ve `Math.max(2, ...)` onu sınırda
tutar. `draw`'da `'Speed ' + speed` yazmayı unutma.

# --tests--

`+` should make the notes fall faster, and they should still reach the line on time.
tr: `+` notaları hızlandırmalı ve notalar çizgiye yine zamanında ulaşmalı.

```js
$.press('+')
$.tick(LEAD - 10)
assert.deepInclude($.rects(COLORS[0]), { x: LEFT + 8, y: HIT_Y - 10 * 5 - 10, w: LANE_W - 16, h: 20, color: COLORS[0] }, '5 pixels a frame')
$.tick(10)
assert.deepInclude($.rects(COLORS[0]), { x: LEFT + 8, y: HIT_Y - 10, w: LANE_W - 16, h: 20, color: COLORS[0] }, 'on the line at its time')
$.press('d')
assert.strictEqual(judged.perfect, 1, 'the timing did not change')
```

`-` should make them slower.
tr: `-` onları yavaşlatmalı.

```js
$.press('-')
$.tick(LEAD - 10)
assert.deepInclude($.rects(COLORS[0]), { x: LEFT + 8, y: HIT_Y - 10 * 3 - 10, w: LANE_W - 16, h: 20, color: COLORS[0] })
```

The speed should stay between 2 and 8, and `=` should work like `+`.
tr: Hız 2 ile 8 arasında kalmalı ve `=` de `+` gibi çalışmalı.

```js
for (let i = 0; i < 6; i++) $.press('-')
$.tick(LEAD - 10)
assert.deepInclude($.rects(COLORS[0]), { x: LEFT + 8, y: HIT_Y - 10 * 2 - 10, w: LANE_W - 16, h: 20, color: COLORS[0] }, 'never below 2')
for (let i = 0; i < 10; i++) $.press('=')
$.tick(1)
assert.deepInclude($.rects(COLORS[0]), { x: LEFT + 8, y: HIT_Y - 9 * 8 - 10, w: LANE_W - 16, h: 20, color: COLORS[0] }, 'never above 8')
```

The speed should be shown on the screen.
tr: Hız ekranda gösterilmeli.

```js
$.tick(1)
assert.include($.texts(), 'Speed 4')
$.press('+')
$.tick(1)
assert.include($.texts(), 'Speed 5')
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
let speed = 4 // pixels a note falls per frame: + and - change it
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
const noteY = (note) => HIT_Y - (note.time - frame) * speed

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
  if (event.key === '+' || event.key === '=') speed = Math.min(8, speed + 1)
  if (event.key === '-') speed = Math.max(2, speed - 1)
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
  ctx.textAlign = 'left'
  ctx.fillText('Speed ' + speed, 12, canvas.height - 16)
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
