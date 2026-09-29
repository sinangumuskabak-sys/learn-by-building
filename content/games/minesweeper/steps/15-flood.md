---
title: Flood fill
title_tr: Taşma dolgusu
skills: [prog.loops, prog.arrays]
---

# --goal--

A `0` means "no mines around me", so all its neighbours are safe to open, and if one of them is a `0` too, its
neighbours are safe as well. This spreading is a **flood fill**. We keep our own list of cells to open, a stack, and
loop until it is empty.

# --goal-tr--

Gerçek oyunda bir `0`'a tıklayınca koca bir alan birden açılır. Çünkü `0` "çevremde hiç mayın yok" demek: bütün
komşularını açmak **güvenli**. O komşulardan biri de `0` ise onun komşuları da güvenli... Böyle yayılır gider. Buna
**taşma dolgusu** (flood fill) denir; resim programlarındaki boya kovası aynı şeyi yapar.

Açılacak hücreleri bir **yapılacaklar listesinde** biriktireceğiz: bir **yığın** (stack). Masadaki kâğıt yığını gibi:
en üste koyarsın (`push`), en üsttekini alırsın (`pop`). Liste boşalana kadar: bir hücre al, aç, `0` ise komşularını
listeye ekle.

# --code--

```js
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
```

# --meaning--

- `while (condition)` repeats as long as the condition is true: here, while cells are waiting.
- `pop()` takes the last cell off the stack. A cell may have been added twice; `continue` skips it if already open.
- Only `0` cells spread. Numbered cells are opened but stop the flood, which is why an open area has a border of
  numbers.
- Recursion (`reveal` calling itself) would also work on a small board, but a huge empty board could make thousands of
  nested calls and overflow the call stack; our own list never does.

# --meaning-tr--

- `const stack = [start]` → liste tıklanan hücreyle başlar.
- `while (stack.length > 0) { ... }` → **while döngüsü**: koşul doğru olduğu sürece tekrar eder. "Listede hâlâ hücre
  var" demek.
- `stack.pop()` → listenin **son** elemanını çıkarır ve verir.
- `if (cell.revealed) continue` → zaten açıksa (listeye iki kez girmiş olabilir) atla, sonrakine geç.
- `cell.revealed = true` → hücreyi aç.
- `if (cell.count === 0)` → sadece **0** hücreler yayılır. Sayılı hücre açılır ama yayılmayı durdurur; açılan alanın
  kenarında sayıların dizilmesinin sebebi bu.
- İçteki `for` komşuları gezer; kapalı (`!next.revealed`) ve mayınsız (`!next.mine`) olanları listeye ekler.
- Neden `reveal` kendini çağırmıyor? Küçük tahtada çalışırdı; ama her çağrı bir öncekinin bitmesini bekler ve çok büyük
  boş bir tahtada binlerce iç içe çağrı tarayıcının sınırını aşabilir. Kendi listemizi tutmak bu sorunu yaşamaz.

# --task--

In `reveal`, replace `start.revealed = true` with the comment and the flood fill. Press **Run** and click.

# --task-tr--

`reveal` içindeki `start.revealed = true` satırını **sil**, yerine yorum satırını ve taşma dolgusunu yaz. **Çalıştır**
ve bir hücreye tıkla: ilk tıklamada koca bir alan açılmalı, kenarında sayılar dizilmeli.

# --hint--

The flood uses `cell` (the one taken off the stack), not `start`, inside the loop.

# --hint-tr--

Döngünün içinde `start` değil, yığından alınan `cell` kullanılır.

# --tests--

Opening a 0 should open the connected area and its numbered border.
tr: Bir 0'ı açmak bağlı alanı ve sayılı kenarını açmalı.

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
assert.isAbove(grid.flat().filter((c) => c.revealed && c.count > 0).length, 0)
for (const cell of grid.flat().filter((c) => !c.revealed && !c.mine)) {
  assert.isFalse(neighbors(cell).some((n) => n.revealed && n.count === 0), 'no hidden safe cell touches an open 0')
}
```

Opening a numbered cell should open only that cell.
tr: Sayılı bir hücreyi açmak sadece o hücreyi açmalı.

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
let state // 'ready' (before the first click), 'playing', 'won' or 'lost'

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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
