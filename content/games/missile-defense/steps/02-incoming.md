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

Düşman füzeleri tepede rastgele bir noktada başlar ve yerdeki bir hedefe dümdüz uçar: hâlâ ayakta olan bir şehre ya da senin
üssüne. Bu oyundaki her füze ve her önleyici aynı şeyi yapar, "bir noktaya belirli bir hızla ilerle"; bu yüzden küçük bir
fonksiyona değer:

```js
const distance = Math.hypot(dx, dy)
m.x += (dx / distance) * speed   // (dx, dy) bölü uzunluğu, 1 uzunluğunda bir yöndür
m.y += (dy / distance) * speed
```

Hedefe giden oku uzunluğuna bölmek bir **birim vektör** verir: salt bir yön. Onu hızla çarpmak tam o büyüklükte bir adım
verir. Hedef bir adımdan yakınsa füze onun üstüne oturur ve fonksiyon vardığını söyler.

Varan bir füze nişan aldığı şehri yok eder. Her füze nereden başladığını hatırlar; böylece duman izi başlangıçtan şu an olduğu
yere bir çizgi olarak çizilebilir.

# --task--

1. Add `incoming`, `toLaunch` and `launchIn`; `reset()` sets `[]`, `20` and `30`.
2. Write `launch()`: a missile `{ sx, sy, x, y, tx, ty, speed: 0.8 }` starting at a random `x` on the top edge, aimed at a
   random choice among the living cities' `x` and `BASE.x`, with `ty = GROUND`.
3. Write `stepTowards(m, speed)` as above, returning `true` when it has arrived.
4. In `update()`: count `launchIn` down while missiles are left to launch; at `0`, launch one and wait 60 frames. Move every
   missile; one that arrives is removed, and destroys a living city within 20 pixels of it.
5. Draw each missile as a `'#f87171'` line, 2 pixels wide, from where it started to where it is.

# --task-tr--

1. `incoming`, `toLaunch` ve `launchIn` ekle; `reset()` onları `[]`, `20` ve `30` yapar.
2. `launch()` yaz: üst kenarda rastgele bir `x`'te başlayan, yaşayan şehirlerin `x`'leri ve `BASE.x` arasından rastgele birine
   `ty = GROUND` ile nişan alan bir füze `{ sx, sy, x, y, tx, ty, speed: 0.8 }`.
3. Yukarıdaki gibi, varınca `true` döndüren `stepTowards(m, speed)` yaz.
4. `update()` içinde: fırlatılacak füze kaldıkça `launchIn`'i geri say; `0`'da birini fırlat ve 60 kare bekle. Her füzeyi
   ilerlet; varan çıkarılır ve 20 piksel yakınındaki yaşayan bir şehri yok eder.
5. Her füzeyi başladığı yerden olduğu yere 2 piksel kalınlığında `'#f87171'` bir çizgi olarak çiz.

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
