---
title: Four directions, one function
title_tr: Dört yön, tek fonksiyon
skills: [prog.functions, prog.arrays, game.input]
---

# --explanation--

You have `slideRow`, which slides **left**. Do you need three more functions for right, up and down? No. Turn every
direction into "left" by looking at the board differently:

- **Right**: reverse the row, slide it left, reverse it back. Sliding a reversed row left is the same as sliding the
  original row right.
- **Up**: read a **column** from top to bottom as if it were a row (`board.map((row) => row[col])`), slide it "left"
  (towards the top), and write it back into the column.
- **Down**: read the column, reverse, slide, reverse back.

One tested function, reused four ways. When you find yourself about to copy-paste logic with small changes, look for a
transformation like this that lets one piece of code do the work.

A move only counts if it **changed something**. Pressing left when nothing can slide left must not add a new tile, or
the player could fill the board by mashing a useless direction. Compare the board before and after (`JSON.stringify`
turns it into text you can compare in one go), and only add a tile and redraw when they differ.

# --explanation-tr--

**Bu adımda:** ok tuşlarıyla oynanabilir hâle getireceğiz. Bir oka basınca bütün karolar o yöne kayacak, eşitler
birleşecek, yeni bir karo çıkacak ve sol üstte `Score: ...` yazacak.

**Dört yön için dört fonksiyon mu? Hayır.** `slideRow` yalnızca **sola** kaydırıyor. Her yönü tahtaya farklı bakarak
"sola"ya çeviririz:

- **Sağ**: satırı ters çevir, sola kaydır, geri ters çevir. Ters çevrilmiş satırı sola kaydırmak, asıl satırı sağa
  kaydırmakla aynıdır. `[0, 2, 0, 2]` → ters `[2, 0, 2, 0]` → sola `[4, 0, 0, 0]` → ters `[0, 0, 0, 4]`.
- **Yukarı**: bir **sütunu** yukarıdan aşağıya bir satırmış gibi oku, "sola" (yani yukarıya) kaydır, sütuna geri yaz.
- **Aşağı**: sütunu oku, ters çevir, kaydır, geri ters çevir.

Tek bir test edilmiş fonksiyon, dört farklı kullanım. Küçük değişikliklerle aynı kodu kopyalamak üzereysen, bir kod
parçasının işi yapmasını sağlayan böyle bir dönüşüm ara.

**Yeni araçlar, parça parça:**

- `[...board[i]]` → `...` (yayma, spread) listenin öğelerini yeni bir listenin içine döker: satırın **kopyasını**
  yapar. Kopya alırız ki ters çevirirken tahtanın kendisi bozulmasın.
- `board.map((row) => row[i])` → `map` listedeki her öğe için bir hesap yapıp sonuçlardan yeni bir liste kurar. Burada
  her satırın `i`. öğesini alır; yani `i`. **sütunu** yukarıdan aşağıya okur.
- `line.reverse()` → listeyi yerinde ters çevirir.
- `const { row, gained } = slideRow(line)` → dönen nesnenin `row` ve `gained` alanlarını aynı adlı iki sabite koyar
  (2. adımdaki `[row, col]` parçalamanın nesne hâli).
- `row.forEach((value, r) => (board[r][i] = value))` → yeni sütunun her değerini tahtada `r`. satırın `i`. hücresine
  yazar. Ok fonksiyonu tek satır olduğunda `{ }` yerine parantez kullanılabilir.
- `horizontal ? A : B` → yataysa (sol/sağ) `A`, değilse `B`.

**Hamle bir şeyi değiştirdiyse sayılır.** Hiçbir şey sola kayamıyorken sola basmak yeni karo **eklememeli**; yoksa
oyuncu boş bir yöne basıp durarak tahtayı doldurabilirdi. Tahtayı hamleden önce ve sonra karşılaştırırız.
`JSON.stringify(board)` bütün tahtayı tek bir yazıya çevirir (`'[[2,4,0,0],[0,0,0,0],...]'`); iki yazıyı `===` ile tek
seferde karşılaştırabiliriz. Değişmediyse `return false` ile çıkarız; değiştiyse yeni karo ekleyip `true` döndürürüz.

**Tuşları yönlere çevirmek.** `directions` tablosu tuş adını yöne çevirir: `directions['ArrowLeft']` → `'left'`.
Tarayıcı bir tuşa basıldığında `keydown` **olayını** gönderir; `document.addEventListener('keydown', (event) => { ... })`
"tuşa basılınca şunu yap" demektir ve `event.key` basılan tuşun adıdır. Tablo başka bir tuş için `undefined` verir;
`if (!direction) return` → "yön yoksa (`!` değil) hiçbir şey yapma". `event.preventDefault()` ok tuşlarının sayfayı
kaydırmasını engeller. Hamleden sonra `draw()` ile tahtayı yeniden çizeriz. (Bu oyunda sürekli dönen bir döngü yok;
yalnızca bir şey değişince çizeriz.)

**Skor** `let score` ile tutulur, `newGame()`'de sıfırlanır ve her kaydırmada `score += gained` ile artar.

# --task--

1. Add `let score = 0` (reset it in `newGame()`).
2. Write `function move(direction)` for `'left'`, `'right'`, `'up'` and `'down'`: for each of the 4 lines (rows for
   left/right, columns for up/down), read the line, reverse it for right/down, `slideRow` it, reverse back, write it
   into the board and add `gained` to `score`. If the board changed, `addTile()` and return `true`; otherwise return
   `false`.
3. On `keydown`, map the arrow keys to directions, call `move`, and `draw()`.
4. Draw `Score: 12` (the real number) in the top strip: `'#776e65'`, `'bold 22px sans-serif'`, left-aligned at
   `(GAP, TOP / 2)`.

# --task-tr--

1. `let board` satırının hemen altına skoru ekle:

   ```js
   let score
   ```

2. `newGame()` fonksiyonunda `board = Array.from(...)` satırının altına skoru sıfırlayan satırı ekle:

   ```js
     board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
     score = 0 // ← yeni
     addTile()
     addTile()
   ```

3. `slideRow()` fonksiyonunun kapanış `}`'inin altına bir satır boşluk bırakıp hamle fonksiyonunu yaz:

   ```js
   // Her yön, bir satır ya da sütunda (belki ters çevrilmiş) "sola kaydır"dır.
   function move(direction) {
     const before = JSON.stringify(board)
     const horizontal = direction === 'left' || direction === 'right'
     const reversed = direction === 'right' || direction === 'down'
     for (let i = 0; i < SIZE; i++) {
       const line = horizontal ? [...board[i]] : board.map((row) => row[i])
       if (reversed) line.reverse()
       const { row, gained } = slideRow(line)
       if (reversed) row.reverse()
       score += gained
       if (horizontal) board[i] = row
       else row.forEach((value, r) => (board[r][i] = value))
     }
     if (JSON.stringify(board) === before) return false
     addTile()
     return true
   }
   ```

4. Altına bir satır boşluk bırakıp tuş tablosunu ve klavye dinleyicisini yaz:

   ```js
   const directions = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }

   document.addEventListener('keydown', (event) => {
     const direction = directions[event.key]
     if (!direction) return
     event.preventDefault()
     move(direction)
     draw()
   })
   ```

5. `draw()` fonksiyonunun başını şöyle değiştir: tahtanın zeminini çizen satırdan sonra skoru yaz. Eski
   `ctx.textAlign = 'center'` satırı skorun **altına** iner:

   ```js
   function draw() {
     ctx.fillStyle = '#faf8ef'
     ctx.fillRect(0, 0, canvas.width, canvas.height)
     ctx.fillStyle = '#bbada0'
     ctx.fillRect(0, TOP, canvas.width, canvas.width)

     ctx.fillStyle = '#776e65' // ← yeni
     ctx.font = 'bold 22px sans-serif' // ← yeni
     ctx.textAlign = 'left' // ← yeni
     ctx.textBaseline = 'middle'
     ctx.fillText('Score: ' + score, GAP, TOP / 2) // ← yeni

     ctx.textAlign = 'center' // ← buraya taşındı
     for (let row = 0; row < SIZE; row++) {
   ```

   Fonksiyonun geri kalanı (döngüler) aynı kalır.

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra ok tuşlarına bas: karolar kaymalı, eşitler birleşmeli, her
   geçerli hamlede yeni bir karo çıkmalı ve sol üstteki skor artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı
   kalırsa `reversed` satırında `'right'` ve `'down'`'ın, `horizontal` satırında `'left'` ve `'right'`'ın yazıldığına
   bak.

# --tests--

Moving left should slide and merge every row.
tr: Sola hareket her satırı kaydırıp birleştirmeli.

```js
Math.random = () => 0.99 // the new tile goes into the last empty cell
board = [[2, 2, 0, 0], [0, 4, 0, 4], [8, 0, 0, 0], [2, 4, 8, 16]]
score = 0
assert.isTrue(move('left'))
assert.deepEqual(board.map((r) => r.slice(0, 2)), [[4, 0], [8, 0], [8, 0], [2, 4]])
assert.strictEqual(score, 12)
assert.lengthOf(board.flat().filter((v) => v !== 0), 8, 'seven tiles after merging, plus one new tile')
```

Moving right, up and down should work the same way in their directions.
tr: Sağa, yukarı ve aşağı hareket kendi yönlerinde aynı şekilde çalışmalı.

```js
Math.random = () => 0.99 // new tiles go into the last empty cell, as 4s
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
move('right')
assert.deepEqual(board[0], [0, 0, 0, 4])
board = [[2, 0, 0, 0], [2, 0, 0, 0], [4, 0, 0, 0], [0, 0, 0, 0]]
move('up')
assert.deepEqual(board.map((r) => r[0]), [4, 4, 0, 0])
board = [[2, 0, 0, 0], [0, 0, 0, 0], [2, 0, 0, 0], [0, 0, 0, 0]]
move('down')
assert.deepEqual(board.map((r) => r[0]), [0, 0, 0, 4])
```

A move that changes nothing should not add a tile.
tr: Hiçbir şeyi değiştirmeyen bir hamle karo eklememeli.

```js
board = [[2, 4, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
assert.isFalse(move('left'))
assert.deepEqual(board[0], [2, 4, 0, 0])
assert.lengthOf(board.flat().filter((v) => v !== 0), 2)
assert.isFalse(move('up'))
```

The arrow keys should move the board and update the score on screen.
tr: Ok tuşları tahtayı hareket ettirmeli ve ekrandaki skoru güncellemeli.

```js
board = [[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
score = 0
$.press('ArrowLeft')
assert.strictEqual(board[0][0], 4)
assert.include($.texts(), 'Score: 4')
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
let score

function emptyCells() {
  const cells = []
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] === 0) cells.push([row, col])
    }
  }
  return cells
}

function addTile() {
  const cells = emptyCells()
  if (cells.length === 0) return
  const [row, col] = cells[Math.floor(Math.random() * cells.length)]
  board[row][col] = Math.random() < 0.9 ? 2 : 4
}

function newGame() {
  // Array.from calls the function for every row, so each row is its own array.
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  score = 0
  addTile()
  addTile()
}

// Slides one row to the left. Pure: returns a new row and the points gained, and changes nothing else.
function slideRow(row) {
  const tiles = row.filter((value) => value !== 0)
  const result = []
  let gained = 0
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      result.push(tiles[i] * 2)
      gained += tiles[i] * 2
      i++ // the next tile was used up by this merge
    } else {
      result.push(tiles[i])
    }
  }
  while (result.length < SIZE) result.push(0)
  return { row: result, gained }
}

// Every direction is "slide left" on a row or a column, possibly reversed.
function move(direction) {
  const before = JSON.stringify(board)
  const horizontal = direction === 'left' || direction === 'right'
  const reversed = direction === 'right' || direction === 'down'
  for (let i = 0; i < SIZE; i++) {
    const line = horizontal ? [...board[i]] : board.map((row) => row[i])
    if (reversed) line.reverse()
    const { row, gained } = slideRow(line)
    if (reversed) row.reverse()
    score += gained
    if (horizontal) board[i] = row
    else row.forEach((value, r) => (board[r][i] = value))
  }
  if (JSON.stringify(board) === before) return false
  addTile()
  return true
}

const directions = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }

document.addEventListener('keydown', (event) => {
  const direction = directions[event.key]
  if (!direction) return
  event.preventDefault()
  move(direction)
  draw()
})

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

  ctx.fillStyle = '#776e65'
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Score: ' + score, GAP, TOP / 2)

  ctx.textAlign = 'center'
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col]
      ctx.fillStyle = value === 0 ? '#cdc1b4' : COLORS[value] || '#3c3a32'
      ctx.fillRect(cellX(col), cellY(row), CELL, CELL)
      if (value !== 0) {
        ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2'
        ctx.font = 'bold ' + (value < 100 ? 40 : value < 1000 ? 34 : 26) + 'px sans-serif'
        ctx.fillText(String(value), cellX(col) + CELL / 2, cellY(row) + CELL / 2)
      }
    }
  }
}

newGame()
draw()
```
