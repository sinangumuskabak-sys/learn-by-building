---
title: Show the selection
title_tr: Seçimi göster
skills: [game.canvas]
---

# --goal--

The selected gem gets a white frame, drawn after all the gems so it is on top.

# --goal-tr--

Oyuncu neyi seçtiğini görmeli: seçili mücevherin karesine beyaz bir **çerçeve** çiziyoruz. Bütün mücevherlerden
**sonra** çiziliyor ki üstlerinde görünsün.

# --code--

```js
if (selected) {
  ctx.lineWidth = 3
  ctx.strokeStyle = '#ffffff'
  ctx.strokeRect(LEFT + selected.c * SIZE + 2, TOP + selected.r * SIZE + 2, SIZE - 4, SIZE - 4)
}
```

# --meaning--

- `if (selected)` is false while nothing is selected (`undefined` or `null`).
- `strokeRect(x, y, width, height)` draws an empty rectangle with `strokeStyle` and `lineWidth`. It is 2 pixels inside
  the square on each side.

# --meaning-tr--

- `if (selected) {` → bir şey seçiliyse. Hiçbir şey seçili değilken `selected` boştur (`undefined` ya da `null`) ve
  `if` içinde **yanlış** sayılır.
- `ctx.lineWidth = 3` → çizgi kalınlığı. `ctx.strokeStyle = '#ffffff'` → çizgi rengi: beyaz.
- `ctx.strokeRect(x, y, en, boy)` → içi **boş** bir dikdörtgen (yalnız kenarları). Karenin her kenarından 2 piksel
  içeride: `+ 2` ve `SIZE - 4`.

# --task--

In `draw`, after the two loops (under their closing `}` lines), write the `if` block.

# --task-tr--

1. `draw` içinde iki döngünün kapanan `}` satırlarının **altına** `if` bloğunu yaz (`draw`'ı kapatan `}`'den önce).
2. **Çalıştır** ve bir mücevhere tıkla: beyaz bir çerçeve görmelisin.

# --tests--

A clicked gem should get a white frame.
tr: Tıklanan mücevher beyaz bir çerçeve almalı.

```js
$.tick(1)
assert.lengthOf($.screen().filter((d) => d.op === 'strokeRect'), 0, 'nothing selected yet')
$.click(32 + 48 * 2, 96 + 48 * 3)
$.tick(1)
const outline = $.screen().filter((d) => d.op === 'strokeRect')
assert.lengthOf(outline, 1)
assert.strictEqual(outline[0].stroke, '#ffffff')
assert.deepEqual(outline[0].args, [8 + 96 + 2, 72 + 144 + 2, 44, 44])
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
  selected = cell
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
