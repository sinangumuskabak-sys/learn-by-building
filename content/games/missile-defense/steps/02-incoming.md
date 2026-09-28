---
title: Incoming!
title_tr: Geliyorlar!
skills: [game.loop, game.physics]
---

# --explanation--

Enemy missiles start at a random point at the top and fly in a straight line to a target on the ground: a city that is still
standing, or your base. Every missile and every interceptor in this game does the same thing, "move towards a point at a
given speed", so it is worth one small function:

```js
const distance = Math.hypot(dx, dy)
m.x += (dx / distance) * speed   // (dx, dy) divided by its length is a direction of length 1
m.y += (dy / distance) * speed
```

Dividing the arrow to the target by its length gives a **unit vector**: a pure direction. Multiplying it by the speed gives
exactly one step of that size. When the target is closer than one step, the missile snaps onto it and the function says
it has arrived.

A missile that arrives destroys the city it was aimed at. Each missile remembers where it started, so its smoke trail can
be drawn as a line from the start to where it is now.

# --explanation-tr--

**Bu adımda:** düşman füzeleri gelecek. Ekranın üstünden kırmızı duman izleri bırakan füzeler yavaşça aşağı süzülecek;
bir şehre ulaşan füze o şehri enkaza çevirecek.

**Rastgele başlangıç ve hedef.** `Math.random()` 0 ile 1 arasında rastgele bir sayı verir; `Math.random() * canvas.width`
0 ile 480 arasında rastgele bir `x`'tir. Listeden rastgele eleman seçmek için `Math.floor` ile aşağı yuvarlarız:
`targets[Math.floor(Math.random() * targets.length)]`. (`.length` listenin eleman sayısıdır; sıra numaraları 0'dan
başladığı için sonuç her zaman geçerli bir sıradır.)

Hedefler: hâlâ ayakta olan şehirlerin `x`'leri ve üssün `x`'i.

```js
const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
```

`filter` kurala uyanları (canlı şehirleri) tutar, `map` her şehrin yerine onun `x`'ini koyar, `concat` listenin sonuna
bir eleman daha ekleyip yeni bir liste verir. Yeni füze `incoming` listesine `push` ile eklenir. Füze nereden başladığını
(`sx, sy`), şimdi nerede olduğunu (`x, y`) ve nereye gittiğini (`tx, ty`) hatırlar.

**Bir noktaya doğru gitmek.** Bu oyundaki her füze aynı şeyi yapar: "belli bir hızla bir noktaya doğru ilerle". Bu yüzden
küçük bir fonksiyona değer:

```js
const distance = Math.hypot(dx, dy)
m.x += (dx / distance) * speed
m.y += (dy / distance) * speed
```

- `dx` ve `dy` hedefe kadar yatayda ve dikeyde ne kadar yol kaldığıdır (`hedef - şimdiki`).
- `Math.hypot(dx, dy)` iki noktanın arasındaki dümdüz uzaklıktır (okuldaki Pisagor: `√(dx² + dy²)`).
- Hedefe giden oku kendi uzunluğuna bölmek, uzunluğu 1 olan bir ok verir: **birim vektör**, yani saf bir yön. Onu hızla
  çarpınca tam o büyüklükte bir adım çıkar. Hedef 30 piksel sağda, 40 piksel aşağıdaysa uzaklık 50'dir; hız 1 ile adım
  `(0.6, 0.8)` olur.

Hedef bir adımdan yakınsa (`distance <= speed`, `<=` "küçük ya da eşit") füze hedefe **oturtulur** ve fonksiyon `true`
("vardım") döndürür; yoksa adım atılır ve `false` döner.

**Geri sayım.** Oyun döngüsü saniyede ~60 kez çalışır; her çalışma bir **kare**dir. `launchIn` bir sonraki fırlatmaya
kaç kare kaldığıdır: her karede 1 azalır (`-=`), 0'a inince bir füze fırlatılır ve 60 kare (bir saniye) beklenir.
`toLaunch` dalgada kaç füze kaldığıdır.

**Varınca.** Varan füzeyi `m.done = true` diye işaretleriz (nesneye sonradan yeni bir alan eklenebilir). Hedefin 20
piksel yakınındaki canlı şehir yıkılır: `Math.abs` bir sayının eksisiz hâlidir (uzaklık), `find` kurala uyan ilk şehri
verir, yoksa `undefined` verir; `if (city)` "bulunduysa" demektir. En sonda `filter((m) => !m.done)` işaretlileri atar
(`!` "değil").

**Çizgi çizmek.** Füzenin duman izi, başladığı yerden şu anki yerine bir çizgidir:

```js
ctx.beginPath()          // yeni çizgiye başla
ctx.moveTo(m.sx, m.sy)   // kalemi başlangıca koy
ctx.lineTo(m.x, m.y)     // şimdiki yere kadar çek
ctx.stroke()             // çizgiyi boya
```

Çizginin rengi `ctx.strokeStyle`, kalınlığı `ctx.lineWidth`'tir.

# --task--

1. Add `incoming`, `toLaunch` and `launchIn`; `reset()` sets `[]`, `20` and `30`.
2. Write `launch()`: a missile `{ sx, sy, x, y, tx, ty, speed: 0.8 }` starting at a random `x` on the top edge, aimed at a
   random choice among the living cities' `x` and `BASE.x`, with `ty = GROUND`.
3. Write `stepTowards(m, speed)` as above, returning `true` when it has arrived.
4. In `update()`: count `launchIn` down while missiles are left to launch; at `0`, launch one and wait 60 frames. Move every
   missile; one that arrives is removed, and destroys a living city within 20 pixels of it.
5. Draw each missile as a `'#f87171'` line, 2 pixels wide, from where it started to where it is.

# --task-tr--

1. `let cities` satırının altına üç değişken ekle:

   ```js
   let incoming // enemy missiles: { sx, sy, x, y, tx, ty, speed }
   let toLaunch // enemy missiles still to come
   let launchIn
   ```

2. `reset()`'i şöyle yap:

   ```js
   function reset() {
     cities = CITY_XS.map((x) => ({ x, alive: true }))
     incoming = [] // ← yeni
     toLaunch = 20 // ← yeni
     launchIn = 30 // ← yeni
   }
   ```

3. `reset()`'in altına, bir boş satır bırakıp füze fırlatan ve bir noktayı hedefe yürüten fonksiyonları yaz:

   ```js
   // A new enemy missile from a random point at the top towards a random living city (or the base).
   function launch() {
     const sx = Math.random() * canvas.width
     const sy = 0
     const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
     const tx = targets[Math.floor(Math.random() * targets.length)]
     incoming.push({ sx, sy, x: sx, y: sy, tx, ty: GROUND, speed: 0.8 })
   }

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
   ```

4. Altına her karede hesabı yapan `update`'i yaz:

   ```js
   function update() {
     if (toLaunch > 0) {
       launchIn -= 1
       if (launchIn <= 0) {
         launch()
         toLaunch -= 1
         launchIn = 60
       }
     }

     for (const m of incoming) {
       if (stepTowards(m, m.speed)) {
         m.done = true
         const city = cities.find((c) => c.alive && Math.abs(c.x - m.x) < 20)
         if (city) city.alive = false
       }
     }
     incoming = incoming.filter((m) => !m.done)
   }
   ```

5. `draw()`'un sonuna, üssü boyayan `ctx.fillRect(BASE.x - 12, ...)` satırının altına, bir boş satır bırakıp duman
   izlerini ekle:

   ```js
     ctx.lineWidth = 2
     ctx.strokeStyle = '#f87171'
     for (const m of incoming) {
       ctx.beginPath()
       ctx.moveTo(m.sx, m.sy)
       ctx.lineTo(m.x, m.y)
       ctx.stroke()
     }
   ```

6. `loop()` içinde `draw()`'dan önce `update()`'i çağır:

   ```js
   function loop() {
     update() // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

7. **Çalıştır**'a bas. Yarım saniye sonra üstten ilk kırmızı iz inmeye başlamalı, sonra her saniye bir yenisi gelmeli.
   Bir şehre ulaşan füze o şehri gri enkaza çevirmeli. Alttaki kontrollerin hepsi yeşil olmalı. Hiçbir şey hareket
   etmiyorsa `loop()`'a `update()` eklemeyi unutmuş olabilirsin.

# --tests--

A point should move towards its target, one step of the given size at a time.
tr: Bir nokta hedefine, her seferinde verilen büyüklükte bir adımla ilerlemeli.

```js
const m = { x: 0, y: 0, tx: 3, ty: 4 }
assert.isFalse(stepTowards(m, 1))
assert.closeTo(m.x, 0.6, 1e-9)
assert.closeTo(m.y, 0.8, 1e-9)
assert.isTrue(stepTowards(m, 10))
assert.deepEqual([m.x, m.y], [3, 4])
```

Missiles should be launched from the top, 60 frames apart, at living cities or the base.
tr: Füzeler tepeden, 60 kare arayla, yaşayan şehirlere ya da üsse fırlatılmalı.

```js
$.tick(29)
assert.lengthOf(incoming, 0)
$.tick(1)
assert.lengthOf(incoming, 1)
const m = incoming[0]
assert.strictEqual(m.sy, 0)
assert.strictEqual(m.ty, 370)
assert.include([50, 110, 170, 310, 370, 430, 240], m.tx)
$.tick(60)
assert.lengthOf(incoming, 2)
cities.forEach((c, i) => (c.alive = i === 4))
for (let i = 0; i < 20; i++) launch()
assert.isTrue(incoming.slice(2).every((m) => m.tx === 370 || m.tx === 240))
```

A missile that lands should destroy its city.
tr: Yere inen bir füze şehrini yok etmeli.

```js
toLaunch = 0
incoming = [{ sx: 50, sy: 300, x: 50, y: 360, tx: 50, ty: 370, speed: 0.8 }]
$.tick(12)
assert.isTrue(cities[0].alive)
$.tick(1)
assert.isFalse(cities[0].alive)
assert.lengthOf(incoming, 0)
```

The smoke trail should be drawn from the start.
tr: Duman izi başlangıçtan çizilmeli.

```js
toLaunch = 0
incoming = [{ sx: 100, sy: 0, x: 100, y: 50, tx: 100, ty: 370, speed: 0.8 }]
$.tick(1)
const calls = $.screen()
assert.isTrue(calls.some((c) => c.op === 'moveTo' && c.args[0] === 100 && c.args[1] === 0))
assert.isTrue(calls.some((c) => c.op === 'lineTo' && c.args[0] === 100 && Math.abs(c.args[1] - 50.8) < 1e-9))
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

let cities
let incoming // enemy missiles: { sx, sy, x, y, tx, ty, speed }
let toLaunch // enemy missiles still to come
let launchIn

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
  incoming = []
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

function update() {
  if (toLaunch > 0) {
    launchIn -= 1
    if (launchIn <= 0) {
      launch()
      toLaunch -= 1
      launchIn = 60
    }
  }

  for (const m of incoming) {
    if (stepTowards(m, m.speed)) {
      m.done = true
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
