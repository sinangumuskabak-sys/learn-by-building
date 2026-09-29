---
title: Flash, and hands off
title_tr: Yanıp sön, dokunma
skills: [game.canvas, game.state]
---

# --goal--

While clearing, the matched gems flash white: every few frames they switch between white and their color. And clicks
are only taken while the game is idle.

# --goal-tr--

Bekleme süresini görünür yapalım: eşleşen mücevherler bu sırada **beyaz yanıp sönsün**. Birkaç karede bir beyaz,
birkaç karede bir kendi renginde.

Bir de: oyun bir şey yaparken (silerken) oyuncu takas yapamasın. Tıklamaları yalnız `'idle'` evresinde kabul ediyoruz.

# --code--

```js
    const flashing = phase === 'clearing' && matched.has(r * N + c) && Math.floor(timer / 3) % 2 === 0
    ctx.fillStyle = flashing ? '#ffffff' : COLORS[gem]

if (phase !== 'idle') return
```

# --meaning--

- A gem flashes if we are clearing, it is one of the matched cells (`matched.has`), and `Math.floor(timer / 3) % 2` is
  0, which switches on and off every 3 frames.
- The listener returns at once unless the game is idle.

# --meaning-tr--

- `phase === 'clearing' && matched.has(r * N + c) && ...` → üç koşul birden: silme evresindeyiz, bu hücre eşleşenlerden
  (`has` "kümede var mı?"; hücre yine tek sayı: `r * N + c`), ve...
- `Math.floor(timer / 3) % 2 === 0` → sayaç 14, 13, 12... azalırken `timer / 3` aşağı yuvarlanınca üç karede bir
  değişir; `% 2` onu 0, 1, 0, 1 yapar. Sonuç: üç kare beyaz, üç kare renkli.
- `flashing ? '#ffffff' : COLORS[gem]` → yanıyorsa beyaz, değilse kendi rengi.
- `if (phase !== 'idle') return` (dinleyicinin ilk satırı) → oyun boşta değilse tıklamayı yok say.

# --task--

1. In `draw`, replace `ctx.fillStyle = COLORS[gem]` with the two lines.
2. Make `if (phase !== 'idle') return` the first line of the click listener.

# --task-tr--

1. `draw` içinde `ctx.fillStyle = COLORS[gem]` satırını sil; yerine iki satırı yaz.
2. Tıklama dinleyicisinin içinde **en üste** `if (phase !== 'idle') return` yaz.
3. **Çalıştır** ve bir üçlü yap: mücevherler yanıp sönüp kaybolmalı.

# --tests--

The matched gems should flash white while clearing.
tr: Silinirken eşleşen mücevherler beyaz yanıp sönmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
$.click(32 + 48 * 2, 96 + 48)
$.click(32 + 48 * 2, 96)
assert.strictEqual(phase, 'clearing')
$.tick(2)
assert.lengthOf($.arcs().filter((a) => a.color === '#ffffff'), 3, 'they flash white')
$.tick(3)
assert.lengthOf($.arcs().filter((a) => a.color === '#ffffff'), 0, 'and back to their color')
```

Clicks should wait while the game is busy.
tr: Oyun meşgulken tıklamalar beklemeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
$.click(32 + 48 * 2, 96 + 48)
$.click(32 + 48 * 2, 96)
$.click(32 + 48 * 6, 96 + 48 * 6)
assert.isNull(selected, 'clicks wait until the clearing is done')
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

let board // board[row][col]: a color index, or -1 while empty
let selected
let score
let phase // 'idle' or 'clearing' (matched gems flash)
let timer
let matched // the cells being cleared

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
  startClearing()
  return true
}

function startClearing() {
  matched = findMatches()
  score += matched.size * 10
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
      write--
    }
    for (let r = write; r >= 0; r--) board[r][c] = randomGem()
  }
  phase = 'idle'
}

function update() {
  if (phase === 'clearing') {
    timer -= 1
    if (timer === 0) collapse()
    return
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
      ctx.arc(x + SIZE / 2, y + SIZE / 2, SIZE / 2 - 6, 0, Math.PI * 2)
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
