---
title: Count the frames
title_tr: Kareleri say
skills: [game.loop, game.state]
---

# --goal--

Every frame, `update()` moves the slide one frame on, and clears it after `SLIDE_FRAMES`. While a tile is sliding,
other moves wait.

# --goal-tr--

Not tamam; şimdi zamanı işletelim. Döngü her karede önce `update()` (güncelle) çağıracak: kayan taş varsa animasyonu
**bir kare** ilerletir, 8 kareye ulaşınca notu siler.

Bir kural daha: bir taş kayarken başka hamle **beklesin**. Yoksa hızlı tıklamalar taşları üst üste bindirir.

# --code--

```js
function move(i) {
  if (slide) return
  // ...

function update() {
  if (!slide) return
  slide.frame += 1
  if (slide.frame >= SLIDE_FRAMES) slide = null
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}
```

# --meaning--

- `if (slide) return` in `move`: while something slides, ignore moves.
- `update` does nothing without a slide; otherwise it counts one frame, and at 8 the slide is over (`null`).
- The loop now updates, then draws.

# --meaning-tr--

- `if (slide) return` → `move`'un **ilk satırı**: kayan bir taş varsa (`slide` `null` değilse) hamle yok. `null`
  `if` için "yanlış" sayılır.
- `function update() {` → her karede çalışacak güncelleme.
- `if (!slide) return` → kayan taş **yoksa** yapacak bir şey yok.
- `slide.frame += 1` → animasyon bir kare ilerler.
- `if (slide.frame >= SLIDE_FRAMES) slide = null` → 8'e ulaştıysa (`>=` "büyük ya da eşit") kayma bitti: not silinir.
- `loop` içinde `update()` → önce durumu güncelle, sonra çiz.

# --task--

1. In `move`, write `if (slide) return` as the first line.
2. Above `function squareX(i)`, write `update` and leave an empty line.
3. In `loop`, write `update()` above `draw()`. Press **Run**.

# --task-tr--

1. `move` içinde **en üste** `if (slide) return` yaz.
2. `function squareX(i) {` satırının **üstüne** `update` fonksiyonunu yaz; arada bir boş satır kalsın.
3. `loop` içinde `draw()` satırının **üstüne** `update()` yaz.
4. **Çalıştır**. Taşlar hâlâ zıplıyor; kaymayı bir sonraki adımda çizeceğiz.

# --tests--

The slide should last eight frames.
tr: Kayma sekiz kare sürmeli.

```js
tiles = solvedTiles()
move(14)
$.tick(4)
assert.strictEqual(slide.frame, 4)
$.tick(4)
assert.isNull(slide)
```

Moves should wait while a tile is sliding.
tr: Bir taş kayarken hamleler beklemeli.

```js
tiles = solvedTiles()
moves = 0
move(14)
move(15)
assert.strictEqual(moves, 1)
$.tick(8)
move(15)
assert.strictEqual(moves, 2)
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
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
