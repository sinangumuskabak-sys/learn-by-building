---
title: Lanes that light up
title_tr: Yanan şeritler
skills: [game.state]
---

# --goal--

When you press a lane it should light up for a moment. Each lane gets a countdown in `lit`: while it is above 0, the
lane is drawn lighter, and every frame counts it down by one.

# --goal-tr--

Bir şeride basınca o şerit **bir an parlasın**; oyuncu basışının yerine ulaştığını görsün. Parlamak kısa sürmeli:
yaklaşık 8 kare (saniyenin yedide biri).

Bunun için her şeride bir **geri sayım** veriyoruz: `lit`. Sayı 0'dan büyükse şerit açık renkle çizilir; her karede
sayı bir azalır, 0'a gelince şerit söner. Mikrodalga fırının sayacı gibi.

# --code--

```js
let lit // frames each lane stays lit after a press

  lit = [0, 0, 0, 0]

  lit = lit.map((n) => Math.max(0, n - 1))

    ctx.fillStyle = lit[lane] > 0 ? '#334155' : '#1e293b'
```

# --meaning--

- `lit` has one countdown per lane; `reset` sets all four to 0.
- `lit.map(...)` makes a new list with 1 taken off each number, but never below 0 (`Math.max` picks the bigger).
- `condition ? a : b` picks `a` when the condition is true: a lit lane is `#334155`, a dark one `#1e293b`.

# --meaning-tr--

- `let lit` → her şerit için "kaç kare daha yanık kalacak". `reset` içinde `[0, 0, 0, 0]`: dördü de sönük.
- `lit = lit.map((n) => Math.max(0, n - 1))` → `update`'in ilk satırı:
  - `map` listenin **her elemanını** dönüştürüp **yeni bir liste** yapar; burada her sayı (`n`) için
    `Math.max(0, n - 1)`.
  - `Math.max(0, n - 1)` → iki sayıdan **büyüğü**: 1 çıkar ama 0'ın altına inme. `[8, 0, 0, 0]` → `[7, 0, 0, 0]`.
- `lit[lane] > 0 ? '#334155' : '#1e293b'` → `koşul ? evetse : hayırsa`. Şerit yanıksa açık gri-mavi, değilse koyu.

# --task--

1. Under `let frame` write `let lit`.
2. At the end of `reset`, write `lit = [0, 0, 0, 0]`.
3. In `update`, above `frame += 1`, write the `lit.map` line.
4. In `draw`, in the lanes loop, change the `'#1e293b'` color line as shown.

# --task-tr--

1. `let frame` satırının altına `let lit ...` satırını yaz.
2. `reset`'in sonunda, `frame = 0` satırının altına `lit = [0, 0, 0, 0]` yaz.
3. `update` içinde `frame += 1` satırının **üstüne** `lit.map` satırını yaz.
4. `draw` içindeki şerit döngüsünde `ctx.fillStyle = '#1e293b'` satırını kodda görüldüğü gibi değiştir.
5. **Çalıştır**: henüz hiçbir şey yanmaz; yakmayı bir sonraki adımda tuşlara bağlayacağız.

# --tests--

A lane with a countdown above 0 should be drawn lighter.
tr: Geri sayımı 0'dan büyük olan şerit daha açık çizilmeli.

```js
assert.deepEqual(lit, [0, 0, 0, 0])
lit = [0, 8, 0, 0]
$.tick(1)
assert.deepEqual($.rects('#334155').map((r) => r.x), [LEFT + 70 + 2])
assert.lengthOf($.rects('#1e293b'), 3)
```

The light should go out after its countdown.
tr: Işık geri sayımı bitince sönmeli.

```js
lit = [0, 0, 3, 0]
$.tick(1)
assert.deepEqual(lit, [0, 0, 2, 0])
$.tick(5)
assert.deepEqual(lit, [0, 0, 0, 0], 'never below 0')
assert.lengthOf($.rects('#334155'), 0)
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

function update() {
  lit = lit.map((n) => Math.max(0, n - 1))
  frame += 1
}

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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
