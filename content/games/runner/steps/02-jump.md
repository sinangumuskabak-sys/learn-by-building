---
title: Jump, and land
title_tr: Zıpla ve yere in
skills: [game.physics, game.input]
---

# --explanation--

A jump is the same physics as the flappy bird, with one new part: **the ground stops you**.

```js
runner.vy += GRAVITY   // gravity pulls a little more every frame
runner.y += runner.vy  // move
if (onGround()) {      // went into (or onto) the ground?
  runner.y = GROUND - runner.h   // stand exactly on it
  runner.vy = 0                  // and stop falling
}
```

Gravity keeps pulling even while the runner stands still; the ground check undoes it every frame. That sounds
wasteful, but it is the simplest correct approach: there is only one set of rules, whether the runner is in the air or
not.

A jump sets the velocity to `JUMP` (up), but **only when on the ground**. Without that check the player can jump again
in mid-air and fly away. (Some games allow a "double jump" on purpose. Then it is a counted, deliberate rule, never an
accident.)

# --explanation-tr--

**Bu adımda:** koşucu zıplayacak. Boşluk tuşuna (ya da yukarı ok tuşuna) basınca dikdörtgen yukarı fırlayacak,
yavaşlayacak, geri düşecek ve tam zemine oturacak.

**Hareket = her karede biraz değişmek.** Çizgi film gibi: resmi saniyede yaklaşık 60 kez yeniden çizeriz, her
seferinde koşucuyu biraz başka yere koyarız. Her bir resme **kare** (frame) denir. Bunun için iki fonksiyon
kullanacağız: `update()` (durumu bir kare ilerlet) ve `draw()` (şimdiki durumu çiz).

**Oyun döngüsü.** `requestAnimationFrame(loop)` tarayıcıya "bir sonraki resmi çizmeden hemen önce `loop`'u çalıştır"
der. `loop` her çalıştığında sonunda kendini yeniden ister; böylece sonsuza kadar kare kare döner:

```js
function loop() {
  update()                     // 1. durumu ilerlet
  draw()                       // 2. çiz
  requestAnimationFrame(loop)  // 3. bir sonraki karede yine gel
}
```

**Hız ve yerçekimi.** Koşucuya yeni bir alan ekliyoruz: `vy`, yani dikey hız (velocity y): her karede kaç piksel
aşağı kayacağı. Eksi değer yukarı demektir (çünkü `y` aşağı doğru büyür).

```js
runner.vy += GRAVITY   // hız her karede biraz daha aşağı yönelir
runner.y += runner.vy  // koşucu o hız kadar kayar
```

`a += b`, "`a`'ya `b` ekle ve sonucu yine `a`'ya koy" demektir (`a = a + b`'nin kısası). Zıplamak için hızı
`JUMP = -11` yaparız: koşucu yukarı fırlar, yerçekimi (`0.6`) her karede bu hızı biraz azaltır, sonunda hız artıya
döner ve koşucu düşer. Topu havaya atmak gibi.

**Zemin seni durdurur.** Düşen koşucu zemine gelince durmalı. Önce "zemindeyim ya da zeminin içine girdim mi?"
sorusunu soran bir fonksiyon yazarız:

```js
function onGround() {
  return runner.y + runner.h >= GROUND
}
```

- `runner.y + runner.h` koşucunun **alt kenarıdır** (tepesi + boyu).
- `>=` "büyük ya da eşit" demek. Karşılaştırmanın sonucu `true` (doğru) ya da `false` (yanlış) olur.
- `return` fonksiyonun **cevabını geri verir**. `onGround()` çağıran yer bu `true`/`false`'u alır.

**`if` (eğer).** Bir şeyi yalnızca bir koşul doğruysa yapmak için:

```js
if (onGround()) {
  runner.y = GROUND - runner.h   // zeminin tam üstüne koy
  runner.vy = 0                  // düşmeyi durdur
}
```

Parantez içi doğruysa `{ }` içindekiler çalışır, değilse atlanır. Tek bir komut varsa süslü parantezsiz, aynı
satıra da yazılabilir: `if (onGround()) runner.vy = JUMP`.

Dururken bile yerçekimi her karede koşucuyu biraz aşağı iter, zemin kontrolü de hemen geri koyar. İsraf gibi görünür
ama en basit doğru yol budur: koşucu havada da olsa yerde de olsa **tek bir kural seti** vardır.

**Sadece yerdeyken zıpla.** `jump()` hızı yalnızca `onGround()` doğruysa değiştirir. Bu kontrol olmasa oyuncu havada
tekrar tekrar basıp uçup giderdi. (Bazı oyunlar bilerek "çift zıplama" verir; o zaman bu sayılan, bilinçli bir
kuraldır, kaza değil.)

**Tuşu dinlemek (olay, event).** Tarayıcıya "bir tuşa basılınca bana haber ver" deriz:

```js
document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') jump()
})
```

- `addEventListener('keydown', ...)` → "tuşa basılma (`keydown`) olayında şunu çalıştır".
- `(event) => { ... }` **adsız kısa bir fonksiyondur** (ok fonksiyonu, arrow function). `=>` "şunu yap" diye
  okunur. Tarayıcı onu çağırırken basılan tuşun bilgisini `event` içinde verir.
- `event.key` basılan tuşun adıdır: boşluk için `' '` (tırnak içinde bir boşluk), yukarı ok için `'ArrowUp'`.
- `===` "tam olarak eşit mi?" diye sorar. `||` "veya" demektir: iki koşuldan biri doğruysa yeterli.

# --task--

1. Add `const GRAVITY = 0.6` and `const JUMP = -11`, and give the runner `vy: 0`.
2. Write `function onGround()` that returns whether the runner's bottom (`runner.y + runner.h`) is at or below
   `GROUND`.
3. Write `function jump()` that sets `runner.vy = JUMP` only when the runner is on the ground. Call it on `keydown`
   for Space (`' '`) and `'ArrowUp'`.
4. Write `update()` with the gravity and landing code above, and a `loop()` that calls `update()`, `draw()` and
   `requestAnimationFrame(loop)`. Start the loop.

# --task-tr--

1. `const GROUND = 180 // y of the ground line` satırının hemen **altına** iki sabit ekle:

   ```js
   const GRAVITY = 0.6
   const JUMP = -11 // speed at the start of a jump (negative = up)
   ```

2. `let runner = ...` satırının sonuna `vy: 0` alanını ekle. Satır şöyle olmalı:

   ```js
   let runner = { x: 50, y: GROUND - 44, w: 40, h: 44, vy: 0 }
   ```

3. `runner` satırının altına bir satır boşluk bırakıp zemin kontrolünü, zıplamayı ve tuş dinleyicisini yaz:

   ```js
   function onGround() {
     return runner.y + runner.h >= GROUND
   }

   function jump() {
     if (onGround()) runner.vy = JUMP
   }

   document.addEventListener('keydown', (event) => {
     if (event.key === ' ' || event.key === 'ArrowUp') jump()
   })
   ```

4. Onun altına (hâlâ `function draw()`'dan **önce**) bir kareyi ilerleten fonksiyonu yaz:

   ```js
   function update() {
     runner.vy += GRAVITY
     runner.y += runner.vy
     if (onGround()) {
       runner.y = GROUND - runner.h
       runner.vy = 0
     }
   }
   ```

5. En alttaki tek başına duran `draw()` satırını **sil** ve yerine döngüyü ve onu başlatan satırı yaz:

   ```js
   function loop() {
     update()
     draw()
     requestAnimationFrame(loop)
   }

   requestAnimationFrame(loop)
   ```

   Artık `draw()`'u döngü her karede kendisi çağırıyor.

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra Boşluk ya da yukarı ok tuşuna bas: koşucu zıplayıp
   zemine geri inmeli, havadayken tekrar basınca bir şey olmamalı. Alttaki kontrollerin hepsi yeşil olmalı.
   Koşucu zeminin içinden düşüp gidiyorsa `onGround()` içindeki `>=` işaretini kontrol et.

# --tests--

Standing still, the runner should stay on the ground.
tr: Dururken koşucu zeminde kalmalı.

```js
assert.deepEqual([GRAVITY, JUMP], [0.6, -11])
$.tick(30)
assert.strictEqual(runner.y, 136)
assert.strictEqual(runner.vy, 0)
assert.isTrue(onGround())
```

Space should start a jump that rises, then lands back on the ground.
tr: Boşluk yükselen, sonra zemine geri inen bir zıplama başlatmalı.

```js
$.press(' ')
assert.strictEqual(runner.vy, -11)
$.tick(10)
assert.isBelow(runner.y, 70, 'about 77 px up after 10 frames')
assert.isFalse(onGround())
$.tick(40)
assert.strictEqual(runner.y, 136)
assert.strictEqual(runner.vy, 0)
```

There should be no jumping in mid-air.
tr: Havada zıplamak olmamalı.

```js
$.press('ArrowUp')
$.release('ArrowUp')
$.tick(5)
const vy = runner.vy
$.press(' ')
assert.strictEqual(runner.vy, vy)
```

# --solution--

```js
// Endless runner, step by step.
// The page already has <canvas id="game" width="600" height="220"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 180 // y of the ground line
const GRAVITY = 0.6
const JUMP = -11 // speed at the start of a jump (negative = up)

let runner = { x: 50, y: GROUND - 44, w: 40, h: 44, vy: 0 }

function onGround() {
  return runner.y + runner.h >= GROUND
}

function jump() {
  if (onGround()) runner.vy = JUMP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') jump()
})

function update() {
  runner.vy += GRAVITY
  runner.y += runner.vy
  if (onGround()) {
    runner.y = GROUND - runner.h
    runner.vy = 0
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
