---
title: Coins, and screen versus world
title_tr: Altınlar ve ekran ile dünya
skills: [game.collision, prog.arrays]
---

# --explanation--

The `o` characters in the level are coins. Tiles like `#` stay in the level forever, but coins change: they disappear
when collected. So, like the player, they get **copied out of the level into objects** when the game starts. Scan
every tile once, and turn each special character into the object it stands for:

```js
if (line[col] === 'o') coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false })
```

The level text stays an unchanging **blueprint**; the objects are the **live state**. Keeping those two apart is what
will make restarting the level easy later: just build the objects again from the blueprint.

Collecting is the usual box overlap between the player and each coin that is not yet `taken`.

The coin counter is drawn **after** `ctx.restore()`, in screen coordinates, so it stays fixed in the corner while the
world scrolls. Anything that belongs to the interface (score, lives, messages) goes after the restore; anything that
lives in the world goes between `save` and `restore`.

# --explanation-tr--

**Bu adımda:** bölümdeki `o` harflerini sarı altınlara çevireceğiz. Oyuncu dokununca altın kaybolacak, sol üstteki
`Coins: ...` sayacı artacak.

**Plan ve canlı durum.** `#` gibi kareler bölümde sonsuza kadar kalır; altınlarsa değişir, toplanınca kaybolur. Bu
yüzden altınları da oyuncu gibi oyun başlarken bölüm yazısından **nesnelere kopyalarız**. Bölüm yazısı hiç değişmeyen
bir **plan** (kroki) olarak kalır; nesneler oyunun **canlı durumudur**. Bu ikisini ayrı tutmak ileride bölümü yeniden
başlatmayı kolaylaştıracak: nesneleri plandan yeniden kurmak yeter.

**Her kareyi bir kez taramak.** Şimdiye kadar her satırda yalnızca `indexOf('P')` ile `P`'yi arıyorduk. Artık her
satırın her sütununa bakan bir `for` döngüsü kullanıyoruz ve özel harfleri gördüğümüz yerde nesnesini oluşturuyoruz:

```js
if (line[col] === 'o') coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false })
```

- `line[col]` → satır yazısının `col`. harfi.
- `coins.push(...)` → `coins` listesinin sonuna yeni bir öğe ekler. Liste `const coins = []` ile **boş** başlar.
- Altın 16×16 bir kutu; 32'lik karenin ortasında dursun diye `x`'e ve `y`'ye 8 ekleriz.
- `taken: false` → "henüz alınmadı".

**İki kutu çakışıyor mu?** `overlaps(a, b)` iki kutunun üst üste gelip gelmediğini söyler. Dört koşulun **hepsi** doğru
olmalı (`&&` "ve" demektir): `a`'nın solu `b`'nin sağından solda, `a`'nın sağı `b`'nin solundan sağda, aynı şey dikeyde
de. Biri bile yanlışsa kutular arasında boşluk vardır.

`update()` içinde her altına bakarız: alınmamışsa (`!coin.taken`) **ve** oyuncuyla çakışıyorsa onu alınmış işaretleriz
ve sayacı bir artırırız (`collected += 1`). Alınmış altın bir daha sayılmaz.

**Daire çizmek.** Canvas'ta daire için önce bir **yol** (path) çizip sonra onu boyarız:

```js
ctx.beginPath()                          // yeni bir şekle başla
ctx.arc(merkezX, merkezY, 8, 0, Math.PI * 2)   // yarıçapı 8 olan bir yay
ctx.fill()                               // şekli seçili renkle doldur
```

`arc`'ın son iki sayısı yayın başladığı ve bittiği açıdır. `Math.PI * 2` tam bir tur demektir; yani tam bir daire.
Merkez, kutunun köşesine genişliğin yarısını ekleyerek bulunur: `coin.x + coin.w / 2`.

`if (coin.taken) continue` → `continue` döngünün **bu turunu** atlar ve sıradaki altına geçer: alınan altın çizilmez.

**Arayüz kaydırılmaz.** Altınlar dünyada yaşar, bu yüzden `save` ile `restore` arasında çizilir ve dünyayla kayar.
Sayaç ise arayüzdür: `ctx.restore()`'dan **sonra**, ekran koordinatlarında çizilir; dünya kayarken köşede sabit kalır.
Skor, can, mesaj gibi arayüz şeyleri hep `restore`'dan sonra gelir. `'Coins: ' + collected` yazıya sayıyı ekler
(`'Coins: 3'`). `ctx.font` yazı tipini, `ctx.textAlign = 'left'` sola hizalamayı seçer, `ctx.fillText(yazı, x, y)`
yazıyı boyar.

# --task--

1. Replace the `'P'` search with a scan of every tile (`LEVEL.forEach((line, row) => { for (let col ...) })`) that
   creates the player at `'P'` as before and pushes a coin `{ x: col * TILE + 8, y: row * TILE + 8, w: 16, h: 16,
   taken: false }` into `const coins = []` for every `'o'`.
2. Add `let collected = 0` and `function overlaps(a, b)` (the box test). In `update()`, after moving the player, mark
   every coin the player overlaps as `taken` and count it.
3. Draw coins that are not taken as `'#facc15'` circles of radius 8 at their centers, inside the camera
   `save`/`restore`. After the `restore`, draw `Coins: 3` (the real number) in white `'bold 18px sans-serif'`,
   left-aligned at `(12, 26)`.

# --task-tr--

1. Oyuncuyu oluşturan kısmı (`let player` satırından `LEVEL.forEach` bloğunun kapanış `})`'ine kadar) şununla
   değiştir:

   ```js
   // Bölüm yazısı plandır; bu nesneler ondan kurulan canlı durumdur.
   let player
   const coins = [] // ← yeni
   LEVEL.forEach((line, row) => {
     for (let col = 0; col < COLS; col++) { // ← değişti: artık her sütuna bakıyoruz
       const x = col * TILE
       const y = row * TILE
       if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
       if (line[col] === 'o') coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false })
     }
   })
   let collected = 0 // ← yeni
   ```

   Eski `const col = line.indexOf('P')` ve `if (col !== -1) ...` satırları gitti; altında `let coyote = 0` olduğu gibi
   kalır.

2. `overlapsSolid` fonksiyonunun kapanış `}`'inin altına bir satır boşluk bırakıp iki kutunun çakışmasını soran
   fonksiyonu ekle:

   ```js
   function overlaps(a, b) {
     return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
   }
   ```

3. `update()` fonksiyonunda `coyote = ...` satırının altına, kamera satırlarından **önce** altın toplamayı ekle:

   ```js
     coyote = player.grounded ? COYOTE : Math.max(0, coyote - 1)

     for (const coin of coins) { // ← yeni: bu bloğun tamamı
       if (!coin.taken && overlaps(player, coin)) {
         coin.taken = true
         collected += 1
       }
     }
   ```

4. `draw()` fonksiyonunda karelerin iki döngüsünün kapanışından sonra, oyuncuyu çizen `ctx.fillStyle = '#dc2626'`
   satırından **önce** altınları çiz:

   ```js
     ctx.fillStyle = '#facc15'
     for (const coin of coins) {
       if (coin.taken) continue
       ctx.beginPath()
       ctx.arc(coin.x + coin.w / 2, coin.y + coin.h / 2, 8, 0, Math.PI * 2)
       ctx.fill()
     }
   ```

5. Yine `draw()`'da, `ctx.restore()` satırının **altına** (fonksiyonun son `}`'inden önce) sayacı ekle:

   ```js
     ctx.restore()

     // Arayüz ekran koordinatlarında, restore'dan sonra çizilir; böylece kaymaz.
     ctx.fillStyle = 'white'
     ctx.font = 'bold 18px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Coins: ' + collected, 12, 26)
   }
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Sarı altınlar görünmeli; üstlerinden geçince kaybolmalı ve sol
   üstteki `Coins:` sayısı artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa sayacın gerçekten
   `ctx.restore()`'dan **sonra** yazıldığına bak.

# --tests--

Every `o` in the level should become a coin.
tr: Bölümdeki her `o` bir altına dönüşmeli.

```js
const count = LEVEL.join('').split('o').length - 1
assert.lengthOf(coins, count)
assert.deepInclude(coins, { x: 4 * 32 + 8, y: 7 * 32 + 8, w: 16, h: 16, taken: false })
```

Touching a coin should collect it once.
tr: Bir altına dokunmak onu bir kez toplamalı.

```js
player.x = 4 * 32
player.y = 7 * 32 + 2
player.vy = -1
update()
assert.strictEqual(collected, 1)
assert.isTrue(coins.find((c) => c.x === 4 * 32 + 8 && c.y === 7 * 32 + 8).taken)
update()
assert.strictEqual(collected, 1)
```

Coins should be drawn in the world, and the counter should stay on the screen.
tr: Altınlar dünyada çizilmeli, sayaç da ekranda sabit kalmalı.

```js
player.x = 1000
$.tick()
const visible = coins.filter((c) => c.x > camera - 32 && c.x < camera + 640)
assert.isTrue($.arcs().filter((a) => a.color === '#facc15').length >= visible.length)
const calls = $.screen()
const restoreAt = calls.findIndex((c) => c.op === 'restore')
const text = calls.findIndex((c) => c.op === 'fillText' && String(c.args[0]).startsWith('Coins: 0'))
assert.isAbove(text, restoreAt, 'draw the counter after ctx.restore()')
assert.deepEqual(calls[text].args.slice(1), [12, 26])
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
const JUMP = -11.5
const CUT = -4 // letting go early caps the upward speed at this
const COYOTE = 6 // frames you can still jump after running off a ledge

// The level text is the blueprint; these objects are the live state built from it.
let player
const coins = []
LEVEL.forEach((line, row) => {
  for (let col = 0; col < COLS; col++) {
    const x = col * TILE
    const y = row * TILE
    if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
    if (line[col] === 'o') coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false })
  }
})
let collected = 0
let coyote = 0
let camera = 0 // world x of the screen's left edge
const keys = {}

function jump() {
  if (coyote > 0) {
    player.vy = JUMP
    coyote = 0
  }
}

function endJump() {
  if (player.vy < CUT) player.vy = CUT
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
  if (event.key === ' ' || event.key === 'ArrowUp') endJump()
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

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
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
  coyote = player.grounded ? COYOTE : Math.max(0, coyote - 1)

  for (const coin of coins) {
    if (!coin.taken && overlaps(player, coin)) {
      coin.taken = true
      collected += 1
    }
  }

  // Keep the player in the middle of the screen, without showing past either end of the level.
  camera = clamp(player.x + player.w / 2 - canvas.width / 2, 0, COLS * TILE - canvas.width)
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(-Math.round(camera), 0)

  // Only draw the columns that are on screen.
  const first = Math.floor(camera / TILE)
  const last = Math.min(COLS - 1, first + Math.ceil(canvas.width / TILE))
  for (let row = 0; row < ROWS; row++) {
    for (let col = first; col <= last; col++) {
      const tile = LEVEL[row][col]
      if (tile === '#' || tile === 'B') {
        ctx.fillStyle = COLORS[tile]
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE)
      }
    }
  }

  ctx.fillStyle = '#facc15'
  for (const coin of coins) {
    if (coin.taken) continue
    ctx.beginPath()
    ctx.arc(coin.x + coin.w / 2, coin.y + coin.h / 2, 8, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#dc2626'
  ctx.fillRect(player.x, player.y, player.w, player.h)
  ctx.restore()

  // The interface is drawn in screen coordinates, after the restore, so it does not scroll.
  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Coins: ' + collected, 12, 26)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
