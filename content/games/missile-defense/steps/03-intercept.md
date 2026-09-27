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

Karşılık vermek için gökyüzüne tıklarsın. Bir önleyici üssünden tıkladığın noktaya hızla uçar ve **orada patlar**. Füzeleri
doğrudan vurmazsın; olacakları yere bir patlama koyarsın. Oyunu ileriye nişan almakla ilgili yapan budur.

Bir patlama yalnızca bir konum ve bir `age`'dir (yaş). Boyutu her karede yaştan hesaplanır: ömrünün ilk yarısında tam yarıçapına
büyür, ikinci yarısında küçülüp kaybolur:

```js
const t = b.age / BLAST_FRAMES           // ömrü boyunca 0'dan 1'e
return BLAST * (t < 0.5 ? t * 2 : (1 - t) * 2)
```

Bir değeri saklayıp güncellemek yerine yaştan hesaplamak işe yarar bir animasyon hilesidir: patlama adımından sapamaz ve şeklini
değiştirmek tek bir formülü değiştirmektir.

Yere ulaşan füzeler de patlar. Önleyiciler `stepTowards()`'ı daha yüksek bir hızla yeniden kullanır. Üssün tepesinin altına
yapılan tıklamalar yok sayılır; böylece yere ateş edemezsin.

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

1. `SHOT_SPEED = 7`, `BLAST = 32`, `BLAST_FRAMES = 50`, `shots` ve `blasts` ekle (ikisi de `reset()`'te `[]`).
2. `fire(tx, ty)` yaz: `BASE.y - 10`'dan aşağıdaki noktaları yok say; değilse `shots`'a `{ x: BASE.x, y: BASE.y, tx, ty }`
   ekle. Bir `pointerdown` tıklamaya, canvas piksellerinde ateş eder.
3. Yukarıdaki gibi `radius(b)` yaz.
4. `update()` içinde: mermileri `SHOT_SPEED` ile ilerlet; varan çıkarılır ve oraya bir patlama `{ x, y, age: 0 }` ekler. Sonra
   her patlamanın yaşına 1 ekle ve `BLAST_FRAMES` kadar yaşlı olanları çıkar. Yere ulaşan bir füze de bir patlama ekler.
5. Mermileri üsten `'#a3e635'` çizgiler, patlamaları yarıçapları kadar dolu daireler olarak çiz; titreşsinler diye
   `age % 6 < 3` iken `'#fde047'`, değilken `'#fb923c'`.

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
