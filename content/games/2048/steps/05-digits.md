---
title: Numbers on the tiles
title_tr: Karolara sayılar
skills: [game.canvas]
---

# --goal--

Every tile shows its number in the middle: dark for 2 and 4, white on the stronger colors.

# --goal-tr--

Her karonun ortasına **sayısını** yazıyoruz. Açık renkli 2 ve 4'te koyu gri, daha koyu renkli büyük sayılarda beyaz
yazı okunur.

Yazıyı hücrenin tam ortasına koymak için kaleme iki ayar veriyoruz: yatayda ortala, dikeyde ortala.

# --code--

```js
ctx.textBaseline = 'middle'

ctx.textAlign = 'center'

    if (value !== 0) {
      ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2'
      ctx.font = 'bold 40px sans-serif'
      ctx.fillText(String(value), cellX(col) + CELL / 2, cellY(row) + CELL / 2)
    }
```

# --meaning--

- `textAlign = 'center'` centres the text on `x`; `textBaseline = 'middle'` centres it on `y`. Both stay set until
  changed, so they are set once before the loop. (The score will be drawn between them later.)
- `String(value)` turns the number into text; the point is the middle of the cell.

# --meaning-tr--

- `ctx.textBaseline = 'middle'` → yazının **dikey ortası** verdiğin `y`'ye gelsin (normalde harflerin oturduğu
  çizgi gelir). `ctx.textAlign = 'center'` → **yatay ortası** `x`'e gelsin.
- Kalem ayarları değiştirilene kadar kalır; bu yüzden döngüden önce bir kez söylemek yeter. İkisinin arasındaki boş
  satırlara ileride skor yazısı gelecek.
- `if (value !== 0)` → boş hücreye yazı yazma.
- `value <= 4 ? '#776e65' : '#f9f6f2'` → 2 ve 4 koyu gri, diğerleri beyaz.
- `String(value)` → sayıyı yazıya çevirir. `cellX(col) + CELL / 2` → hücrenin yatay ortası; `cellY(row) + CELL / 2`
  dikey ortası.

# --task--

1. In `draw`, under the board's `fillRect` and its empty line, write `textBaseline`, an empty line, and `textAlign`.
2. In the loop, under the cell's `fillRect`, write the `if` block.

# --task-tr--

1. `draw` içinde tahtayı boyayan `fillRect` satırının altındaki boş satırdan sonra `ctx.textBaseline = 'middle'` yaz,
   bir boş satır bırak, sonra `ctx.textAlign = 'center'` yaz (döngü bunun hemen altında kalır).
2. Döngüde hücreyi çizen `ctx.fillRect(cellX(col), ...)` satırının altına `if` bloğunu yaz.
3. **Çalıştır**.

# --tests--

Numbers should be drawn in the middle of their cell, dark for 2 and 4.
tr: Sayılar hücrelerinin ortasına, 2 ve 4 için koyu renkle yazılmalı.

```js
board = [[2, 0, 0, 0], [0, 8, 0, 0], [0, 0, 0, 0], [0, 0, 0, 4]]
draw()
const texts = $.screen().filter((c) => c.op === 'fillText').map((c) => [c.args[0], c.args[1], c.args[2], c.fill])
assert.deepEqual(texts, [['2', 54.5, 114.5, '#776e65'], ['8', 151.5, 211.5, '#f9f6f2'], ['4', 345.5, 405.5, '#776e65']])
assert.strictEqual($.ctx.textAlign, 'center')
assert.strictEqual($.ctx.textBaseline, 'middle')
```

# --solution--

```js
// 2048, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4
const GAP = 12
const CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE // 85
const TOP = 60 // room for the score above the board
const COLORS = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
}

let board

function newGame() {
  // Array.from calls the function for every row, so each row is its own array.
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function cellX(col) {
  return GAP + col * (CELL + GAP)
}

function cellY(row) {
  return TOP + GAP + row * (CELL + GAP)
}

function draw() {
  ctx.fillStyle = '#faf8ef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#bbada0'
  ctx.fillRect(0, TOP, canvas.width, canvas.width)

  ctx.textBaseline = 'middle'

  ctx.textAlign = 'center'
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col]
      ctx.fillStyle = value === 0 ? '#cdc1b4' : COLORS[value] || '#3c3a32'
      ctx.fillRect(cellX(col), cellY(row), CELL, CELL)
      if (value !== 0) {
        ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2'
        ctx.font = 'bold 40px sans-serif'
        ctx.fillText(String(value), cellX(col) + CELL / 2, cellY(row) + CELL / 2)
      }
    }
  }
}

newGame()
draw()
```
