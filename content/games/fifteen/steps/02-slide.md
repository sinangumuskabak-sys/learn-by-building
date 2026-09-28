---
title: Sliding into the gap
title_tr: Boşluğa kaydırmak
skills: [game.input, prog.arrays]
---

# --explanation--

Only a tile **next to the gap** can move, and moving it just swaps it with the gap. So the key question is: which squares
are next to square `i`?

In a flat array the neighbours are `i - N` (above), `i + N` (below), `i - 1` (left) and `i + 1` (right), but careful at the
edges: square 3 is at the end of the first row, and `3 + 1 = 4` is the **start of the next row**, not a neighbour. Checking
the row and column before adding each one avoids that classic wrap-around bug:

```js
if (colOf(i) < N - 1) list.push(i + 1)   // only if i is not in the last column
```

A click works out the square under the pointer; the arrow keys feel best when they move the tile **towards** the gap in
that direction: Left slides the tile on the right of the gap to the left.

# --explanation-tr--

**Bu adımda:** taşları kaydırabileceksin. Boşluğun yanındaki bir taşa tıklayınca boşluğa kayar; ok tuşları da aynı
işi yapar. Sol üstte `Moves 1` gibi bir hamle sayacı görünecek.

**Hangi taş hareket edebilir?** Sadece **boşluğun yanındaki** taş; hareket de onun boşlukla yer değiştirmesidir.
Asıl soru: `i` karesinin komşuları hangileri?

Tek sıralı listede komşular `i - N` (üst), `i + N` (alt), `i - 1` (sol) ve `i + 1` (sağ)'dır. Ama kenarlara dikkat:
3 numaralı kare ilk satırın sonunda; `3 + 1 = 4` ise **bir alt satırın başı**, komşu değil. Her komşuyu eklemeden
önce satırı ve sütunu kontrol ederek bu klasik hatadan kaçınırız:

```js
if (colOf(i) < N - 1) list.push(i + 1)   // i son sütunda değilse sağ komşu var
```

`if (koşul) komut` → koşul doğruysa komutu çalıştır. `<` "küçük", `>` "büyük" demektir. `list.push(şey)` listenin
sonuna ekler.

**Hamle.** `tiles.indexOf(0)` → `0`'ın (boşluğun) listede kaçıncı konumda olduğunu bulur.
`neighbors(gap).includes(i)` → "`i`, boşluğun komşuları arasında var mı?" (`true`/`false`). Başındaki `!` "değil"
demektir: komşu değilse `return` ile çık, hiçbir şey yapma. Komşuysa taşı boşluğa yaz, eski yerini boşluk (`0`) yap
ve `moves += 1` ile hamleyi 1 artır.

**Tıklama.** `canvas.addEventListener('pointerdown', (event) => { ... })` → canvas'a basılınca (fare ya da parmak)
içindeki kodu çalıştırır. `event.clientX/Y` ekrandaki konumdur; canvas ekranda farklı boyda görünebildiği için
`getBoundingClientRect()` ile canvas'ın ekrandaki yerini alıp konumu canvas piksellerine çeviririz. Sonra tahtanın
sol üst köşesini (`LEFT`, `TOP`) çıkarır, bir kare + aralık genişliğine (`SIZE + GAP`) bölüp aşağı yuvarlayarak
sütunu ve satırı buluruz. `col >= 0 && col < N && ...` → tıklama tahtanın içindeyse (`&&` "ve", `>=` "büyük ya da
eşit"). Konum `row * N + col`'dur.

**Ok tuşları.** `document.addEventListener('keydown', ...)` → bir tuşa basılınca çalışır; basılan tuşun adı
`event.key` (`'ArrowLeft'` gibi). Oklar taşı boşluğa **doğru** o yönde götürür: Sol ok, boşluğun **sağındaki** taşı
sola kaydırır. Hangi taşın geleceğini küçük bir sözlükten (**nesne**) buluruz:

```js
{ ArrowLeft: 1, ArrowRight: -1, ArrowUp: N, ArrowDown: -N }[event.key]
```

Sol okta `1` (boşluğun sağı), başka bir tuşta `undefined` ("yok") çıkar. `from !== undefined` ise (`!==` "eşit
değil") ok tuşudur: `event.preventDefault()` sayfanın kaymasını engeller, taş komşuysa hareket eder.

`ctx.textBaseline = 'alphabetic'` yazıyı normal satır çizgisine oturtur (taşlar için `'middle'` yapmıştık).

# --task--

1. Write `neighbors(i)`: the squares above, below, left and right of `i` that are on the board.
2. Add `moves` (`0` in `reset()`) and write `move(i)`: if `i` is a neighbour of the gap, swap the tile into the gap and add 1
   to `moves`.
3. On `pointerdown`, convert to canvas pixels, work out the column and row (each square plus its gap is `SIZE + GAP` wide) and
   `move` that square if it is on the board.
4. The arrow keys move the tile at `gap + 1` (Left), `gap - 1` (Right), `gap + N` (Up) or `gap - N` (Down), only if it is a
   neighbour of the gap (`preventDefault()` them).
5. Draw `Moves 3` at the top left (`LEFT`, `y = 36`, white, `'bold 18px sans-serif'`).

# --task-tr--

1. `let tiles ...` satırının hemen altına ekle:

   ```js
   let moves
   ```

2. `const solvedTiles = ...` satırının altına bir satır boşluk bırakıp komşuları bulan fonksiyonu ekle:

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

3. `reset()` fonksiyonuna `moves = 0` ekle:

   ```js
   function reset() {
     tiles = solvedTiles()
     moves = 0   // ← yeni
   }
   ```

4. `reset()`'in kapanış `}`'sinden sonra, `function squareX(i)`'den önce bir satır boşluk bırakıp şunları ekle:

   ```js
   // Slide the tile at position i into the gap, if it is next to the gap.
   function move(i) {
     const gap = tiles.indexOf(0)
     if (!neighbors(gap).includes(i)) return
     tiles[gap] = tiles[i]
     tiles[i] = 0
     moves += 1
   }

   canvas.addEventListener('pointerdown', (event) => {
     const rect = canvas.getBoundingClientRect()
     const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
     const y = ((event.clientY - rect.top) * canvas.height) / rect.height - TOP
     const col = Math.floor(x / (SIZE + GAP))
     const row = Math.floor(y / (SIZE + GAP))
     if (col >= 0 && col < N && row >= 0 && row < N) move(row * N + col)
   })

   // An arrow moves the tile on the other side of the gap in that direction: Left slides the tile right of the gap to the left.
   document.addEventListener('keydown', (event) => {
     const gap = tiles.indexOf(0)
     const from = { ArrowLeft: 1, ArrowRight: -1, ArrowUp: N, ArrowDown: -N }[event.key]
     if (from !== undefined) {
       event.preventDefault()
       if (neighbors(gap).includes(gap + from)) move(gap + from)
     }
   })
   ```

5. `draw()` fonksiyonunun sonunda, `tiles.forEach(...)` bloğunu kapatan `})`'den sonra ve fonksiyonun kapanış
   `}`'sinden önce bir satır boşluk bırakıp hamle sayacını çiz:

   ```js
     ctx.fillStyle = 'white'
     ctx.font = 'bold 18px sans-serif'
     ctx.textBaseline = 'alphabetic'
     ctx.textAlign = 'left'
     ctx.fillText('Moves ' + moves, LEFT, 36)
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla: 15'e ya da 12'ye tıkla, boşluğa kaymalı. Ok tuşlarını da dene.
   Uzaktaki bir taşa tıklamak hiçbir şey yapmamalı; `Moves` her kaymada 1 artmalı. Alttaki kontrollerin hepsi yeşil
   olmalı. Kenar kontrolü kırmızıysa `neighbors` içindeki `N - 1` karşılaştırmalarını kontrol et.

# --tests--

Neighbours should stop at the edges of the board.
tr: Komşular tahtanın kenarlarında durmalı.

```js
assert.sameMembers(neighbors(5), [1, 9, 4, 6])
assert.sameMembers(neighbors(0), [4, 1])
assert.sameMembers(neighbors(3), [7, 2], 'square 4 is on the next row, not a neighbour')
assert.sameMembers(neighbors(15), [11, 14])
```

Clicking a tile next to the gap should slide it; others should not move.
tr: Boşluğun yanındaki bir taşa tıklamak onu kaydırmalı; diğerleri hareket etmemeli.

```js
$.click(248, 393) // tile 15, left of the gap
assert.deepEqual(tiles.slice(12), [13, 14, 0, 15])
assert.strictEqual(moves, 1)
$.click(56, 105) // tile 1: far from the gap
assert.strictEqual(tiles[0], 1)
assert.strictEqual(moves, 1)
$.tick(1)
assert.include($.texts(), 'Moves 1')
```

The arrows should move the tile next to the gap towards it.
tr: Oklar boşluğun yanındaki taşı ona doğru hareket ettirmeli.

```js
$.press('ArrowRight') // the tile left of the gap (15) goes right
assert.deepEqual(tiles.slice(12), [13, 14, 0, 15])
$.press('ArrowDown') // the tile above the gap (11) comes down
assert.deepEqual([tiles[10], tiles[14]], [0, 11])
$.press('ArrowLeft') // the tile right of the gap (12) goes left
assert.strictEqual(tiles.indexOf(0), 11)
$.press('ArrowLeft') // the gap is in the last column: position 12 is on the next row, not a neighbour
assert.strictEqual(tiles.indexOf(0), 11)
assert.strictEqual(moves, 3)
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
let moves

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
  moves = 0
}

// Slide the tile at position i into the gap, if it is next to the gap.
function move(i) {
  const gap = tiles.indexOf(0)
  if (!neighbors(gap).includes(i)) return
  tiles[gap] = tiles[i]
  tiles[i] = 0
  moves += 1
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - TOP
  const col = Math.floor(x / (SIZE + GAP))
  const row = Math.floor(y / (SIZE + GAP))
  if (col >= 0 && col < N && row >= 0 && row < N) move(row * N + col)
})

// An arrow moves the tile on the other side of the gap in that direction: Left slides the tile right of the gap to the left.
document.addEventListener('keydown', (event) => {
  const gap = tiles.indexOf(0)
  const from = { ArrowLeft: 1, ArrowRight: -1, ArrowUp: N, ArrowDown: -N }[event.key]
  if (from !== undefined) {
    event.preventDefault()
    if (neighbors(gap).includes(gap + from)) move(gap + from)
  }
})

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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillText('Moves ' + moves, LEFT, 36)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
