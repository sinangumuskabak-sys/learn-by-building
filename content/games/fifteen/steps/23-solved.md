---
title: Solved!
title_tr: Çözüldü!
skills: [game.state]
---

# --goal--

A `state` says whether we are `'playing'` or the puzzle is `'solved'`. After every move we check; once solved, no more
moves are taken.

# --goal-tr--

Oyunun **aşamasını** bir değişkende tutacağız: `state` (durum). İki değeri olacak: `'playing'` (oynanıyor) ya da
`'solved'` (çözüldü). Her hamleden sonra `isSolved()` ile bakarız; çözüldüyse tahta **donar**, hamle kabul etmez.

# --code--

```js
let state // 'playing' or 'solved'

  state = 'playing'

function move(i) {
  if (state !== 'playing' || slide) return
  // ...
  moves += 1
  if (isSolved()) {
    state = 'solved'
  }
}
```

# --meaning--

- Every new game starts `'playing'`.
- `move` now returns when the game is not being played **or** a tile is sliding.
- After a move that completes the board, `state` becomes `'solved'`.

# --meaning-tr--

- `let state` → oyunun aşaması; `reset` içinde `state = 'playing'`.
- `if (state !== 'playing' || slide) return` → oyun sürmüyorsa (`!==` "eşit değil") **veya** (`||`) bir taş kayıyorsa
  çık.
- `if (isSolved()) { state = 'solved' }` → hamleden sonra tahta sıraya girdiyse **çözüldü**.

# --task--

1. Under `let moves` write `let state ...`.
2. In `reset`, under `moves = 0`, write `state = 'playing'`.
3. In `move`, change the first line, and at the end write the `if (isSolved())` block. Press **Run**.

# --task-tr--

1. `let moves` satırının altına `let state // 'playing' or 'solved'` yaz.
2. `reset` içinde `moves = 0` satırının altına `state = 'playing'` yaz.
3. `move`'un ilk satırını `if (state !== 'playing' || slide) return` yap.
4. `move`'un sonuna, `moves += 1` satırının altına `if (isSolved()) { ... }` bloğunu yaz.
5. **Çalıştır**. Görüntüyü bir sonraki adımda değiştireceğiz.

# --tests--

Putting the last tile back should solve the puzzle.
tr: Son taşı yerine koymak bulmacayı çözmeli.

```js
assert.strictEqual(state, 'playing')
tiles = solvedTiles()
;[tiles[14], tiles[15]] = [0, 15]
move(15)
assert.strictEqual(state, 'solved')
```

A solved board should take no more moves.
tr: Çözülmüş tahta başka hamle almamalı.

```js
tiles = solvedTiles()
;[tiles[14], tiles[15]] = [0, 15]
move(15)
$.tick(10)
$.press('ArrowRight')
assert.isTrue(isSolved(), 'no more moves once solved')
assert.strictEqual(moves, 1)
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
const SLIDE_FRAMES = 8

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row
let moves
let state // 'playing' or 'solved'
let slide // the tile sliding right now: { tile, from, to, frame }, or null

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

// Mix the tiles by making random slides, so the puzzle can always be solved.
function shuffle(count) {
  let gap = tiles.indexOf(0)
  let previous = -1
  for (let n = 0; n < count; n++) {
    const options = neighbors(gap).filter((i) => i !== previous) // do not undo the last slide
    const i = options[Math.floor(Math.random() * options.length)]
    tiles[gap] = tiles[i]
    tiles[i] = 0
    previous = gap
    gap = i
  }
}

// A position can be solved when the number of pairs out of order, plus the gap's row counted from the bottom, is odd.
function solvable(list) {
  const numbers = list.filter((t) => t !== 0)
  let inversions = 0
  for (let a = 0; a < numbers.length; a++) {
    for (let b = a + 1; b < numbers.length; b++) if (numbers[a] > numbers[b]) inversions++
  }
  const gapRowFromBottom = N - rowOf(list.indexOf(0))
  return (inversions + gapRowFromBottom) % 2 === 1
}

function reset() {
  tiles = solvedTiles()
  do shuffle(200)
  while (isSolved())
  moves = 0
  state = 'playing'
  slide = null
}

function isSolved() {
  return tiles.every((t, i) => t === solvedTiles()[i])
}

// Slide the tile at position i into the gap, if it is next to the gap.
function move(i) {
  if (state !== 'playing' || slide) return
  const gap = tiles.indexOf(0)
  if (!neighbors(gap).includes(i)) return
  slide = { tile: tiles[i], from: i, to: gap, frame: 0 }
  tiles[gap] = tiles[i]
  tiles[i] = 0
  moves += 1
  if (isSolved()) {
    state = 'solved'
  }
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

function update() {
  if (!slide) return
  slide.frame += 1
  if (slide.frame >= SLIDE_FRAMES) slide = null
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
    if (number === 0 || (slide && number === slide.tile)) return
    drawTile(number, squareX(i), squareY(i))
  })
  // The sliding tile is drawn part of the way from its old square to its new one.
  if (slide) {
    const t = slide.frame / SLIDE_FRAMES
    const x = squareX(slide.from) + (squareX(slide.to) - squareX(slide.from)) * t
    const y = squareY(slide.from) + (squareY(slide.to) - squareY(slide.from)) * t
    drawTile(slide.tile, x, y)
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillText('Moves ' + moves, LEFT, 36)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
