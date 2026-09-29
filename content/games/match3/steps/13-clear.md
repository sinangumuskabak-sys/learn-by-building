---
title: Clear the match
title_tr: Eşleşeni sil
skills: [prog.arrays, game.state]
---

# --goal--

After a matching swap the matched gems disappear, 10 points each. An empty cell is marked `-1`, which is no color;
`findMatches` and `draw` skip empty cells.

# --goal-tr--

Eşleşen mücevherler **kaybolsun** ve her biri 10 puan getirsin. Kaybolan hücreyi `-1` ile işaretliyoruz: `-1` hiçbir
rengin sırası değil, yani **boş**.

Tahtada artık boş hücreler olabileceği için iki yer onları atlamalı: `findMatches` (üç boşluk yan yana bir "eşleşme"
değildir) ve `draw` (boşun rengi yok). Bu adımda deliklere bir şey dolmayacak; onu bir sonraki adımda yapacağız.

# --code--

```js
let board // board[row][col]: a color index, or -1 while empty

      const gem = board[r][c]
      if (gem < 0) continue

  const matched = findMatches()
  score += matched.size * 10
  for (const cell of matched) board[Math.floor(cell / N)][cell % N] = -1
```

# --meaning--

- `trySwap`, after a swap that matches: 10 points per matched gem, then every matched cell becomes `-1`.
- A cell number turns back into a row with `Math.floor(cell / N)` and a column with `cell % N`.
- `if (gem < 0) continue` skips empty cells in both `findMatches` and the drawing loop.

# --meaning-tr--

- `const matched = findMatches()` → eşleşen hücreler (bir küme).
- `score += matched.size * 10` → her mücevher 10 puan: üçlü 30, dörtlü 40.
- `for (const cell of matched)` → kümenin her elemanını gez.
- `board[Math.floor(cell / N)][cell % N] = -1` → hücre sayısını satıra (`Math.floor(cell / 8)`) ve sütuna
  (`cell % 8`) geri çevir ve orayı **boş** yap.
- `if (gem < 0) continue` → iki yerde (`findMatches` ve `draw` döngüsü): hücre boşsa atla, sonrakine geç.
- `let board` yorumu da `-1`'i anlatacak şekilde güncelleniyor.

# --task--

1. Update the comment of `let board`.
2. In `findMatches`, under `const gem = board[r][c]`, write `if (gem < 0) continue`.
3. In `trySwap`, above the last `return true`, write the three lines.
4. In `draw`, under `const gem = board[r][c]`, write `if (gem < 0) continue` too.

# --task-tr--

1. `let board` satırının yorumunu koddaki gibi yap.
2. `findMatches` içinde `const gem = board[r][c]` satırının **altına** `if (gem < 0) continue` yaz.
3. `trySwap` içinde en sondaki `return true` satırının **üstüne** üç satırı yaz.
4. `draw` içinde de `const gem = board[r][c]` satırının **altına** `if (gem < 0) continue` yaz.
5. **Çalıştır** ve bir üçlü yap: mücevherler kaybolmalı, yerlerinde delik kalmalı, skor artmalı.

# --predict--

You make a match. What fills the holes?
- [ ] The gems above fall into them
- [x] Nothing yet: the holes stay empty
  Falling comes in the next step.
- [ ] New random gems appear in them

# --predict-tr--

Bir üçlü yapıyorsun. Delikleri ne doldurur?
- [ ] Üstlerindeki mücevherler içine düşer
- [x] Henüz hiçbir şey: delikler boş kalır
  Düşme bir sonraki adımda.
- [ ] İçlerinde yeni rastgele mücevherler belirir

# --tests--

A matching swap should clear the matched gems and score 10 each.
tr: Eşleşen bir takas eşleşen mücevherleri silmeli ve her birine 10 puan vermeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
assert.isTrue(trySwap({ r: 1, c: 2 }, { r: 0, c: 2 }))
assert.deepEqual(board[0].slice(0, 3), [-1, -1, -1])
assert.strictEqual(score, 30)
$.tick(1)
assert.lengthOf($.arcs().filter((a) => a.r === 18), 61, 'empty cells are not drawn')
```

Empty cells should never count as a match.
tr: Boş hücreler asla eşleşme sayılmamalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[4][2] = board[4][3] = board[4][4] = -1
assert.strictEqual(findMatches().size, 0)
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
  const matched = findMatches()
  score += matched.size * 10
  for (const cell of matched) board[Math.floor(cell / N)][cell % N] = -1
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
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
