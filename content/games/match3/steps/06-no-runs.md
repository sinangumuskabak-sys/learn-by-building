---
title: Start without matches
title_tr: Eşleşmesiz başla
skills: [prog.loops, prog.functions]
---

# --goal--

We fill the board row by row, left to right, so when a gem is placed only the cells to its left and above it exist.
If the two to its left, or the two above it, have its color, it would make three: then we pick again.

# --goal-tr--

Tahtayı satır satır, soldan sağa dolduruyoruz. Bir mücevheri koyarken yalnız **solundaki** ve **üstündeki** hücreler
dolu; sağı ve altı henüz boş. Üçlü oluşabilecek iki durum var:

- soldaki iki mücevher yeni mücevherle aynı renkse (yatay üçlü),
- üstteki iki mücevher yeni mücevherle aynı renkse (dikey üçlü).

O zaman **yeniden zar atarız**, üçlü yapmayan bir renk çıkana kadar. Hep biter: en fazla iki renk yasak, altı renk
var.

# --code--

```js
// Would this gem make three in a row with the two to its left, or the two above it?
function makesRun(r, c, gem) {
  const left = c >= 2 && board[r][c - 1] === gem && board[r][c - 2] === gem
  const up = r >= 2 && board[r - 1][c] === gem && board[r - 2][c] === gem
  return left || up
}

// A new board with no three in a row: each gem avoids the colors that would make one.

      let gem
      do gem = randomGem()
      while (makesRun(r, c, gem))
      board[r].push(gem)
```

# --meaning--

- `left` is true if there are two cells to the left (`c >= 2`) and both have this color; `up` the same above.
- `do ... while (condition)` runs its body at least once, then again while the condition is true: pick a gem, and
  pick again while it would make a run.

# --meaning-tr--

- `function makesRun(r, c, gem) {` → "bu mücevher `(r, c)`'ye konsa üçlü yapar mı?"
  - `c >= 2` → solda iki hücre var mı? (0. ve 1. sütunun solunda iki hücre yok.)
  - `board[r][c - 1] === gem && board[r][c - 2] === gem` → bir sol ve iki sol aynı renk mi? `&&` "ve", `===` "eşit mi?"
  - `const up = ...` → aynısı yukarı için: `r - 1` bir üst, `r - 2` iki üst satır.
  - `return left || up` → `||` "veya": ikisinden biri doğruysa `true`.
  - `c >= 2 &&` önce gelir: yanlışsa `&&` gerisine bakmaz; böylece `board[r][-1]` gibi olmayan bir hücre okunmaz.
- `let gem` → mücevher için bir değişken.
- `do gem = randomGem()` / `while (makesRun(r, c, gem))` → **do ... while** döngüsü: içini (`gem = randomGem()`) **en
  az bir kez** yapar, sonra koşul doğru olduğu sürece tekrarlar. "Rastgele seç; üçlü yapıyorsa yeniden seç."
- `board[r].push(gem)` → sonunda uygun mücevheri koy.

# --task--

1. Above `function newBoard() {` write the comment, `makesRun`, and the comment for `newBoard`.
2. In `newBoard`, replace `board[r].push(randomGem())` with the four lines.

# --task-tr--

1. `function newBoard() {` satırının **üstüne** yorum satırını, `makesRun` fonksiyonunu ve (bir boş satırdan sonra)
   `newBoard`'un yorum satırını yaz.
2. `newBoard` içinde `board[r].push(randomGem())` satırını sil; yerine dört satırı yaz.
3. **Çalıştır** ve birkaç kez tekrar çalıştır: hiç üçlü görmemelisin.

# --hint--

`do` and `while` belong together: `do gem = randomGem()` on one line, `while (makesRun(r, c, gem))` on the next.

# --hint-tr--

`do` ile `while` birlikte çalışır: bir satırda `do gem = randomGem()`, altında `while (makesRun(r, c, gem))`.

# --tests--

`makesRun` should spot three in a row to the left or above.
tr: `makesRun` soldaki ya da üstteki üçlüyü görmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[2][0] = board[2][1] = 4
assert.isTrue(makesRun(2, 2, 4), 'two to the left')
assert.isFalse(makesRun(2, 2, (4 + 1) % 6), 'another color')
board[0][5] = board[1][5] = 1
assert.isTrue(makesRun(2, 5, 1), 'two above')
assert.isFalse(makesRun(0, 1, board[0][0]), 'only one cell to the left')
```

A new board should never contain three of a color in a row or a column.
tr: Yeni bir tahta asla bir satırda ya da sütunda aynı renkten üç içermemeli.

```js
for (let i = 0; i < 200; i++) {
  newBoard()
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (c >= 2) assert.isFalse(board[r][c] === board[r][c - 1] && board[r][c] === board[r][c - 2], 'three in a row at row ' + r)
    if (r >= 2) assert.isFalse(board[r][c] === board[r - 1][c] && board[r][c] === board[r - 2][c], 'three in a column at column ' + c)
  }
}
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
