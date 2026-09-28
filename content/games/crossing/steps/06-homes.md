---
title: Four homes and faster levels
title_tr: Dört ev ve hızlanan bölümler
skills: [game.state]
---

# --explanation--

Reaching the far bank is not enough: the frog has to land **in a home**. The bank has four home slots; the rest is
bushes, and landing in a bush (or in a home that already has a frog) costs a life. That turns the river into a real
puzzle: you have to pick the log that carries you to the right place.

The homes are just four column numbers, plus a matching array of true/false:

```js
const HOMES = [1, 4, 7, 10]
filled = HOMES.map(() => false)   // [false, false, false, false]
const i = HOMES.indexOf(frog.x)   // -1 when the frog is not in front of a home
```

Row 0 has no lane, so the rounding from the last step already lines the frog up with a column before this check. When
all four homes are full, the level goes up, the homes empty and everything moves a quarter faster. Multiplying every
speed by one `pace` number is a simple, very common way to make a game harder: the level design stays the same, only the
tempo changes. A cap (`Math.min(2, ...)`) keeps late levels possible.

# --explanation-tr--

**Bu adımda:** karşı kıyıya dört ev ekleyeceğiz. En üst yeşil şeritte dört mavi kare (ev) görünecek. Kurbağa bir
eve ulaşınca ev açık yeşil bir kurbağayla dolacak ve yeni kurbağa alttan başlayacak. Dört ev dolunca bölüm atlanacak
ve her şey biraz hızlanacak. Sağ üstte `Level 1   Lives: 3` yazacak.

**Kıyıya varmak yetmez.** Kurbağanın bir **eve** konması gerekiyor. Karşı kıyıda dört ev yeri var; geri kalanı
çalılık. Çalıya (ya da içinde zaten kurbağa olan bir eve) konmak bir cana mal olur. Bu, nehri gerçek bir bulmacaya
çevirir: seni doğru yere taşıyacak kütüğü seçmelisin.

**Evler = dört sütun numarası.** Evleri sadece hangi sütunda olduklarıyla tutarız, bir de her ev için "dolu mu?"
diyen bir doğru/yanlış listesiyle:

```js
const HOMES = [1, 4, 7, 10]         // evlerin sütunları
filled = HOMES.map(() => false)     // [false, false, false, false]
const i = HOMES.indexOf(frog.x)     // kurbağa hangi evin önünde? değilse -1
```

- `map` bir listenin her elemanı için küçük fonksiyonu çalıştırıp cevaplardan **yeni bir liste** yapar. Burada
  fonksiyon hiçbir şeye bakmadan `false` verdiği için dört tane `false` çıkar. (`() =>` parametresi olmayan bir ok
  fonksiyonudur.)
- `indexOf(değer)` değerin listede **kaçıncı sırada** olduğunu verir (sayma 0'dan başlar); yoksa `-1` verir.
  `HOMES.indexOf(7)` → `2`, `HOMES.indexOf(5)` → `-1`.
- `filled[i]` listenin `i`'nci elemanıdır: o ev dolu mu?

Satır 0'da şerit olmadığı için, geçen adımdaki yuvarlama bu kontrolden önce kurbağayı zaten bir sütuna oturtmuş
olur. Kütükten 6,7'de atlayan kurbağa 7'ye yuvarlanır.

**Hepsi dolu mu?** `filled.every(Boolean)` → "listedeki her eleman doğru mu?" `every` her elemanı sırayla verilen
fonksiyona sorar; `Boolean` bir değeri doğruya ya da yanlışa çeviren hazır bir fonksiyondur. Dört ev de doluysa
cevap doğrudur.

**Hızlanan bölümler.** Dört ev dolunca bölüm (`level`) artar, evler boşalır ve her şey dörtte bir hızlanır. Bütün
hızları tek bir `pace` (tempo) sayısıyla çarpmak bir oyunu zorlaştırmanın basit ve çok yaygın bir yoludur: bölüm
tasarımı aynı kalır, sadece tempo değişir.

```js
const pace = Math.min(2, 1 + (level - 1) * 0.25)
```

1. bölümde `1`, 2.'de `1.25`, 3.'de `1.5`... `Math.min(2, ...)` iki sayıdan küçüğünü verdiği için tempo asla 2'yi
(iki kat hız) geçmez; ileri bölümler de oynanabilir kalır.

**`forEach` ile elemanı ve sırasını birlikte almak.** Evleri çizerken her evin hem sütununa hem sırasına (dolu mu
diye `filled`'e bakmak için) ihtiyacımız var:

```js
HOMES.forEach((col, i) => { ... })
```

`forEach` her eleman için fonksiyonu çağırır ve ona elemanı (`col`) ve sıra numarasını (`i`) verir.

# --task--

1. Add `HOMES = [1, 4, 7, 10]`, `let level` and `let filled`; `reset()` sets `level = 1` and four `false`s.
2. At the end of `hop()`, call `reachHome()` when the frog is in row 0. `reachHome()`: if `frog.x` is not a home or that
   home is filled, `die()`. Otherwise fill it and start a new frog; if every home is filled, add 1 to `level` and empty
   the homes.
3. In `update()`, use `pace = Math.min(2, 1 + (level - 1) * 0.25)` for both the lanes and the ride on a log.
4. Draw each home as a `'#1e3a8a'` tile in row 0, with a `'#86efac'` frog (8-pixel inset) in it when filled. Show the
   level before the lives: `Level 2   Lives: 3`.

# --task-tr--

1. `// Rows from the top: ...` yorum satırının hemen altına (`// speed is in tiles ...` satırından önce) evleri
   ekle:

   ```js
   const HOMES = [1, 4, 7, 10] // columns of the home slots in row 0
   ```

2. `let state // 'playing' or 'over'` satırının altına:

   ```js
   let level
   let filled // one true/false per home
   ```

3. `reset()` fonksiyonuna, `state = 'playing'` satırının altına iki satır ekle:

   ```js
   function reset() {
     lives = 3
     state = 'playing'
     level = 1                          // ← yeni
     filled = HOMES.map(() => false)    // ← yeni
     for (const lane of LANES) lane.offset = 0
     newFrog()
   }
   ```

4. `hop()` fonksiyonunun sonuna, kıyıya varınca evi kontrol eden satırı ekle ve fonksiyonun hemen altına
   `reachHome()`'u yaz:

   ```js
     if (!lane || !lane.log) frog.x = Math.round(frog.x)
     if (frog.y === 0) reachHome()   // ← yeni
   }

   function reachHome() {
     const i = HOMES.indexOf(frog.x)
     if (i === -1 || filled[i]) {
       die()
       return
     }
     filled[i] = true
     if (filled.every(Boolean)) {
       level += 1
       filled = HOMES.map(() => false)
     }
     newFrog()
   }
   ```

   Okuyalım: kurbağa bir evin önünde değilse **veya** o ev doluysa öl. Değilse evi doldur; dördü de dolduysa bölümü
   artır ve evleri boşalt. Her durumda yeni kurbağa alttan başlar.

5. `update()` fonksiyonunda şeritleri kaydıran `for (const lane of LANES) lane.offset += lane.speed` satırını şu üç
   satırla değiştir:

   ```js
     // Each level is a quarter faster, up to twice the starting speed.
     const pace = Math.min(2, 1 + (level - 1) * 0.25)
     for (const lane of LANES) lane.offset += lane.speed * pace
   ```

6. Yine `update()`'in sonlarında, kütüğün kurbağayı taşıdığı `frog.x += lane.speed` satırını şöyle değiştir:

   ```js
     frog.x += lane.speed * pace   // ← değişti
   ```

7. `draw()` fonksiyonunda, satırları çizen `for (let row = 0; ...)` döngüsünün kapanış `}`'inin hemen altına evleri
   çiz:

   ```js
     HOMES.forEach((col, i) => {
       ctx.fillStyle = '#1e3a8a'
       ctx.fillRect(col * TILE, TOP, TILE, TILE)
       if (filled[i]) {
         ctx.fillStyle = '#86efac'
         ctx.fillRect(col * TILE + 8, TOP + 8, TILE - 16, TILE - 16)
       }
     })
   ```

   Her ev satır 0'da mavi bir döşemedir; doluysa içine her kenardan 8 piksel küçük açık yeşil bir kurbağa çizilir.

8. Yine `draw()`'da can yazısını bölümü de gösterecek şekilde değiştir:

   ```js
     ctx.fillText('Level ' + level + '   Lives: ' + lives, canvas.width - 10, 27)   // ← değişti
   ```

   `'   Lives: '`'ın başında **üç** boşluk var.

9. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Üst kıyıda dört mavi ev görmelisin. Oynamak için önce oyuna tıkla ve
   bir eve ulaş: ev dolmalı, yeni kurbağa alttan başlamalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı
   kalırsa `Level 2   Lives: 3` yazısındaki boşlukları ve `pace`'in iki yerde de kullanıldığını kontrol et.

# --tests--

Hopping into an empty home should fill it and bring the next frog.
tr: Boş bir eve zıplamak onu doldurmalı ve sıradaki kurbağayı getirmeli.

```js
frog = { x: 4, y: 1 }
$.press('ArrowUp')
assert.deepEqual(filled, [false, true, false, false])
assert.deepEqual(frog, { x: 5, y: 12 })
assert.strictEqual(lives, 3)
$.tick(1)
assert.lengthOf($.rects('#86efac'), 1)
```

A frog slightly off a home column should be rounded into it.
tr: Bir ev sütunundan biraz kaymış kurbağa içine yuvarlanmalı.

```js
frog = { x: 6.7, y: 1 }
$.press('ArrowUp')
assert.deepEqual(filled, [false, false, true, false])
```

Landing in a bush or a filled home should cost a life.
tr: Bir çalıya ya da dolu bir eve konmak bir cana mal olmalı.

```js
frog = { x: 5, y: 1 }
$.press('ArrowUp')
assert.strictEqual(lives, 2)
assert.deepEqual(filled, [false, false, false, false])
filled = [true, false, false, false]
frog = { x: 1, y: 1 }
$.press('ArrowUp')
assert.strictEqual(lives, 1)
```

Filling all four homes should start a faster level.
tr: Dört evi de doldurmak daha hızlı bir bölüm başlatmalı.

```js
filled = [true, true, false, true]
frog = { x: 7, y: 1 }
$.press('ArrowUp')
assert.strictEqual(level, 2)
assert.deepEqual(filled, [false, false, false, false])
$.tick(1)
assert.closeTo(laneAt(7).offset, -0.0625, 1e-9, 'a quarter faster')
assert.include($.texts(), 'Level 2   Lives: 3')
level = 20
$.tick(1)
assert.closeTo(laneAt(7).offset, -0.0625 - 0.1, 1e-9, 'never more than twice as fast')
```

# --solution--

```js
// Road and river crossing, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const TOP = 40 // room for the score and the lives
const START_ROW = 12
// Rows from the top: 0 the far bank with the homes, 1-5 the river, 6 a safe strip, 7-11 the road, 12 the start.
const HOMES = [1, 4, 7, 10] // columns of the home slots in row 0
// speed is in tiles per frame (negative = to the left), len and spacing in tiles.
const LANES = [
  { row: 1, speed: 0.025, len: 3, spacing: 5, log: true },
  { row: 2, speed: -0.035, len: 4, spacing: 6, log: true },
  { row: 3, speed: 0.02, len: 2, spacing: 4, log: true },
  { row: 4, speed: -0.03, len: 3, spacing: 5, log: true },
  { row: 5, speed: 0.04, len: 4, spacing: 6, log: true },
  { row: 7, speed: -0.05, len: 1, spacing: 4, color: '#ef4444' },
  { row: 8, speed: 0.035, len: 2, spacing: 6, color: '#f59e0b' },
  { row: 9, speed: -0.06, len: 1, spacing: 5, color: '#e879f9' },
  { row: 10, speed: 0.03, len: 1, spacing: 4, color: '#38bdf8' },
  { row: 11, speed: -0.025, len: 2, spacing: 5, color: '#f97316' },
]

let frog
let lives
let state // 'playing' or 'over'
let level
let filled // one true/false per home

function newFrog() {
  frog = { x: 5, y: START_ROW }
}

function reset() {
  lives = 3
  state = 'playing'
  level = 1
  filled = HOMES.map(() => false)
  for (const lane of LANES) lane.offset = 0
  newFrog()
}

function laneAt(row) {
  return LANES.find((lane) => lane.row === row)
}

// A lane repeats every `period` tiles, which is always wider than the screen plus one car or log.
function period(lane) {
  return lane.spacing * Math.ceil((COLS + lane.len) / lane.spacing)
}

// Left edges (in tiles) of the cars or logs in a lane right now.
function items(lane) {
  const p = period(lane)
  const xs = []
  for (let start = 0; start < p; start += lane.spacing) {
    xs.push((((start + lane.offset) % p) + p) % p - lane.len)
  }
  return xs
}

function hop(dx, dy) {
  if (state !== 'playing') return
  frog.x = Math.min(COLS - 1, Math.max(0, frog.x + dx))
  frog.y = Math.min(START_ROW, Math.max(0, frog.y + dy))
  const lane = laneAt(frog.y)
  // Back on solid ground: line up with the grid again.
  if (!lane || !lane.log) frog.x = Math.round(frog.x)
  if (frog.y === 0) reachHome()
}

function reachHome() {
  const i = HOMES.indexOf(frog.x)
  if (i === -1 || filled[i]) {
    die()
    return
  }
  filled[i] = true
  if (filled.every(Boolean)) {
    level += 1
    filled = HOMES.map(() => false)
  }
  newFrog()
}

function die() {
  lives -= 1
  if (lives > 0) {
    newFrog()
    return
  }
  state = 'over'
}

const DIRECTIONS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
document.addEventListener('keydown', (event) => {
  const direction = DIRECTIONS[event.key]
  if (direction) {
    event.preventDefault()
    // One hop per press: holding the key down does not hop again.
    if (!event.repeat) hop(...direction)
  }
  if (event.key === ' ' && state === 'over') reset()
})

// Touch: a swipe hops that way, a short tap hops forward.
let swipeStart = null
canvas.addEventListener('pointerdown', (event) => {
  swipeStart = { x: event.clientX, y: event.clientY }
})
canvas.addEventListener('pointerup', (event) => {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (state === 'over') {
    reset()
  } else if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
    hop(0, -1)
  } else if (Math.abs(dx) > Math.abs(dy)) {
    hop(Math.sign(dx), 0)
  } else {
    hop(0, Math.sign(dy))
  }
})

function hitByCar(lane) {
  return items(lane).some((x) => frog.x + 0.15 < x + lane.len && frog.x + 0.85 > x)
}

function onLog(lane) {
  const middle = frog.x + 0.5
  return items(lane).some((x) => middle > x && middle < x + lane.len)
}

function update() {
  if (state !== 'playing') return
  // Each level is a quarter faster, up to twice the starting speed.
  const pace = Math.min(2, 1 + (level - 1) * 0.25)
  for (const lane of LANES) lane.offset += lane.speed * pace

  const lane = laneAt(frog.y)
  if (!lane) return
  if (!lane.log) {
    if (hitByCar(lane)) die()
    return
  }
  if (!onLog(lane)) {
    die()
    return
  }
  // The log carries the frog; being carried off the screen is a splash too.
  frog.x += lane.speed * pace
  if (frog.x < -0.5 || frog.x > COLS - 0.5) die()
}

function rowColor(row) {
  if (row === 0) return '#166534'
  if (row <= 5) return '#1e3a8a'
  if (row === 6 || row === START_ROW) return '#4d7c0f'
  return '#1f2937'
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row <= START_ROW; row++) {
    ctx.fillStyle = rowColor(row)
    ctx.fillRect(0, TOP + row * TILE, canvas.width, TILE)
  }
  HOMES.forEach((col, i) => {
    ctx.fillStyle = '#1e3a8a'
    ctx.fillRect(col * TILE, TOP, TILE, TILE)
    if (filled[i]) {
      ctx.fillStyle = '#86efac'
      ctx.fillRect(col * TILE + 8, TOP + 8, TILE - 16, TILE - 16)
    }
  })

  for (const lane of LANES) {
    ctx.fillStyle = lane.log ? '#92400e' : lane.color
    const inset = lane.log ? 4 : 6
    for (const x of items(lane)) {
      ctx.fillRect(x * TILE + 2, TOP + lane.row * TILE + inset, lane.len * TILE - 4, TILE - inset * 2)
    }
  }

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('Level ' + level + '   Lives: ' + lives, canvas.width - 10, 27)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
