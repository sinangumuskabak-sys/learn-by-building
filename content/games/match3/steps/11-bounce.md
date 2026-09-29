---
title: No match, no swap
title_tr: Eşleşme yoksa takas yok
skills: [game.state]
---

# --goal--

A swap only counts if it makes a match. `trySwap` swaps, looks with `findMatches`, and if there is none, swaps back
and says no.

# --goal-tr--

Gerçek oyunda işe yaramayan bir takas **geri seker**: iki mücevher yer değiştirir gibi olur ama eski yerlerine döner.
Yalnız **üçlü yapan** takas kalır.

`trySwap` önce takas edecek, sonra `findMatches` ile bakacak; hiç eşleşme yoksa **geri takas edip** `false`
diyecek. "Dene, bak, gerekirse geri al."

# --code--

```js
swap(a, b)
if (findMatches().size === 0) {
  swap(a, b) // no match: the gems go back
  return false
}
return true
```

# --meaning--

- After swapping, `findMatches().size` is how many matched cells there are.
- If there are none, swapping the same two again puts them back, and `trySwap` returns `false`, so the listener
  treats the click like any other and keeps the selection logic.

# --meaning-tr--

- `findMatches().size === 0` → takastan sonra hiç eşleşen hücre yoksa...
- `swap(a, b)` → aynı iki hücreyi yeniden takas etmek onları **eski yerlerine** koyar.
- `return false` → "takas olmadı". Dinleyici bunu görür: seçim bitmez, tıklanan hücre yeni seçim olur.
- Eşleşme varsa takas kalır ve `return true`.

# --task--

In `trySwap`, between `swap(a, b)` and `return true`, write the `if` block.

# --task-tr--

1. `trySwap` içinde `swap(a, b)` satırının **altına**, `return true` satırının **üstüne** `if` bloğunu yaz.
2. **Çalıştır**: artık yalnız üçlü yapan takaslar kalmalı.

# --tests--

A swap that makes no match should bounce back.
tr: Eşleşme yapmayan bir takas geri sekmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
$.click(32 + 48 * 4, 96 + 48 * 5)
$.click(32 + 48 * 5, 96 + 48 * 5)
assert.strictEqual(board[5][4], (5 + 8) % 6, 'no match: the gems go back')
assert.strictEqual(board[5][5], (5 + 10) % 6)
```

A swap that makes a match should stay.
tr: Eşleşme yapan bir takas kalmalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
assert.isTrue(trySwap({ r: 1, c: 2 }, { r: 0, c: 2 }))
assert.deepEqual(board[0].slice(0, 3), [1, 1, 1], 'the swap stays')
assert.isFalse(trySwap({ r: 3, c: 3 }, { r: 5, c: 3 }), 'only neighbours')
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

let board // board[row][col]: a color index
let selected

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

// Every cell that is part of three or more of the same color in a row or a column.
function findMatches() {
  const cells = new Set()
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const gem = board[r][c]
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
  return true
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
      ctx.fillStyle = COLORS[gem]
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newBoard()
requestAnimationFrame(loop)
```
