---
title: Show the hint
title_tr: İpucunu göster
skills: [game.canvas, prog.arrays]
---

# --goal--

The selection is outlined white, the hint's two gems yellow. Instead of three `if` blocks, one loop goes through a list
of `[cell, color]` pairs and skips the empty ones.

# --goal-tr--

İpucunun iki mücevheri **sarı** çerçeveyle gösterilsin; seçim yine beyaz. Üç ayrı `if` bloğu yazmak yerine üç
`[hücre, renk]` çiftini bir listeye koyup **tek döngüyle** çiziyoruz; hücre yoksa atlıyoruz.

# --code--

```js
// Outline the selected gem, and after five idle seconds, a possible move.
ctx.lineWidth = 3
for (const [cell, color] of [[selected, '#ffffff'], [hint && hint.a, '#fde047'], [hint && hint.b, '#fde047']]) {
  if (!cell) continue
  ctx.strokeStyle = color
  ctx.strokeRect(LEFT + cell.c * SIZE + 2, TOP + cell.r * SIZE + 2, SIZE - 4, SIZE - 4)
}
```

# --meaning--

- The list has three pairs: the selection in white and the hint's two cells in yellow.
- `hint && hint.a` is the hint's first cell if there is a hint, otherwise `null`; writing `hint.a` with no hint would
  be an error.
- Empty cells (`null`) are skipped with `continue`.

# --meaning-tr--

- `[[selected, '#ffffff'], [hint && hint.a, '#fde047'], [hint && hint.b, '#fde047']]` → üç çiftlik liste: seçim beyaz,
  ipucunun iki hücresi sarı.
- `hint && hint.a` → ipucu varsa onun `a`'sı, yoksa `null`. İpucu yokken `hint.a` yazmak **hata** verirdi; `&&` soldaki
  yanlışsa sağa hiç bakmaz.
- `for (const [cell, color] of ...)` → her çifti açıp `cell` ve `color` adlarıyla al.
- `if (!cell) continue` → hücre yoksa atla.
- `strokeRect` artık `selected` yerine `cell` ile çiziyor.

# --task--

In `draw`, replace the whole `if (selected) { ... }` block with the comment and the loop.

# --task-tr--

1. `draw` içindeki `if (selected) { ... }` bloğunun **tamamını** sil; yerine yorum satırını, `lineWidth` satırını ve
   döngüyü yaz.
2. **Çalıştır** ve beş saniye bekle: iki mücevher sarı çerçeveyle belirmeli.

# --tests--

The hint should be outlined in yellow, the selection in white.
tr: İpucu sarı, seçim beyaz çerçevelenmeli.

```js
$.tick(301)
assert.lengthOf($.screen().filter((d) => d.op === 'strokeRect' && d.stroke === '#fde047'), 2)
$.click(32, 96)
$.tick(1)
assert.lengthOf($.screen().filter((d) => d.op === 'strokeRect' && d.stroke === '#ffffff'), 1)
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
let idleFor // frames since the last move
let hint // a possible move, shown after five idle seconds

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
  do newBoard()
  while (!hasMove())
  selected = null
  score = 0
  phase = 'idle'
  drop = board.map((row) => row.map(() => 0))
  idleFor = 0
  hint = null
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

// Is there any swap that would make a match? Try each one, look, and swap back.
function hasMove() {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        if (r + dr >= N || c + dc >= N) continue
        const a = { r, c }
        const b = { r: r + dr, c: c + dc }
        swap(a, b)
        const found = findMatches().size > 0
        swap(a, b)
        if (found) return { a, b }
      }
    }
  }
  return null
}

function trySwap(a, b) {
  if (Math.abs(a.r - b.r) + Math.abs(a.c - b.c) !== 1) return false
  swap(a, b)
  if (findMatches().size === 0) {
    swap(a, b) // no match: the gems go back
    return false
  }
  chain = 0
  idleFor = 0
  hint = null
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
    else {
      phase = 'idle'
      // No swap left anywhere: a fresh board.
      while (!hasMove()) newBoard()
    }
    return
  }
  idleFor += 1
  if (idleFor === 300) hint = hasMove()
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
  // Outline the selected gem, and after five idle seconds, a possible move.
  ctx.lineWidth = 3
  for (const [cell, color] of [[selected, '#ffffff'], [hint && hint.a, '#fde047'], [hint && hint.b, '#fde047']]) {
    if (!cell) continue
    ctx.strokeStyle = color
    ctx.strokeRect(LEFT + cell.c * SIZE + 2, TOP + cell.r * SIZE + 2, SIZE - 4, SIZE - 4)
  }

  // New gems fall in from above the board: paint the score strip again, so they come out from under it.
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, TOP)
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
