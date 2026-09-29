---
title: Walking along a line
title_tr: Bir çizgi boyunca yürümek
skills: [prog.loops, prog.arrays]
---

# --goal--

`lineThrough(row, col, [dx, dy])` starts at a disc and walks in one direction while the discs are the same color, then
the other way, collecting the cells. `[1, 0]` is across: one column right per step.

# --goal-tr--

`lineThrough` (içinden geçen çizgi) bir diskten başlayıp **bir yönde** yürüyecek: disk aynı renk olduğu sürece ilerler
ve hücreleri toplar. Sonra **ters yönde** aynısını yapar.

Yön iki sayıyla verilir: `[dx, dy]` → her adımda sütun (`dx`) ve satır (`dy`) ne kadar değişir. `[1, 0]` yatay (her adım
bir sütun sağa), `[0, 1]` dikey, `[1, 1]` ve `[1, -1]` çaprazlar.

İki yöne yürümek önemli: boşluğun **ortasına** atılan bir disk (`X X _ X`) ucunda olmasa da dörtlüyü tamamlar.

# --code--

```js
// Count the discs in a row through (row, col) in one direction and its opposite.
function lineThrough(row, col, [dx, dy]) {
  const who = board[row][col]
  const cells = [[row, col]]
  for (const sign of [1, -1]) {
    let r = row + dy * sign
    let c = col + dx * sign
    while (inside(r, c) && board[r][c] === who) {
      cells.push([r, c])
      r += dy * sign
      c += dx * sign
    }
  }
  return cells
}
```

# --meaning--

- `[dx, dy]` in the parameters names the two items of the direction array.
- `for (const sign of [1, -1])` runs once forwards and once backwards.
- `while` repeats as long as its condition is true: while still on the board and the same color, add the cell and step on.
- The list starts with the disc itself, so three neighbours make four.

# --meaning-tr--

- `function lineThrough(row, col, [dx, dy])` → üçüncü bilgi bir dizi olarak gelir; köşeli parantezli yazım onun iki
  elemanına `dx` ve `dy` adlarını verir.
- `const who = board[row][col]` → başladığımız diskin rengi.
- `const cells = [[row, col]]` → bulunan hücrelerin listesi, diskin kendisiyle başlar. Her hücre bir `[satır, sütun]`
  çifti.
- `for (const sign of [1, -1])` → "dizideki her değer için": önce `sign = 1` (ileri), sonra `sign = -1` (geri).
- `let r = row + dy * sign` → bir adım ötedeki satır; `c` sütun.
- `while (koşul) { ... }` → yeni bir döngü türü: koşul doğru **olduğu sürece** tekrarla. Kaç kez döneceğini önceden
  bilmediğimizde kullanılır: aynı renk bitene kadar yürürüz.
- `inside(r, c) && board[r][c] === who` → önce tahtada mıyız diye sorarız; `&&` ilk koşul yanlışsa ikincisine hiç
  bakmaz, böylece tahtanın dışını okumaya çalışmayız.
- `cells.push([r, c])` → hücreyi listeye ekle; sonra bir adım daha at.
- `return cells` → bulunan bütün hücreler.

# --task--

Above `function play(` write the comment and `lineThrough`, followed by an empty line.

# --task-tr--

`function play(` satırının **üstüne** yorum satırını ve `lineThrough` fonksiyonunu yaz; altında bir boş satır kalsın.
**Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --predict--

Red discs at columns 0, 1 and 3 of the bottom row, and a new red disc lands at column 2. How long is the line across
through it?
- [ ] 2: only the disc and its right neighbour
- [ ] 3
- [x] 4
  Walking right finds column 3, walking left finds 1 and 0: with the new disc that is four.

# --predict-tr--

En alt satırda 0, 1 ve 3. sütunlarda kırmızı diskler var; 2. sütuna yeni bir kırmızı disk iniyor. Ondan geçen yatay
çizgi kaç hücre?
- [ ] 2: disk ve sağındaki
- [ ] 3
- [x] 4
  Sağa yürüyünce 3. sütun, sola yürüyünce 1. ve 0. sütun bulunur: yeni diskle birlikte dört.

# --tests--

It should count the same-colored discs through a cell, both ways.
tr: Bir hücreden geçen aynı renkli diskleri iki yönde de saymalı.

```js
board[5][0] = 1
board[5][1] = 1
board[5][2] = 1
board[5][3] = 2
assert.lengthOf(lineThrough(5, 1, [1, 0]), 3)
assert.sameDeepMembers(lineThrough(5, 1, [1, 0]), [[5, 0], [5, 1], [5, 2]])
assert.lengthOf(lineThrough(5, 1, [0, 1]), 1)
```

It should follow diagonals too.
tr: Çaprazları da izlemeli.

```js
board[5][0] = 1
board[4][1] = 1
board[3][2] = 1
board[2][3] = 1
assert.lengthOf(lineThrough(3, 2, [1, -1]), 4)
assert.lengthOf(lineThrough(3, 2, [1, 1]), 1)
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
const GRAVITY = 1.2
const COLORS = { 1: '#ef4444', 2: '#facc15' }

let board // board[row][col]: 0 empty, 1 or 2
let turn
let falling // the disc on its way down, or null
let hoverCol = 3

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  turn = 1
  falling = null
}

// The lowest empty row in a column, or -1 when the column is full.
function dropRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row
  }
  return -1
}

const inside = (row, col) => row >= 0 && row < ROWS && col >= 0 && col < COLS

// Count the discs in a row through (row, col) in one direction and its opposite.
function lineThrough(row, col, [dx, dy]) {
  const who = board[row][col]
  const cells = [[row, col]]
  for (const sign of [1, -1]) {
    let r = row + dy * sign
    let c = col + dx * sign
    while (inside(r, c) && board[r][c] === who) {
      cells.push([r, c])
      r += dy * sign
      c += dx * sign
    }
  }
  return cells
}

function play(col) {
  if (falling || dropRow(col) === -1) return
  const row = dropRow(col)
  falling = { col, row, who: turn, y: -CELL / 2, vy: 0 }
}

function land() {
  const { col, row, who } = falling
  board[row][col] = who
  falling = null
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
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') hoverCol = Math.max(0, hoverCol - 1)
  if (event.key === 'ArrowRight') hoverCol = Math.min(COLS - 1, hoverCol + 1)
  if (event.key >= '1' && event.key <= '7') hoverCol = Number(event.key) - 1
  if (event.key === ' ' || event.key === 'Enter' || (event.key >= '1' && event.key <= '7')) {
    event.preventDefault()
    play(hoverCol)
  }
})

function update() {
  if (falling) {
    falling.vy += GRAVITY
    falling.y += falling.vy
    const bottom = TOP + falling.row * CELL + CELL / 2
    if (falling.y >= bottom) {
      falling.y = bottom
      land()
    }
  }
}

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
  if (!falling) disc(hoverCol * CELL + CELL / 2, TOP - CELL / 2, COLORS[turn])

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, board[row][col] ? COLORS[board[row][col]] : '#0f172a')
    }
  }

  // The falling disc goes over the board, on its way to its hole.
  if (falling) disc(falling.col * CELL + CELL / 2, falling.y, COLORS[falling.who])

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  let message = turn === 1 ? "Red's turn" : "Yellow's turn"
  ctx.fillText(message, canvas.width / 2, 26)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
