---
title: Coloured numbers
title_tr: Renkli sayılar
skills: [game.canvas]
---

# --goal--

An open cell shows how many mines are around it, unless it is 0. Each number has its own colour (1 blue, 2 green, 3
red...), so experienced players read the board at a glance; a lookup list keeps it to one line.

# --goal-tr--

Açık hücre çevresindeki mayın sayısını göstermeli (0 ise hiçbir şey yazmayız). Her sayının **kendi rengi** var: 1 mavi,
2 yeşil, 3 kırmızı... Deneyimli oyuncular tahtayı rakamları okumadan renginden tanır.

Renkleri bir **listede** tutacağız: `NUMBER_COLORS[3]` 3'ün rengi. Uzun bir `if` zinciri yerine tek satır.

# --code--

```js
const NUMBER_COLORS = [null, '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b45309', '#0891b2', '#111827', '#6b7280']

  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

      if (cell.count > 0) {
        ctx.fillStyle = NUMBER_COLORS[cell.count]
        ctx.fillText(String(cell.count), x + CELL / 2, y + CELL / 2 + 1)
      }
```

# --meaning--

- `NUMBER_COLORS[n]` is the colour of the number `n`. Index 0 is `null` because 0 is never written.
- Font and alignment are set once before the loop: text is centred on the given point both ways.
- `String(count)` turns the number into text for `fillText`.

# --meaning-tr--

- `NUMBER_COLORS` → renk listesi; sıra numarası sayının kendisi. İlk eleman `null` ("boş"), çünkü 0'ı hiç yazmıyoruz.
- `ctx.font`, `ctx.textAlign = 'center'`, `ctx.textBaseline = 'middle'` → döngüden **önce** bir kez: yazı verilen
  noktaya hem yatayda hem dikeyde **ortalanır**.
- `if (cell.count > 0)` → sadece çevrede mayın varsa yaz.
- `ctx.fillText(String(cell.count), x + CELL / 2, y + CELL / 2 + 1)` → sayıyı yazıya çevirip (`3` → `'3'`) hücrenin
  ortasına yazar (+1 piksel: rakamlar göze biraz yukarıda durur).

# --task--

1. Under `const MINES = 10`, write `NUMBER_COLORS`.
2. In `draw`, above the `for` loop, write the three text settings.
3. In the `if (cell.revealed)` block, under its `fillRect`, write the `if (cell.count > 0)` block. Press **Run**.

# --task-tr--

1. `const MINES = 10` satırının altına `NUMBER_COLORS` listesini yaz.
2. `draw` içinde `for` döngüsünün **üstüne** üç yazı ayarını yaz.
3. `if (cell.revealed)` bloğunda, `fillRect` satırının altına `if (cell.count > 0) { ... }` bloğunu yaz.
4. **Çalıştır**.

# --tests--

Numbers should be drawn in their colour.
tr: Sayılar kendi renklerinde çizilmeli.

```js
reveal(grid[0][0])
const numbered = grid.flat().find((c) => !c.mine && c.count > 0)
reveal(numbered)
$.tick()
const text = $.screen().find((c) => c.op === 'fillText' && c.args[0] === String(numbered.count))
assert.exists(text)
assert.deepEqual(text.args.slice(1), [numbered.col * 40 + 20, 40 + numbered.row * 40 + 21])
assert.strictEqual(text.fill, NUMBER_COLORS[numbered.count])
```

A 0 should show no number.
tr: 0 hiçbir sayı göstermemeli.

```js
reveal(grid[0][0])
$.tick()
assert.strictEqual(grid[0][0].count, 0)
assert.notInclude($.texts(), '0')
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
  start.revealed = true
}

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
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
      if (cell.count > 0) {
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
