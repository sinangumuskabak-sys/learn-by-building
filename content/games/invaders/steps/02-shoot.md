---
title: Firing, with a cooldown
title_tr: Bekleme süreli ateş
skills: [game.input, prog.arrays]
---

# --explanation--

Space fires a bullet straight up. Bullets are the classic **list of short-lived objects**: push a new one when firing,
move all of them every frame, and drop the ones that have left the screen with `filter`.

Without a limit, holding Space (which repeats `keydown` many times a second) or mashing it would fill the screen with
bullets and remove all challenge. So the cannon needs a **cooldown**: a minimum time between shots. Remember **when**
the last shot happened and refuse to fire again too soon:

```js
if (now - lastShot < COOLDOWN) return   // still reloading
lastShot = now
```

`now` is the current time, which the loop receives from `requestAnimationFrame`. Starting `lastShot` at `-COOLDOWN`
means the very first shot is allowed immediately.

Cooldowns are everywhere in games: weapons, abilities, dashes, even how often a menu button can be pressed.

# --explanation-tr--

**Bu adımda:** Boşluk tuşu ile topun namlusundan yukarı beyaz mermiler atacağız. Mermiler yukarı uçacak, ekrandan
çıkınca silinecek; tuşa ne kadar hızlı basarsan bas, top en fazla 0,35 saniyede bir ateş edecek.

**Dizi (array): bir liste.** Ekranda aynı anda birkaç mermi olabilir. Her biri bir nesne (`{ x, y, w, h }`) ve hepsini
bir **diziye** koyarız. Dizi köşeli parantezle yazılır, elemanlar virgülle ayrılır:

```js
let bullets = []                        // boş liste
bullets.push({ x: 238, y: 468, w: 4, h: 12 })   // listenin sonuna bir mermi ekle
```

`push` "sona ekle" demektir. Liste bir alışveriş listesi gibidir: yazarsın, üstünü çizersin, yeniden yazarsın.

**Hepsini tek tek dolaşmak (`for ... of`).** Her karede her mermiyi yukarı taşımalıyız:

```js
for (const bullet of bullets) bullet.y -= BULLET_SPEED
```

"`bullets` listesindeki her eleman için, ona sırayla `bullet` de ve `y`'sini 8 azalt." `y` azalınca mermi
**yukarı** çıkar (1. adımdaki gibi `y` aşağı doğru büyür).

**Eleme (`filter`).** Ekranın üstünden çıkmış mermileri atmak için:

```js
bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)
```

`filter` her eleman için verdiğin küçük fonksiyonu çalıştırır ve sonucu doğru (`true`) olanlarla **yeni bir liste**
yapar. Burada kural: "merminin alt kenarı (`y + h`) hâlâ 0'dan büyükse, yani ekrandaysa kalsın". `>` "büyüktür",
`<` "küçüktür" demektir. Yeni listeyi eski adın üstüne yazarız; bu yüzden `bullets` `const` değil `let`.

**Bekleme süresi (cooldown).** Sınır olmazsa Boşluk'u basılı tutmak (tarayıcı `keydown`'ı saniyede birçok kez tekrar
eder) ekranı mermiyle doldurur, oyunun bütün zorluğu kaybolur. Çözüm: son atışın **ne zaman** olduğunu hatırla,
çok erken ise ateş etme:

```js
if (now - lastShot < COOLDOWN) return   // hâlâ dolduruluyor
lastShot = now
```

- `return` fonksiyonu **hemen bitirir**; altındaki satırlar o sefer çalışmaz.
- `now` o anki zamandır (milisaniye; 1000 milisaniye = 1 saniye). `requestAnimationFrame`, `loop`'u çağırırken ona
  zamanı da verir. `function loop(time)` yazınca bu zaman `time` adıyla içeri gelir; buna **parametre** denir.
- `lastShot`'u `-COOLDOWN` (eksi 350) ile başlatırız ki ilk atışa hemen izin verilsin: `0 - (-350) = 350`, bu da
  350'den küçük değil.

**`===` eşit mi?** `event.key === ' '` "basılan tuş boşluk mu?" diye sorar. Tek `=` bir değer **koyar**, üç `===`
iki değeri **karşılaştırır**. Boşluk tuşunun adı, tırnak içinde tek bir boşluktur: `' '`.

Bekleme süreleri oyunların her yerindedir: silahlar, yetenekler, atılmalar, hatta bir menü düğmesine ne sıklıkla
basılabileceği.

# --task--

1. Add `BULLET_SPEED = 8`, `COOLDOWN = 350`, `let bullets = []`, `let lastShot = -COOLDOWN` and `let now = 0`, and set
   `now = time` at the start of `loop(time)`.
2. Write `shoot()`: if less than `COOLDOWN` ms have passed since `lastShot`, do nothing; otherwise set `lastShot = now`
   and push a 4×12 bullet at `x = ship.x + SHIP_W / 2 - 2`, `y = ship.y - 12`. Call it when Space is pressed.
3. In `update()`, move bullets up by `BULLET_SPEED` and keep only those still on screen (`y + h > 0`). Draw them in
   `'#f8fafc'`.

# --task-tr--

1. `const SHIP_SPEED = 4` satırının altına iki ayar ekle:

   ```js
   const BULLET_SPEED = 8
   const COOLDOWN = 350 // milliseconds between shots
   ```

2. `let ship = ...` satırının altına şu üç satırı ekle:

   ```js
   let bullets = []
   let lastShot = -COOLDOWN
   let now = 0
   ```

3. `const keys = {}` satırının altına, bir boş satır bırakıp ateş eden fonksiyonu yaz:

   ```js
   function shoot() {
     if (now - lastShot < COOLDOWN) return
     lastShot = now
     bullets.push({ x: ship.x + SHIP_W / 2 - 2, y: ship.y - 12, w: 4, h: 12 })
   }
   ```

   Yeni mermi 4 piksel eninde, 12 piksel boyunda; namlunun ortasından çıkar.

4. `keydown` bloğuna Boşluk'a basınca `shoot()`'u çağıran satırı ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
     if (event.key === ' ') shoot() // ← yeni
   })
   ```

5. `update()` fonksiyonunun sonuna, `}` kapanışından önce iki satır ekle:

   ```js
   function update() {
     if (keys.ArrowLeft) ship.x -= SHIP_SPEED
     if (keys.ArrowRight) ship.x += SHIP_SPEED
     ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))

     for (const bullet of bullets) bullet.y -= BULLET_SPEED // ← yeni
     bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0) // ← yeni
   }
   ```

6. `draw()` fonksiyonunun sonuna, `}` kapanışından önce mermileri boyayan iki satırı ekle:

   ```js
     ctx.fillStyle = '#f8fafc'
     for (const bullet of bullets) ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h)
   ```

7. `loop` fonksiyonunu zamanı alacak şekilde değiştir:

   ```js
   function loop(time) { // ← değişti
     now = time // ← yeni
     update()
     draw()
     requestAnimationFrame(loop)
   }
   ```

8. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra Boşluk'a bas: namludan beyaz bir mermi yukarı uçmalı.
   Boşluk'a art arda bassan da mermiler aralıklı çıkmalı. Alttaki kontrollerin hepsi yeşil olmalı. Mermi hiç
   çıkmıyorsa `event.key === ' '` satırındaki tırnakların arasında **bir boşluk** olduğundan emin ol.

# --tests--

Space should fire a bullet from the barrel.
tr: Boşluk namludan bir mermi atmalı.

```js
$.tick()
$.tap(' ')
assert.deepEqual(bullets, [{ x: 238, y: 468, w: 4, h: 12 }])
$.tick()
assert.strictEqual(bullets[0].y, 460)
assert.lengthOf($.rects('#f8fafc'), 1)
```

The cooldown should limit how fast the cannon fires.
tr: Bekleme süresi topun ne kadar hızlı ateş ettiğini sınırlamalı.

```js
$.tick()
$.tap(' ')
$.tap(' ')
$.tap(' ')
assert.lengthOf(bullets, 1, 'mashing Space fires once')
$.run(0.3)
$.tap(' ')
assert.lengthOf(bullets, 1, 'still reloading after 300 ms')
$.run(0.1)
$.tap(' ')
assert.lengthOf(bullets, 2, 'ready again after 350 ms')
```

Bullets should disappear once they leave the screen.
tr: Mermiler ekrandan çıkınca kaybolmalı.

```js
$.tick()
$.tap(' ')
$.run(1.2)
assert.lengthOf(bullets, 0)
```

# --solution--

```js
// Invaders, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_Y = 480
const SHIP_W = 36
const SHIP_H = 16
const SHIP_SPEED = 4
const BULLET_SPEED = 8
const COOLDOWN = 350 // milliseconds between shots

let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
let bullets = []
let lastShot = -COOLDOWN
let now = 0
const keys = {}

function shoot() {
  if (now - lastShot < COOLDOWN) return
  lastShot = now
  bullets.push({ x: ship.x + SHIP_W / 2 - 2, y: ship.y - 12, w: 4, h: 12 })
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ') shoot()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowLeft) ship.x -= SHIP_SPEED
  if (keys.ArrowRight) ship.x += SHIP_SPEED
  ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))

  for (const bullet of bullets) bullet.y -= BULLET_SPEED
  bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)

  ctx.fillStyle = '#f8fafc'
  for (const bullet of bullets) ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h)
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
