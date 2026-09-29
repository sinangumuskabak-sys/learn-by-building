---
title: Click to play
title_tr: Tıklayarak oyna
skills: [game.input]
---

# --goal--

A click plays the column under the mouse. `colAt(event)` turns the mouse position into a column number, first converting
screen pixels to canvas pixels, because the page may show the canvas smaller or bigger.

# --goal-tr--

Artık fareyle oynayacağız: bir sütuna **tıklayınca** o sütuna disk düşsün.

Tarayıcı sayfada bir şey olunca bunu bir **olay** (event) olarak duyurur; sen de "şu olunca şunu yap" diye kayıt
olursun. Kapıya zil takmak gibi. `'pointerdown'` fareyle tıklanınca (ya da parmakla dokununca) olur.

Farenin hangi sütunda olduğunu `colAt(event)` hesaplayacak. Bir incelik: sayfa canvas'ı ekrana sığdırmak için büyütüp
küçültebilir. O yüzden önce ekran pikselini canvas pikseline çeviriyoruz.

# --code--

```js
let hoverCol = 3

function colAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  return Math.min(COLS - 1, Math.max(0, Math.floor(x / CELL)))
}

canvas.addEventListener('pointerdown', (event) => {
  hoverCol = colAt(event)
  play(hoverCol)
})
```

# --meaning--

- `hoverCol` is the chosen column.
- `getBoundingClientRect()` gives where the canvas is on the screen (`left`) and how wide it is shown (`width`);
  `event.clientX` is the mouse position. Together they give `x` in canvas pixels.
- `Math.floor(x / CELL)` is the column; `Math.max(0, ...)` and `Math.min(COLS - 1, ...)` keep it between 0 and 6.
- `addEventListener('pointerdown', ...)` runs the arrow function on every click.

# --meaning-tr--

- `let hoverCol = 3` → seçili sütun; ortadan başlar.
- `canvas.getBoundingClientRect()` → canvas'ın ekrandaki yeri (`rect.left`) ve **gösterilen** eni (`rect.width`).
- `event.clientX` → farenin ekrandaki yatay konumu. `event.clientX - rect.left` → canvas'ın sol kenarından uzaklığı.
- `* canvas.width / rect.width` → ekran pikselini canvas pikseline çevirir. Canvas yarı boyda gösteriliyorsa 2 ile çarpar.
- `Math.floor(x / CELL)` → aşağı yuvarlar: `x` 200 ise 200 / 64 = 3.1 → 3. sütun.
- `Math.max(0, ...)` → 0'ın altına inme; `Math.min(COLS - 1, ...)` → 6'nın üstüne çıkma. İkisi birlikte sonucu 0 ile 6
  arasında **sıkıştırır**.
- `canvas.addEventListener('pointerdown', (event) => { ... })` → her tıklamada bu fonksiyon çalışır. `(event) => { }`
  kısa yoldan yazılmış bir fonksiyon; `event` olayın bilgisi (farenin yeri gibi).

# --task--

1. Under `let turn` write `let hoverCol = 3`.
2. Above `function disc(` write `colAt` and the `pointerdown` listener, followed by an empty line.

# --task-tr--

1. `let turn` satırının altına `let hoverCol = 3` yaz.
2. `function disc(` satırının **üstüne** `colAt` fonksiyonunu ve bir boş satırdan sonra `pointerdown` dinleyicisini yaz;
   altında bir boş satır kalsın.
3. **Çalıştır** ve sütunlara tıkla: kırmızı ve sarı diskler sırayla dizilmeli.

# --tests--

A click should drop a disc into that column.
tr: Tıklama o sütuna disk bırakmalı.

```js
$.click(224, 300) // column 3
assert.strictEqual(board[5][3], 1)
$.click(224, 300)
assert.strictEqual(board[4][3], 2)
$.click(20, 300)
assert.strictEqual(board[5][0], 1)
```

Clicks should work when the canvas is shown smaller.
tr: Canvas küçük gösterildiğinde de tıklamalar çalışmalı.

```js
canvas.getBoundingClientRect = () => ({ left: 100, top: 0, width: 224, height: 260 }) // drawn at half size
$.click(100 + 40, 100)
assert.strictEqual(board[5][1], 1)
assert.strictEqual(hoverCol, 1)
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
