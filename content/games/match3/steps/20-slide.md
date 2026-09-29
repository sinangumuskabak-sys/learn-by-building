---
title: Slide down
title_tr: Kayarak in
skills: [game.loop, game.state]
---

# --goal--

Each frame of the falling phase, every `drop` gets `FALL` pixels smaller, down to 0. Only when no gem is still in the
air has the fall ended; then the cascade check runs as before.

# --goal-tr--

Şimdi mücevherleri indiriyoruz: `'falling'` evresinde her karede her `drop` **8 piksel** küçülsün, 0'a inene kadar.
Mücevher de o kadar aşağıda çizileceği için yerine **kayarak** iner.

Hepsi yere inmeden yeni eşleşmelere bakmamalıyız; yoksa oyuncu havadaki mücevherlerin patladığını görürdü. Bu yüzden
"hâlâ hareket eden var mı?" diye soruyoruz.

# --code--

```js
const FALL = 8 // pixels a gem falls per frame

  if (phase === 'falling') {
    let moving = false
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        drop[r][c] = Math.max(0, drop[r][c] - FALL)
        if (drop[r][c] > 0) moving = true
      }
    }
    if (moving) return
```

# --meaning--

- `Math.max(0, drop - FALL)` takes 8 off but never goes below 0.
- `moving` starts false and becomes true if any gem is still above its place.
- While something moves, `update` stops there; once everything has landed, the cascade check below runs.

# --meaning-tr--

- `const FALL = 8` → bir karede düşülen piksel.
- `let moving = false` → "hareket eden yok" diye başla.
- İki döngü bütün hücreleri gezer:
  - `drop[r][c] = Math.max(0, drop[r][c] - FALL)` → 8 azalt; `Math.max(0, ...)` iki sayıdan **büyüğünü** seçtiği için
    0'ın altına inmez.
  - `if (drop[r][c] > 0) moving = true` → hâlâ havadaysa, hareket eden var.
- `if (moving) return` → biri bile havadaysa bu karelik iş bitti; alttaki zincirleme kontrolüne **henüz** gelme.
- Hepsi indiğinde `moving` `false` kalır ve eski satırlar çalışır: yeni eşleşme varsa yeniden sil, yoksa `'idle'`.

# --task--

1. Under `COLORS` write `FALL`.
2. In `update`, at the top of the `'falling'` block, above the `// Landed...` comment, write the lines shown.

# --task-tr--

1. `COLORS` satırının altına `FALL` satırını yaz.
2. `update` içinde `if (phase === 'falling') {` satırının **altına**, `// Landed...` yorumunun üstüne koddaki satırları
   yaz.
3. **Çalıştır** ve bir üçlü yap: mücevherler kayarak inmeli, yenileri yukarıdan süzülmeli.

# --tests--

A gem that fell one row should slide down `FALL` pixels per frame.
tr: Bir satır düşen mücevher her karede `FALL` piksel aşağı kaymalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
drop = board.map((row) => row.map(() => 0))
matched = new Set([7 * N + 3])
collapse()
$.tick(1)
assert.strictEqual(drop[7][3], 48 - FALL)
assert.strictEqual(phase, 'falling', 'still falling')
assert.deepInclude($.arcs(), { x: 32 + 48 * 3, y: 96 + 48 * 7 - 48 + FALL, r: 18, color: COLORS[board[7][3]] })
$.tick(5)
assert.strictEqual(drop[7][3], 0)
$.tick(1)
assert.notStrictEqual(phase, 'falling', 'landed')
```

After a move everything should land and the board should be quiet.
tr: Bir hamleden sonra her şey inmeli ve tahta sakinleşmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
$.click(32 + 48 * 2, 96 + 48)
$.click(32 + 48 * 2, 96)
for (let i = 0; i < 300 && phase !== 'idle'; i++) $.tick(1)
assert.strictEqual(phase, 'idle')
assert.strictEqual(findMatches().size, 0)
for (const row of drop) for (const d of row) assert.strictEqual(d, 0)
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
