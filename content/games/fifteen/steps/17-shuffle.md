---
title: Shuffle with real slides
title_tr: Gerçek kaydırmalarla karıştır
skills: [prog.loops, prog.arrays]
---

# --goal--

A puzzle must start mixed. We start from the solved board and make 200 random slides, never undoing the one just
made. Every board reached like this can be solved by playing the slides backwards.

# --goal-tr--

Bulmaca **karışık** başlamalı. Akla gelen ilk yol listeyi bir deste kart gibi karıştırmak; ama bu bir tuzak (bir
sonraki adımda nedenini göreceğiz).

Güvenli yol: çözülmüş tahtadan başlayıp **200 kez rastgele gerçek bir kaydırma** yapmak. Az önce yapılanı hemen geri
almamaya dikkat ederiz, yoksa boşluk ileri geri gidip durur. Böyle ulaşılan her tahta, hamleleri tersinden oynayarak
**mutlaka çözülebilir**.

# --code--

```js
// Mix the tiles by making random slides, so the puzzle can always be solved.
function shuffle(count) {
  let gap = tiles.indexOf(0)
  let previous = -1
  for (let n = 0; n < count; n++) {
    const options = neighbors(gap).filter((i) => i !== previous) // do not undo the last slide
    const i = options[Math.floor(Math.random() * options.length)]
    tiles[gap] = tiles[i]
    tiles[i] = 0
    previous = gap
    gap = i
  }
}

  tiles = solvedTiles()
  shuffle(200)
```

# --meaning--

- The `for` loop repeats `count` times.
- `options` are the gap's neighbours, except the square the gap just came from (`previous`), so no slide is undone.
- `Math.random()` gives a number from 0 up to 1; times the length, rounded down, it picks a random option.
- The chosen tile slides into the gap, and the gap moves to where the tile was.

# --meaning-tr--

- `let gap = tiles.indexOf(0)` → boşluğun yeri. `let previous = -1` → boşluğun bir önceki yeri; başta hiçbir kareye
  denk gelmeyen bir sayı ("önceki yok").
- `for (let n = 0; n < count; n++) { ... }` → bir **döngü**: `n` 0'dan başlar, `count`'tan küçük olduğu sürece tekrarlar,
  her turda `n++` ile 1 artar. `shuffle(200)` → 200 tur.
- `neighbors(gap).filter((i) => i !== previous)` → boşluğun komşularından, boşluğun **az önce geldiği** kare hariç
  olanları tutar (`filter` süzer, `!==` "eşit değil").
- `Math.random()` → 0 ile 1 arasında rastgele bir sayı. `* options.length` ile çarpıp `Math.floor` ile aşağı yuvarlayınca
  0 ile son sıra arasında rastgele bir sıra çıkar; `options[...]` o seçeneği verir.
- `tiles[gap] = tiles[i]`, `tiles[i] = 0` → seçilen taş boşluğa kayar (`move` gibi).
- `previous = gap`, `gap = i` → boşluk artık taşın eski yerinde; nereden geldiğini hatırlarız.
- `reset` içinde `shuffle(200)` → sıraya dizdikten hemen sonra karıştır.

# --task--

1. Above `function reset()`, write the comment and `shuffle`, and leave an empty line.
2. In `reset`, under `tiles = solvedTiles()`, write `shuffle(200)`. Press **Run** a few times.

# --task-tr--

1. `function reset() {` satırının **üstüne** yorum satırını ve `shuffle` fonksiyonunu yaz; arada bir boş satır kalsın.
2. `reset` içinde `tiles = solvedTiles()` satırının altına `shuffle(200)` yaz.
3. **Çalıştır**'a birkaç kez bas: her seferinde farklı karışık bir tahta görmelisin. Artık gerçekten oynayabilirsin!

# --hint--

`previous` must be updated before `gap`: first remember where the gap was, then move it.

# --hint-tr--

`previous`, `gap`'ten **önce** güncellenmeli: önce boşluğun nerede olduğunu hatırla, sonra onu taşı.

# --tests--

The board should start mixed, with every tile exactly once.
tr: Tahta karışık başlamalı; her taş tam bir kez bulunmalı.

```js
assert.notDeepEqual(tiles, solvedTiles())
assert.deepEqual([...tiles].sort((a, b) => a - b), [...Array(16).keys()])
```

A shuffle should be made of slides and never undo the last one.
tr: Karıştırma kaydırmalardan oluşmalı ve sonuncuyu asla geri almamalı.

```js
tiles = solvedTiles()
shuffle(1)
assert.include([11, 14], tiles.indexOf(0))
for (let n = 0; n < 20; n++) {
  tiles = solvedTiles()
  shuffle(2)
  assert.notStrictEqual(tiles.indexOf(0), 15, 'the second slide must not undo the first')
}
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

// Mix the tiles by making random slides, so the puzzle can always be solved.
function shuffle(count) {
  let gap = tiles.indexOf(0)
  let previous = -1
  for (let n = 0; n < count; n++) {
    const options = neighbors(gap).filter((i) => i !== previous) // do not undo the last slide
    const i = options[Math.floor(Math.random() * options.length)]
    tiles[gap] = tiles[i]
    tiles[i] = 0
    previous = gap
    gap = i
  }
}

function reset() {
  tiles = solvedTiles()
  shuffle(200)
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
