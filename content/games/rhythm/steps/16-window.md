---
title: Close enough in time
title_tr: Zamana yeterince yakın
skills: [game.state]
---

# --goal--

Nobody presses at exactly the right frame, so a hit needs a **window**: a press counts if the note's time is within
`GOOD` (9) frames of now, a little early or a little late. Otherwise nothing happens and the note keeps coming.

# --goal-tr--

Kimse tam doğru karede basamaz; bir iki kare erken ya da geç olur. Bu yüzden vuruşa bir **pencere** veriyoruz:
notanın zamanına **9 kare** (saniyenin yaklaşık altıda biri) yakın her basış sayılır.

Pencerenin dışında basarsan (çok erken) **hiçbir şey olmaz**: nota yerinde durur ve gelmeye devam eder.

# --code--

```js
const GOOD = 9

// A key press hits the closest note in its lane, if it is close enough in time.
function press(lane) {

  if (!closest) return
  const off = Math.abs(closest.time - frame)
  if (off > GOOD) return // too early: nothing happens, and the note is still there
  closest.hit = true
```

# --meaning--

- `off` is how many frames the press is away from the note's time.
- `if (off > GOOD) return` leaves `press` before the note is marked, so a press far too early does nothing.

# --meaning-tr--

- `const GOOD = 9` → pencerenin genişliği: iki yana 9 kare.
- Yorum satırı `press`'in ne yaptığını anlatıyor.
- `const off = Math.abs(closest.time - frame)` → basış, notanın zamanından **kaç kare uzakta** (erken ya da geç).
- `if (off > GOOD) return` → 9 kareden uzaksa fonksiyondan çık: `closest.hit = true` satırına hiç gelinmez, nota
  vurulmaz.

# --task--

1. Under `LEAD` write `GOOD` (above `KEYS`).
2. Above `function press(lane) {` write the comment.
3. In `press`, between `if (!closest) return` and `closest.hit = true`, write the two new lines.

# --task-tr--

1. `const LEAD = ...` satırının altına `const GOOD = 9` yaz (`KEYS` onun altında kalır).
2. `function press(lane) {` satırının **üstüne** yorum satırını yaz.
3. `press` içinde `if (!closest) return` ile `closest.hit = true` satırlarının **arasına** iki yeni satırı yaz.
4. **Çalıştır**: artık yalnız nota çizgiye gelirken basınca kaybolmalı.

# --try--

Set `GOOD` to `2` and try to play: it is very hard. Then try `30`. Put `9` back.

# --try-tr--

`GOOD`'u `2` yap ve oynamayı dene: çok zor. Sonra `30`'u dene. En son `9`'a geri al.

# --tests--

A press far too early should do nothing, and the note should stay.
tr: Çok erken bir basış hiçbir şey yapmamalı ve nota yerinde kalmalı.

```js
$.tick(LEAD - 20)
$.press('d')
assert.isFalse(notes[0].hit, 'far too early: nothing happens')
$.tick(1)
assert.strictEqual($.rects(COLORS[0]).filter((r) => r.h === 20).length, 1, 'the note is still on screen')
```

A little early or a little late should still hit.
tr: Biraz erken ya da biraz geç yine vurmalı.

```js
$.tick(LEAD - 5)
$.press('d')
assert.isTrue(notes[0].hit, 'five frames early')
const second = notes.find((n) => n.lane === 1)
$.tick(second.time - frame + GOOD)
$.press('f')
assert.isTrue(second.hit, 'nine frames late')
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
