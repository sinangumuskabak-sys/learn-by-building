---
title: Falling and landing on tiles
title_tr: Düşmek ve döşemelere inmek
skills: [game.physics, game.collision]
---

# --explanation--

Gravity works as usual: add it to the vertical speed, then move. The new part is **landing on tiles**
of any shape and height, not just a flat ground line.

The recipe is: move, then check. If the move ended inside something solid, **snap back** to the edge of the tile you
ran into:

- falling (`vy > 0`): the feet went into the tile below, so put the feet exactly on its top:
  `y = tileTop - h`, where the tile row is `Math.floor((y + h - EPS) / TILE)`. You are now `grounded`.
- rising (`vy < 0`): the head bumped the tile above, so put the head exactly at its bottom.

Either way, stop the vertical movement (`vy = 0`).

One more rule keeps this safe. If a body moved **more than a tile** in one frame, it could jump right over a thin floor
without ever overlapping it; this is called **tunneling**. Capping the fall speed below the tile size (`MAX_FALL = 12`
< 32) makes that impossible.

# --explanation-tr--

**Bu adımda:** yerçekimini ekleyip oyunu canlandıracağız. Oyuncu artık saniyede 60 kez güncellenecek; zeminde duracak,
çukurun üstüne gelirse düşecek. Şimdilik yürüyemediği için ekranda değişen bir şey göremeyebilirsin, ama kontroller
oyuncuyu havaya koyup düşüşünü deneyecek.

**Hız ve yerçekimi.** Oyuncunun iki yeni alanı var: `vx` yatay hız, `vy` dikey hız (her karede kaç piksel gideceği).
`vy` pozitifse aşağı, negatifse yukarı gider. Yerçekimi her karede `vy`'yi biraz artırır; bu yüzden düşen şey gittikçe
hızlanır. Sonra hız konumu değiştirir: `body.y += body.vy` (`+=` "üstüne ekle" demektir). Üçüncü alan `grounded`
(yerde mi?) `true` ya da `false` olur.

**Önce hareket et, sonra kontrol et.** Hareket bir karenin içine girerek bittiyse, çarptığın karenin kenarına **geri
it**:

- **Düşüyorsan** (`vy > 0`): ayakların alttaki kareye girdi. Ayakların satırı
  `Math.floor((y + h - EPS) / TILE)`'dır; o satırın tepesi `satır * TILE`. Ayakları tam oraya koyarız:
  `y = tepe - h`. Artık `grounded = true`.
- **Yükseliyorsan** (`vy < 0`): kafan üstteki kareye çarptı. Kafanın satırı `Math.floor(y / TILE)`; o karenin altı
  `satır * TILE + TILE`. Kafayı oraya koyarız.

İki durumda da dikey hareketi durdururuz: `vy = 0`.

`if (!overlapsSolid(body)) return` → `!` "değil" demektir: "hiçbir şeye değmiyorsa işin bitti, fonksiyondan çık".
`return` fonksiyonu o anda bitirir. `else` ise "`if` doğru değilse şunu yap" demektir.

**Tünel etkisi.** Bir cisim bir karede **bir kareden fazla** yol alırsa ince bir zeminin üstünden hiç değmeden geçebilir
(**tunneling**). Düşüş hızını kare boyunun altında tutmak bunu imkânsız yapar: `MAX_FALL = 12` (32'den küçük).
`Math.min(a, b)` ikisinden küçüğünü verir; `Math.min(MAX_FALL, player.vy + GRAVITY)` hız 12'yi geçmek üzereyse 12'de
tutar.

**Oyun döngüsü.** Hareket görmek için her şeyi saniyede yaklaşık 60 kez hesaplayıp yeniden çizmeliyiz.
`requestAnimationFrame(loop)` tarayıcıya "bir sonraki karede `loop`'u çalıştır" der. `loop` de önce `update()`
(hesapla), sonra `draw()` (çiz) yapar ve kendini yeniden sıraya koyar. Böylece durmadan dönen bir döngü olur. Bu yüzden
en alttaki tek `draw()` çağrısının yerini döngü alıyor.

# --task--

1. Add `const GRAVITY = 0.5` and `const MAX_FALL = 12`, and give the player `vx: 0, vy: 0, grounded: false`.
2. Write `function moveY(body)`: set `body.grounded = false`, add `body.vy` to `body.y`, and if it now overlaps
   something solid, snap it back as described (feet on the tile's top and `grounded = true` when falling, head at the
   tile's bottom when rising), then set `body.vy = 0`.
3. Write `update()`: `player.vy = Math.min(MAX_FALL, player.vy + GRAVITY)`, then `moveY(player)`. Add a `loop()` that
   updates, draws and requests the next frame, and start it.

# --task-tr--

1. `const COLORS = ...` satırının altına (oyuncuyu oluşturan `let player` satırından önce) iki sabit ekle:

   ```js
   const GRAVITY = 0.5
   const MAX_FALL = 12 // TILE'dan küçük kalmalı, yoksa hızlı düşüş bir kareyi atlayabilir
   ```

2. Oyuncuyu oluşturan satıra üç alan ekle:

   ```js
     if (col !== -1) player = { x: col * TILE + 4, y: row * TILE + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false } // ← değişti
   ```

3. `overlapsSolid` fonksiyonunun kapanış `}`'inin altına bir satır boşluk bırakıp dikey hareketi yapan fonksiyonu yaz:

   ```js
   // Hareket et; bir karenin içinde bittiyse karenin kenarına geri it.
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
   ```

4. Altına her karede yerçekimini uygulayan `update` fonksiyonunu yaz:

   ```js
   function update() {
     player.vy = Math.min(MAX_FALL, player.vy + GRAVITY)
     moveY(player)
   }
   ```

5. En alttaki `draw()` satırını **sil** ve yerine oyun döngüsünü yaz:

   ```js
   function loop() {
     update()
     draw()
     requestAnimationFrame(loop)
   }

   requestAnimationFrame(loop)
   ```

6. **Çalıştır**'a bas. Kırmızı oyuncu toprağın üstünde durmaya devam etmeli (titremeden); alttaki kontrollerin hepsi
   yeşil olmalı. Kırmızı kalırsa `moveY`'deki iki `Math.floor` satırını harf harf karşılaştır: birinde `- body.h`,
   ötekinde `+ TILE` var.

# --tests--

Standing on the ground, the player should stay put and be grounded.
tr: Zeminde dururken oyuncu yerinde kalmalı ve yerde sayılmalı.

```js
$.tick(30)
assert.strictEqual(player.y, 258)
assert.strictEqual(player.vy, 0)
assert.isTrue(player.grounded)
```

Dropped from the sky, the player should land exactly on the ground.
tr: Gökyüzünden bırakılan oyuncu tam zeminin üstüne inmeli.

```js
player.y = 20
$.tick(10)
assert.isFalse(player.grounded)
$.tick(60)
assert.strictEqual(player.y, 258)
assert.isTrue(player.grounded)
```

Falling should never be faster than `MAX_FALL`.
tr: Düşüş hiçbir zaman `MAX_FALL`'dan hızlı olmamalı.

```js
player.x = 16 * 32 + 4
player.y = -400
let fastest = 0
for (let i = 0; i < 60; i++) {
  update()
  fastest = Math.max(fastest, player.vy)
}
assert.strictEqual(fastest, 12)
```

Jumping into a brick from below should bump the head.
tr: Alttan bir tuğlaya zıplamak kafayı çarptırmalı.

```js
player.x = 9 * 32 + 4
player.y = 230
player.vy = -8
moveY(player)
assert.strictEqual(player.y, 224, 'the head is right under the brick')
assert.strictEqual(player.vy, 0)
```

Walking over a pit, the player should fall out of the world.
tr: Çukurun üstünde oyuncu dünyadan düşmeli.

```js
player.x = 16 * 32 + 4
$.tick(40)
assert.isAbove(player.y, 352)
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

let player
LEVEL.forEach((line, row) => {
  const col = line.indexOf('P')
  if (col !== -1) player = { x: col * TILE + 4, y: row * TILE + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
})

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

// Move, and if that ends inside a tile, snap back to the tile's edge.
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
