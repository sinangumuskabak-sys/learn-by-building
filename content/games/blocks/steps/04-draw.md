---
title: Draw the whole board
title_tr: Bütün tahtayı çiz
skills: [prog.loops, game.canvas]
---

# --goal--

`draw()` paints the well and then every filled cell of `board`. Two loops, one inside the other, visit all 200 cells.

# --goal-tr--

Şimdi deneme çağrısının yerine asıl işi yapıyoruz: `draw()` kuyuyu boyayacak, sonra `board`'daki **her dolu
hücreyi** çizecek.

200 hücreye tek tek bakmak için **iç içe iki döngü** kullanıyoruz: dıştaki satırları, içteki o satırdaki sütunları
gezer. Bir kitabı satır satır, her satırı soldan sağa okumak gibi. Tahta şu an boş olduğu için yalnız kuyu görünecek.

# --code--

```js
function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) drawCell(col, row, '#94a3b8')
    }
  }
}

draw()
```

# --meaning--

- The painting of the page and the well moves into `draw`.
- `for (let row = 0; row < ROWS; row++)` counts 0 to 19; the inner loop counts columns 0 to 9.
- `if (board[row][col])` is true for any number except 0, so only filled cells are drawn.

# --meaning-tr--

- `function draw() {` → arka planı ve kuyuyu boyayan dört satır artık bu fonksiyonun içinde.
- `for (let row = 0; row < ROWS; row++) {` → sayan döngü: `row` 0'dan başlar, 20'den küçük olduğu sürece içi çalışır,
  her turun sonunda `row++` ile 1 artar.
- İçindeki `for (let col = 0; ...)` → aynı satırın 10 sütununu gezer. İkisi birlikte 20 × 10 = 200 hücreye bakar.
- `if (board[row][col]) drawCell(col, row, '#94a3b8')` → hücre 0 değilse (doluysa) çiz. `if` içinde 0 "yok",
  başka her sayı "var" sayılır.
- `draw()` → fonksiyonu çağırır. Deneme çağrısının yerini alıyor.

# --task--

1. Wrap the four painting lines in `function draw() { ... }` (indented), add the two loops inside it.
2. Replace the test call `drawCell(0, 19, ...)` with `draw()`.

# --task-tr--

1. Dört boyama satırının **üstüne** `function draw() {` yaz ve dört satırı iki boşluk içeri al.
2. Altlarına bir boş satır bırakıp iki döngüyü yaz; en sona `draw`'ı kapatan `}` gelsin.
3. En alttaki `drawCell(0, 19, '#94a3b8')` satırını sil; yerine `draw()` yaz.
4. **Çalıştır**: yalnız kuyu görünmeli (tahta boş).

# --predict--

After Run, is the grey cell in the corner still there?
- [ ] Yes
- [x] No, the board is empty
  `draw` only paints the cells of `board` that are not 0, and they are all 0.
- [ ] Every cell is grey

# --predict-tr--

Çalıştır'dan sonra köşedeki gri hücre hâlâ orada mı?
- [ ] Evet
- [x] Hayır, tahta boş
  `draw` yalnız `board`'daki 0 olmayan hücreleri boyuyor; hepsi 0.
- [ ] Bütün hücreler gri

# --try--

Under `let board = ...` write `board[19][3] = 1` and run: a grey cell. Then remove it.

# --try-tr--

`let board = ...` satırının altına `board[19][3] = 1` yaz ve çalıştır: gri bir hücre. Sonra geri sil.

# --tests--

`draw()` should paint every filled cell of the board.
tr: `draw()` tahtanın her dolu hücresini boyamalı.

```js
board[19][0] = 1
board[18][9] = 1
draw()
assert.deepEqual($.rects('#1e293b'), [{ x: 0, y: 0, w: 240, h: 480, color: '#1e293b' }])
assert.sameDeepMembers($.rects('#94a3b8'), [
  { x: 1, y: 457, w: 22, h: 22, color: '#94a3b8' },
  { x: 217, y: 433, w: 22, h: 22, color: '#94a3b8' },
])
```

# --solution--

```js
// Falling blocks, step by step.
// The page already has <canvas id="game" width="360" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 10
const ROWS = 20
const CELL = 24

function emptyRow() {
  return Array(COLS).fill(0)
}

let board = Array.from({ length: ROWS }, emptyRow)

function drawCell(col, row, color) {
  ctx.fillStyle = color
  ctx.fillRect(col * CELL + 1, row * CELL + 1, CELL - 2, CELL - 2)
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) drawCell(col, row, '#94a3b8')
    }
  }
}

draw()
```
