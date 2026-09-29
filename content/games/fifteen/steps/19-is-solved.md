---
title: Is it solved?
title_tr: Çözüldü mü?
skills: [prog.arrays]
---

# --goal--

`isSolved()` compares every square with the solved board. A shuffle could by chance end solved, so `reset` shuffles
again while it is.

# --goal-tr--

"Bulmaca çözüldü mü?" sorusunu soran bir fonksiyon yazıyoruz: `isSolved`. Her konumdaki taş, çözülmüş tahtadakiyle aynı
mı?

Onu hemen bir işe de koşacağız: 200 rastgele kaydırma, şans eseri tahtayı **çözülmüş** bırakabilir (çok nadir, ama
olur). O zaman oyun "çözüldü" diye başlardı. Böyle olursa yeniden karıştıralım.

# --code--

```js
function reset() {
  tiles = solvedTiles()
  do shuffle(200)
  while (isSolved())
  moves = 0
}

function isSolved() {
  return tiles.every((t, i) => t === solvedTiles()[i])
}
```

# --meaning--

- `every` is `true` only if the test is true for every item; `t` is the tile and `i` its position.
- `do ... while (isSolved())` shuffles first, then checks, and shuffles again as long as the board is solved.

# --meaning-tr--

- `tiles.every((t, i) => ...)` → listenin **her elemanı** için soruyu sorar: `t` taş, `i` konumu. **Hepsi** `true`
  derse sonuç `true`, bir tane bile `false` varsa `false`.
- `t === solvedTiles()[i]` → bu konumdaki taş çözülmüş tahtadakiyle aynı mı?
- `do shuffle(200)` / `while (isSolved())` → **önce yap, sonra kontrol et** döngüsü: karıştır; sonuç çözülmüşse yine
  karıştır. Neredeyse her zaman tek turda biter.

# --task--

1. In `reset`, change `shuffle(200)` to `do shuffle(200)` and write `while (isSolved())` under it.
2. Under `reset`, leave an empty line and write `isSolved`. Press **Run**.

# --task-tr--

1. `reset` içindeki `shuffle(200)` satırını `do shuffle(200)` yap ve altına `while (isSolved())` yaz.
2. `reset` fonksiyonunun altına bir boş satır bırakıp `isSolved` fonksiyonunu yaz.
3. **Çalıştır**.

# --tests--

`isSolved()` should tell a solved board from a mixed one.
tr: `isSolved()` çözülmüş tahtayı karışık olandan ayırmalı.

```js
tiles = solvedTiles()
assert.isTrue(isSolved())
move(14)
assert.isFalse(isSolved())
```

A new game should never start solved.
tr: Yeni oyun asla çözülmüş başlamamalı.

```js
for (let n = 0; n < 50; n++) {
  reset()
  assert.isFalse(isSolved())
  assert.strictEqual(moves, 0)
}
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
}

function isSolved() {
  return tiles.every((t, i) => t === solvedTiles()[i])
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
