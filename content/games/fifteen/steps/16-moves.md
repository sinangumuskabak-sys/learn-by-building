---
title: Count the moves
title_tr: Hamleleri say
skills: [game.state]
---

# --goal--

A move counter at the top left shows how many slides you needed. It starts at 0 and goes up on every real slide.

# --goal-tr--

Bulmacayı kaç hamlede çözdüğün önemli. Sol üste bir **hamle sayacı** yazacağız: `Moves 3`. Sadece gerçekten olan
kaydırmalar sayılsın; uzaktaki bir taşa tıklamak sayılmasın.

# --code--

```js
let moves

function reset() {
  tiles = solvedTiles()
  moves = 0
}

  tiles[i] = 0
  moves += 1

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillText('Moves ' + moves, LEFT, 36)
```

# --meaning--

- `moves` starts at 0 in `reset`.
- `moves += 1` is the last line of `move`: a tile far from the gap has already returned, so it is not counted.
- `textBaseline = 'alphabetic'` puts the text back on a normal line (the tiles set it to `'middle'`).

# --meaning-tr--

- `let moves` → hamle sayacı; `reset` içinde `moves = 0`.
- `moves += 1` → `move`'un **en sonunda**: "moves'a 1 ekle". Uzaktaki taş daha önce `return` ile çıktığı için sayılmaz.
- Yazı: beyaz, kalın 18 piksel. `ctx.textBaseline = 'alphabetic'` → yazıyı **normal satır çizgisine** oturtur (taşlar
  için `'middle'` yapmıştık; o ayar kalır, bu yüzden geri alıyoruz). `textAlign = 'left'` → yazı x'ten başlar.
- `'Moves ' + moves` → `+` yazıyla sayıyı yan yana ekler: `'Moves 3'`.
- `LEFT, 36` → tahtanın sol kenarı hizasında, üst şeritte.

# --task--

1. Under `let tiles ...` write `let moves`.
2. In `reset`, write `moves = 0`; at the end of `move`, write `moves += 1`.
3. In `draw`, under the `forEach` block, leave an empty line and write the five text lines. Press **Run**.

# --task-tr--

1. `let tiles ...` satırının altına `let moves` yaz.
2. `reset` içinde `tiles = solvedTiles()` satırının altına `moves = 0` yaz.
3. `move`'un sonuna, `tiles[i] = 0` satırının altına `moves += 1` yaz.
4. `draw` içinde `forEach` bloğunu kapatan `})` satırının altına bir boş satır bırakıp beş yazı satırını yaz.
5. **Çalıştır** ve birkaç taş kaydır: sayı artmalı.

# --tests--

Real slides should be counted, far clicks should not.
tr: Gerçek kaydırmalar sayılmalı, uzak tıklamalar sayılmamalı.

```js
assert.strictEqual(moves, 0)
$.click(248, 393)
assert.strictEqual(moves, 1)
$.click(56, 105)
assert.strictEqual(moves, 1)
$.tick(1)
assert.include($.texts(), 'Moves 1')
```

The counter should be at the top left.
tr: Sayaç sol üstte olmalı.

```js
$.tick(1)
const t = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Moves 0')
assert.exists(t)
assert.deepEqual(t.args.slice(1), [11, 36])
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
