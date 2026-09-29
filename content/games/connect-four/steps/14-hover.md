---
title: The next disc
title_tr: Sıradaki disk
skills: [game.input, game.canvas]
---

# --goal--

Above the board, the next disc floats over the column under the mouse, in the color of the player whose turn it is. It
shows where a click will drop.

# --goal-tr--

Tahtanın üstünde, farenin olduğu sütunun üzerinde **sıradaki disk** beklesin; rengi sırası gelen oyuncunun rengi. Böylece
tıklamadan önce diskin nereye düşeceğini görürsün.

# --code--

```js
canvas.addEventListener('pointermove', (event) => {
  hoverCol = colAt(event)
})

  // The next disc waits above the column it would drop into.
  disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[turn])
```

# --meaning--

- `pointermove` happens whenever the mouse moves over the canvas: it updates `hoverCol`.
- The disc is drawn in the middle of that column, half a cell above the board (`TOP - CELL / 2` = 64).

# --meaning-tr--

- `'pointermove'` → fare canvas'ın üstünde **hareket edince** olur; her seferinde `hoverCol`'u güncelleriz.
- `hoverCol * CELL + CELL / 2` → seçili sütunun ortası.
- `TOP - CELL / 2` → tahtanın yarım hücre üstü: 96 - 32 = 64.
- `COLORS[turn]` → sırası gelen oyuncunun rengi.
- Bu disk mavi tahtadan **önce** çiziliyor; tahtanın üstündeki boşlukta durduğu için örtülmez.

# --task--

1. Above the `pointerdown` listener write the `pointermove` listener.
2. In `draw`, above `ctx.fillStyle = '#1d4ed8'`, write the comment and the disc line, followed by an empty line.

# --task-tr--

1. `canvas.addEventListener('pointerdown', ...` satırının **üstüne** `pointermove` dinleyicisini yaz.
2. `draw` içinde `ctx.fillStyle = '#1d4ed8'` satırının **üstüne** yorum satırını ve disk satırını yaz; altında bir boş
   satır kalsın.
3. **Çalıştır** ve fareyi tahtanın üstünde gezdir: disk seni izlemeli.

# --tests--

The next disc should hover over the column under the mouse.
tr: Sıradaki disk farenin altındaki sütunun üstünde durmalı.

```js
$.move(100, 300) // column 1
$.tick(1)
const above = $.arcs().filter((a) => a.y === 64)
assert.deepEqual(above.map((a) => [a.x, a.color]), [[96, '#ef4444']])
```

After a move it should be the other player's color.
tr: Bir hamleden sonra öbür oyuncunun renginde olmalı.

```js
$.click(224, 300)
$.tick(1)
const above = $.arcs().filter((a) => a.y === 64)
assert.deepEqual(above.map((a) => [a.x, a.color]), [[224, '#facc15']])
```

# --solution--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 7
const ROWS = 6
const CELL = 64
const TOP = 96 // room above the board for the messages and the next disc
const COLORS = { 1: '#ef4444', 2: '#facc15' }

let board // board[row][col]: 0 empty, 1 or 2
let turn
let hoverCol = 3

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  turn = 1
}

// The lowest empty row in a column, or -1 when the column is full.
function dropRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row
  }
  return -1
}

function play(col) {
  if (dropRow(col) === -1) return
  const row = dropRow(col)
  board[row][col] = turn
  turn = 3 - turn
}

function colAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  return Math.min(COLS - 1, Math.max(0, Math.floor(x / CELL)))
}

canvas.addEventListener('pointermove', (event) => {
  hoverCol = colAt(event)
})
canvas.addEventListener('pointerdown', (event) => {
  hoverCol = colAt(event)
  play(hoverCol)
})

function disc(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // The next disc waits above the column it would drop into.
  disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[turn])

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
