---
title: Squashed!
title_tr: Ezildin!
skills: [game.collision, game.state]
---

# --explanation--

The frog lives on the grid, but cars move smoothly, so a car can be half a tile into the frog's tile. Collision is an
**overlap of two ranges** on the x axis (they are always in the same row):

```
frog:   [x + 0.15, x + 0.85]      a little smaller than its tile
car:    [carX, carX + len]
hit when  frog.left < car.right  &&  frog.right > car.left
```

Shrinking the frog by 0.15 of a tile on each side is a **forgiving hitbox**: a car that only brushes the corner of the
frog's tile does not count. Players feel that as fair; an exact hitbox would feel like being hit by a car that missed.

After a hit the frog loses a life and a new frog starts at the bottom. Two functions keep this tidy: `newFrog()` puts a
fresh frog at the start, `reset()` starts a whole new game. Game over is just another **state**: while it is `'over'`,
`update()` and `hop()` do nothing, and Space starts again.

# --explanation-tr--

**Bu adımda:** arabalar kurbağayı ezecek. Sağ üstte `Lives: 3` yazacak; bir arabaya çarpınca bir can gidecek ve
yeni bir kurbağa alttan başlayacak. Canlar bitince tahta kararacak, `Game Over` ve `Press Space to play again`
yazacak; Boşluk'a basınca (ya da dokununca) yeni oyun başlayacak.

**İki aralığın üst üste binmesi.** Kurbağa döşemelerde yaşıyor ama arabalar akıcı kayıyor; bir araba kurbağanın
döşemesine yarım döşeme girmiş olabilir. İkisi hep aynı satırda olduğu için sadece yatayda bakarız: kurbağanın
kapladığı aralık ile arabanın kapladığı aralık üst üste biniyor mu?

```
kurbağa:  [x + 0.15, x + 0.85]     döşemesinden biraz küçük
araba:    [carX, carX + len]
çarpar:   kurbağa.sol < araba.sağ  &&  kurbağa.sağ > araba.sol
```

`&&` "**ve**" demektir: iki koşul da doğruysa çarpışma var. Kâğıda iki çizgi çizip dene: kurbağanın solu arabanın
sağından önce **ve** kurbağanın sağı arabanın solundan sonraysa, çizgiler üst üste biner.

**Affedici çarpışma kutusu.** Kurbağayı her yandan döşemenin 0,15'i kadar küçültmek **affedici** bir kutudur
(forgiving hitbox): kurbağanın döşemesinin sadece köşesini sıyıran bir araba sayılmaz. Oyuncular bunu adil bulur;
tam ölçülü bir kutu "bana değmedi ki!" hissi verir.

`some` bir listenin **en az bir** elemanı için sorunun doğru olup olmadığını söyler:

```js
items(lane).some((x) => frog.x + 0.15 < x + lane.len && frog.x + 0.85 > x)
```

"Bu şeritteki arabalardan herhangi biri kurbağayla üst üste biniyor mu?"

**Kurbağa hangi şeritte?** `find` listede koşulu tutan **ilk** elemanı verir; bulamazsa "hiçbir şey" (`undefined`)
verir. Kurbağa çimendeyse ya da güvenli şeritteyse o satırda şerit yoktur:

```js
LANES.find((lane) => lane.row === row)
```

`if (lane && hitByCar(lane))` → "bir şerit varsa **ve** oradaki bir araba çarpıyorsa". Şerit yoksa `&&`'nin sağına
hiç bakılmaz.

**Toparlamak için iki fonksiyon.** `newFrog()` başlangıca yeni bir kurbağa koyar; `reset()` bütünüyle yeni bir oyun
başlatır (canlar, durum, şeritler, kurbağa). Değişkenleri en üstte değersiz tanımlarız (`let frog`); değerlerini
`reset()` verir. `die()` (öl) bir can düşürür: can kaldıysa yeni kurbağa, kalmadıysa oyun biter.

**Durum.** Oyunun bittiğini tek bir değişkende tutarız: `state` (durum), `'playing'` (oyunda) ya da `'over'`
(bitti). `'over'` iken `update()` ve `hop()` hiçbir şey yapmaz:

```js
if (state !== 'playing') return
```

`!==` "eşit değil mi?" diye sorar, `return` fonksiyondan hemen çıkar. Yani "oyunda değilsek hiçbir şey yapma".

**Yarı saydam renk.** `'rgba(15, 23, 42, 0.75)'` kırmızı, yeşil, mavi miktarı (0–255) ve son olarak **opaklık**
(0 görünmez, 1 tam) ile yazılmış bir renktir. 0,75 opak koyu lacivert, tahtanın üstüne bir perde gibi çekilir; tahta
hafifçe arkadan görünür.

`'Lives: ' + lives` yazı ile sayıyı birleştirir: `'Lives: 3'`.

# --task--

1. Replace `let frog = ...` with `let frog`, `let lives` and `let state`. Write `newFrog()` (a frog at `{ x: 5, y:
   START_ROW }`) and `reset()` (3 lives, state `'playing'`, every lane's `offset` back to `0`, a new frog), and call
   `reset()` before the loop starts.
2. Write `laneAt(row)` returning the lane in that row, if there is one, and `hitByCar(lane)` using the forgiving ranges
   above.
3. Write `die()`: one life less; a new frog if lives are left, otherwise state `'over'`.
4. In `update()`, do nothing unless playing; after moving the lanes, if the frog's row has a lane and a car hits it,
   `die()`. `hop()` should also do nothing unless playing, and Space (or a tap) should `reset()` when the game is over.
5. Draw `Lives: 3` right-aligned at the top (white, `'bold 18px sans-serif'`). When the game is over, cover the board
   with `'rgba(15, 23, 42, 0.75)'` and draw `Game Over` and `Press Space to play again`.

# --task-tr--

1. `let frog = { x: 5, y: START_ROW }` ve altındaki `for (const lane of LANES) lane.offset = 0` satırlarını sil ve
   yerlerine şunu yaz:

   ```js
   let frog
   let lives
   let state // 'playing' or 'over'

   function newFrog() {
     frog = { x: 5, y: START_ROW }
   }

   function reset() {
     lives = 3
     state = 'playing'
     for (const lane of LANES) lane.offset = 0
     newFrog()
   }

   function laneAt(row) {
     return LANES.find((lane) => lane.row === row)
   }
   ```

2. `hop()` fonksiyonunun başına bir satır ekle ve fonksiyonun hemen altına `die()`'ı yaz:

   ```js
   function hop(dx, dy) {
     if (state !== 'playing') return   // ← yeni
     frog.x = Math.min(COLS - 1, Math.max(0, frog.x + dx))
     frog.y = Math.min(START_ROW, Math.max(0, frog.y + dy))
   }

   function die() {
     lives -= 1
     if (lives > 0) {
       newFrog()
       return
     }
     state = 'over'
   }
   ```

   `lives -= 1` canı bir azaltır. `lives > 0` ise yeni kurbağa gelir ve `return` ile çıkılır; değilse son satıra
   inilir ve oyun biter.

3. `keydown` dinleyicisinde, `if (direction) { ... }` bloğunun kapanış `}`'inden sonra, `})`'den **önce** bir satır
   ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     const direction = DIRECTIONS[event.key]
     if (direction) {
       event.preventDefault()
       // One hop per press: holding the key down does not hop again.
       if (!event.repeat) hop(...direction)
     }
     if (event.key === ' ' && state === 'over') reset()   // ← yeni
   })
   ```

4. `pointerup` dinleyicisinde, `swipeStart = null` satırının altındaki ilk `if`'i şöyle değiştir (oyun bittiyse
   dokunuş yeni oyun başlatsın):

   ```js
     swipeStart = null
     if (state === 'over') {                                          // ← yeni
       reset()                                                        // ← yeni
     } else if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {          // ← değişti
       hop(0, -1)
     } else if (Math.abs(dx) > Math.abs(dy)) {
   ```

   Geri kalanı aynen kalır.

5. `pointerup` kodunun kapanış `})`'inden sonra, `function update()`'ten **önce** çarpışma fonksiyonunu yaz ve
   `update()`'i şöyle değiştir:

   ```js
   function hitByCar(lane) {
     return items(lane).some((x) => frog.x + 0.15 < x + lane.len && frog.x + 0.85 > x)
   }

   function update() {
     if (state !== 'playing') return                   // ← yeni
     for (const lane of LANES) lane.offset += lane.speed

     const lane = laneAt(frog.y)                        // ← yeni
     if (lane && hitByCar(lane)) die()                  // ← yeni
   }
   ```

6. `draw()` fonksiyonunda, kurbağayı çizen `ctx.fillRect(frog.x * TILE + 6, ...)` satırının altına (fonksiyonun
   kapanış `}`'inden önce) şunları ekle:

   ```js

     ctx.fillStyle = 'white'
     ctx.font = 'bold 18px sans-serif'
     ctx.textAlign = 'right'
     ctx.fillText('Lives: ' + lives, canvas.width - 10, 27)

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
   ```

   `ctx.font` yazı tipini ve boyunu, `ctx.textAlign = 'right'` verilen noktanın yazının sağ ucu olmasını
   (`'center'` ortası) söyler. `fillText` yazıyı o noktaya boyar.

7. En alttaki `requestAnimationFrame(loop)` satırının **üstüne** oyunu hazırlayan çağrıyı ekle:

   ```js
   reset()
   requestAnimationFrame(loop)
   ```

   Bunu unutursan `frog` boş kalır ve hiçbir şey çizilmez.

8. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Oynamak için önce oyuna tıkla, sonra yukarı okla yola çık. Bir arabaya
   çarpınca `Lives:` bir azalmalı ve kurbağa başa dönmeli; canlar bitince `Game Over` çıkmalı ve Boşluk yeni oyun
   başlatmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `hitByCar` satırındaki `0.15`, `0.85`
   sayılarını ve `<`, `>` yönlerini kontrol et.

# --tests--

Hopping in front of a truck should cost a life and bring a new frog.
tr: Bir kamyonun önüne zıplamak bir cana mal olmalı ve yeni bir kurbağa getirmeli.

```js
$.tick(1)
assert.strictEqual(lives, 3)
assert.include($.texts(), 'Lives: 3')
frog = { x: 3, y: 12 }
$.press('ArrowUp') // row 11: a truck is right there
$.tick(1)
assert.strictEqual(lives, 2)
assert.deepEqual(frog, { x: 5, y: 12 })
```

The hitbox should forgive a car that only brushes the frog's tile.
tr: Çarpışma kutusu kurbağanın döşemesini yalnızca sıyıran bir arabayı affetmeli.

```js
const red = laneAt(7)
frog = { x: 4, y: 7 }
red.offset = 0.1 // a car from 3.1 to 4.1
assert.isFalse(hitByCar(red))
red.offset = 0.2 // a car from 3.2 to 4.2
assert.isTrue(hitByCar(red))
red.offset = -0.9 // a car from 2.1 to 3.1: clear
assert.isFalse(hitByCar(red))
assert.isUndefined(laneAt(6))
```

Losing the last life should end the game, and Space should start a new one.
tr: Son canı kaybetmek oyunu bitirmeli, Boşluk da yenisini başlatmalı.

```js
lives = 1
frog = { x: 3, y: 12 }
$.press('ArrowUp')
$.tick(1)
assert.strictEqual(state, 'over')
assert.include($.texts(), 'Game Over')
$.press('ArrowUp')
$.tick(30)
assert.strictEqual(lives, 0, 'nothing moves once the game is over')
$.press(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(lives, 3)
assert.deepEqual(frog, { x: 5, y: 12 })
assert.strictEqual(laneAt(7).offset, 0)
```

The safe strip and the start row should be safe.
tr: Güvenli şerit ve başlangıç satırı güvenli olmalı.

```js
frog = { x: 5, y: 6 }
$.tick(600)
assert.strictEqual(lives, 3)
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
// speed is in tiles per frame (negative = to the left), len and spacing in tiles.
const LANES = [
  { row: 7, speed: -0.05, len: 1, spacing: 4, color: '#ef4444' },
  { row: 8, speed: 0.035, len: 2, spacing: 6, color: '#f59e0b' },
  { row: 9, speed: -0.06, len: 1, spacing: 5, color: '#e879f9' },
  { row: 10, speed: 0.03, len: 1, spacing: 4, color: '#38bdf8' },
  { row: 11, speed: -0.025, len: 2, spacing: 5, color: '#f97316' },
]

let frog
let lives
let state // 'playing' or 'over'

function newFrog() {
  frog = { x: 5, y: START_ROW }
}

function reset() {
  lives = 3
  state = 'playing'
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

function update() {
  if (state !== 'playing') return
  for (const lane of LANES) lane.offset += lane.speed

  const lane = laneAt(frog.y)
  if (lane && hitByCar(lane)) die()
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

  for (const lane of LANES) {
    ctx.fillStyle = lane.color
    for (const x of items(lane)) {
      ctx.fillRect(x * TILE + 2, TOP + lane.row * TILE + 6, lane.len * TILE - 4, TILE - 12)
    }
  }

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('Lives: ' + lives, canvas.width - 10, 27)

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
