---
title: Click a tile
title_tr: Taşa tıkla
skills: [game.input]
---

# --goal--

A click (or a tap) finds the square under the pointer and moves it. We turn the pointer position into board pixels,
then divide by the width of a square plus its gap.

# --goal-tr--

Şimdi fareyle (ya da parmakla) oynayalım: bir taşa **tıklayınca** `move` çağrılsın.

Tıklanan noktanın **hangi kare** olduğunu bulmalıyız. Yöntem: noktayı tahtanın sol üst köşesine göre ölç, sonra bir
kare + aralık genişliğine (96) böl ve aşağı yuvarla. 250. piksel → 250 / 96 = 2,6 → **2. sütun**.

# --code--

```js
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - TOP
  const col = Math.floor(x / (SIZE + GAP))
  const row = Math.floor(y / (SIZE + GAP))
  if (col >= 0 && col < N && row >= 0 && row < N) move(row * N + col)
})
```

# --meaning--

- `pointerdown` fires when a mouse button or a finger goes down on the canvas.
- The canvas can be shown bigger or smaller than 400 pixels, so the position is scaled into canvas pixels; subtracting
  `LEFT` and `TOP` measures from the board's corner.
- Dividing by `SIZE + GAP` and rounding down gives the column and row.
- Only clicks on the board count; the position is `row * N + col`.

# --meaning-tr--

- `canvas.addEventListener('pointerdown', (event) => { ... })` → tuvale fareyle **basıldığında** ya da parmakla
  **dokunulduğunda** içini çalıştırır. `event` tıklamanın bilgilerini taşır.
- `canvas.getBoundingClientRect()` → tuvalin ekrandaki yeri ve boyu. Tuval ekranda 400 pikselden küçük ya da büyük
  görünebilir (telefonda küçülür).
- `(event.clientX - rect.left) * canvas.width / rect.width` → tıklamanın tuvalin sol kenarına uzaklığı, **tuval
  pikseline** çevrilmiş. `- LEFT` → tahtanın sol kenarından ölç. `y` için aynısı, `- TOP` ile.
- `Math.floor(x / (SIZE + GAP))` → sütun; `row` aynı şekilde satır.
- `col >= 0 && col < N && row >= 0 && row < N` → tıklama **tahtanın içinde mi**? `&&` "ve", `>=` "büyük ya da eşit".
- `move(row * N + col)` → satır ve sütundan listedeki konuma: `row * 4 + col`. (`rowOf`/`colOf`'un tersi.)

# --task--

Above `function squareX(i)`, write the listener and leave an empty line. Press **Run** and click tiles next to the gap.

# --task-tr--

`function squareX(i) {` satırının **üstüne** dinleyiciyi yaz; arada bir boş satır kalsın. **Çalıştır**, sonra 15'e ya
da 12'ye tıkla: boşluğa geçmeli. Uzaktaki bir taşa tıklamak hiçbir şey yapmamalı.

# --hint--

Check the parentheses in the `x` line: the scaling is done first, then `- LEFT`.

# --hint-tr--

`x` satırındaki parantezleri kontrol et: önce ölçekleme yapılır, en sonda `- LEFT` çıkarılır.

# --tests--

Clicking a tile next to the gap should slide it; others should not move.
tr: Boşluğun yanındaki taşa tıklamak onu kaydırmalı; diğerleri hareket etmemeli.

```js
$.click(248, 393) // tile 15, left of the gap
assert.deepEqual(tiles.slice(12), [13, 14, 0, 15])
$.click(56, 105) // tile 1: far from the gap
assert.strictEqual(tiles[0], 1)
```

Clicks outside the board should do nothing.
tr: Tahtanın dışına tıklamak hiçbir şey yapmamalı.

```js
$.click(5, 400)
$.click(398, 400)
$.click(200, 20)
assert.deepEqual(tiles, solvedTiles())
```

# --solution--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 4 // 4 by 4: tiles 1 to 15 and one gap
const SIZE = 90
const GAP = 6
const LEFT = (canvas.width - N * SIZE - (N - 1) * GAP) / 2
const TOP = 60

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

const rowOf = (i) => Math.floor(i / N)
const colOf = (i) => i % N
const solvedTiles = () => [...Array(N * N - 1).keys()].map((i) => i + 1).concat(0)

// The squares next to position i (up, down, left, right), staying inside the board.
function neighbors(i) {
  const list = []
  if (rowOf(i) > 0) list.push(i - N)
  if (rowOf(i) < N - 1) list.push(i + N)
  if (colOf(i) > 0) list.push(i - 1)
  if (colOf(i) < N - 1) list.push(i + 1)
  return list
}

function reset() {
  tiles = solvedTiles()
}

// Slide the tile at position i into the gap, if it is next to the gap.
function move(i) {
  const gap = tiles.indexOf(0)
  if (!neighbors(gap).includes(i)) return
  tiles[gap] = tiles[i]
  tiles[i] = 0
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - TOP
  const col = Math.floor(x / (SIZE + GAP))
  const row = Math.floor(y / (SIZE + GAP))
  if (col >= 0 && col < N && row >= 0 && row < N) move(row * N + col)
})

function squareX(i) {
  return LEFT + colOf(i) * (SIZE + GAP)
}
function squareY(i) {
  return TOP + rowOf(i) * (SIZE + GAP)
}

function drawTile(number, x, y) {
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(x, y, SIZE, SIZE)
  ctx.fillStyle = '#1c1917'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(number), x + SIZE / 2, y + SIZE / 2 + 2)
}

function draw() {
  ctx.fillStyle = '#292524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  tiles.forEach((number, i) => {
    if (number === 0) return
    drawTile(number, squareX(i), squareY(i))
  })
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
