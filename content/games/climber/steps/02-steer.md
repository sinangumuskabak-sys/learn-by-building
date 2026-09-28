---
title: Steering and wrapping around
title_tr: Yönlendirmek ve kenardan dolanmak
skills: [game.input]
---

# --explanation--

Steering has to be smooth: while a key is **held**, the player keeps moving. So instead of acting on each `keydown`,
remember which keys are down in a `keys` object, and let `update()` read it every frame:

```js
const direction = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)   // -1, 0 or 1
player.x += direction * SPEED
```

Holding both keys gives `0`, which is exactly what you would expect.

There are no walls: walk off the right side and you come back on the left. The switch happens when the player's
**middle** crosses the edge, and while it is half off one side, draw it a second time on the other side, so it seems to
slide through the edge instead of jumping.

On a phone, holding a finger on the left or right half of the game does the same as holding an arrow key. The touch
handlers simply set the same `keys`, so `update()` does not need to know where the input came from.

# --explanation-tr--

**Bu adımda:** oyuncuyu sağ ve sol ok tuşlarıyla (telefonda parmakla) yönlendireceğiz. Sağdan çıkınca soldan geri
gelecek, tıpkı eski oyunlardaki gibi.

**Tuşu basılı tutmak.** Yönlendirme akıcı olmalı: tuş **basılı** kaldığı sürece oyuncu kaymaya devam etmeli. Bunun
için hangi tuşların şu an basılı olduğunu bir not defterinde tutarız. Bu defter boş bir nesnedir:

```js
const keys = {}
```

Tuşa basınca `keys.ArrowRight = true` (doğru), bırakınca `false` (yanlış) yazarız. `true` ve `false`'a
**mantıksal değer** (boolean) denir: evet ya da hayır.

**Olay (event) dinlemek.** Tarayıcı, bir tuşa basıldığında sana haber verebilir:

```js
document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
```

Parça parça:

- `addEventListener('keydown', ...)` → "bir tuşa basıldığında şunu yap". `'keyup'` ise tuş bırakıldığında olur.
- `(event) => { ... }` → adsız, kısa bir fonksiyondur (ok fonksiyonu, **arrow function**). `event` tarayıcının
  verdiği bilgidir; `event.key` basılan tuşun adıdır, örneğin `'ArrowLeft'` ya da `'ArrowRight'`.
- `keys[event.key]` → köşeli parantez, alanın adını bir değişkenden almamızı sağlar. Sağ oka basıldıysa bu
  `keys.ArrowRight` ile aynı şeydir.
- `event.preventDefault()` → tarayıcının o tuşla normalde yaptığı şeyi (sayfayı kaydırmak) engeller.
- `===` "eşit mi?" diye sorar (tek `=` ise değer atar, karıştırma). `||` "ya da" demektir: iki koşuldan biri doğruysa
  sonuç doğrudur.

**Yön hesabı.** `update()` her karede defterden okur:

```js
const direction = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
```

`a ? b : c` kısa bir "eğer"dir: `a` doğruysa `b`, değilse `c`. Yani sağ basılıysa `1 - 0 = 1`, sol basılıysa
`0 - 1 = -1`, ikisi birden basılıysa `1 - 1 = 0` (oyuncu durur). Sonra `player.x += direction * SPEED` ile oyuncu
her karede 5 piksel sağa ya da sola gider (`*` çarpmadır).

**Kenardan dolanmak.** Duvar yok. Oyuncunun **ortası** (`x + w / 2`, `/` bölmedir) `0`'ın altına inerse `x`'e
`canvas.width` (400) ekleriz, sağ kenarı geçerse çıkarırız; böylece öbür taraftan çıkar. Oyuncu yarısı taşmışken
kaybolmasın diye onu **ikinci kez**, öbür tarafta da çizeriz. Böylece kenardan kayarak geçiyormuş gibi görünür. Tek
satırlık `if`'lerde süslü parantez gerekmez: `if (koşul) komut`.

**Telefonda dokunmak.** `pointerdown` parmak (ya da fare) basıldığında, `pointerup` kalktığında, `pointercancel`
dokunma yarıda kesildiğinde olur. Parmak oyunun sol yarısındaysa sol oku, sağdaysa sağ oku "basılı" sayarız:

- `canvas.getBoundingClientRect()` → canvas'ın ekrandaki yerini ve boyunu verir (`rect.left`, `rect.width`).
- `event.clientX - rect.left` → parmağın canvas'ın sol kenarından uzaklığı.
- Bu uzaklık `rect.width / 2`'den küçükse (`<`) parmak sol yarıdadır.

Dokunma da aynı `keys` defterine yazdığı için `update()`'in komutun klavyeden mi parmaktan mı geldiğini bilmesine
gerek kalmaz. Parmak kalkınca ikisini birden bırakan `stopSteering` adlı bir fonksiyon yazarız ve onu iki olaya da
veririz (burada adını parantezsiz yazarız: "çağır" değil "şu fonksiyonu kullan" deriz).

# --task--

1. Add `SPEED = 5` and `const keys = {}`. On `keydown` set `keys[event.key] = true` (and `preventDefault()` for the left
   and right arrows); on `keyup` set it back to `false`.
2. In `update()`, move the player by `direction * SPEED` before the physics. If its middle (`x + w / 2`) went below `0`,
   add `canvas.width` to `x`; if it went past `canvas.width`, subtract it.
3. In `draw()`, when `player.x < 0` also draw the player at `x + canvas.width`, and when its right edge is past the
   canvas, also at `x - canvas.width`.
4. On `pointerdown` on the canvas, hold `ArrowLeft` if the touch is in the left half (`event.clientX - rect.left <
   rect.width / 2`, with `rect = canvas.getBoundingClientRect()`), otherwise `ArrowRight`. On `pointerup` and
   `pointercancel`, release both.

# --task-tr--

1. `const JUMP = -11` satırının hemen altına yan hızı ekle:

   ```js
   const SPEED = 5 // her karede yana kaç piksel gidilir
   ```

2. `let player = { ... }` satırının hemen altına tuş defterini ve klavye dinleyicilerini ekle:

   ```js
   const keys = {}

   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
     if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault()
   })
   document.addEventListener('keyup', (event) => {
     keys[event.key] = false
   })
   ```

3. Hemen altına dokunmayla yönlendirmeyi ekle:

   ```js
   // Dokunma: oyunun sol ya da sağ yarısını basılı tut.
   canvas.addEventListener('pointerdown', (event) => {
     const rect = canvas.getBoundingClientRect()
     const left = event.clientX - rect.left < rect.width / 2
     keys[left ? 'ArrowLeft' : 'ArrowRight'] = true
   })
   function stopSteering() {
     keys.ArrowLeft = false
     keys.ArrowRight = false
   }
   canvas.addEventListener('pointerup', stopSteering)
   canvas.addEventListener('pointercancel', stopSteering)
   ```

4. `update()` fonksiyonunun **en başına**, fizik satırlarından önce dört satır ekle. Fonksiyon şöyle olmalı:

   ```js
   function update() {
     const direction = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0) // ← yeni
     player.x += direction * SPEED // ← yeni
     if (player.x + player.w / 2 < 0) player.x += canvas.width // ← yeni
     if (player.x + player.w / 2 > canvas.width) player.x -= canvas.width // ← yeni

     player.vy += GRAVITY
     player.y += player.vy
     // Yere değmek bir sonraki sekişi başlatır.
     if (player.y + player.h >= FLOOR) {
       player.y = FLOOR - player.h
       player.vy = JUMP
     }
   }
   ```

5. `draw()` fonksiyonunda oyuncuyu çizen `ctx.fillRect(player.x, ...)` satırının altına, taşan yarıyı öbür tarafta
   çizen iki satırı ekle:

   ```js
     ctx.fillStyle = '#f59e0b'
     ctx.fillRect(player.x, player.y, player.w, player.h)
     if (player.x < 0) ctx.fillRect(player.x + canvas.width, player.y, player.w, player.h) // ← yeni
     if (player.x + player.w > canvas.width) ctx.fillRect(player.x - canvas.width, player.y, player.w, player.h) // ← yeni
   }
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra sağ/sol ok tuşlarını basılı tut: kare o yöne kaymalı, sağdan
   çıkınca soldan girmeli. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `ArrowLeft`/`ArrowRight`
   yazımına (büyük A ve R) ve `<`/`>` işaretlerinin yönüne bak.

# --tests--

Holding an arrow key should keep the player moving that way.
tr: Bir ok tuşunu basılı tutmak oyuncuyu o yöne hareket ettirmeye devam etmeli.

```js
$.press('ArrowRight')
$.tick(10)
assert.strictEqual(player.x, 230)
$.release('ArrowRight')
$.tick(10)
assert.strictEqual(player.x, 230)
$.press('ArrowLeft')
$.press('ArrowRight')
$.tick(10)
assert.strictEqual(player.x, 230, 'both keys cancel out')
```

Walking off one side should bring the player back on the other.
tr: Bir taraftan çıkmak oyuncuyu öbür taraftan geri getirmeli.

```js
player.x = 370
$.press('ArrowRight')
$.tick(2)
assert.strictEqual(player.x, 380, 'the middle is exactly on the edge: not yet')
$.tick(1)
assert.strictEqual(player.x, -15)
$.release('ArrowRight')
$.press('ArrowLeft')
$.tick(2)
assert.strictEqual(player.x, 375)
```

Half off one side, the player should also be drawn on the other side.
tr: Bir taraftan yarı yarıya taşmışken oyuncu öbür tarafta da çizilmeli.

```js
player.x = -15
$.tick(1)
assert.deepEqual($.rects('#f59e0b').map((r) => r.x), [-15, 385])
player.x = 100
$.tick(1)
assert.lengthOf($.rects('#f59e0b'), 1)
```

Holding a finger on the left or right half should steer.
tr: Parmağı sol ya da sağ yarıda tutmak yönlendirmeli.

```js
$.pointerDown(50, 300)
$.tick(4)
assert.strictEqual(player.x, 160)
$.pointerUp(50, 300)
$.tick(4)
assert.strictEqual(player.x, 160)
$.pointerDown(350, 300)
$.tick(2)
assert.strictEqual(player.x, 170)
```

# --solution--

```js
// Doodle Jump-style climber, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.35
const JUMP = -11 // every bounce starts with this speed (negative = up)
const SPEED = 5 // sideways pixels per frame
const FLOOR = 600 // the bottom of the canvas

let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

// Touch: hold the left or right half of the game to steer.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const left = event.clientX - rect.left < rect.width / 2
  keys[left ? 'ArrowLeft' : 'ArrowRight'] = true
})
function stopSteering() {
  keys.ArrowLeft = false
  keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopSteering)
canvas.addEventListener('pointercancel', stopSteering)

function update() {
  const direction = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  player.x += direction * SPEED
  // Walking off one side brings you back on the other.
  if (player.x + player.w / 2 < 0) player.x += canvas.width
  if (player.x + player.w / 2 > canvas.width) player.x -= canvas.width

  player.vy += GRAVITY
  player.y += player.vy
  // Touching the floor starts the next bounce.
  if (player.y + player.h >= FLOOR) {
    player.y = FLOOR - player.h
    player.vy = JUMP
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y, player.w, player.h)
  // Half off one side: draw the other half on the far side.
  if (player.x < 0) ctx.fillRect(player.x + canvas.width, player.y, player.w, player.h)
  if (player.x + player.w > canvas.width) ctx.fillRect(player.x - canvas.width, player.y, player.w, player.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
