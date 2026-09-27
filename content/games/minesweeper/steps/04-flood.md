---
title: Flood fill
title_tr: Taşma dolgusu
skills: [prog.loops, prog.arrays]
---

# --explanation--

Click a `0` in real Minesweeper and a whole area opens. A `0` means "no mines around me", so all its neighbours are
safe to open, and if any of **them** is a `0`, its neighbours are safe too, and so on. This spreading is a **flood
fill**, the same algorithm as the paint bucket in a drawing program.

The natural first idea is recursion: `reveal` calls itself for each neighbour. It works on a small board, but every
call waits on the call stack, and on a big empty board thousands of nested calls can overflow it. The robust version
keeps its **own** list of cells still to visit, a *stack*:

```js
const stack = [start]
while (stack.length > 0) {
  const cell = stack.pop()
  if (cell.revealed) continue           // already done (it may have been added twice)
  cell.revealed = true
  if (cell.count === 0) {
    for (const next of neighbors(cell)) if (!next.revealed && !next.mine) stack.push(next)
  }
}
```

Only `0` cells spread; numbered cells are opened but stop the flood. That is exactly why the board opens up to a
"coastline" of numbers.

This pattern of "a list of things to visit, and a loop that takes one, handles it and adds new ones" is the heart of
graph search. Swap the stack for a queue and you have breadth-first search, used for path finding in maps and mazes.

# --explanation-tr--

Gerçek Mayın Tarlası'nda bir `0`'a tıkla, bütün bir alan açılır. `0`, "çevremde mayın yok" demektir; yani bütün
komşularını açmak güvenlidir, ve **onlardan** biri `0` ise onun komşuları da güvenlidir, ve böyle devam eder. Bu
yayılmaya **taşma dolgusu** (flood fill) denir; bir çizim programındaki boya kovasıyla aynı algoritmadır.

İlk akla gelen fikir özyinelemedir: `reveal` her komşu için kendini çağırır. Küçük bir tahtada çalışır, ama her çağrı
çağrı yığınında bekler ve büyük boş bir tahtada binlerce iç içe çağrı yığını taşırabilir. Sağlam sürüm, hâlâ ziyaret
edilecek hücrelerin **kendi** listesini tutar, bir *yığın*:

```js
const stack = [start]
while (stack.length > 0) {
  const cell = stack.pop()
  if (cell.revealed) continue           // zaten yapıldı (iki kez eklenmiş olabilir)
  cell.revealed = true
  if (cell.count === 0) {
    for (const next of neighbors(cell)) if (!next.revealed && !next.mine) stack.push(next)
  }
}
```

Yalnızca `0` hücreler yayılır; sayılı hücreler açılır ama dolguyu durdurur. Tahtanın sayılardan bir "kıyı şeridine"
kadar açılmasının nedeni tam da budur.

"Ziyaret edilecek şeylerin bir listesi ve birini alıp işleyen, yenilerini ekleyen bir döngü" kalıbı, çizge aramanın
kalbidir. Yığını bir kuyrukla değiştir, haritalarda ve labirentlerde yol bulmada kullanılan genişlik öncelikli aramayı
elde edersin.

# --task--

In `reveal()`, replace "mark the cell revealed" with the stack-based flood fill above, so opening a `0` also opens the
area around it, stopping at numbered cells and never opening a mine.

# --task-tr--

`reveal()` içinde "hücreyi açık işaretle"yi yukarıdaki yığın tabanlı taşma dolgusuyla değiştir; böylece bir `0`'ı açmak
çevresindeki alanı da açsın, sayılı hücrelerde dursun ve asla bir mayını açmasın.

# --tests--

Opening a 0 should open the connected area and its numbered border.
tr: Bir 0'ı açmak bağlı alanı ve onun sayılı sınırını açmalı.

```js
reveal(grid[4][4])
const opened = grid.flat().filter((c) => c.revealed)
assert.isAtLeast(opened.length, 9, 'the first click is a 0, so at least it and its 8 neighbours open')
for (const cell of opened) {
  assert.isFalse(cell.mine)
  if (cell.count === 0) assert.isTrue(neighbors(cell).every((n) => n.revealed), 'every open 0 has all its neighbours open')
}
```

The flood should stop at numbers.
tr: Dolgu sayılarda durmalı.

```js
reveal(grid[4][4])
const border = grid.flat().filter((c) => c.revealed && c.count > 0)
assert.isAbove(border.length, 0)
const beyond = grid.flat().filter((c) => !c.revealed && !c.mine)
for (const cell of beyond) {
  assert.isFalse(neighbors(cell).some((n) => n.revealed && n.count === 0), 'no hidden safe cell touches an open 0')
}
```

Opening a numbered cell should open only that cell.
tr: Sayılı bir hücreyi açmak yalnızca o hücreyi açmalı.

```js
reveal(grid[4][4])
const numbered = grid.flat().find((c) => !c.revealed && !c.mine && c.count > 0)
const before = grid.flat().filter((c) => c.revealed).length
reveal(numbered)
assert.strictEqual(grid.flat().filter((c) => c.revealed).length, before + 1)
```

# --solution--

```js
// Minesweeper, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 9
const CELL = 40
const TOP = 40 // room for the mine counter and the timer
const MINES = 10
const NUMBER_COLORS = [null, '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b45309', '#0891b2', '#111827', '#6b7280']

let grid
let state // 'ready' (before the first click), 'playing' or 'lost'

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col, mine: false, count: 0, revealed: false })),
  )
  state = 'ready'
}

// The up to 8 cells around a cell, skipping the ones that would be off the board.
function neighbors(cell) {
  const list = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const row = cell.row + dr
      const col = cell.col + dc
      if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) list.push(grid[row][col])
    }
  }
  return list
}

// Mines are placed on the first click, never on or next to the clicked cell, so the first click always opens space.
function placeMines(safe) {
  const forbidden = new Set([safe, ...neighbors(safe)])
  const candidates = grid.flat().filter((cell) => !forbidden.has(cell))
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  for (const cell of candidates.slice(0, MINES)) cell.mine = true
  for (const cell of grid.flat()) cell.count = neighbors(cell).filter((n) => n.mine).length
}

function reveal(start) {
  if (start.revealed) return
  if (state === 'ready') {
    placeMines(start)
    state = 'playing'
  }
  if (start.mine) {
    lose()
    return
  }
  // Flood fill with our own stack: open the cell, and keep opening around every empty (0) cell.
  const stack = [start]
  while (stack.length > 0) {
    const cell = stack.pop()
    if (cell.revealed) continue
    cell.revealed = true
    if (cell.count === 0) {
      for (const next of neighbors(cell)) {
        if (!next.revealed && !next.mine) stack.push(next)
      }
    }
  }
}

function lose() {
  state = 'lost'
  for (const cell of grid.flat()) if (cell.mine) cell.revealed = true
}

function cellAt(event) {
  // The canvas may be displayed at a different size than its own pixels, so scale the pointer.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const col = Math.floor(x / CELL)
  const row = Math.floor((y - TOP) / CELL)
  if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return undefined
  return grid[row][col]
}

canvas.addEventListener('click', (event) => {
  if (state === 'lost') return
  const cell = cellAt(event)
  if (cell) reveal(cell)
})

function draw() {
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const cell of grid.flat()) {
    const x = cell.col * CELL
    const y = TOP + cell.row * CELL
    if (cell.revealed) {
      ctx.fillStyle = cell.mine ? '#fca5a5' : '#e2e8f0'
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
      if (cell.mine) ctx.fillText('💣', x + CELL / 2, y + CELL / 2 + 1)
      else if (cell.count > 0) {
        ctx.fillStyle = NUMBER_COLORS[cell.count]
        ctx.fillText(String(cell.count), x + CELL / 2, y + CELL / 2 + 1)
      }
    } else {
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
    }
  }

  ctx.font = 'bold 18px monospace'

  if (state === 'lost') {
    ctx.textAlign = 'center'
    ctx.fillStyle = '#f87171'
    ctx.fillText('Boom!', canvas.width / 2, TOP / 2)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
