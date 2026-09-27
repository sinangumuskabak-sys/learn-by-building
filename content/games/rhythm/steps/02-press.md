---
title: Hitting a note
title_tr: Bir notaya vurmak
skills: [game.input, game.state]
---

# --explanation--

Nobody presses at exactly the right frame, so a hit needs a **window**: a press counts if the note's time is within `WINDOW`
frames of now, a little early or a little late.

Which note does a press hit? The **closest** one in that lane that has not been hit yet. If even the closest is outside the window,
the press was too early (or too late) and nothing happens: the note is still there, waiting.

```js
const off = Math.abs(closest.time - frame)
if (off > WINDOW) return
```

A detail that matters a lot here: when you hold a key down, the computer repeats the `keydown` event many times a second. In most
games that is useful, but in a rhythm game one press must be one hit, so repeated events (`event.repeat` is true) are ignored.

The keys are D, F, J and K, where your fingers rest on a keyboard, or the four arrows. A pressed lane lights up for a moment, and a
short message shows what happened.

# --explanation-tr--

Kimse tam doğru karede basmaz, bu yüzden bir vuruşun bir **pencereye** ihtiyacı vardır: notanın zamanı şu andan `WINDOW` kare içindeyse,
biraz erken ya da biraz geç, basış sayılır.

Bir basış hangi notaya vurur? O şeritte henüz vurulmamış **en yakın** olana. En yakını bile pencerenin dışındaysa basış çok erkendi (ya
da çok geç) ve hiçbir şey olmaz: nota hâlâ oradadır, bekler.

```js
const off = Math.abs(closest.time - frame)
if (off > WINDOW) return
```

Burada çok önemli bir ayrıntı: bir tuşu basılı tuttuğunda bilgisayar `keydown` olayını saniyede birçok kez tekrarlar. Çoğu oyunda bu
işe yarar ama bir ritim oyununda bir basış bir vuruş olmalıdır; bu yüzden tekrarlanan olaylar (`event.repeat` true) yok sayılır.

Tuşlar, klavyede parmaklarının durduğu D, F, J ve K ya da dört ok tuşudur. Basılan şerit bir an yanar ve kısa bir mesaj ne olduğunu
gösterir.

# --task--

1. Add `WINDOW = 9`, `KEYS` (d, f, j, k and the arrows to lanes 0 to 3), and `hits`, `feedback` and `lit` (`0`, `null` and four
   zeros in `reset()`).
2. Write `judge(text, color)`, which sets `feedback = { text, color, time: 30 }`.
3. Write `press(lane)`: light the lane (`lit[lane] = 8`), find the closest note in the lane not yet hit, and if it is within
   `WINDOW` frames mark it hit, add 1 to `hits` and `judge('Hit', '#fde047')`.
4. On `keydown`: ignore repeats; find the lane for the key (also for capital letters) and `press` it (`preventDefault()`).
5. `update()` counts `lit` and the feedback's time down. Draw a lit lane `'#334155'`, the feedback in its color
   (`'bold 28px sans-serif'`, centered at `y = 300`), and `Hits 3` at `(12, 24)`.

# --task-tr--

1. `WINDOW = 9`, `KEYS` (d, f, j, k ve oklardan 0'dan 3'e şeritlere) ve `hits`, `feedback` ve `lit` ekle (`reset()`'te `0`, `null` ve dört
   sıfır).
2. `feedback = { text, color, time: 30 }` yapan `judge(text, color)`'u yaz.
3. `press(lane)` yaz: şeridi yak (`lit[lane] = 8`), şeritte henüz vurulmamış en yakın notayı bul ve `WINDOW` kare içindeyse onu vurulmuş
   işaretle, `hits`'e 1 ekle ve `judge('Hit', '#fde047')` et.
4. `keydown`'da: tekrarları yok say; tuşun şeridini bul (büyük harfler için de) ve onu `press` et (`preventDefault()`).
5. `update()` `lit`'i ve geri bildirimin süresini azaltır. Yanık bir şeridi `'#334155'`, geri bildirimi kendi renginde
   (`'bold 28px sans-serif'`, `y = 300`'de ortalı) ve `(12, 24)`'e `Hits 3` çiz.

# --tests--

A press right on time should hit the note.
tr: Tam zamanında bir basış notaya vurmalı.

```js
$.tick(LEAD)
$.press('d')
assert.isTrue(notes[0].hit, 'pressed right on time')
assert.strictEqual(hits, 1)
$.tick(1)
assert.include($.texts(), 'Hit')
assert.include($.texts(), 'Hits 1')
```

A press far too early should do nothing, a held key should not count again, and a little early should be fine.
tr: Çok erken bir basış hiçbir şey yapmamalı, basılı tutulan tuş yeniden sayılmamalı ve biraz erken olmak sorun olmamalı.

```js
$.tick(LEAD - 20)
$.press('d')
assert.isFalse(notes[0].hit, 'far too early: nothing happens')
$.tick(20 - 5)
$.press('d', { repeat: true })
assert.isFalse(notes[0].hit, 'a key held down does not count again')
$.press('d')
assert.isTrue(notes[0].hit, 'a little early is fine')
```

The arrow keys should work, the lane should light up, and an empty lane should not count.
tr: Ok tuşları çalışmalı, şerit yanmalı ve boş bir şerit sayılmamalı.

```js
const second = notes.find((n) => n.lane === 1)
$.tick(second.time)
$.press('ArrowDown')
assert.isTrue(second.hit, 'the arrow keys work too')
$.tick(1)
assert.lengthOf($.rects('#334155'), 1, 'the pressed lane lights up')
$.press('J')
assert.strictEqual(hits, 1, 'no note near in that lane')
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
const WINDOW = 9 // frames either side of the exact moment that still count
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
let hits
let feedback // { text, color, time } shown for a moment
let lit // frames each lane stays lit after a press

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
  frame = 0
  hits = 0
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
  if (off > WINDOW) return // too early: nothing happens, and the note is still there
  closest.hit = true
  hits += 1
  judge('Hit', '#fde047')
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
  if (feedback) {
    ctx.fillStyle = feedback.color
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(feedback.text, canvas.width / 2, 300)
  }
  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Hits ' + hits, 12, 24)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
