---
title: Arrow keys
title_tr: Ok tuşları
skills: [game.input]
---

# --goal--

The arrow keys feel best when they move a tile **towards** the gap: Left slides the tile on the right of the gap to the
left. A small lookup object says where that tile is.

# --goal-tr--

Klavyeyle de oynayalım. Oklar en doğal şöyle hissettirir: ok, **taşı** o yöne götürür. Sol ok, boşluğun **sağındaki**
taşı sola kaydırır; yukarı ok, boşluğun **altındaki** taşı yukarı çeker.

Hangi taşın geleceğini küçük bir tablodan (nesne) buluruz: sol ok → boşluğun bir sağı (`+1`), yukarı ok → bir altı
(`+N`)...

# --code--

```js
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

# --meaning--

- `keydown` fires when a key goes down; `event.key` is its name, such as `'ArrowLeft'`.
- The object `{ ArrowLeft: 1, ... }` is read with `[event.key]`: for Left it gives 1, for any other key `undefined`.
- `event.preventDefault()` stops the arrows from scrolling the page.
- `gap + from` is the tile to move; the neighbour check stops it from wrapping to another row.

# --meaning-tr--

- `document.addEventListener('keydown', (event) => { ... })` → sayfada bir tuşa **basıldığında** çalışır. `event.key`
  tuşun adı: `'ArrowLeft'`, `'ArrowUp'`...
- `{ ArrowLeft: 1, ArrowRight: -1, ArrowUp: N, ArrowDown: -N }` → bir **nesne**, burada bir **tablo**: sol tarafta ad,
  sağ tarafta değer. Sondaki `[event.key]` tablodan o tuşun değerini okur: sol okta `1`. Tabloda olmayan bir tuşta
  `undefined` ("yok") çıkar.
- `if (from !== undefined)` → `!==` "eşit değil": yani bir **ok tuşuysa**.
- `event.preventDefault()` → tarayıcının kendi işini engeller: oklar normalde sayfayı kaydırır.
- `neighbors(gap).includes(gap + from)` → gelecek taş gerçekten boşluğun komşusu mu? Boşluk son sütundaysa `gap + 1` bir
  alt satırın başıdır; bu kontrol onu engeller.

# --task--

Above `function squareX(i)`, write the comment and the listener, and leave an empty line. Press **Run** and try the
arrows.

# --task-tr--

`function squareX(i) {` satırının **üstüne** yorum satırını ve dinleyiciyi yaz; arada bir boş satır kalsın.
**Çalıştır**, oyuna bir kez tıkla ve okları dene.

# --predict--

The gap is in the bottom-right corner. What does the **Up** arrow do?
- [ ] The tile above the gap goes up
- [x] Nothing
  Up pulls the tile **below** the gap up, and there is no row below the bottom one.
- [ ] Tile 12 comes down

# --predict-tr--

Boşluk sağ alt köşede. **Yukarı** ok ne yapar?
- [ ] Boşluğun üstündeki taş yukarı gider
- [x] Hiçbir şey
  Yukarı ok boşluğun **altındaki** taşı yukarı çeker; en alt satırın altında satır yok.
- [ ] 12 aşağı iner

# --tests--

The arrows should move the tile next to the gap towards it.
tr: Oklar boşluğun yanındaki taşı ona doğru götürmeli.

```js
$.press('ArrowRight') // the tile left of the gap (15) goes right
assert.deepEqual(tiles.slice(12), [13, 14, 0, 15])
$.press('ArrowDown') // the tile above the gap (11) comes down
assert.deepEqual([tiles[10], tiles[14]], [0, 11])
$.press('ArrowLeft') // the tile right of the gap (12) goes left
assert.strictEqual(tiles.indexOf(0), 11)
```

An arrow should not pull a tile from another row.
tr: Bir ok başka satırdan taş çekmemeli.

```js
$.press('ArrowRight')
$.press('ArrowDown')
$.press('ArrowLeft')
$.press('ArrowLeft') // the gap is in the last column: position 12 is on the next row, not a neighbour
assert.strictEqual(tiles.indexOf(0), 11)
$.press('a')
assert.strictEqual(tiles.indexOf(0), 11)
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

// Slide the tile at position i into the gap, if it is next to the gap.
function move(i) {
  const gap = tiles.indexOf(0)
  if (!neighbors(gap).includes(i)) return
  tiles[gap] = tiles[i]
  tiles[i] = 0
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
