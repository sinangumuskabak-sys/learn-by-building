---
title: Click a gem
title_tr: Bir mücevhere tıkla
skills: [game.input]
---

# --goal--

A move starts by clicking a gem. `cellAt` turns the click's position into a row and a column (or `null` off the
board), and the click remembers that cell in `selected`.

# --goal-tr--

Bir hamle bir mücevhere **tıklayarak** başlar. Tarayıcı tıklamanın yerini piksel olarak verir; bizim ise **hangi
hücreye** tıklandığını bilmemiz lazım. Bunu `cellAt` (hücre nerede) fonksiyonu hesaplayacak. Tahtanın dışına
tıklandıysa cevap `null` (hiçbir şey).

Tıklanan hücreyi `selected` (seçili) değişkeninde tutuyoruz. Ekranda henüz bir şey görünmeyecek; seçimi bir sonraki
adımda çizeceğiz.

# --code--

```js
let selected

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
```

# --meaning--

- The canvas may be shown smaller than 400 pixels on a phone. `getBoundingClientRect()` gives its place and size on
  screen, so the click position is turned into canvas pixels, then made relative to the grid's corner.
- Dividing by `SIZE` and rounding down gives the row and column.
- Outside the grid the answer is `null`. `{ r, c }` is short for `{ r: r, c: c }`.
- `pointerdown` fires when a mouse button or a finger goes down on the canvas.

# --meaning-tr--

- `canvas.getBoundingClientRect()` → canvas'ın ekrandaki yeri ve boyu. Telefonda canvas küçültülmüş olabilir: ekranda
  200 piksel eninde görünse de içi hâlâ 400 piksel.
- `(event.clientX - rect.left) * canvas.width / rect.width` → tıklamanın ekrandaki yerini **canvas pikseline**
  çevirir: önce canvas'ın sol kenarını çıkar, sonra gerçek en ÷ ekrandaki en oranıyla büyüt. `- LEFT` → ızgaranın
  köşesine göre.
- `Math.floor(y / SIZE)` → 48'e bölüp aşağı yuvarla: satır. Aynısı sütun için.
- `r >= 0 && r < N && c >= 0 && c < N ? { r, c } : null` → ızgaranın içindeyse `{ r, c }` nesnesi, değilse `null`.
  `{ r, c }`, `{ r: r, c: c }`'nin kısası.
- `canvas.addEventListener('pointerdown', (event) => { ... })` → canvas'a fareyle basılınca ya da parmakla dokununca
  bu fonksiyonu çalıştır. `event` tıklamanın bilgisini taşır.
- `if (!cell) return` → `!` "değil": hücre yoksa (tahtanın dışı) hiçbir şey yapma.
- `selected = cell` → tıklanan hücreyi hatırla.

# --task--

1. Under `let board` write `let selected`.
2. Above `function draw() {` write `cellAt` and the listener.

# --task-tr--

1. `let board ...` satırının altına `let selected` yaz.
2. `function draw() {` satırının **üstüne** `cellAt` fonksiyonunu ve tıklama dinleyicisini yaz; aralarında ve altında
   birer boş satır kalsın.
3. **Çalıştır**: ekran değişmez; kontroller tıklamayı deniyor.

# --tests--

`cellAt` should find the row and column under a click, or `null` off the board.
tr: `cellAt` tıklamanın altındaki satırı ve sütunu, tahtanın dışındaysa `null` bulmalı.

```js
assert.deepEqual(cellAt({ clientX: 32 + 48 * 2, clientY: 96 + 48 * 3 }), { r: 3, c: 2 })
assert.deepEqual(cellAt({ clientX: 391, clientY: 455 }), { r: 7, c: 7 })
assert.isNull(cellAt({ clientX: 5, clientY: 5 }))
assert.isNull(cellAt({ clientX: 200, clientY: 460 }), 'below the board')
```

Clicking a gem should select it.
tr: Bir mücevhere tıklamak onu seçmeli.

```js
$.click(32 + 48 * 2, 96 + 48 * 3)
assert.deepEqual(selected, { r: 3, c: 2 })
$.click(5, 5)
assert.deepEqual(selected, { r: 3, c: 2 }, 'a click off the board changes nothing')
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newBoard()
requestAnimationFrame(loop)
```
