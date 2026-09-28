---
title: Jumping that feels fair
title_tr: Adil hissettiren zıplama
skills: [game.input, game.physics]
---

# --explanation--

Jumping takes two pieces: set `vy` to `JUMP` when on the ground, and cut the upward speed
when the button is released early for a short hop.

But there is a famous problem with "only when on the ground". Run toward a ledge and press jump at the very edge. Very
often the player has *just* stepped off, one or two frames too late, and the game says no. To the player, that feels
like the game ignored them.

The fix has a fun name: **coyote time**, after the cartoon coyote who runs off a cliff and only falls once he notices.
Keep counting down for a few frames after leaving the ground, and still allow a jump during them:

```js
coyote = player.grounded ? COYOTE : Math.max(0, coyote - 1)   // refill while grounded, drain in the air
...
if (coyote > 0) { player.vy = JUMP; coyote = 0 }              // using it empties it: no double jumps
```

Six frames is a tenth of a second: invisible to the player, but it removes a whole class of "I definitely pressed
it!" moments. Many of the best-loved platformers quietly bend the rules like this in the player's favor.

# --explanation-tr--

**Bu adımda:** zıplamayı ekleyeceğiz. Boşluk ya da yukarı ok ile oyuncu yaklaşık dört kare yükseğe zıplayacak; tuşu
erken bırakırsan kısa bir sıçrama yapacak.

**Zıplamak = yukarı doğru hız vermek.** Yerdeyken `vy`'yi `JUMP`'a (`-11.5`) eşitleriz. Eksi hız yukarı demek;
yerçekimi onu her karede biraz azaltır, sonunda oyuncu durur ve geri düşer. Zaten yazdığımız `moveY` ve yerçekimi gerisini
halleder.

**Kısa sıçrama.** Tuşu erken bırakırsan yukarı hızı `CUT`'a (`-4`) düşürürüz:
`if (player.vy < CUT) player.vy = CUT`. Hâlâ hızla yükseliyorsan (örneğin `-9`, bu `-4`'ten küçük) hız `-4` olur ve
zıplama kısalır. Zaten yavaşladıysan dokunulmaz. Böylece oyuncu, tuşu ne kadar tuttuğuyla zıplama yüksekliğini seçer.

**Tuşun kendi kendini tekrarlaması.** Bir tuşu basılı tutunca tarayıcı `keydown`'u tekrar tekrar gönderir. Bu
tekrarlarda `event.repeat` doğrudur. `!event.repeat` ("tekrar değilse") ile yalnızca ilk basışta zıplarız. Koşuldaki
parantezlere dikkat: `(boşluk ya da yukarı ok) ve tekrar değil`. `&&` "ve" demektir. Boşluk tuşunun adı tırnak içinde
tek bir boşluktur: `' '`.

**Coyote time (çakal süresi).** "Sadece yerdeyken zıpla" kuralının ünlü bir sorunu var. Bir kenara koşup tam uçta
zıplamaya bas: çoğu zaman oyuncu bir iki kare önce kenardan **çoktan** adım atmıştır ve oyun "hayır" der. Oyuncuya bu,
oyun onu duymamış gibi gelir.

Çözümün adı çizgi filmdeki çakaldan gelir: uçurumdan koşarak çıkar ve ancak aşağı bakınca düşer. Yerden ayrıldıktan
sonra birkaç kare daha geri sayarız ve bu sürede zıplamaya hâlâ izin veririz:

```js
coyote = player.grounded ? COYOTE : Math.max(0, coyote - 1)   // yerdeyken dolar, havada azalır
```

`a ? b : c` "a doğruysa b, değilse c" demektir. Yerdeysek sayaç 6'ya dolar; havadaysak her karede 1 azalır ama
`Math.max(0, ...)` sayesinde 0'ın altına inmez. `jump()` yalnızca `coyote > 0` iken çalışır ve sayacı hemen `0` yapar:
böylece havada ikinci kez zıplanamaz.

Altı kare saniyenin onda biri: oyuncu fark etmez ama "Ama bastım!" anlarının hepsini ortadan kaldırır. En sevilen
platform oyunlarının çoğu kuralları sessizce oyuncu lehine böyle esnetir.

# --task--

1. Add `const JUMP = -11.5`, `const CUT = -4`, `const COYOTE = 6` and `let coyote = 0`.
2. At the end of `update()`, refill `coyote` to `COYOTE` when grounded, otherwise count it down to a minimum of `0`.
3. Write `jump()` (when `coyote > 0`: `player.vy = JUMP` and `coyote = 0`) and `endJump()` (if `player.vy < CUT`, set it
   to `CUT`). Call `jump()` on a non-repeated `keydown` of Space or `ArrowUp`, and `endJump()` on their `keyup`.

# --task-tr--

1. `const FRICTION = 0.8` satırının hemen altına üç sabit ekle:

   ```js
   const JUMP = -11.5
   const CUT = -4 // erken bırakınca yukarı hız en fazla bu olur
   const COYOTE = 6 // kenardan çıktıktan sonra hâlâ zıplayabildiğin kare sayısı
   ```

2. Oyuncuyu oluşturan `LEVEL.forEach(...)` bloğunun kapanış `})` satırının hemen altına, `const keys = {}`'den önce
   sayacı ekle:

   ```js
   let coyote = 0
   ```

3. `const keys = {}` satırının altına bir satır boşluk bırakıp iki fonksiyonu yaz:

   ```js
   function jump() {
     if (coyote > 0) {
       player.vy = JUMP
       coyote = 0
     }
   }

   function endJump() {
     if (player.vy < CUT) player.vy = CUT
   }
   ```

4. Klavye dinleyicilerine birer satır ekle. İkisi şöyle olmalı:

   ```js
   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
     if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump() // ← yeni
   })
   document.addEventListener('keyup', (event) => {
     keys[event.key] = false
     if (event.key === ' ' || event.key === 'ArrowUp') endJump() // ← yeni
   })
   ```

5. `update()` fonksiyonunun **en sonuna**, `moveY(player)` satırının altına sayacı güncelleyen satırı ekle:

   ```js
     moveY(player)
     coyote = player.grounded ? COYOTE : Math.max(0, coyote - 1) // ← yeni
   }
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra Boşluk'a bas: oyuncu zıplamalı. Kısa basınca alçak, uzun
   basınca yüksek zıplamalı; havadayken yeniden basmak işe yaramamalı. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

The player should jump from the ground about four tiles high.
tr: Oyuncu zeminden yaklaşık dört döşeme yükseğe zıplamalı.

```js
$.tick()
$.press(' ')
assert.strictEqual(player.vy, -11.5)
let highest = player.y
for (let i = 0; i < 60; i++) {
  $.tick()
  highest = Math.min(highest, player.y)
}
assert.closeTo(258 - highest, 126, 4)
assert.isTrue(player.grounded)
```

A released jump should be shorter, and there should be no double jump.
tr: Bırakılan zıplama daha kısa olmalı ve çift zıplama olmamalı.

```js
$.tick()
$.press(' ')
$.tick(2)
$.release(' ')
assert.strictEqual(player.vy, -4)
$.tick(3)
const vy = player.vy
$.press(' ')
assert.strictEqual(player.vy, vy, 'no jumping in the air')
```

A jump pressed a few frames after running off a ledge should still work (coyote time).
tr: Kenardan koşup çıktıktan birkaç kare sonra basılan zıplama yine çalışmalı (coyote time).

```js
player.x = 480
$.tick(5)
player.x = 16 * 32 + 1
player.vx = 0
$.tick(3)
assert.isFalse(player.grounded)
$.press(' ')
assert.strictEqual(player.vy, -11.5)
```

Too long after leaving the ground, the jump should be refused.
tr: Yerden ayrıldıktan çok sonra zıplama reddedilmeli.

```js
player.x = 480
$.tick(5)
player.x = 16 * 32 + 1
player.vx = 0
$.tick(8)
const vy = player.vy
$.press(' ')
assert.strictEqual(player.vy, vy)
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

let player
LEVEL.forEach((line, row) => {
  const col = line.indexOf('P')
  if (col !== -1) player = { x: col * TILE + 4, y: row * TILE + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
})
let coyote = 0
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
