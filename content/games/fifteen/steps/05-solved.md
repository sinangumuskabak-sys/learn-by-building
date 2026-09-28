---
title: Solved!
title_tr: Çözüldü!
skills: [game.state]
---

# --explanation--

After every move, check whether the board is back in order. When it is, the game stops taking moves, the tiles turn green
and the number of moves is compared with the best so far.

As in the raycaster, **fewer** is better here, so "is this a new best?" reads `best === 0 || moves < best`: no record yet,
or a smaller number. Saving the record in `localStorage` makes it survive a reload.

A click (or Space) on a solved board shuffles a new one. That completes the puzzle: a flat array with grid neighbours, a
shuffle that is always solvable (and the math behind it), smooth sliding and a record to beat.

# --explanation-tr--

**Bu adımda:** bulmacayı çözünce oyun bunu fark edecek: taşlar yeşile döner, sağ üstte `Solved! Click to shuffle`
yazar ve hamle sayın en iyi sonuçla (rekorla) karşılaştırılır. Tıklayınca (ya da boşluk tuşuyla) yeni bir karışık
tahta gelir; sağ üstte `Best 42` gibi rekorun görünür.

**Durum.** Oyunun aşamasını `state` değişkeninde bir yazı olarak tutarız: `'playing'` (oynanıyor) ya da `'solved'`
(çözüldü). Her hamleden sonra `isSolved()` ile bakarız; çözüldüyse durum `'solved'` olur ve `move()` artık hamle
kabul etmez: `if (state !== 'playing' || slide) return` → "oyun sürmüyorsa **veya** (`||`) bir taş kayıyorsa çık".

**Burada az olan iyidir.** Rekor "en az hamle"dir. "Bu yeni rekor mu?" sorusu şöyle okunur:

```js
best === 0 || moves < best
```

"Henüz rekor yoksa (0) **veya** bu hamle sayısı rekordan küçükse." İlk çözüşünde rekor 0 olduğu için ne yaparsan yap
rekor olur.

**Rekoru saklamak: `localStorage`.** Değişkenler sayfa kapanınca silinir. `localStorage` tarayıcının küçük bir
defteridir; sayfayı yenilesen de içindekiler durur. Ama sadece **yazı** saklar:

- `localStorage.setItem('fifteen-best', best)` → `'fifteen-best'` başlığıyla yaz.
- `localStorage.getItem('fifteen-best')` → oku; hiç yazılmamışsa `null` (boş) verir.
- `Number(...)` yazıyı sayıya çevirir; `|| 0` "sonuç boş ya da geçersizse 0 kullan" demektir.

**Yeni tahta.** Çözülmüş tahtada tıklama `reset()` çağırır ve `return` ile çıkar (taş kaydırma koduna inmez).
Klavyede boşluk tuşunun adı `' '` (iki tırnak arasında bir boşluk).

**İç içe kısa `if`.** Sağ üstteki yazı tek satırda seçilir:

```js
state === 'solved' ? 'Solved! Click to shuffle' : best ? 'Best ' + best : ''
```

`? :` kısa bir `if`/`else`'tir: "çözüldüyse bu yazı; değilse, rekor varsa `'Best 42'`; o da yoksa boş yazı". `best`
0 ise "yanlış" sayılır. `ctx.textAlign = 'right'` yazının **sağ ucunu** verilen noktaya (`canvas.width - LEFT`,
tahtanın sağ kenarı) koyar.

# --task--

1. Add `state` (`'playing'` in `reset()`) and `best` (from `localStorage` `'fifteen-best'`).
2. `move()` does nothing unless playing. After a move, if the board is solved, the state becomes `'solved'` and the moves are
   saved as `best` if they beat it.
3. When solved, a click or Space calls `reset()`.
4. Draw the tiles `'#16a34a'` once solved. At the top right (right-aligned to `canvas.width - LEFT`), show
   `Solved! Click to shuffle` when solved, otherwise `Best 42` if there is a best.

# --task-tr--

1. `let moves` satırının hemen altına ekle:

   ```js
   let state // 'playing' or 'solved'
   ```

2. `let slide ...` satırının hemen altına ekle:

   ```js
   let best = Number(localStorage.getItem('fifteen-best')) || 0
   ```

3. `reset()` içinde `moves = 0` satırının altına ekle:

   ```js
     state = 'playing'
   ```

4. `move(i)` fonksiyonunu şöyle değiştir:

   ```js
   function move(i) {
     if (state !== 'playing' || slide) return                  // ← değişti
     const gap = tiles.indexOf(0)
     if (!neighbors(gap).includes(i)) return
     slide = { tile: tiles[i], from: i, to: gap, frame: 0 }
     tiles[gap] = tiles[i]
     tiles[i] = 0
     moves += 1
     if (isSolved()) {                                         // ← yeni
       state = 'solved'                                        // ← yeni
       if (best === 0 || moves < best) {                       // ← yeni
         best = moves                                          // ← yeni
         localStorage.setItem('fifteen-best', best)            // ← yeni
       }                                                       // ← yeni
     }                                                         // ← yeni
   }
   ```

5. `pointerdown` dinleyicisinin **en başına**, `(event) => {` satırının hemen altına ekle:

   ```js
     if (state === 'solved') {
       reset()
       return
     }
   ```

6. `keydown` dinleyicisinde, `if (from !== undefined) { ... }` bloğunu kapatan `}`'den sonra ve dinleyicinin kapanış
   `})`'sinden önce ekle:

   ```js
     if (event.key === ' ' && state === 'solved') reset()
   ```

7. `drawTile` fonksiyonunun ilk satırını şöyle değiştir:

   ```js
     ctx.fillStyle = state === 'solved' ? '#16a34a' : '#f59e0b'   // ← değişti
   ```

8. `draw()`'un sonunda `ctx.fillText('Moves ' + moves, LEFT, 36)` satırının altına ekle:

   ```js
     ctx.textAlign = 'right'
     ctx.fillText(state === 'solved' ? 'Solved! Click to shuffle' : best ? 'Best ' + best : '', canvas.width - LEFT, 36)
   ```

9. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla ve bulmacayı çöz (biraz sürebilir). Çözünce taşlar yeşile dönmeli ve sağ üstte `Solved! Click to shuffle` yazmalı;
   tıklayınca yeni tahta gelmeli. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

Putting the last tile back should solve the puzzle and set a record.
tr: Son taşı yerine koymak bulmacayı çözmeli ve bir rekor koymalı.

```js
tiles = solvedTiles()
;[tiles[14], tiles[15]] = [0, 15]
moves = 41
move(15)
assert.strictEqual(state, 'solved')
assert.strictEqual(best, 42)
assert.strictEqual(localStorage.getItem('fifteen-best'), '42')
$.tick(10)
assert.lengthOf($.rects('#16a34a'), 15)
assert.include($.texts(), 'Solved! Click to shuffle')
```

A solved board should take no more moves, and a click should shuffle a new one.
tr: Çözülmüş bir tahta daha fazla hamle almamalı ve bir tıklama yenisini karıştırmalı.

```js
tiles = solvedTiles()
;[tiles[14], tiles[15]] = [0, 15]
move(15)
$.tick(10)
$.press('ArrowRight')
assert.isTrue(isSolved(), 'no more moves once solved')
assert.strictEqual(moves, 1)
$.click(200, 200)
assert.strictEqual(state, 'playing')
assert.isFalse(isSolved())
assert.strictEqual(moves, 0)
$.tick(1)
assert.include($.texts(), 'Best 1')
```

A worse result should not replace the record.
tr: Daha kötü bir sonuç rekorun yerini almamalı.

```js
best = 30
tiles = solvedTiles()
;[tiles[14], tiles[15]] = [0, 15]
moves = 50
move(15)
assert.strictEqual(state, 'solved')
assert.strictEqual(best, 30)
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
const SLIDE_FRAMES = 8

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row
let moves
let state // 'playing' or 'solved'
let slide // the tile sliding right now: { tile, from, to, frame }, or null
let best = Number(localStorage.getItem('fifteen-best')) || 0

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

// A position can be solved when the number of pairs out of order, plus the gap's row counted from the bottom, is odd.
function solvable(list) {
  const numbers = list.filter((t) => t !== 0)
  let inversions = 0
  for (let a = 0; a < numbers.length; a++) {
    for (let b = a + 1; b < numbers.length; b++) if (numbers[a] > numbers[b]) inversions++
  }
  const gapRowFromBottom = N - rowOf(list.indexOf(0))
  return (inversions + gapRowFromBottom) % 2 === 1
}

function reset() {
  tiles = solvedTiles()
  do shuffle(200)
  while (isSolved())
  moves = 0
  state = 'playing'
  slide = null
}

function isSolved() {
  return tiles.every((t, i) => t === solvedTiles()[i])
}

// Slide the tile at position i into the gap, if it is next to the gap.
function move(i) {
  if (state !== 'playing' || slide) return
  const gap = tiles.indexOf(0)
  if (!neighbors(gap).includes(i)) return
  slide = { tile: tiles[i], from: i, to: gap, frame: 0 }
  tiles[gap] = tiles[i]
  tiles[i] = 0
  moves += 1
  if (isSolved()) {
    state = 'solved'
    if (best === 0 || moves < best) {
      best = moves
      localStorage.setItem('fifteen-best', best)
    }
  }
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'solved') {
    reset()
    return
  }
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
  if (event.key === ' ' && state === 'solved') reset()
})

function update() {
  if (!slide) return
  slide.frame += 1
  if (slide.frame >= SLIDE_FRAMES) slide = null
}

function squareX(i) {
  return LEFT + colOf(i) * (SIZE + GAP)
}
function squareY(i) {
  return TOP + rowOf(i) * (SIZE + GAP)
}

function drawTile(number, x, y) {
  ctx.fillStyle = state === 'solved' ? '#16a34a' : '#f59e0b'
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
    if (number === 0 || (slide && number === slide.tile)) return
    drawTile(number, squareX(i), squareY(i))
  })
  // The sliding tile is drawn part of the way from its old square to its new one.
  if (slide) {
    const t = slide.frame / SLIDE_FRAMES
    const x = squareX(slide.from) + (squareX(slide.to) - squareX(slide.from)) * t
    const y = squareY(slide.from) + (squareY(slide.to) - squareY(slide.from)) * t
    drawTile(slide.tile, x, y)
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillText('Moves ' + moves, LEFT, 36)
  ctx.textAlign = 'right'
  ctx.fillText(state === 'solved' ? 'Solved! Click to shuffle' : best ? 'Best ' + best : '', canvas.width - LEFT, 36)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
