---
title: Interceptors and explosions
title_tr: Önleyiciler ve patlamalar
skills: [game.input, game.loop]
---

# --explanation--

You fight back by clicking the sky. An interceptor flies from your base to the point you clicked, fast, and **explodes
there**. You do not hit missiles directly; you put an explosion where they will be. That is what makes the game about
aiming ahead.

An explosion is just a position and an `age`. Its size is worked out from the age every frame: it grows to its full radius
in the first half of its life and shrinks away in the second half:

```js
const t = b.age / BLAST_FRAMES           // 0 to 1 over its life
return BLAST * (t < 0.5 ? t * 2 : (1 - t) * 2)
```

Computing a value from the age, instead of storing and updating it, is a handy animation trick: the explosion cannot get
out of step, and changing its shape means changing one formula.

Missiles that reach the ground explode too. Interceptors reuse `stepTowards()` with a higher speed. Clicks below the top of
the base are ignored, so you cannot shoot the ground.

# --explanation-tr--

**Bu adımda:** karşılık vereceksin. Gökyüzünde bir yere tıklayınca üssünden yeşil bir önleme füzesi o noktaya fırlayacak
ve orada **patlayacak**: büyüyüp küçülen, sarı-turuncu yanıp sönen bir top. Yere düşen düşman füzeleri de patlayacak.

**Doğrudan vurmak yok, önünü kesmek var.** Füzeleri doğrudan vurmazsın; onların **geleceği yere** bir patlama
koyarsın. Oyunu "önünü kestirerek nişan alma" oyunu yapan budur. Önleme füzesi 2. adımdaki `stepTowards()`'u kullanır,
yalnızca çok daha hızlıdır (`SHOT_SPEED = 7`). Varınca listeden çıkar ve yerine bir patlama eklenir.

**Tıklamanın yeri.** Ekrana dokununca ya da tıklayınca `pointerdown` olayı olur ve verdiğin fonksiyon çalışır.
`event.clientX` / `event.clientY` tıklamanın **pencere** içindeki yeridir. Canvas sayfanın bir yerinde durur ve
ekranda küçültülmüş olabilir; `canvas.getBoundingClientRect()` onun pencerede nerede ve ne boyda göründüğünü verir.
Çeviri:

- `event.clientX - rect.left` → canvas'ın sol kenarından uzaklık (ekran pikseli),
- `* canvas.width / rect.width` → ekran pikselini canvas pikseline çevirir.

`y` için aynısı. Üssün tepesinin altına yapılan tıklamalar yok sayılır (`if (ty > BASE.y - 10) return`); böylece yere
ateş edemezsin. `return` fonksiyonu hemen bitirir.

**Patlama = konum + yaş.** Bir patlama yalnızca bir konum ve bir `age`'dir (yaş, kaç karedir yaşadığı). Her karede yaşı
1 artar; `BLAST_FRAMES` (50) kareye ulaşınca silinir. Boyutu her karede yaşından **hesaplanır**: ömrünün ilk yarısında
tam yarıçapına büyür, ikinci yarısında küçülüp kaybolur:

```js
const t = b.age / BLAST_FRAMES           // ömrü boyunca 0'dan 1'e
return BLAST * (t < 0.5 ? t * 2 : (1 - t) * 2)
```

`t` ömrün ne kadarının geçtiğidir (0.5 = yarısı). `koşul ? A : B` "doğruysa A, değilse B". İlk yarıda `t * 2` 0'dan
1'e çıkar, ikinci yarıda `(1 - t) * 2` 1'den 0'a iner; ikisini 32 ile çarpınca yarıçap çıkar. Değeri saklayıp
güncellemek yerine yaştan hesaplamak kullanışlı bir animasyon hilesidir: patlama şaşıramaz ve biçimini değiştirmek tek
bir formülü değiştirmektir.

**Daire çizmek.**

```js
ctx.beginPath()
ctx.arc(x, y, yaricap, 0, Math.PI * 2)   // merkez, yarıçap, tam tur
ctx.fill()                               // içini boya
```

**Yanıp sönme: `%`.** `%` bölümden kalanı verir: `7 % 6` → 1, `10 % 6` → 4. Yaş arttıkça `b.age % 6` 0, 1, 2, 3, 4, 5,
0, 1... diye döner. 3'ten küçükken sarı, değilse turuncu boyarsak patlama her 3 karede renk değiştirir, titrer.

# --task--

1. Add `SHOT_SPEED = 7`, `BLAST = 32`, `BLAST_FRAMES = 50`, `shots` and `blasts` (both `[]` in `reset()`).
2. Write `fire(tx, ty)`: ignore points lower than `BASE.y - 10`; otherwise add `{ x: BASE.x, y: BASE.y, tx, ty }` to `shots`.
   A `pointerdown` fires at the click, in canvas pixels.
3. Write `radius(b)` as above.
4. In `update()`: move shots at `SHOT_SPEED`; one that arrives is removed and adds a blast `{ x, y, age: 0 }` there. Then add
   1 to every blast's age and remove the ones as old as `BLAST_FRAMES`. A missile that reaches the ground also adds a blast.
5. Draw shots as `'#a3e635'` lines from the base, and blasts as filled circles of their radius, `'#fde047'` when
   `age % 6 < 3` and `'#fb923c'` otherwise, so they flicker.

# --task-tr--

1. `const CITY_XS = ...` satırının altına üç ayar ekle:

   ```js
   const SHOT_SPEED = 7
   const BLAST = 32 // the biggest radius of an explosion
   const BLAST_FRAMES = 50 // how long an explosion lasts, growing then shrinking
   ```

2. `let incoming ...` satırının altına iki değişken ekle:

   ```js
   let shots // your interceptors on their way: { x, y, tx, ty }
   let blasts // explosions: { x, y, age }
   ```

3. `reset()` içinde `incoming = []` satırının altına ekle:

   ```js
     shots = []
     blasts = []
   ```

4. `launch()` fonksiyonunun kapanış `}`'inin altına, bir boş satır bırakıp ateş etmeyi ve tıklamayı ekle:

   ```js
   function fire(tx, ty) {
     if (ty > BASE.y - 10) return
     shots.push({ x: BASE.x, y: BASE.y, tx, ty })
   }

   canvas.addEventListener('pointerdown', (event) => {
     const rect = canvas.getBoundingClientRect()
     fire(((event.clientX - rect.left) * canvas.width) / rect.width, ((event.clientY - rect.top) * canvas.height) / rect.height)
   })
   ```

5. `stepTowards` fonksiyonunun kapanış `}`'inin altına, `update`'in üstüne `radius`'u ekle:

   ```js
   // How big an explosion is at its age: it grows for the first half and shrinks in the second.
   function radius(b) {
     const t = b.age / BLAST_FRAMES
     return BLAST * (t < 0.5 ? t * 2 : (1 - t) * 2)
   }
   ```

6. `update()` içinde, fırlatma bloğunun (`if (toLaunch > 0) { ... }`) altına ve düşman füzelerini yürüten
   `for (const m of incoming)` döngüsünün üstüne şunu ekle:

   ```js
     for (const s of shots) {
       if (stepTowards(s, SHOT_SPEED)) {
         s.done = true
         blasts.push({ x: s.x, y: s.y, age: 0 })
       }
     }
     shots = shots.filter((s) => !s.done)

     for (const b of blasts) b.age += 1
     blasts = blasts.filter((b) => b.age < BLAST_FRAMES)
   ```

7. Aynı fonksiyonda, düşman füzesi yere varınca da patlasın:

   ```js
     for (const m of incoming) {
       if (stepTowards(m, m.speed)) {
         m.done = true
         blasts.push({ x: m.x, y: m.y, age: 0 }) // ← yeni
         const city = cities.find((c) => c.alive && Math.abs(c.x - m.x) < 20)
         if (city) city.alive = false
       }
     }
   ```

8. `draw()`'un sonuna, duman izlerini çizen `for` döngüsünün altına önleme füzelerini ve patlamaları ekle:

   ```js
     ctx.strokeStyle = '#a3e635'
     for (const s of shots) {
       ctx.beginPath()
       ctx.moveTo(BASE.x, BASE.y)
       ctx.lineTo(s.x, s.y)
       ctx.stroke()
     }
     for (const b of blasts) {
       ctx.fillStyle = b.age % 6 < 3 ? '#fde047' : '#fb923c'
       ctx.beginPath()
       ctx.arc(b.x, b.y, radius(b), 0, Math.PI * 2)
       ctx.fill()
     }
   ```

9. **Çalıştır**'a bas. Gökyüzüne tıkla: üssünden yeşil bir çizgi o noktaya uzanmalı, varınca yanıp sönen bir patlama
   büyüyüp küçülmeli. Yere düşen kırmızı füzeler de patlamalı. Alttaki kontrollerin hepsi yeşil olmalı. (Patlamalar
   henüz füzeleri yok etmiyor; o bir sonraki adımda.)

# --tests--

An explosion should grow to its full size halfway through its life, then shrink.
tr: Bir patlama ömrünün yarısında tam boyutuna büyümeli, sonra küçülmeli.

```js
assert.strictEqual(radius({ age: 0 }), 0)
assert.closeTo(radius({ age: 10 }), 12.8, 1e-9)
assert.strictEqual(radius({ age: 25 }), 32)
assert.closeTo(radius({ age: 40 }), 12.8, 1e-9)
```

A click should send an interceptor that explodes where you clicked.
tr: Bir tıklama tıkladığın yerde patlayan bir önleyici göndermeli.

```js
toLaunch = 0
$.click(240, 100)
assert.lengthOf(shots, 1)
$.tick(36)
assert.lengthOf(shots, 1)
$.tick(1)
assert.lengthOf(shots, 0)
assert.lengthOf(blasts, 1)
assert.deepEqual([blasts[0].x, blasts[0].y], [240, 100])
$.tick(24)
assert.strictEqual(radius(blasts[0]), 32)
assert.isTrue($.arcs().some((a) => a.r === 32 && a.x === 240))
$.tick(25)
assert.lengthOf(blasts, 0)
```

Clicks below the base should not fire.
tr: Üssün altına yapılan tıklamalar ateş etmemeli.

```js
fire(240, 350)
fire(100, 390)
assert.lengthOf(shots, 0)
fire(100, 340)
assert.lengthOf(shots, 1)
```

A missile that reaches the ground should explode.
tr: Yere ulaşan bir füze patlamalı.

```js
toLaunch = 0
incoming = [{ sx: 50, sy: 300, x: 50, y: 369, tx: 50, ty: 370, speed: 0.8 }]
$.tick(2)
assert.lengthOf(blasts, 1)
assert.strictEqual(blasts[0].x, 50)
```

# --solution--

```js
// Missile defense, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 370
const BASE = { x: 240, y: GROUND - 14 } // where your interceptors start
const CITY_XS = [50, 110, 170, 310, 370, 430]
const SHOT_SPEED = 7
const BLAST = 32 // the biggest radius of an explosion
const BLAST_FRAMES = 50 // how long an explosion lasts, growing then shrinking

let cities
let incoming // enemy missiles: { sx, sy, x, y, tx, ty, speed }
let shots // your interceptors on their way: { x, y, tx, ty }
let blasts // explosions: { x, y, age }
let toLaunch // enemy missiles still to come
let launchIn

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
  incoming = []
  shots = []
  blasts = []
  toLaunch = 20
  launchIn = 30
}

// A new enemy missile from a random point at the top towards a random living city (or the base).
function launch() {
  const sx = Math.random() * canvas.width
  const sy = 0
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  incoming.push({ sx, sy, x: sx, y: sy, tx, ty: GROUND, speed: 0.8 })
}

function fire(tx, ty) {
  if (ty > BASE.y - 10) return
  shots.push({ x: BASE.x, y: BASE.y, tx, ty })
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  fire(((event.clientX - rect.left) * canvas.width) / rect.width, ((event.clientY - rect.top) * canvas.height) / rect.height)
})

// Move a point `speed` pixels towards its target; true when it has arrived.
function stepTowards(m, speed) {
  const dx = m.tx - m.x
  const dy = m.ty - m.y
  const distance = Math.hypot(dx, dy)
  if (distance <= speed) {
    m.x = m.tx
    m.y = m.ty
    return true
  }
  m.x += (dx / distance) * speed
  m.y += (dy / distance) * speed
  return false
}

// How big an explosion is at its age: it grows for the first half and shrinks in the second.
function radius(b) {
  const t = b.age / BLAST_FRAMES
  return BLAST * (t < 0.5 ? t * 2 : (1 - t) * 2)
}

function update() {
  if (toLaunch > 0) {
    launchIn -= 1
    if (launchIn <= 0) {
      launch()
      toLaunch -= 1
      launchIn = 60
    }
  }

  for (const s of shots) {
    if (stepTowards(s, SHOT_SPEED)) {
      s.done = true
      blasts.push({ x: s.x, y: s.y, age: 0 })
    }
  }
  shots = shots.filter((s) => !s.done)

  for (const b of blasts) b.age += 1
  blasts = blasts.filter((b) => b.age < BLAST_FRAMES)

  for (const m of incoming) {
    if (stepTowards(m, m.speed)) {
      m.done = true
      blasts.push({ x: m.x, y: m.y, age: 0 })
      const city = cities.find((c) => c.alive && Math.abs(c.x - m.x) < 20)
      if (city) city.alive = false
    }
  }
  incoming = incoming.filter((m) => !m.done)
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#854d0e'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  for (const c of cities) {
    ctx.fillStyle = c.alive ? '#38bdf8' : '#44403c'
    ctx.fillRect(c.x - 16, GROUND - (c.alive ? 14 : 4), 32, c.alive ? 14 : 4)
  }
  ctx.fillStyle = '#a3e635'
  ctx.fillRect(BASE.x - 12, BASE.y, 24, 14)

  ctx.lineWidth = 2
  ctx.strokeStyle = '#f87171'
  for (const m of incoming) {
    ctx.beginPath()
    ctx.moveTo(m.sx, m.sy)
    ctx.lineTo(m.x, m.y)
    ctx.stroke()
  }
  ctx.strokeStyle = '#a3e635'
  for (const s of shots) {
    ctx.beginPath()
    ctx.moveTo(BASE.x, BASE.y)
    ctx.lineTo(s.x, s.y)
    ctx.stroke()
  }
  for (const b of blasts) {
    ctx.fillStyle = b.age % 6 < 3 ? '#fde047' : '#fb923c'
    ctx.beginPath()
    ctx.arc(b.x, b.y, radius(b), 0, Math.PI * 2)
    ctx.fill()
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
