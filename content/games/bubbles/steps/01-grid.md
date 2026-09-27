---
title: A grid of nested bubbles
title_tr: İç içe geçmiş balonlardan bir ızgara
skills: [prog.arrays, game.canvas]
---

# --explanation--

In a bubble shooter the bubbles hang from the ceiling, packed as tightly as marbles in a box: every other row is shifted half a
bubble to the right, so each bubble nests in the gap between the two above it. This is a **hex grid**, the same pattern as a
honeycomb.

We still store it as a plain 2D array, `grid[r][c]`, and the geometry lives in one function that turns a cell into a position:

- **x**: `R + c * 2R`, plus `R` more on odd rows (the shift);
- **y**: rows are closer than one diameter, because the bubbles nest. In a honeycomb the row height is `R * √3`, about
  `1.73 R` instead of `2 R`.

That `√3` is not magic: a bubble and the two it rests on form an equilateral triangle with sides `2R`, and its height is
`2R × √3 / 2`. The test checks that two bubbles in neighbouring rows are exactly `2R` apart, just touching.

An odd row fits one bubble less: shifted right by `R`, a tenth bubble would stick out of the canvas.

# --explanation-tr--

Bir balon atıcıda balonlar tavandan asılıdır, bir kutudaki bilyeler kadar sıkı dizilmiş: her iki satırdan biri yarım balon sağa
kaymıştır; böylece her balon üstündeki ikisinin arasındaki boşluğa oturur. Bu bir **altıgen ızgaradır**, bal peteğiyle aynı desen.

Onu yine düz bir 2 boyutlu dizi olarak saklarız, `grid[r][c]`, ve geometri bir hücreyi konuma çeviren tek bir fonksiyonda yaşar:

- **x**: `R + c * 2R`, tek satırlarda `R` daha (kayma);
- **y**: balonlar iç içe geçtiği için satırlar bir çaptan daha yakındır. Bal peteğinde satır yüksekliği `R * √3`'tür, yani `2R`
  yerine yaklaşık `1.73 R`.

O `√3` sihir değildir: bir balon ve üstünde durduğu iki balon, kenarları `2R` olan bir eşkenar üçgen oluşturur ve yüksekliği
`2R × √3 / 2`'dir. Test, komşu satırlardaki iki balonun tam `2R` uzakta, yani yalnızca değer durumda olduğunu kontrol eder.

Tek bir satıra bir balon eksik sığar: `R` kadar sağa kaymış onuncu bir balon canvas'tan taşardı.

# --task--

1. Add `R = 20`, `COLS = 10`, `ROWS = 14`, `ROW_H = R * Math.sqrt(3)`, `TOP = 30` and five `COLORS`
   (`'#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'`).
2. Write `cols(r)` (`COLS` on even rows, one less on odd rows) and `cellPos(r, c)` as described
   (`y = TOP + R + r * ROW_H`).
3. In `reset()`, build `grid`: rows 0 to 4 filled with random colors, the rest `-1` (empty).
4. Draw: fill `'#1e1b4b'`, the top strip (`TOP` high) `'#312e81'`, and every bubble as a circle of radius `R - 1` in its color,
   using a helper `drawBubble(x, y, color, r = R)`.

# --task-tr--

1. `R = 20`, `COLS = 10`, `ROWS = 14`, `ROW_H = R * Math.sqrt(3)`, `TOP = 30` ve beş `COLORS`
   (`'#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'`) ekle.
2. `cols(r)`'yi (çift satırlarda `COLS`, tek satırlarda bir eksik) ve `cellPos(r, c)`'yi anlatıldığı gibi yaz
   (`y = TOP + R + r * ROW_H`).
3. `reset()`'te `grid`'i kur: 0'dan 4'e satırlar rastgele renklerle dolu, geri kalanı `-1` (boş).
4. Çiz: `'#1e1b4b'` doldur, üst şeridi (`TOP` yüksekliğinde) `'#312e81'` ve her balonu bir `drawBubble(x, y, color, r = R)`
   yardımcısıyla kendi renginde `R - 1` yarıçaplı bir daire olarak.

# --tests--

The grid should have 14 rows, alternating 10 and 9 cells, with the first five filled.
tr: Izgarada 10 ve 9 hücre arasında değişen 14 satır olmalı ve ilk beşi dolu olmalı.

```js
assert.lengthOf(grid, ROWS)
assert.lengthOf(grid[0], 10)
assert.lengthOf(grid[1], 9, 'odd rows have one bubble less')
assert.lengthOf(grid[2], 10)
for (let r = 0; r < 5; r++) for (const color of grid[r]) assert.include([0, 1, 2, 3, 4], color)
for (let r = 5; r < ROWS; r++) for (const color of grid[r]) assert.strictEqual(color, -1)
```

Odd rows should be shifted, and neighbouring rows should just touch.
tr: Tek satırlar kaymış olmalı ve komşu satırlar yalnızca değmeli.

```js
assert.deepEqual(cellPos(0, 0), { x: 20, y: 50 })
assert.deepEqual(cellPos(0, 9), { x: 380, y: 50 })
const p = cellPos(1, 0)
assert.strictEqual(p.x, 40, 'odd rows sit half a bubble to the right')
assert.closeTo(p.y, 50 + 20 * Math.sqrt(3), 1e-9)
assert.closeTo(Math.hypot(p.x - 20, p.y - 50), 2 * R, 1e-9, 'bubbles in neighbouring rows just touch')
```

Every bubble should be drawn in its place and color.
tr: Her balon kendi yerinde ve renginde çizilmeli.

```js
$.tick(1)
const bubbles = $.arcs().filter((a) => a.r === 19)
assert.lengthOf(bubbles, 48, 'five rows: 10 + 9 + 10 + 9 + 10')
assert.deepInclude(bubbles, { x: 20, y: 50, r: 19, color: COLORS[grid[0][0]] })
```

# --seed--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
```

# --solution--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 20 // bubble radius
const COLS = 10 // bubbles in an even row; odd rows have one less and sit half a bubble to the right
const ROWS = 14
const ROW_H = R * Math.sqrt(3) // rows overlap so the bubbles nest
const TOP = 30 // room for the score
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']

let grid // grid[r][c]: a color index, or -1 for an empty cell

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + R + r * ROW_H })

function reset() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < cols(r); c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)
  }
}

function drawBubble(x, y, color, r = R) {
  ctx.fillStyle = COLORS[color]
  ctx.beginPath()
  ctx.arc(x, y, r - 1, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#312e81'
  ctx.fillRect(0, 0, canvas.width, TOP)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      drawBubble(p.x, p.y, grid[r][c])
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
