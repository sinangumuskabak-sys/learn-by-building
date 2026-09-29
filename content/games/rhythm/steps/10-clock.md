---
title: A clock that ticks
title_tr: İşleyen bir saat
skills: [game.state]
---

# --goal--

`update` moves the clock one frame forward. Since the notes are drawn from the clock, this is all they need to fall.

# --goal-tr--

Notaları düşürmek için onları tek tek kaydırmayacağız. Sadece **saati ilerleteceğiz**: `update` her çağrıldığında
`frame` bir artar. Notaların yeri saatten hesaplandığı için gerisi kendiliğinden olur.

# --code--

```js
function update() {
  frame += 1
}
```

# --meaning--

- `frame += 1` adds one frame. Every note's `noteY` is now 4 pixels lower.
- Nothing calls `update` yet.

# --meaning-tr--

- `function update() {` → oyunu bir kare ilerleten fonksiyon.
- `frame += 1` → "frame'e 1 ekle". `+=` "üstüne ekle" demek: 0 → 1. Bir kare geçince her notanın `noteY`'si 4 piksel
  artar, yani notalar 4 piksel aşağı iner.
- Dikkat: fonksiyonu **tanımladık ama çağırmadık**. Tarif yazıldı, kimse pişirmedi.

# --task--

Write `update` above `function draw() {`, with an empty line between them.

# --task-tr--

`update` fonksiyonunu `function draw() {` satırının **üstüne** yaz; aralarında bir boş satır kalsın. **Çalıştır**.

# --predict--

Will the notes fall after Run?
- [ ] Yes, slowly
- [x] No, nothing calls `update()` yet

# --predict-tr--

Çalıştır'a basınca notalar düşecek mi?
- [ ] Evet, yavaş yavaş
- [x] Hayır, `update()`'i henüz kimse çağırmıyor

# --tests--

`update()` should move the clock one frame forward.
tr: `update()` saati bir kare ilerletmeli.

```js
update()
update()
assert.strictEqual(frame, 2)
assert.strictEqual(noteY(notes[0]), 8)
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

function reset() {
  notes = []
  CHART.forEach((row, i) => {
    for (let lane = 0; lane < LANES; lane++) if (row[lane] === '1') notes.push({ lane, time: LEAD + i * STEP, hit: false })
  })
  frame = 0
}

// Where a note is drawn: on the line at its time, higher up the earlier it is.
const noteY = (note) => HIT_Y - (note.time - frame) * SPEED

function update() {
  frame += 1
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let lane = 0; lane < LANES; lane++) {
    const x = LEFT + lane * LANE_W
    ctx.fillStyle = '#1e293b'
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
}

reset()
draw()
```
