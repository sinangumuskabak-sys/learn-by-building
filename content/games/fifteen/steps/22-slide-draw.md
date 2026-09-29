---
title: Smooth sliding
title_tr: Akıcı kayma
skills: [game.loop, game.canvas]
---

# --goal--

The sliding tile is not drawn on its square; it is drawn part of the way from its old square to its new one. `t` goes
from 0 to 1 during the slide, and the position goes along with it.

# --goal-tr--

Şimdi kaymayı **çiziyoruz**. Kayan taşı kendi karesine çizmeyeceğiz; onu eski karesiyle yeni karesi **arasında** bir
yere çizeceğiz.

Fikir: `t` = animasyonun ne kadarı bitti (0 başta, 1 sonda). Yol boyunca yer: başlangıç + (bitiş − başlangıç) × `t`.
`t` 0,5 iken tam yarı yol. Buna **doğrusal interpolasyon** (lerp) denir; oyunlarda her yerde kullanılır.

# --code--

```js
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
```

# --meaning--

- The `forEach` now also skips the sliding tile: `slide &&` makes sure there is a slide before reading `slide.tile`.
- `t` is 0 at the start and 1 at the end.
- `x` and `y` go from the old square towards the new one as `t` grows; the tile is drawn there.

# --meaning-tr--

- `number === 0 || (slide && number === slide.tile)` → boşluksa **veya** (`||`) (kayan taş varsa **ve** bu o taşsa)
  bu turu atla. `slide &&` önce "kayan taş var mı?" diye bakar; yoksa `slide.tile` hiç okunmaz.
- `if (slide) { ... }` → kayan taş varsa onu ayrıca çiz:
  - `const t = slide.frame / SLIDE_FRAMES` → 0/8 = 0 başta, 4/8 = 0,5 yarıda, 8/8 = 1 sonda.
  - `squareX(slide.from) + (squareX(slide.to) - squareX(slide.from)) * t` → eski x'ten yeni x'e yolun `t` kadarı.
  - `y` aynısı. `drawTile(slide.tile, x, y)` → taşı oraya çiz.

# --task--

In `draw`, change the `if` inside `forEach`, and under the `forEach` block write the comment and the `if (slide)` block.

# --task-tr--

1. `draw` içindeki `forEach`'te `if (number === 0) return` satırını `if (number === 0 || (slide && number === slide.tile)) return`
   yap.
2. `forEach` bloğunu kapatan `})` satırının altına yorum satırını ve `if (slide) { ... }` bloğunu yaz.
3. **Çalıştır**, bir taş kaydır: boşluğa **süzülerek** gitmeli.

# --try--

Change `SLIDE_FRAMES` to `30` and run: a very slow slide. Put `8` back.

# --try-tr--

`SLIDE_FRAMES`'i `30` yap ve çalıştır: ağır çekim kayma. Sonra `8`'e geri al.

# --tests--

A moved tile should slide over eight frames.
tr: Hareket eden taş sekiz karede kaymalı.

```js
tiles = solvedTiles()
move(14)
$.tick(4)
const row = $.rects('#f59e0b').filter((r) => r.y === 348)
assert.sameMembers(row.map((r) => r.x), [11, 107, 11 + 2 * 96 + 48], '13, 14, and 15 halfway')
$.tick(5)
assert.isTrue($.rects('#f59e0b').some((r) => r.x === 11 + 3 * 96 && r.y === 348), '15 on its new square')
```

The sliding tile should be drawn once, not also on its square.
tr: Kayan taş bir kez çizilmeli; ayrıca karesinde değil.

```js
tiles = solvedTiles()
move(14)
$.tick(2)
assert.lengthOf($.rects('#f59e0b'), 15)
assert.lengthOf($.texts().filter((t) => t === '15'), 1)
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
  slide = null
}

function isSolved() {
  return tiles.every((t, i) => t === solvedTiles()[i])
}

// Slide the tile at position i into the gap, if it is next to the gap.
function move(i) {
  if (slide) return
  const gap = tiles.indexOf(0)
  if (!neighbors(gap).includes(i)) return
  slide = { tile: tiles[i], from: i, to: gap, frame: 0 }
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
