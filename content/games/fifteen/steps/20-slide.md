---
title: Remember the slide
title_tr: Kaymayı hatırla
skills: [game.state]
---

# --goal--

A tile that jumps to its new square is hard to follow. To make it slide, we first remember which tile is moving, from
where to where, and how far the animation is: `slide`.

# --goal-tr--

Taş yeni karesine bir anda **zıplıyor**; göz hangi taşın hareket ettiğini izleyemiyor. Taşları **kayarak** götüreceğiz.

Önemli bir fikir: tahta (`tiles`) eskisi gibi **hemen** değişecek; oyunun kuralları animasyonu beklemez. Ayrıca bir
not tutacağız: **hangi taş, nereden nereye** kayıyor ve animasyonun **kaçıncı karesindeyiz**. Bu not `slide`. Bu adımda
notu yazıyoruz; hareketi sonraki adımlarda.

# --code--

```js
const SLIDE_FRAMES = 8

let slide // the tile sliding right now: { tile, from, to, frame }, or null

  slide = null

  slide = { tile: tiles[i], from: i, to: gap, frame: 0 }
```

# --meaning--

- A slide lasts `SLIDE_FRAMES` = 8 frames (about 0.13 seconds).
- `slide` is `null` when nothing slides: `null` means "nothing, on purpose".
- `move` fills it in before changing the board: the tile's number, its old square, its new square (the gap), frame 0.

# --meaning-tr--

- `SLIDE_FRAMES = 8` → bir kayma 8 kare sürer (saniyede 60 kare: yaklaşık 0,13 saniye).
- `let slide` → kayan taşın notu. Yorum içindeki alanları sayıyor.
- `slide = null` → `reset` içinde. `null` "**bilerek hiçbir şey**" demek: kayan taş yok.
- `slide = { tile: tiles[i], from: i, to: gap, frame: 0 }` → `move` içinde, tahtayı değiştirmeden **önce**:
  - `tile` → kayan taşın numarası, `from` → eski karesi, `to` → yeni karesi (boşluk), `frame` → animasyonun karesi (0).

# --task--

1. Under `const TOP = 60` write `const SLIDE_FRAMES = 8`.
2. Under `let moves` write `let slide ...`.
3. At the end of `reset` write `slide = null`.
4. In `move`, under the neighbour check, write the `slide = { ... }` line. Press **Run**.

# --task-tr--

1. `const TOP = 60` satırının altına `const SLIDE_FRAMES = 8` yaz.
2. `let moves` satırının altına yorumuyla birlikte `let slide` satırını yaz.
3. `reset`'in sonuna, `moves = 0` satırının altına `slide = null` yaz.
4. `move` içinde `if (!neighbors(gap).includes(i)) return` satırının altına `slide = { ... }` satırını yaz.
5. **Çalıştır**. Ekran aynı; not tutuluyor ama henüz kullanılmıyor.

# --tests--

`slide` should start as `null`.
tr: `slide` `null` olarak başlamalı.

```js
assert.strictEqual(SLIDE_FRAMES, 8)
assert.isNull(slide)
```

A move should note which tile slides, from where to where.
tr: Bir hamle hangi taşın nereden nereye kaydığını not etmeli.

```js
tiles = solvedTiles()
move(14)
assert.deepEqual(slide, { tile: 15, from: 14, to: 15, frame: 0 })
assert.deepEqual(tiles.slice(12), [13, 14, 0, 15], 'the board changes at once')
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
