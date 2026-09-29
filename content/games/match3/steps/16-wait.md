---
title: Wait before clearing
title_tr: Silmeden önce bekle
skills: [game.state, game.loop]
---

# --goal--

A `phase` says what the game is doing: `'idle'` (waiting for the player) or `'clearing'`. A matching swap starts the
clearing phase with a timer of 14 frames; `update`, called every frame, counts it down and then collapses.

# --goal-tr--

Şimdi iki yarının arasına **bekleme** koyuyoruz. Oyunun o an ne yaptığını bir değişkende tutacağız: `phase` (evre).

- `'idle'` (boşta) → oyuncuyu bekliyor;
- `'clearing'` (siliniyor) → eşleşen mücevherler 14 kare (yaklaşık dörtte bir saniye) bekliyor.

Bir de her karede çalışan `update` (güncelle) fonksiyonu: evre `'clearing'` ise sayacı bir azaltır, sıfıra inince
`collapse()`'ı çağırır. Buna **durum makinesi** (state machine) denir: oyun her an bir evrededir ve her evrenin kendi
işi vardır.

# --code--

```js
let phase // 'idle' or 'clearing' (matched gems flash)
let timer

function reset() {
  // ...
  phase = 'idle'
}

function startClearing() {
  // ...
  phase = 'clearing'
  timer = 14
}

function collapse() {
  // ...
  phase = 'idle'
}

function update() {
  if (phase === 'clearing') {
    timer -= 1
    if (timer === 0) collapse()
    return
  }
}

function loop() {
  update()
  draw()
```

# --meaning--

- `reset` starts idle. `startClearing` switches to `'clearing'` and sets the timer to 14.
- `trySwap` no longer collapses at once; `update` does it when the timer reaches 0, and `collapse` switches back to
  `'idle'`.
- The loop now calls `update()` before `draw()`.

# --meaning-tr--

- `let phase`, `let timer` → evre ve sayaç.
- `phase = 'idle'` (`reset`'in sonunda) → oyun boşta başlar.
- `phase = 'clearing'` ve `timer = 14` (`startClearing`'in sonunda) → silme evresi başlar, 14 kare sürecek.
- `trySwap` içindeki `collapse()` satırı **siliniyor**: artık hemen değil, sayaç bitince.
- `phase = 'idle'` (`collapse`'ın sonunda) → silme bitti, yine oyuncuyu bekle.
- `function update() {` →
  - `if (phase === 'clearing') {` → silme evresindeysek:
  - `timer -= 1` → sayacı bir azalt; `if (timer === 0) collapse()` → sıfırsa sil ve düşür.
  - `return` → bu karede başka iş yok.
- `update()` (`loop` içinde, `draw()`'dan önce) → her karede önce durumu ilerlet, sonra çiz.

# --task--

1. Above `let matched` write `let phase` and `let timer`.
2. In `reset`, at the end, write `phase = 'idle'`.
3. In `startClearing`, at the end, write the two `phase`/`timer` lines.
4. In `trySwap`, delete the `collapse()` line.
5. In `collapse`, at the end (after the column loop), write `phase = 'idle'`.
6. Above `function cellAt(event) {` write `update`, and call `update()` in `loop` above `draw()`.

# --task-tr--

1. `let matched ...` satırının **üstüne** `let phase ...` ve `let timer` yaz.
2. `reset` içinde en sona `phase = 'idle'` yaz.
3. `startClearing` içinde en sona `phase = 'clearing'` ve `timer = 14` yaz.
4. `trySwap` içindeki `collapse()` satırını sil.
5. `collapse` içinde en sona, sütun döngüsünün kapanan `}` satırının altına `phase = 'idle'` yaz.
6. `function cellAt(event) {` satırının **üstüne** `update` fonksiyonunu yaz; `loop` içinde `draw()`'un üstüne
   `update()` yaz.
7. **Çalıştır** ve bir üçlü yap: mücevherler bir an durup sonra kaybolmalı.

# --tests--

A matching swap should wait 14 frames before clearing.
tr: Eşleşen bir takas silmeden önce 14 kare beklemeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
assert.strictEqual(phase, 'idle')
assert.isTrue(trySwap({ r: 1, c: 2 }, { r: 0, c: 2 }))
assert.strictEqual(phase, 'clearing')
assert.strictEqual(timer, 14)
$.tick(13)
assert.deepEqual(board[0].slice(0, 3), [1, 1, 1], 'the matched gems stay for a moment')
$.tick(1)
assert.strictEqual(phase, 'idle')
for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) assert.isAtLeast(board[r][c], 0)
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
