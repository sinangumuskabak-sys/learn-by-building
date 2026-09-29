---
title: "Build it yourself: a timer"
title_tr: "Kendin yap: bir süre sayacı"
skills: [game.loop, game.state]
---

# --goal--

Your game, your rules. Add a timer: the seconds since the shuffle, shown under the board, stopping when the puzzle is
solved.

# --goal-tr--

Oyun senin, kurallar da! Oyuna bir **süre sayacı** ekle: karıştırmadan beri kaç saniye geçti? Tahtanın altında
`Time 12` gibi görünsün, bulmaca çözülünce dursun. Artık hem hamleyle hem zamanla yarışabilirsin.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: `update` her karede (saniyede 60 kez) çalışıyor, `state`, `reset`,
`Math.floor`... Kontroller çalıştığında yeşile döner.

# --task--

- Count the time since the last shuffle, in seconds.
- Draw it as `Time 12` (whole seconds) centered under the board, below y = 440.
- It stops when the puzzle is solved and starts again from 0 with a new puzzle.

# --task-tr--

- Son karıştırmadan beri geçen süreyi saniye olarak say.
- Tahtanın altına, ortaya `Time 12` gibi (tam saniye) yaz; y 440'ın altında olsun (tahta orada bitiyor).
- Bulmaca çözülünce süre dursun; yeni bulmacada 0'dan başlasın.

Değiştireceğin yerler: değişkenler, `reset`, `update` ve `draw`. Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

`update` runs 60 times a second, so adding `1 / 60` there while playing counts seconds. Draw `Math.floor(...)` of it.

# --hint-tr--

`update` saniyede 60 kez çalışır; oyun sürerken (`state === 'playing'`) oraya `1 / 60` eklersen saniye sayarsın.
`reset` içinde sıfırla, çizerken `Math.floor(...)` ile tam sayıya çevir. `update`'in ilk satırı kayan taş yoksa hemen
çıkıyor; sayacı ondan **önce** artır.

# --tests--

The time should be shown under the board and count seconds.
tr: Süre tahtanın altında gösterilmeli ve saniye saymalı.

```js
$.run(5)
const t = $.screen().find((c) => c.op === 'fillText' && /^Time \d+$/.test(c.args[0]))
assert.exists(t, 'a text like Time 5')
assert.isAbove(t.args[2], 440, 'under the board')
const shown = Number(t.args[0].split(' ')[1])
assert.isAtLeast(shown, 4)
assert.isAtMost(shown, 6)
```

The time should stop when the puzzle is solved.
tr: Bulmaca çözülünce süre durmalı.

```js
tiles = solvedTiles()
;[tiles[14], tiles[15]] = [0, 15]
$.run(2)
move(15)
$.run(1)
const read = () => $.texts().find((t) => t.startsWith('Time '))
const first = read()
$.run(3)
assert.strictEqual(read(), first)
```

A new puzzle should start the time from 0.
tr: Yeni bulmaca süreyi 0'dan başlatmalı.

```js
tiles = solvedTiles()
;[tiles[14], tiles[15]] = [0, 15]
$.run(3)
move(15)
$.tick(10)
$.click(200, 200)
$.tick(1)
assert.include($.texts(), 'Time 0')
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
let best = Number(localStorage.getItem('fifteen-best')) || 0
let seconds

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
  seconds = 0
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
    if (best === 0 || moves < best) {
      best = moves
      localStorage.setItem('fifteen-best', best)
    }
  }
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'solved') {
    reset()
    return
  }
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
  if (event.key === ' ' && state === 'solved') reset()
})

function update() {
  if (state === 'playing') seconds += 1 / 60
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
  ctx.fillStyle = state === 'solved' ? '#16a34a' : '#f59e0b'
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
  ctx.textAlign = 'right'
  ctx.fillText(state === 'solved' ? 'Solved! Click to shuffle' : best ? 'Best ' + best : '', canvas.width - LEFT, 36)
  ctx.textAlign = 'center'
  ctx.fillText('Time ' + Math.floor(seconds), canvas.width / 2, 455)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
