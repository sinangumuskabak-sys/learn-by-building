---
title: Running with momentum
title_tr: Momentumla koşmak
skills: [game.physics, game.input, game.collision]
---

# --explanation--

In Pong the paddle moved at a fixed speed the instant you pressed a key. A platformer hero feels better with
**momentum**: speed builds up while you hold a direction, and bleeds away when you let go.

```js
if (input !== 0) player.vx += input * ACCEL   // speed up
else player.vx *= FRICTION                    // let go: lose 20% of the speed each frame
player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED)
```

Multiplying by `0.8` every frame shrinks the speed quickly but never quite to zero (0.8, 0.64, 0.51, ...), so snap tiny
speeds to exactly `0` or the player drifts forever by fractions of a pixel. Tuning `ACCEL` and `FRICTION` is a big
part of what makes one game feel "floaty" and another "tight".

Walls work like floors: move **horizontally first**, and if that lands inside a tile, snap back to its side. Then move
vertically, as before. Handling the two axes **separately** is the key trick of tile collisions. If you moved on both
axes at once and then found an overlap, you could not tell whether you hit a wall or a floor, and bodies would snag on
the seams between tiles.

# --explanation-tr--

**Bu adımda:** oyuncu sağ ve sol ok tuşlarıyla koşacak. Hızlanarak kalkacak, tuşu bırakınca kayarak duracak ve duvara
çarpınca tam duvarın dibinde duracak.

**Basılı tuşları hatırlamak.** Tarayıcı bir tuşa basıldığında ve bırakıldığında bize haber verir (**olay**, event).
Hangi tuşların şu an basılı olduğunu boş bir nesnede (`const keys = {}`) tutarız:

```js
document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
```

- `addEventListener('keydown', ...)` → "bir tuşa basıldığında şunu yap". `'keyup'` tuş bırakıldığında olur.
- `(event) => { ... }` kısa, adsız bir fonksiyondur; `event.key` basılan tuşun adıdır (`'ArrowRight'`, `'ArrowLeft'`).
- `keys[event.key] = true` → köşeli parantez alanın adını değişkenden alır; sağ oka basıldıysa `keys.ArrowRight = true`.

**Yön.** `(keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)` → `a ? b : c` kısa bir "eğer"dir: `a` doğruysa `b`,
değilse `c`. Sonuç sağ için `1`, sol için `-1`, hiçbiri (ya da ikisi birden) için `0`.

**Momentum (ivme).** Kahraman, tuşa basar basmaz tam hızla gitmezse daha iyi hissettirir: yön tuşu basılıyken hız
yavaş yavaş artar, bırakınca yavaş yavaş söner.

```js
if (input !== 0) player.vx += input * ACCEL   // hızlan
else player.vx *= FRICTION                    // bırakınca: her karede hızın %20'sini kaybet
player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED)
```

- `*=` "şununla çarp" demektir. `0.8` ile çarpmak hızı %20 azaltır. `else` "değilse" demektir.
- `clamp(değer, en az, en çok)` değeri iki sınır arasında tutan küçük bir yardımcı fonksiyon: 4'ten büyükse 4, -4'ten
  küçükse -4 yapar. `Math.max` ikisinden büyüğünü, `Math.min` küçüğünü verir; ikisi birlikte sınır koyar.
- Her karede 0.8 ile çarpmak hızı çabucak küçültür ama **asla tam sıfır yapmaz** (0.8, 0.64, 0.51, ...). Bu yüzden
  çok küçük hızları tam `0`'a çekeriz; yoksa oyuncu piksel kırıntılarıyla sonsuza kadar kayar.
  `Math.abs(sayı)` sayının eksisiz hâlidir (`-0.03` → `0.03`); böylece iki yönü tek kontrolle yakalarız.

`ACCEL` ve `FRICTION` ayarları bir oyunun "yüzen" mi "sıkı" mı hissettirdiğini büyük ölçüde belirler.

**Duvarlar zemin gibi çalışır.** Önce **yatay** hareket edilir; bu bir karenin içinde bittiyse karenin yanına geri
itilir (sağa gidiyorsan duvarın soluna, sola gidiyorsan sağına). **Sonra** eskisi gibi dikey hareket gelir. İki ekseni
**ayrı ayrı** ele almak kare çarpışmalarının anahtar hilesidir. İkisini birden hareket ettirip sonra çakışma bulsaydın
duvara mı zemine mi çarptığını bilemezdin; oyuncu karelerin birleşim yerlerine takılırdı. `moveX` bir şeye çarptıysa
`true`, çarpmadıysa `false` döndürür (bunu ileride düşmanlar kullanacak).

# --task--

1. Add `const ACCEL = 0.5`, `const MAX_SPEED = 4`, `const FRICTION = 0.8`, a `clamp(value, min, max)` helper and
   `const keys = {}` updated on `keydown`/`keyup`.
2. Write `function moveX(body)`: add `body.vx` to `body.x`; if it now overlaps something solid, snap it to the tile's
   side (moving right: `x = Math.floor((x + w - EPS) / TILE) * TILE - w`; moving left:
   `x = Math.floor(x / TILE) * TILE + TILE`), set `body.vx = 0` and return `true`. Otherwise return `false`.
3. In `update()`, before gravity: `input` is `1` while `ArrowRight` is held, `-1` for `ArrowLeft`, `0` for neither.
   Apply acceleration or friction, clamp to `±MAX_SPEED`, snap speeds under `0.05` to `0`, then `moveX(player)`.

# --task-tr--

1. `const MAX_FALL = 12 ...` satırının hemen altına üç sabit ekle:

   ```js
   const ACCEL = 0.5
   const MAX_SPEED = 4
   const FRICTION = 0.8
   ```

2. Oyuncuyu oluşturan `LEVEL.forEach(...)` bloğunun kapanış `})` satırının altına bir satır boşluk bırakıp tuş
   defterini, klavye dinleyicilerini ve `clamp` yardımcısını ekle:

   ```js
   const keys = {}

   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
   })
   document.addEventListener('keyup', (event) => {
     keys[event.key] = false
   })

   function clamp(value, min, max) {
     return Math.max(min, Math.min(max, value))
   }
   ```

3. `moveY` fonksiyonunun **üstüne** (üstündeki yorum satırının da üstüne) yatay hareket fonksiyonunu yaz:

   ```js
   // Her seferinde tek eksende hareket et; bir karenin içinde bittiyse karenin kenarına geri it.
   function moveX(body) {
     body.x += body.vx
     if (!overlapsSolid(body)) return false
     if (body.vx > 0) body.x = Math.floor((body.x + body.w - EPS) / TILE) * TILE - body.w
     else body.x = Math.floor(body.x / TILE) * TILE + TILE
     body.vx = 0
     return true
   }
   ```

4. `update()` fonksiyonunun **en başına**, yerçekiminden önce koşmayı ekle. Fonksiyon şöyle olmalı:

   ```js
   function update() {
     const input = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0) // ← yeni
     if (input !== 0) player.vx += input * ACCEL // ← yeni
     else player.vx *= FRICTION // ← yeni
     player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED) // ← yeni
     if (Math.abs(player.vx) < 0.05) player.vx = 0 // ← yeni
     moveX(player) // ← yeni

     player.vy = Math.min(MAX_FALL, player.vy + GRAVITY)
     moveY(player)
   }
   ```

5. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra sağ/sol okları basılı tut: oyuncu hızlanarak koşmalı,
   bırakınca kayarak durmalı, sütuna çarpınca durmalı. Çukura girersen düşersin (şimdilik yeniden başlamak için
   **Çalıştır**'a bas). Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

Holding right should build up speed to `MAX_SPEED`.
tr: Sağı basılı tutmak hızı `MAX_SPEED`'e kadar artırmalı.

```js
assert.deepEqual([ACCEL, MAX_SPEED, FRICTION], [0.5, 4, 0.8])
$.press('ArrowRight')
$.tick()
assert.strictEqual(player.vx, 0.5)
$.tick(3)
assert.strictEqual(player.vx, 2)
$.tick(20)
assert.strictEqual(player.vx, 4)
```

Letting go should slow down smoothly to a full stop.
tr: Bırakmak yumuşakça tam bir duruşa kadar yavaşlatmalı.

```js
$.press('ArrowRight')
$.tick(20)
$.release('ArrowRight')
$.tick()
assert.closeTo(player.vx, 3.2, 0.001)
$.tick(40)
assert.strictEqual(player.vx, 0)
```

Walls should stop the player exactly at their side.
tr: Duvarlar oyuncuyu tam yanlarında durdurmalı.

```js
player.x = 600
$.press('ArrowRight')
$.tick(60)
assert.strictEqual(player.x, 22 * 32 - 24, 'right side of the player against the pillar')
assert.strictEqual(player.vx, 0)
```

The left end of the level should be a wall too.
tr: Bölümün sol ucu da bir duvar olmalı.

```js
$.press('ArrowLeft')
$.tick(60)
assert.strictEqual(player.x, 0)
assert.strictEqual(player.y, 258, 'still standing on the ground')
```

# --solution--

```js
// Platformer, step by step.
// The page already has <canvas id="game" width="640" height="352"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 32
const EPS = 0.01 // a hair: the right and bottom edges are just inside the box
// The level as text: '#' ground, 'B' brick, 'o' coin, 'e' enemy, 'P' player start, 'F' flag.
const LEVEL = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '....................................oooo........................',
  '.........oooo........................e..........................',
  '.........BBBB.................ooo...BBBB....##..................',
  '....ooo...............#....................###.......oooo.......',
  '..P...................#...e...............####.....e.....e...F..',
  '################..############...#############..################',
  '################..############...#############..################',
]
const ROWS = LEVEL.length
const COLS = LEVEL[0].length
const COLORS = { '#': '#78350f', B: '#c2410c' }

const GRAVITY = 0.5
const MAX_FALL = 12 // must stay below TILE, or a fast fall could skip over a whole tile
const ACCEL = 0.5
const MAX_SPEED = 4
const FRICTION = 0.8

let player
LEVEL.forEach((line, row) => {
  const col = line.indexOf('P')
  if (col !== -1) player = { x: col * TILE + 4, y: row * TILE + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
})
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function solidAt(x, y) {
  const col = Math.floor(x / TILE)
  const row = Math.floor(y / TILE)
  if (col < 0 || col >= COLS) return true // invisible walls at both ends of the level
  if (row < 0 || row >= ROWS) return false // open sky above, bottomless pits below
  const tile = LEVEL[row][col]
  return tile === '#' || tile === 'B'
}

// Bodies are never bigger than a tile, so checking their four corners is enough.
function overlapsSolid(body) {
  const right = body.x + body.w - EPS
  const bottom = body.y + body.h - EPS
  return solidAt(body.x, body.y) || solidAt(right, body.y) || solidAt(body.x, bottom) || solidAt(right, bottom)
}

// Move along one axis at a time; if that ends inside a tile, snap back to the tile's edge.
function moveX(body) {
  body.x += body.vx
  if (!overlapsSolid(body)) return false
  if (body.vx > 0) body.x = Math.floor((body.x + body.w - EPS) / TILE) * TILE - body.w
  else body.x = Math.floor(body.x / TILE) * TILE + TILE
  body.vx = 0
  return true
}

function moveY(body) {
  body.grounded = false
  body.y += body.vy
  if (!overlapsSolid(body)) return
  if (body.vy > 0) {
    body.y = Math.floor((body.y + body.h - EPS) / TILE) * TILE - body.h
    body.grounded = true
  } else {
    body.y = Math.floor(body.y / TILE) * TILE + TILE
  }
  body.vy = 0
}

function update() {
  const input = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  if (input !== 0) player.vx += input * ACCEL
  else player.vx *= FRICTION
  player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED)
  if (Math.abs(player.vx) < 0.05) player.vx = 0
  moveX(player)

  player.vy = Math.min(MAX_FALL, player.vy + GRAVITY)
  moveY(player)
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = LEVEL[row][col]
      if (tile === '#' || tile === 'B') {
        ctx.fillStyle = COLORS[tile]
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE)
      }
    }
  }

  ctx.fillStyle = '#dc2626'
  ctx.fillRect(player.x, player.y, player.w, player.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
