---
title: Sliding into the gap
title_tr: Boşluğa kaydırmak
skills: [game.input, prog.arrays]
---

# --explanation--

Only a tile **next to the gap** can move, and moving it just swaps it with the gap. So the key question is: which squares
are next to square `i`?

In a flat array the neighbours are `i - N` (above), `i + N` (below), `i - 1` (left) and `i + 1` (right), but careful at the
edges: square 3 is at the end of the first row, and `3 + 1 = 4` is the **start of the next row**, not a neighbour. Checking
the row and column before adding each one avoids that classic wrap-around bug:

```js
if (colOf(i) < N - 1) list.push(i + 1)   // only if i is not in the last column
```

A click works out the square under the pointer; the arrow keys feel best when they move the tile **towards** the gap in
that direction: Left slides the tile on the right of the gap to the left.

# --explanation-tr--

Yalnızca **boşluğun yanındaki** bir taş hareket edebilir ve onu hareket ettirmek onu yalnızca boşlukla takas eder. Öyleyse asıl
soru şu: hangi kareler `i` karesinin yanında?

Düz bir dizide komşular `i - N` (üst), `i + N` (alt), `i - 1` (sol) ve `i + 1`'dir (sağ); ama kenarlarda dikkat: 3. kare ilk
satırın sonundadır ve `3 + 1 = 4` bir komşu değil, **sonraki satırın başıdır**. Her birini eklemeden önce satırı ve sütunu
kontrol etmek bu bilinen başa sarma hatasını önler:

```js
if (colOf(i) < N - 1) list.push(i + 1)   // yalnızca i son sütunda değilse
```

Bir tıklama işaretçinin altındaki kareyi hesaplar; ok tuşları, taşı o yönde boşluğa **doğru** hareket ettirdiğinde en iyi
hissettirir: Sol, boşluğun sağındaki taşı sola kaydırır.

# --task--

1. Write `neighbors(i)`: the squares above, below, left and right of `i` that are on the board.
2. Add `moves` (`0` in `reset()`) and write `move(i)`: if `i` is a neighbour of the gap, swap the tile into the gap and add 1
   to `moves`.
3. On `pointerdown`, convert to canvas pixels, work out the column and row (each square plus its gap is `SIZE + GAP` wide) and
   `move` that square if it is on the board.
4. The arrow keys move the tile at `gap + 1` (Left), `gap - 1` (Right), `gap + N` (Up) or `gap - N` (Down), only if it is a
   neighbour of the gap (`preventDefault()` them).
5. Draw `Moves 3` at the top left (`LEFT`, `y = 36`, white, `'bold 18px sans-serif'`).

# --task-tr--

1. `neighbors(i)` yaz: `i`'nin üstündeki, altındaki, solundaki ve sağındaki, tahtada olan kareler.
2. `moves` ekle (`reset()`'te `0`) ve `move(i)` yaz: `i` boşluğun komşusuysa taşı boşluğa takas et ve `moves`'a 1 ekle.
3. `pointerdown`'da canvas piksellerine çevir, sütunu ve satırı hesapla (her kare ve boşluğu `SIZE + GAP` genişliğindedir) ve
   tahtadaysa o kareyi `move` et.
4. Ok tuşları `gap + 1`'deki (Sol), `gap - 1`'deki (Sağ), `gap + N`'deki (Yukarı) ya da `gap - N`'deki (Aşağı) taşı yalnızca
   boşluğun komşusuysa hareket ettirir (`preventDefault()` et).
5. Sol üste `Moves 3` çiz (`LEFT`, `y = 36`, beyaz, `'bold 18px sans-serif'`).

# --tests--

Neighbours should stop at the edges of the board.
tr: Komşular tahtanın kenarlarında durmalı.

```js
assert.sameMembers(neighbors(5), [1, 9, 4, 6])
assert.sameMembers(neighbors(0), [4, 1])
assert.sameMembers(neighbors(3), [7, 2], 'square 4 is on the next row, not a neighbour')
assert.sameMembers(neighbors(15), [11, 14])
```

Clicking a tile next to the gap should slide it; others should not move.
tr: Boşluğun yanındaki bir taşa tıklamak onu kaydırmalı; diğerleri hareket etmemeli.

```js
$.click(248, 393) // tile 15, left of the gap
assert.deepEqual(tiles.slice(12), [13, 14, 0, 15])
assert.strictEqual(moves, 1)
$.click(56, 105) // tile 1: far from the gap
assert.strictEqual(tiles[0], 1)
assert.strictEqual(moves, 1)
$.tick(1)
assert.include($.texts(), 'Moves 1')
```

The arrows should move the tile next to the gap towards it.
tr: Oklar boşluğun yanındaki taşı ona doğru hareket ettirmeli.

```js
$.press('ArrowRight') // the tile left of the gap (15) goes right
assert.deepEqual(tiles.slice(12), [13, 14, 0, 15])
$.press('ArrowDown') // the tile above the gap (11) comes down
assert.deepEqual([tiles[10], tiles[14]], [0, 11])
$.press('ArrowLeft') // the tile right of the gap (12) goes left
assert.strictEqual(tiles.indexOf(0), 11)
$.press('ArrowLeft') // the gap is in the last column: position 12 is on the next row, not a neighbour
assert.strictEqual(tiles.indexOf(0), 11)
assert.strictEqual(moves, 3)
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
let moves

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
  moves = 0
}

// Slide the tile at position i into the gap, if it is next to the gap.
function move(i) {
  const gap = tiles.indexOf(0)
  if (!neighbors(gap).includes(i)) return
  tiles[gap] = tiles[i]
  tiles[i] = 0
  moves += 1
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - TOP
  const col = Math.floor(x / (SIZE + GAP))
  const row = Math.floor(y / (SIZE + GAP))
  if (col >= 0 && col < N && row >= 0 && row < N) move(row * N + col)
})

// An arrow moves the tile on the other side of the gap in that direction: Left slides the tile right of the gap to the left.
document.addEventListener('keydown', (event) => {
  const gap = tiles.indexOf(0)
  const from = { ArrowLeft: 1, ArrowRight: -1, ArrowUp: N, ArrowDown: -N }[event.key]
  if (from !== undefined) {
    event.preventDefault()
    if (neighbors(gap).includes(gap + from)) move(gap + from)
  }
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillText('Moves ' + moves, LEFT, 36)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
