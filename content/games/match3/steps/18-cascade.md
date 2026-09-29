---
title: Cascades
title_tr: Zincirleme
skills: [game.state]
---

# --goal--

Fallen and new gems can line up by themselves: a cascade. After a collapse the game is `'falling'`; then it looks for
new matches and clears again, each round of the chain worth more: 10, 20, 30 points a gem.

# --goal-tr--

Düşen ve yeni gelen mücevherler **kendiliğinden** sıraya girebilir. Oyunun en güzel anı bu: **zincirleme** (cascade).
Sen bir hamle yaparsın, tahta birkaç tur kendi kendine patlar.

Yeni bir evre ekliyoruz: `'falling'` (düşüyor). `collapse` bittiğinde oyun bu evreye geçer; sonra `update` bakar:
yeni eşleşme var mı? Varsa yeniden silme evresi, yoksa `'idle'`.

Zincirin her turu daha değerli: ilk silme mücevher başına 10, ikincisi 20, üçüncüsü 30 puan. Kaçıncı turda olduğumuzu
`chain` (zincir) sayar.

# --code--

```js
let chain // how many clears in a row this move has caused
let phase // 'idle', 'clearing' (matched gems flash) or 'falling'

function trySwap(a, b) {
  // ...
  chain = 0
  startClearing()
  return true
}

function startClearing() {
  matched = findMatches()
  chain += 1
  score += matched.size * 10 * chain // cascades are worth more and more
  // ...
}

function collapse() {
  // ...
  phase = 'falling'
}

function update() {
  // ...
  if (phase === 'falling') {
    // Landed: new matches make a cascade; otherwise the move is over.
    if (findMatches().size > 0) startClearing()
    else phase = 'idle'
  }
}
```

# --meaning--

- Each move starts a chain at 0; each clear adds 1 and multiplies the points by it.
- `collapse` ends in `'falling'`. On the next frame `update` checks the board: new matches start another clear,
  otherwise the move is over.

# --meaning-tr--

- `let chain` → bu hamlenin kaçıncı silme turunda olduğumuz.
- `phase` yorumuna `'falling'` ekleniyor.
- `chain = 0` (`trySwap`) → her hamle zinciri sıfırdan başlatır.
- `chain += 1` (`startClearing`) → her silme bir tur; `* chain` → ilk tur ×1, ikinci ×2, üçüncü ×3.
- `phase = 'falling'` (`collapse`'ın sonunda) → artık `'idle'` değil: mücevherler "düştü", bakmamız gereken şey var.
- `if (phase === 'falling') {` (`update`) →
  - `findMatches().size > 0` → düşenler yeni eşleşme yaptıysa `startClearing()`: yeni bir tur.
  - `else phase = 'idle'` → yapmadıysa hamle bitti.

# --task--

1. Above `let phase` write `let chain`, and add `'falling'` to the comment of `let phase`.
2. In `trySwap`, write `chain = 0` above `startClearing()`.
3. In `startClearing`, count the chain and multiply the points.
4. At the end of `collapse`, change `'idle'` to `'falling'`.
5. In `update`, under the `'clearing'` block, write the `'falling'` block.

# --task-tr--

1. `let phase` satırının **üstüne** `let chain ...` yaz; `let phase` yorumunu koddaki gibi yap.
2. `trySwap` içinde `startClearing()` satırının **üstüne** `chain = 0` yaz.
3. `startClearing` içinde `matched = ...` satırının altına `chain += 1` yaz; puan satırını koddaki gibi yap.
4. `collapse`'ın sonundaki `phase = 'idle'` satırını `phase = 'falling'` yap.
5. `update` içinde `'clearing'` bloğunun kapanan `}` satırının **altına** `'falling'` bloğunu yaz.
6. **Çalıştır** ve oyna: bazen tahta kendi kendine birkaç kez patlamalı.

# --tests--

Each round of a chain should be worth more.
tr: Zincirin her turu daha değerli olmalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[4][1] = board[4][2] = board[4][3] = 2
chain = 0
startClearing()
assert.strictEqual(score, 30, 'first round: 10 a gem')
startClearing()
assert.strictEqual(score, 90, 'second round: 20 a gem')
assert.strictEqual(chain, 2)
```

After a move, no matches should be left on the board.
tr: Bir hamleden sonra tahtada hiç eşleşme kalmamalı.

```js
for (let game = 0; game < 20; game++) {
  board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
  score = 0
  assert.isTrue(trySwap({ r: 1, c: 2 }, { r: 0, c: 2 }))
  for (let i = 0; i < 300 && phase !== 'idle'; i++) $.tick(1)
  assert.strictEqual(phase, 'idle')
  assert.isAtLeast(score, 30)
  assert.strictEqual(findMatches().size, 0, 'no matches are left after a move')
}
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
let chain // how many clears in a row this move has caused
let phase // 'idle', 'clearing' (matched gems flash) or 'falling'
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
      write--
    }
    for (let r = write; r >= 0; r--) board[r][c] = randomGem()
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
