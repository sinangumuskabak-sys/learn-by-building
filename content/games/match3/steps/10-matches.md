---
title: Find every match
title_tr: Bütün eşleşmeleri bul
skills: [prog.arrays, prog.loops]
---

# --goal--

`findMatches` finds every cell that is part of three or more of one color in a row or a column. From each cell it
looks right and down; it counts a run only from its first gem, and collects the cells in a `Set`.

# --goal-tr--

Oyunun kalbi: tahtada aynı renkten **üç ya da daha fazla** yan yana ya da alt alta dizilmiş mücevherleri bulmak.
`findMatches` (eşleşmeleri bul) böyle bir sıranın parçası olan **her hücreyi** bulacak.

Yöntem: her hücreden iki yöne bakarız, **sağa** ve **aşağı**. O yönde aynı renk kaç hücre devam ediyor, sayarız; 3
ya da fazlaysa hepsini listeye ekleriz. Bir incelik: bir sırayı yalnız **ilk** mücevherinden sayarız; sıranın
ortasındaki bir hücreden yeniden saymayız.

Ekranda bir şey değişmeyecek; kontroller fonksiyonu deniyor.

# --code--

```js
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
```

# --meaning--

- `[dr, dc]` is a direction: `[0, 1]` is right (same row, next column), `[1, 0]` is down.
- `(pr, pc)` is the cell just before this one in that direction. If it has the same color, this cell is inside a run
  we already counted: `continue` skips it.
- `while` counts how far the color goes on; `length++` adds one.
- A run of 3 or more adds all its cells. A cell is stored as one number, `r * N + c`, because a `Set` compares objects
  by identity, not content; a `Set` keeps each value once, so a gem in both a row and a column counts once.

# --meaning-tr--

- `const cells = new Set()` → boş bir **küme** (Set). Kümeye aynı şeyi iki kez eklesen de bir kez tutar. Bir mücevher
  hem yatay hem dikey bir sıranın parçası olabilir (L ya da T şekli); küme onu bir kez sayar.
- `for (const [dr, dc] of [[0, 1], [1, 0]])` → iki **yön**: `[0, 1]` sağa (satır aynı, sütun +1), `[1, 0]` aşağı.
  Her turda çiftin ilk sayısı `dr` (satır farkı), ikincisi `dc` (sütun farkı).
- `const pr = r - dr`, `const pc = c - dc` → o yönde **bir önceki** hücre. Tahtanın içinde ve aynı renkse bu hücre
  zaten saydığımız bir sıranın ortası: `continue` ile atla.
- `let length = 1` → bu mücevher 1.
- `while (... && board[r + dr * length][c + dc * length] === gem) length++` → `while` koşul doğru olduğu sürece tekrar
  eder: tahtanın içinde kaldıkça ve renk aynı gittikçe `length`'i 1 artır. `r + dr * length` o yönde `length` adım
  ötedeki satır.
- `if (length >= 3) for (...) cells.add(...)` → sıra en az 3 ise bütün hücrelerini kümeye ekle.
- `(r + dr * i) * N + (c + dc * i)` → hücreyi **tek bir sayı** olarak sakla: satır × 8 + sütun (satır 2, sütun 3 →
  19). Neden nesne değil? Küme iki nesneyi içerikleriyle değil **kimlikleriyle** karşılaştırır; `{ r: 2, c: 3 }` başka
  bir `{ r: 2, c: 3 }`'e asla eşit sayılmaz. Geri çevirmek kolay: satır `Math.floor(19 / 8)` = 2, sütun `19 % 8` = 3.
- `return cells` → eşleşen bütün hücreler. `cells.size` kaç tane olduğunu verir.

# --task--

Write the comment and `findMatches` above `function swap(a, b) {`.

# --task-tr--

1. Yorum satırını ve `findMatches` fonksiyonunu `function swap(a, b) {` satırının **üstüne** yaz; altında bir boş
   satır kalsın.
2. Uzun `while` satırını dikkatle yaz: tek satır.
3. **Çalıştır**: ekran değişmez; kontroller fonksiyonu deniyor.

# --hint--

`cells.add(...)` takes one number: `(r + dr * i) * N + (c + dc * i)`.

# --hint-tr--

`cells.add(...)` tek bir sayı alır: `(r + dr * i) * N + (c + dc * i)`.

# --tests--

`findMatches` should find runs of three and more in rows and columns, and nothing on a board without runs.
tr: `findMatches` satırlarda ve sütunlarda üç ve daha uzun sıraları bulmalı, sırasız bir tahtada hiçbir şey bulmamalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
assert.strictEqual(findMatches().size, 0)
board[2] = [3, 3, 3, 3, 1, 2, 2, 2]
board[5][6] = board[6][6] = board[7][6] = 5
assert.sameMembers([...findMatches()], [16, 17, 18, 19, 21, 22, 23, 46, 54, 62])
```

A gem in both a row and a column should count once.
tr: Hem satırda hem sütunda olan bir mücevher bir kez sayılmalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[3][2] = board[3][3] = board[3][4] = 0
board[4][4] = board[5][4] = 0
assert.sameMembers([...findMatches()], [26, 27, 28, 36, 44])
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
