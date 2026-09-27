---
title: Flash and fall
title_tr: Parla ve düş
skills: [game.state, game.loop]
---

# --explanation--

The game works, but it is instant: one click and the board is already different. Players need to **see** what happened. So
the `while` loop from the last step is broken into **phases** that play out over frames:

| phase | what happens | then |
|---|---|---|
| `'idle'` | waiting for the player | a matching swap → `'clearing'` |
| `'clearing'` | the matched gems flash for 14 frames | `collapse()` → `'falling'` |
| `'falling'` | gems slide down into place | new matches → `'clearing'`, otherwise `'idle'` |

This is a **state machine**: the loop is the same, the `update()` function asks "which phase are we in?" each frame. Clicks
are ignored unless the phase is `'idle'`, so the player cannot swap gems in the middle of a fall.

The falling is a drawing trick. The board data changes at once in `collapse()`, but each gem remembers how many pixels
**above** its new place it used to be, in `drop[r][c]`. A gem that fell two rows starts with `drop = 96`, a new gem starts
above the board. Every frame each `drop` shrinks by `FALL` pixels until it reaches `0`, and the gem is drawn at
`y - drop[r][c]`. When no gem is moving any more, the fall is over.

# --explanation-tr--

Oyun çalışıyor ama anlık: tek tıklama ve tahta çoktan değişmiş. Oyuncuların ne olduğunu **görmesi** gerekir. Bu yüzden son
adımdaki `while` döngüsü karelere yayılarak oynanan **evrelere** bölünür:

| evre | ne olur | sonra |
|---|---|---|
| `'idle'` | oyuncuyu bekler | eşleşen bir takas → `'clearing'` |
| `'clearing'` | eşleşen mücevherler 14 kare yanıp söner | `collapse()` → `'falling'` |
| `'falling'` | mücevherler yerlerine kayar | yeni eşleşmeler → `'clearing'`, yoksa `'idle'` |

Bu bir **durum makinesi**: döngü aynı, `update()` fonksiyonu her karede "hangi evredeyiz?" diye sorar. Evre `'idle'` değilse
tıklamalar yok sayılır; böylece oyuncu bir düşüşün ortasında mücevher takas edemez.

Düşüş bir çizim numarasıdır. Tahta verisi `collapse()`'ta hemen değişir ama her mücevher yeni yerinin kaç piksel **üstünde**
olduğunu `drop[r][c]`'de hatırlar. İki satır düşen bir mücevher `drop = 96` ile başlar, yeni bir mücevher tahtanın üstünden
başlar. Her karede her `drop` `0`'a ulaşana kadar `FALL` piksel küçülür ve mücevher `y - drop[r][c]`'de çizilir. Hiçbir
mücevher hareket etmediğinde düşüş biter.

# --task--

1. Add `FALL = 8`, and `phase` (`'idle'` in `reset()`), `timer`, `matched`, `chain` and `drop` (a grid of zeros in `reset()`).
2. Write `startClearing()`: set `matched = findMatches()`, add 1 to `chain`, score `matched.size * 10 * chain`, and set
   `phase = 'clearing'`, `timer = 14`. In `trySwap`, a matching swap now sets `chain = 0` and calls `startClearing()`.
3. `collapse()` now empties the `matched` cells itself, sets each moved gem's `drop` to `(write - r) * SIZE`, each new gem's
   to `(write + 1) * SIZE`, and sets `phase = 'falling'`.
4. Write `update()`, called before `draw()`: in `'clearing'`, count `timer` down and `collapse()` at `0`; in `'falling'`, shrink
   every `drop` by `FALL` (not below `0`), and once none is above `0`, `startClearing()` if there are matches, otherwise go
   back to `'idle'`.
5. Ignore clicks unless `phase === 'idle'`. Draw each gem `drop[r][c]` pixels higher, and white (`'#ffffff'`) instead of its
   color while it is `matched` in `'clearing'` and `Math.floor(timer / 3) % 2 === 0`.

# --task-tr--

1. `FALL = 8` ekle; ayrıca `phase` (`reset()`'te `'idle'`), `timer`, `matched`, `chain` ve `drop` (`reset()`'te sıfırlardan
   bir ızgara).
2. `startClearing()` yaz: `matched = findMatches()` yap, `chain`'e 1 ekle, `matched.size * 10 * chain` puan ver ve
   `phase = 'clearing'`, `timer = 14` yap. `trySwap`'ta eşleşen bir takas artık `chain = 0` yapar ve `startClearing()`'i
   çağırır.
3. `collapse()` artık `matched` hücrelerini kendisi boşaltır, kayan her mücevherin `drop`'unu `(write - r) * SIZE`, her yeni
   mücevherinkini `(write + 1) * SIZE` yapar ve `phase = 'falling'` yapar.
4. `draw()`'dan önce çağrılan `update()`'i yaz: `'clearing'`'de `timer`'ı geri say ve `0`'da `collapse()` et; `'falling'`'de
   her `drop`'u `FALL` kadar küçült (`0`'ın altına değil) ve hiçbiri `0`'ın üstünde değilse, eşleşme varsa `startClearing()`
   et, yoksa `'idle'`'a dön.
5. `phase === 'idle'` değilse tıklamaları yok say. Her mücevheri `drop[r][c]` piksel daha yukarıda çiz; `'clearing'`'de
   `matched` içindeyken ve `Math.floor(timer / 3) % 2 === 0` iken kendi rengi yerine beyaz (`'#ffffff'`) çiz.

# --tests--

A matching swap should first flash the matched gems, then drop new gems in from above.
tr: Eşleşen bir takas önce eşleşen mücevherleri yakıp söndürmeli, sonra yeni mücevherleri yukarıdan düşürmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
$.click(32 + 48 * 2, 96 + 48)
$.click(32 + 48 * 2, 96)
assert.strictEqual(phase, 'clearing')
assert.strictEqual(score, 30)
assert.deepEqual(board[0].slice(0, 3), [1, 1, 1], 'the matched gems stay while they flash')
$.tick(2)
assert.lengthOf($.arcs().filter((a) => a.color === '#ffffff'), 3, 'they flash white')
$.tick(12)
assert.strictEqual(phase, 'falling')
assert.isAbove(drop[0][0], 0, 'the new gem starts above the board')
```

Clicks should wait until everything has landed, and then the board should be quiet.
tr: Tıklamalar her şey yere inene kadar beklemeli, sonra tahta sakin olmalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
$.click(32 + 48 * 2, 96 + 48)
$.click(32 + 48 * 2, 96)
$.click(32 + 48 * 6, 96 + 48 * 6)
assert.isNull(selected, 'clicks wait until the gems land')
for (let i = 0; i < 300 && phase !== 'idle'; i++) $.tick(1)
assert.strictEqual(phase, 'idle')
assert.strictEqual(findMatches().size, 0)
for (const row of drop) for (const d of row) assert.strictEqual(d, 0)
```

A gem that fell one row should start one row higher and slide down `FALL` pixels per frame.
tr: Bir satır düşen bir mücevher bir satır yukarıdan başlamalı ve her karede `FALL` piksel aşağı kaymalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
matched = new Set([7 * N + 3])
collapse()
assert.strictEqual(board[7][3], (6 + 6) % 6, 'the gem above fell into the gap')
assert.strictEqual(drop[7][3], 48)
assert.strictEqual(drop[0][3], 48, 'the new gem starts one row above')
$.tick(1)
assert.strictEqual(drop[7][3], 48 - FALL)
assert.deepInclude($.arcs(), { x: 32 + 48 * 3, y: 96 + 48 * 7 - 48 + FALL, r: 18, color: COLORS[board[7][3]] })
```

# --solution--

```js
// Match three, step by step.
// The page already has <canvas id="game" width="400" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 8 // 8 by 8 gems
const SIZE = 48
const LEFT = (canvas.width - N * SIZE) / 2
const TOP = 72 // room for the score and the moves left
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']
const FALL = 8 // pixels a gem falls per frame

let board // board[row][col]: a color index, or -1 while empty
let selected
let score
let chain // how many clears in a row this move has caused
let phase // 'idle', 'clearing' (matched gems flash) or 'falling'
let timer
let matched // the cells being cleared
let drop // drop[row][col]: how many pixels above its place a gem is still drawn

const randomGem = () => Math.floor(Math.random() * COLORS.length)

// Would this gem make three in a row with the two to its left, or the two above it?
function makesRun(r, c, gem) {
  const left = c >= 2 && board[r][c - 1] === gem && board[r][c - 2] === gem
  const up = r >= 2 && board[r - 1][c] === gem && board[r - 2][c] === gem
  return left || up
}

// A new board with no three in a row: each gem avoids the colors that would make one.
function newBoard() {
  board = []
  for (let r = 0; r < N; r++) {
    board.push([])
    for (let c = 0; c < N; c++) {
      let gem
      do gem = randomGem()
      while (makesRun(r, c, gem))
      board[r].push(gem)
    }
  }
}

function reset() {
  newBoard()
  selected = null
  score = 0
  phase = 'idle'
  drop = board.map((row) => row.map(() => 0))
}

// Every cell that is part of three or more of the same color in a row or a column.
function findMatches() {
  const cells = new Set()
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const gem = board[r][c]
      if (gem < 0) continue
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        // Only start counting at the first gem of a run.
        const pr = r - dr
        const pc = c - dc
        if (pr >= 0 && pc >= 0 && board[pr][pc] === gem) continue
        let length = 1
        while (r + dr * length < N && c + dc * length < N && board[r + dr * length][c + dc * length] === gem) length++
        if (length >= 3) for (let i = 0; i < length; i++) cells.add((r + dr * i) * N + (c + dc * i))
      }
    }
  }
  return cells
}

function swap(a, b) {
  const gem = board[a.r][a.c]
  board[a.r][a.c] = board[b.r][b.c]
  board[b.r][b.c] = gem
}

function trySwap(a, b) {
  if (Math.abs(a.r - b.r) + Math.abs(a.c - b.c) !== 1) return false
  swap(a, b)
  if (findMatches().size === 0) {
    swap(a, b) // no match: the gems go back
    return false
  }
  chain = 0
  startClearing()
  return true
}

function startClearing() {
  matched = findMatches()
  chain += 1
  score += matched.size * 10 * chain // cascades are worth more and more
  phase = 'clearing'
  timer = 14
}

// Remove the matched gems; everything above falls down to fill the gaps, and new gems drop in from the top.
function collapse() {
  for (const cell of matched) board[Math.floor(cell / N)][cell % N] = -1
  for (let c = 0; c < N; c++) {
    let write = N - 1
    for (let r = N - 1; r >= 0; r--) {
      if (board[r][c] < 0) continue
      board[write][c] = board[r][c]
      drop[write][c] = (write - r) * SIZE
      write--
    }
    for (let r = write; r >= 0; r--) {
      board[r][c] = randomGem()
      drop[r][c] = (write + 1) * SIZE
    }
  }
  phase = 'falling'
}

function update() {
  if (phase === 'clearing') {
    timer -= 1
    if (timer === 0) collapse()
    return
  }
  if (phase === 'falling') {
    let moving = false
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        drop[r][c] = Math.max(0, drop[r][c] - FALL)
        if (drop[r][c] > 0) moving = true
      }
    }
    if (moving) return
    // Landed: new matches make a cascade; otherwise the move is over.
    if (findMatches().size > 0) startClearing()
    else phase = 'idle'
  }
}

function cellAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - TOP
  const r = Math.floor(y / SIZE)
  const c = Math.floor(x / SIZE)
  return r >= 0 && r < N && c >= 0 && c < N ? { r, c } : null
}

canvas.addEventListener('pointerdown', (event) => {
  if (phase !== 'idle') return
  const cell = cellAt(event)
  if (!cell) return
  if (selected && trySwap(selected, cell)) selected = null
  else selected = selected && selected.r === cell.r && selected.c === cell.c ? null : cell
})

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      ctx.fillStyle = (r + c) % 2 === 0 ? '#312e81' : '#3730a3'
      ctx.fillRect(x, y, SIZE, SIZE)
      const gem = board[r][c]
      if (gem < 0) continue
      const flashing = phase === 'clearing' && matched.has(r * N + c) && Math.floor(timer / 3) % 2 === 0
      ctx.fillStyle = flashing ? '#ffffff' : COLORS[gem]
      ctx.beginPath()
      ctx.arc(x + SIZE / 2, y + SIZE / 2 - drop[r][c], SIZE / 2 - 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  if (selected) {
    ctx.lineWidth = 3
    ctx.strokeStyle = '#ffffff'
    ctx.strokeRect(LEFT + selected.c * SIZE + 2, TOP + selected.r * SIZE + 2, SIZE - 4, SIZE - 4)
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, LEFT, 30)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
