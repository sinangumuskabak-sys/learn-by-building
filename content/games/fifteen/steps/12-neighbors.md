---
title: Neighbours
title_tr: Komşular
skills: [prog.arrays]
---

# --goal--

Only a tile next to the gap can move. In the flat list the neighbours of `i` are `i - N` (above), `i + N` (below),
`i - 1` and `i + 1`, but only when they are on the board: position 3 ends a row, and 4 starts the next one.

# --goal-tr--

Sadece **boşluğun yanındaki** taş hareket edebilir. O hâlde asıl soru: `i` karesinin **komşuları** hangileri?

Düz listede: üstteki `i - N`, alttaki `i + N`, soldaki `i - 1`, sağdaki `i + 1`. Ama **kenarlara dikkat**: 3 numaralı
kare ilk satırın sonunda; `3 + 1 = 4` ise bir alt satırın **başı**, komşu değil. Bu çok bilinen bir hatadır. Her
komşuyu eklemeden önce satırı ve sütunu kontrol ederek ondan kaçınırız.

# --code--

```js
// The squares next to position i (up, down, left, right), staying inside the board.
function neighbors(i) {
  const list = []
  if (rowOf(i) > 0) list.push(i - N)
  if (rowOf(i) < N - 1) list.push(i + N)
  if (colOf(i) > 0) list.push(i - 1)
  if (colOf(i) < N - 1) list.push(i + 1)
  return list
}
```

# --meaning--

- `list` starts empty; `push` adds a neighbour at the end.
- Each neighbour is added only when it exists: not in the top row for "above", not in the last column for "right"...
- `return list` gives the neighbours back.

# --meaning-tr--

- `const list = []` → boş bir liste; komşuları buraya toplayacağız.
- `if (rowOf(i) > 0) list.push(i - N)` → en üst satırda **değilse** üst komşuyu ekle. `>` "büyük", `.push(...)`
  listenin sonuna ekler.
- `if (rowOf(i) < N - 1) list.push(i + N)` → en alt satırda (3) değilse alt komşu. `<` "küçük".
- `if (colOf(i) > 0) list.push(i - 1)` → ilk sütunda değilse sol komşu.
- `if (colOf(i) < N - 1) list.push(i + 1)` → son sütunda değilse sağ komşu. 3 numaralı kare için bu yüzden 4 eklenmez.
- `return list` → listeyi geri verir. Köşedeki karenin 2, kenardakinin 3, ortadakinin 4 komşusu olur.

# --task--

Under `solvedTiles`, leave an empty line and write the comment and `neighbors`. Press **Run**.

# --task-tr--

`solvedTiles` satırının altına bir boş satır bırakıp yorum satırını ve `neighbors` fonksiyonunu yaz. **Çalıştır**.
Ekran değişmez; kontroller komşuları deniyor.

# --predict--

How many neighbours does square 4 (the start of the second row) have?
- [ ] 4
- [x] 3
  Above (0), below (8) and right (5). Square 3 is at the end of the row above, not its left neighbour.
- [ ] 2

# --predict-tr--

4 numaralı karenin (ikinci satırın başı) kaç komşusu var?
- [ ] 4
- [x] 3
  Üstte 0, altta 8, sağda 5. 3 numaralı kare bir üst satırın sonunda; sol komşusu değil.
- [ ] 2

# --tests--

Neighbours should stop at the edges of the board.
tr: Komşular tahtanın kenarlarında durmalı.

```js
assert.sameMembers(neighbors(5), [1, 9, 4, 6])
assert.sameMembers(neighbors(0), [4, 1])
assert.sameMembers(neighbors(3), [7, 2], 'square 4 is on the next row, not a neighbour')
assert.sameMembers(neighbors(12), [8, 13], 'square 11 is on the row above, not a neighbour')
assert.sameMembers(neighbors(15), [11, 14])
```

# --solution--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 4 // 4 by 4: tiles 1 to 15 and one gap
const SIZE = 90
const GAP = 6
const LEFT = (canvas.width - N * SIZE - (N - 1) * GAP) / 2
const TOP = 60

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

const rowOf = (i) => Math.floor(i / N)
const colOf = (i) => i % N
const solvedTiles = () => [...Array(N * N - 1).keys()].map((i) => i + 1).concat(0)

// The squares next to position i (up, down, left, right), staying inside the board.
function neighbors(i) {
  const list = []
  if (rowOf(i) > 0) list.push(i - N)
  if (rowOf(i) < N - 1) list.push(i + N)
  if (colOf(i) > 0) list.push(i - 1)
  if (colOf(i) < N - 1) list.push(i + 1)
  return list
}

function reset() {
  tiles = solvedTiles()
}

function squareX(i) {
  return LEFT + colOf(i) * (SIZE + GAP)
}
function squareY(i) {
  return TOP + rowOf(i) * (SIZE + GAP)
}

function drawTile(number, x, y) {
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(x, y, SIZE, SIZE)
  ctx.fillStyle = '#1c1917'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(number), x + SIZE / 2, y + SIZE / 2 + 2)
}

function draw() {
  ctx.fillStyle = '#292524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  tiles.forEach((number, i) => {
    if (number === 0) return
    drawTile(number, squareX(i), squareY(i))
  })
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
