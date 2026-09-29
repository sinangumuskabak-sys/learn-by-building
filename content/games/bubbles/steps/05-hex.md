---
title: Bubbles that nest
title_tr: İç içe oturan balonlar
skills: [prog.arrays, game.canvas]
---

# --goal--

Real bubbles pack like marbles in a box: every other row is shifted half a bubble to the right, so each bubble nests in
the gap between the two above it. This is a **hex grid**, like a honeycomb. Rows get closer, and odd rows have one bubble
less.

# --goal-tr--

Gerçek balonlar kutudaki bilyeler gibi **sıkı** dizilir: her iki satırdan biri yarım balon **sağa kayar** ve her balon,
üstündeki iki balonun arasındaki çukura oturur. Buna **altıgen ızgara** denir; bal peteğindeki desen.

Izgaramız yine düz bir iki boyutlu dizi; değişen yalnız `cellPos`, yani geometri:

- tek satırlar (1, 3, 5...) `R` kadar sağa kayar;
- satırlar bir çaptan **daha yakın** olur, çünkü balonlar iç içe geçer;
- kayan satıra bir balon **eksik** sığar, yoksa onuncu balon canvas'tan taşardı.

# --code--

```js
const ROW_H = R * Math.sqrt(3) // rows overlap so the bubbles nest

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + R + r * ROW_H })

    for (let c = 0; c < cols(r); c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)

    for (let c = 0; c < cols(r); c++) {
```

# --meaning--

- `r % 2` is the remainder of dividing by 2: 0 on even rows, 1 on odd rows. So odd rows get `+ R` in x.
- `ROW_H = R × √3`, about `1.73 R` instead of `2 R`: a bubble and the two it rests on form an equilateral triangle with
  sides `2R`, whose height is `2R × √3 / 2`.
- `cols(r)` is 10 on even rows and 9 on odd rows; the grid and the drawing use it instead of `COLS`.

# --meaning-tr--

- `r % 2` → `%` **bölümden kalan**: çift satırda 0, tek satırda 1. `(r % 2) * R` → tek satırlar `R` kadar sağa.
- `const ROW_H = R * Math.sqrt(3)` → satır yüksekliği. Neden √3? Bir balon ve oturduğu iki balonun merkezleri kenarı
  `2R` olan bir **eşkenar üçgen** yapar; o üçgenin yüksekliği `2R × √3 / 2` = `R × √3` ≈ 1.73 R. Yani 2R yerine 1.73 R:
  satırlar iç içe geçer. `Math.sqrt` karekök alır.
- `const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)` → çift satırda 10, tek satırda 9 hücre.
- `reset` ve `draw` içindeki döngüler artık `COLS` yerine `cols(r)`'ye kadar gidiyor.

# --task--

1. Under `ROWS` write `ROW_H`.
2. Above `cellPos` write `cols`, and change `cellPos` as shown.
3. In `reset` and in `draw`, replace `c < COLS` with `c < cols(r)`.

# --task-tr--

1. `const ROWS = 14` satırının altına `ROW_H` yaz.
2. `cellPos` satırının **üstüne** `cols` satırını yaz; `cellPos`'u kodda görüldüğü gibi değiştir.
3. `reset` ve `draw` içindeki `c < COLS` yazılarını `c < cols(r)` yap.
4. **Çalıştır**: balonlar artık petek gibi iç içe oturuyor.

# --tests--

The grid should have 14 rows, alternating 10 and 9 cells, with the first five filled.
tr: Izgarada 10 ve 9 hücre arasında değişen 14 satır olmalı ve ilk beşi dolu olmalı.

```js
assert.lengthOf(grid, ROWS)
assert.lengthOf(grid[0], 10)
assert.lengthOf(grid[1], 9, 'odd rows have one bubble less')
assert.lengthOf(grid[2], 10)
for (let r = 0; r < 5; r++) for (const color of grid[r]) assert.include([0, 1, 2, 3, 4], color)
```

Odd rows should be shifted, and neighbouring rows should just touch.
tr: Tek satırlar kaymış olmalı ve komşu satırlar yalnızca değmeli.

```js
assert.deepEqual(cellPos(0, 0), { x: 20, y: 50 })
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
