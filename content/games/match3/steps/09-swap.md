---
title: Swap two neighbours
title_tr: İki komşuyu takas et
skills: [game.input, prog.functions]
---

# --goal--

A move is two clicks. The second one decides: a neighbour of the selected gem swaps with it; the same gem again
unselects it; any other gem becomes the new selection.

# --goal-tr--

Bir hamle **iki tıklamadır**: ilki bir mücevheri seçer, ikincisi eşini. İkinci tıklamanın kuralları:

- seçili mücevherin **komşusu** (tam solu, sağı, üstü ya da altı): ikisi **yer değiştirir**;
- **aynı** mücevher yine: seçim kalkar;
- başka herhangi bir mücevher: o yeni seçim olur; yanlış ilk seçim kolayca düzelir.

İki bardaktaki suyu değiştirmek için üçüncü bir bardak gerekir; iki hücreyi değiştirmek için de bir geçici değişken.

# --code--

```js
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

  if (selected && trySwap(selected, cell)) selected = null
  else selected = selected && selected.r === cell.r && selected.c === cell.c ? null : cell
```

# --meaning--

- `swap` keeps `a`'s gem in `gem`, puts `b`'s into `a`, then the kept one into `b`.
- Two cells are neighbours when their row and column differences add up to exactly 1 (a diagonal is 2).
  `Math.abs` drops the minus sign.
- In the listener: if something is selected and the swap works, the selection ends. Otherwise the same cell unselects,
  and any other cell becomes the selection.

# --meaning-tr--

- `function swap(a, b) {` → `a` ve `b` birer hücre (`{ r, c }`).
  - `const gem = board[a.r][a.c]` → `a`'daki mücevheri **yedekle**. Yedeklemeden `a`'ya yazsaydık eski değer
    kaybolurdu.
  - `board[a.r][a.c] = board[b.r][b.c]` → `a`'ya `b`'yi koy; `board[b.r][b.c] = gem` → `b`'ye yedeği koy.
- `Math.abs(a.r - b.r) + Math.abs(a.c - b.c) !== 1` → `Math.abs` sayının eksisini atar (`Math.abs(-1)` = 1). Satır ve
  sütun farklarının toplamı tam 1 ise komşudur; çaprazın farkı 2. `!==` "eşit değil": komşu değilse `false` ile çık.
- `if (selected && trySwap(selected, cell)) selected = null` → seçili bir şey varsa **ve** takas olduysa seçim biter.
  `&&` soldaki yanlışsa sağdakini **hiç çalıştırmaz**: seçim yokken takas denenmez.
- `else selected = ... ? null : cell` → takas olmadıysa: tıklanan hücre seçili hücrenin **aynısıysa** seçimi kaldır
  (`null`), değilse yeni seçim o.

# --task--

1. Above `function cellAt(event) {` write `swap` and `trySwap`.
2. In the listener, replace `selected = cell` with the two lines.

# --task-tr--

1. `function cellAt(event) {` satırının **üstüne** `swap` ve `trySwap` fonksiyonlarını yaz; altlarında birer boş satır
   kalsın.
2. Tıklama dinleyicisinde `selected = cell` satırını sil; yerine iki satırı yaz.
3. **Çalıştır**: bir mücevhere, sonra komşusuna tıkla: yer değiştirmeli.

# --hint--

`Math.abs(a.r - b.r) + Math.abs(a.c - b.c)` must be exactly 1 for neighbours.

# --hint-tr--

Komşular için `Math.abs(a.r - b.r) + Math.abs(a.c - b.c)` tam 1 olmalı.

# --tests--

Clicking a neighbour of the selected gem should swap the two.
tr: Seçili mücevherin bir komşusuna tıklamak ikisini takas etmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
$.click(32 + 48 * 4, 96 + 48 * 5)
$.click(32 + 48 * 5, 96 + 48 * 5)
assert.strictEqual(board[5][4], (5 + 10) % 6)
assert.strictEqual(board[5][5], (5 + 8) % 6)
assert.isNull(selected)
```

Clicking the selected gem again should unselect it; a far gem should become the new selection.
tr: Seçili mücevhere yeniden tıklamak seçimi kaldırmalı; uzaktaki bir mücevher yeni seçim olmalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
$.click(32 + 48 * 2, 96 + 48 * 3)
$.click(32 + 48 * 2, 96 + 48 * 3)
assert.isNull(selected, 'clicking the selected gem again unselects it')
$.click(32, 96)
$.click(32 + 48 * 3, 96 + 48 * 3)
assert.strictEqual(board[0][0], 0, 'a far gem is not swapped')
assert.deepEqual(selected, { r: 3, c: 3 }, 'it becomes the new selection')
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
