---
title: Slide a tile
title_tr: Taş kaydır
skills: [game.state, prog.arrays]
---

# --goal--

`move(i)` slides the tile at position `i` into the gap, if it is a neighbour of the gap. Sliding is just swapping the
tile and the gap in the list.

# --goal-tr--

Bir taşı kaydırmak aslında çok basit: taş ile boşluk **yer değiştirir**. Listede taşın numarasını boşluğun yerine
yazar, taşın eski yerine `0` yazarız.

Ama sadece boşluğun **komşusu** olan taş kayabilir; uzaktaki bir taşa tıklamak hiçbir şey yapmamalı.

# --code--

```js
// Slide the tile at position i into the gap, if it is next to the gap.
function move(i) {
  const gap = tiles.indexOf(0)
  if (!neighbors(gap).includes(i)) return
  tiles[gap] = tiles[i]
  tiles[i] = 0
}
```

# --meaning--

- `tiles.indexOf(0)` finds the position of the gap.
- `neighbors(gap).includes(i)` asks whether `i` is next to the gap; `!` means "not", so a far tile returns at once.
- The tile's number is written into the gap, and its old square becomes the gap.

# --meaning-tr--

- `tiles.indexOf(0)` → `0`'ın (boşluğun) listede **kaçıncı konumda** olduğunu bulur.
- `neighbors(gap).includes(i)` → "`i`, boşluğun komşuları arasında **var mı**?" `true` ya da `false`.
- `!` → "**değil**". Komşu **değilse** `return`: fonksiyondan hemen çık, hiçbir şey değişmez.
- `tiles[gap] = tiles[i]` → taşın numarasını boşluğun yerine yaz.
- `tiles[i] = 0` → taşın eski yeri artık boşluk.

# --task--

Above `function squareX(i)`, write the comment and `move`, and leave an empty line. Press **Run**.

# --task-tr--

`function squareX(i) {` satırının **üstüne** yorum satırını ve `move` fonksiyonunu yaz; arada bir boş satır kalsın.
**Çalıştır**. Tıklamayı bir sonraki adımda bağlayacağız; kontroller fonksiyonu kendileri çağırıyor.

# --tests--

A tile next to the gap should slide into it.
tr: Boşluğun yanındaki taş boşluğa kaymalı.

```js
move(14)
assert.deepEqual(tiles.slice(12), [13, 14, 0, 15])
move(10)
assert.deepEqual([tiles[10], tiles[14]], [0, 11])
```

A tile far from the gap should not move.
tr: Boşluktan uzak bir taş hareket etmemeli.

```js
move(0)
move(12)
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
