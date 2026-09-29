---
title: A hint after five seconds
title_tr: Beş saniye sonra ipucu
skills: [game.state, game.loop]
---

# --goal--

`hasMove` also gives a hint. `idleFor` counts the idle frames; after 300 (five seconds) the hint is a possible move.
Making a move clears it.

# --goal-tr--

Aynı fonksiyon bir özellik daha veriyor: **ipucu**. Oyuncu beş saniye hiçbir şey yapmazsa olası bir hamleyi
gösterelim.

Boşta geçen kareleri sayıyoruz: `idleFor`. 300 kare (saniyede 60 kare × 5) olunca `hint = hasMove()`. Bir hamle
yapılınca sayaç da ipucu da sıfırlanır. Bu adımda ipucunu yalnız hesaplıyoruz; çizimi bir sonraki adımda.

# --code--

```js
let idleFor // frames since the last move
let hint // a possible move, shown after five idle seconds

function reset() {
  // ...
  idleFor = 0
  hint = null
}

function trySwap(a, b) {
  // ...
  chain = 0
  idleFor = 0
  hint = null
  startClearing()

function update() {
  // ...
  if (phase === 'falling') {
    // ...
    return
  }
  idleFor += 1
  if (idleFor === 300) hint = hasMove()
}
```

# --meaning--

- `reset` and every move set `idleFor` to 0 and `hint` to `null`.
- The `'falling'` block now ends with `return`, so the lines after it only run while the game is idle.
- Each idle frame adds 1; at exactly 300 the hint is found.

# --meaning-tr--

- `let idleFor`, `let hint` → boş kare sayacı ve ipucu (bir hamle `{ a, b }` ya da `null`).
- `idleFor = 0`, `hint = null` → `reset`'te ve `trySwap`'ta (her başarılı hamlede): sayaç ve ipucu sıfırlanır.
- `return` (`'falling'` bloğunun sonunda) → düşme evresindeyken alttaki satırlara gelme. Artık `update`'in sonuna
  yalnız `'idle'` evresinde gelinir.
- `idleFor += 1` → her boş karede bir artır.
- `if (idleFor === 300) hint = hasMove()` → tam 300. karede bir hamle bul. `===` 300'de yalnız bir kez doğru olduğu
  için 112 çifti her karede değil, bir kez deneriz.

# --task--

1. Under `let drop` write `let idleFor` and `let hint`.
2. In `reset`, at the end, and in `trySwap`, under `chain = 0`, write `idleFor = 0` and `hint = null`.
3. In `update`, write `return` at the end of the `'falling'` block, and the two `idleFor` lines at the end of the function.

# --task-tr--

1. `let drop ...` satırının altına `let idleFor ...` ve `let hint ...` yaz.
2. `reset` içinde en sona ve `trySwap` içinde `chain = 0` satırının altına `idleFor = 0` ve `hint = null` yaz.
3. `update` içinde `'falling'` bloğunun kapanan `}` satırının hemen üstüne (`else { ... }` bloğunun altına) `return`
   yaz; fonksiyonun en sonuna iki `idleFor` satırını yaz.
4. **Çalıştır**: ekran değişmez; kontroller ipucunu deniyor.

# --tests--

After 300 idle frames `hint` should be a possible move.
tr: 300 boş kareden sonra `hint` olası bir hamle olmalı.

```js
$.tick(299)
assert.isNull(hint)
$.tick(1)
assert.isNotNull(hint)
swap(hint.a, hint.b)
assert.isAbove(findMatches().size, 0, 'the hint really makes a match')
```

Making a move should clear the hint and start counting again.
tr: Bir hamle yapmak ipucunu silmeli ve saymaya yeniden başlamalı.

```js
$.tick(300)
assert.isTrue(trySwap(hint.a, hint.b))
assert.isNull(hint)
assert.strictEqual(idleFor, 0)
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
  if (selected) {
    ctx.lineWidth = 3
    ctx.strokeStyle = '#ffffff'
    ctx.strokeRect(LEFT + selected.c * SIZE + 2, TOP + selected.r * SIZE + 2, SIZE - 4, SIZE - 4)
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
