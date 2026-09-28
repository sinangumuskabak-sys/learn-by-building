---
title: Smooth sliding
title_tr: Akıcı kaydırma
skills: [game.loop, game.state]
---

# --explanation--

When a tile jumps to its new square, the eye cannot follow which tile moved. A short **slide** of 8 frames makes every move
readable.

The board changes at once, as before: the game logic does not wait for animations. Separately, `slide` remembers which tile
is moving, from where to where, and how many frames of the animation have passed. The drawing uses it to put that tile part
of the way along:

```js
const t = slide.frame / SLIDE_FRAMES      // 0 at the start, 1 at the end
const x = fromX + (toX - fromX) * t       // the same linear interpolation as always
```

Keeping the **state** (where the tiles are) apart from the **presentation** (where they are drawn right now) keeps the rules
simple: tests, the solved check and the move counter never have to think about animation.

While a tile is sliding, other moves wait, so fast clicks cannot make tiles overlap.

# --explanation-tr--

**Bu adımda:** taşlar yeni yerine zıplamak yerine **kayarak** gidecek. Bir taşa tıklayınca 8 kare (yaklaşık 0,13
saniye) boyunca boşluğa doğru süzüldüğünü göreceksin.

**Neden?** Taş bir anda yeni karesine atlayınca göz hangi taşın hareket ettiğini izleyemez. Kısa bir kayma her hamleyi
okunur yapar.

**Durum ile görüntü ayrı.** Tahta (`tiles`) eskisi gibi **hemen** değişir; oyunun kuralları animasyonu beklemez. Ayrı
olarak `slide` adlı bir nesne hangi taşın, nereden nereye kaydığını ve animasyonun kaçıncı karesinde olduğunu hatırlar:

```js
slide = { tile: 15, from: 14, to: 15, frame: 0 }
```

Çizim bu bilgiyle o taşı yolun bir kısmına koyar:

```js
const t = slide.frame / SLIDE_FRAMES      // başta 0, sonda 1
const x = fromX + (toX - fromX) * t       // başlangıç + (bitiş - başlangıç) * t
```

Buna **doğrusal interpolasyon** (lerp) denir: `t` 0'dan 1'e giderken `x` başlangıçtan bitişe yürür. **Durumu**
(taşlar nerede) **görüntüden** (şu an nerede çiziliyorlar) ayrı tutmak kuralları basit tutar: hamle sayacı ve
"çözüldü mü?" kontrolü animasyonu hiç düşünmek zorunda kalmaz.

**`null`: bilerek "hiçbir şey".** Kayan taş yokken `slide` değeri `null`'dır. `if (slide)` "kayan bir taş varsa",
`if (!slide)` "yoksa" demektir (`null` yanlış sayılır). Bir taş kayarken `move()` hemen `return` eder; böylece hızlı
tıklamalar taşları üst üste bindiremez.

**`update()`: her karede bir adım.** Döngü artık her karede önce `update()` çağırır: `slide.frame += 1`, 8'e ulaşınca
`slide = null` (animasyon bitti). `>=` "büyük ya da eşit" demektir.

**Çizim.** Kayan taşı yerinde çizmeyiz (`number === slide.tile` ise atla), onu ayrıca iki kare arasında çizeriz.
`slide && number === slide.tile` → "kayan taş varsa **ve** bu o taşsa"; `||` "veya" demektir.

# --task--

1. Add `SLIDE_FRAMES = 8` and `slide` (`null` in `reset()`). `move()` does nothing while `slide` is set, and a move sets
   `slide = { tile, from, to, frame: 0 }` (from the tile's old square to the gap).
2. Write `update()`: add 1 to `slide.frame`, and clear `slide` when it reaches `SLIDE_FRAMES`. Call it every frame.
3. Draw every tile except the sliding one on its square, then the sliding tile between `from` and `to`.

# --task-tr--

1. `const TOP = 60` satırının hemen altına ekle:

   ```js
   const SLIDE_FRAMES = 8
   ```

2. `let moves` satırının hemen altına ekle:

   ```js
   let slide // the tile sliding right now: { tile, from, to, frame }, or null
   ```

3. `reset()` içinde `moves = 0` satırının altına ekle:

   ```js
     slide = null
   ```

4. `move(i)` fonksiyonunu şöyle değiştir:

   ```js
   function move(i) {
     if (slide) return                                        // ← yeni
     const gap = tiles.indexOf(0)
     if (!neighbors(gap).includes(i)) return
     slide = { tile: tiles[i], from: i, to: gap, frame: 0 }   // ← yeni
     tiles[gap] = tiles[i]
     tiles[i] = 0
     moves += 1
   }
   ```

   `slide = ...` satırı, taşlar yer değiştirmeden **önce** olmalı; yoksa `tiles[i]` artık 0'dır.

5. `keydown` dinleyicisinin kapanış `})`'sinden sonra, `function squareX(i)`'den önce bir satır boşluk bırakıp ekle:

   ```js
   function update() {
     if (!slide) return
     slide.frame += 1
     if (slide.frame >= SLIDE_FRAMES) slide = null
   }
   ```

6. `draw()` içindeki `tiles.forEach` bloğunu ve hemen altını şöyle değiştir:

   ```js
     tiles.forEach((number, i) => {
       if (number === 0 || (slide && number === slide.tile)) return   // ← değişti
       drawTile(number, squareX(i), squareY(i))
     })
     // The sliding tile is drawn part of the way from its old square to its new one.
     if (slide) {                                                                        // ← yeni
       const t = slide.frame / SLIDE_FRAMES                                              // ← yeni
       const x = squareX(slide.from) + (squareX(slide.to) - squareX(slide.from)) * t     // ← yeni
       const y = squareY(slide.from) + (squareY(slide.to) - squareY(slide.from)) * t     // ← yeni
       drawTile(slide.tile, x, y)                                                        // ← yeni
     }                                                                                   // ← yeni
   ```

7. `loop()` fonksiyonunda `draw()`'dan önce `update()` çağır:

   ```js
   function loop() {
     update()   // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

8. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla ve bir taşı kaydır: taş boşluğa süzülerek gitmeli. Alttaki
   kontrollerin hepsi yeşil olmalı. Taş hiç görünmüyorsa `update()`'i `loop()`'a eklediğini kontrol et.

# --tests--

A moved tile should slide over eight frames, while the board changes at once.
tr: Hareket eden bir taş sekiz karede kaymalı, tahta ise hemen değişmeli.

```js
tiles = solvedTiles()
move(14)
assert.deepEqual(tiles.slice(12), [13, 14, 0, 15], 'the board changed at once')
assert.deepEqual(slide, { tile: 15, from: 14, to: 15, frame: 0 })
$.tick(4)
const fifteen = $.rects('#f59e0b').filter((r) => r.y === 348)
assert.sameMembers(fifteen.map((r) => r.x), [11, 107, 11 + 2 * 96 + 48], '13, 14, and 15 halfway')
$.tick(4)
assert.isNull(slide)
$.tick(1)
assert.isTrue($.rects('#f59e0b').some((r) => r.x === 11 + 3 * 96 && r.y === 348))
```

Moves should wait while a tile is sliding.
tr: Bir taş kayarken hamleler beklemeli.

```js
tiles = solvedTiles()
moves = 0
move(14)
move(15)
assert.strictEqual(moves, 1)
$.tick(8)
move(15)
assert.strictEqual(moves, 2)
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
let slide // the tile sliding right now: { tile, from, to, frame }, or null

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
  slide = null
}

function isSolved() {
  return tiles.every((t, i) => t === solvedTiles()[i])
}

// Slide the tile at position i into the gap, if it is next to the gap.
function move(i) {
  if (slide) return
  const gap = tiles.indexOf(0)
  if (!neighbors(gap).includes(i)) return
  slide = { tile: tiles[i], from: i, to: gap, frame: 0 }
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
