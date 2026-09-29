---
title: Impact
title_tr: Çarpma
skills: [game.collision, game.state]
---

# --goal--

A missile that arrives destroys the living city under it and is removed from the list.

# --goal-tr--

Füze hedefine varınca iki şey olsun: hedefteki şehir **yıkılsın** ve füze **listeden çıksın**.

Varan füzeyi hemen listeden silmek yerine önce `done` (bitti) diye **işaretleyeceğiz**, döngü bitince işaretlileri
toptan atacağız. Bir listeyi gezerken ondan eleman silmek, bazı elemanların atlanmasına yol açar.

# --code--

```js
for (const m of incoming) {
  if (stepTowards(m, m.speed)) {
    m.done = true
    const city = cities.find((c) => c.alive && Math.abs(c.x - m.x) < 20)
    if (city) city.alive = false
  }
}
incoming = incoming.filter((m) => !m.done)
```

# --meaning--

- `stepTowards` returns `true` on arrival; then the missile is marked `done`.
- `find` returns the first living city within 20 pixels of the missile, or `undefined`.
- After the loop, `filter` keeps only the missiles that are not done.

# --meaning-tr--

- `if (stepTowards(m, m.speed))` → adımı at; fonksiyon `true` döndürdüyse (füze **vardıysa**)...
- `m.done = true` → füzeyi "bitti" diye işaretle. Nesneye sonradan yeni bir alan eklenebilir.
- `cities.find((c) => c.alive && Math.abs(c.x - m.x) < 20)` → füzenin **20 piksel** yakınındaki ilk ayakta şehri bul.
  `Math.abs` sayının eksisiz hâli: iki `x` arasındaki uzaklık. Bulamazsa `undefined` verir (füze üsse düştüyse).
- `if (city) city.alive = false` → bir şehir bulunduysa onu **yık**.
- `incoming.filter((m) => !m.done)` → döngüden sonra yalnız bitmemiş füzeleri tutan yeni liste. `!` "değil".

# --task--

In `update`, replace the missile loop with the new one and write the `filter` line under it.

# --task-tr--

`update` içindeki füze döngüsünde `stepTowards(m, m.speed)` satırını kodda görüldüğü gibi bir `if` bloğuna çevir;
döngünün kapanış `}`'inin altına da `filter` satırını yaz. **Çalıştır** ve bekle: vurulan şehirler enkaza dönmeli.

# --hint--

`filter` goes **after** the loop's closing `}`, not inside it.

# --hint-tr--

`filter` satırı döngünün **içine** değil, kapanış `}`'inin **altına** gelir.

# --tests--

A missile that lands should destroy its city and disappear.
tr: Yere inen bir füze şehrini yıkmalı ve kaybolmalı.

```js
toLaunch = 0
incoming = [{ sx: 50, sy: 300, x: 50, y: 360, tx: 50, ty: 370, speed: 0.8 }]
$.tick(12)
assert.isTrue(cities[0].alive)
$.tick(1)
assert.isFalse(cities[0].alive)
assert.lengthOf(incoming, 0)
```

A missile landing on the base should not destroy a city.
tr: Üsse düşen bir füze şehir yıkmamalı.

```js
toLaunch = 0
incoming = [{ sx: 240, sy: 300, x: 240, y: 369, tx: 240, ty: 370, speed: 0.8 }]
$.tick(3)
assert.isTrue(cities.every((c) => c.alive))
assert.lengthOf(incoming, 0)
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
let toLaunch // enemy missiles still to come in this wave
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
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  incoming.push({ sx, sy: 0, x: sx, y: 0, tx, ty: GROUND, speed: 0.8 })
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
