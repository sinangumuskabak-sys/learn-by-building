---
title: Only your explosions count
title_tr: Yalnız senin patlamaların sayılır
skills: [game.collision, game.state]
---

# --goal--

Only your explosions (and the chains they start) should destroy missiles. Each blast gets an `own` flag: `true` for
interceptors and chains, `false` for impacts on the ground.

# --goal-tr--

Yere çarpan bir füzenin patlaması yanındaki füzeleri yok etmemeli; yoksa düşmanın saldırısı kendi kendini temizler ve
ileride sana bedava puan verir. Füze yalnız **senin** patlamalarınla (ve onların başlattığı zincirle) yok olmalı.

Her patlamaya bir bayrak ekliyoruz: `own` ("kendi"). Önleyici ve zincir patlamalarında `true`, yere çarpmada `false`.

# --code--

```js
let blasts // explosions: { x, y, age, own }: own ones destroy missiles, impacts on the ground do not

      blasts.push({ x: s.x, y: s.y, age: 0, own: true })

    if (blasts.some((b) => b.own && Math.hypot(m.x - b.x, m.y - b.y) <= radius(b))) {
      m.done = true
      blasts.push({ x: m.x, y: m.y, age: 0, own: true })

      blasts.push({ x: m.x, y: m.y, age: 0, own: false })
```

# --meaning--

- Interceptor and chain blasts get `own: true`, ground impacts `own: false`.
- `b.own && ...`: only own blasts are checked; `&&` stops at the first false part.

# --meaning-tr--

- Yorum satırı `own`'un anlamını not eder.
- Önleyicinin patlaması → `own: true`.
- `b.own && Math.hypot(...) <= radius(b)` → patlama **senin** mi **ve** füze içinde mi? `&&` ilk yanlış parçada durur;
  senin olmayan patlamaya uzaklık bile hesaplanmaz.
- Zincir patlaması (yakalanan füzeninki) → `own: true`: senin başlattığın zincir de senin sayılır.
- Yere çarpma → `own: false`.

# --task--

Change the places shown: the `let blasts` comment, the interceptor's blast, the `some` check and the two missile
blasts.

# --task-tr--

1. `let blasts` satırının yorumunu kodda görüldüğü gibi değiştir.
2. `update` içinde önleyicinin bıraktığı patlamaya `, own: true` ekle.
3. Füze döngüsünde `blasts.some((b) => ...)` içine, `Math.hypot`'tan önce `b.own && ` ekle.
4. Hemen altındaki zincir patlamasına `, own: true`, yere çarpan füzenin patlamasına `, own: false` ekle.
5. **Çalıştır**: kontroller yeşil olmalı.

# --tests--

Explosions from missiles hitting the ground should not destroy others.
tr: Yere çarpan füzelerin patlamaları diğerlerini yok etmemeli.

```js
toLaunch = 0
incoming = [
  { sx: 100, sy: 300, x: 100, y: 369.5, tx: 100, ty: 370, speed: 0.8 },
  { sx: 110, sy: 0, x: 110, y: 360, tx: 110, ty: 900, speed: 0 },
]
$.tick(30)
assert.lengthOf(incoming, 1)
assert.isFalse(blasts[0].own)
```

Interceptor explosions and chains should still destroy missiles.
tr: Önleyici patlamaları ve zincirler yine füze yok etmeli.

```js
toLaunch = 0
$.click(240, 100)
$.tick(37)
assert.isTrue(blasts[0].own)
incoming = [{ sx: 240, sy: 0, x: 240, y: 101, tx: 240, ty: 370, speed: 0 }]
$.tick(1)
assert.lengthOf(incoming, 0)
assert.isTrue(blasts[1].own)
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
let blasts // explosions: { x, y, age, own }: own ones destroy missiles, impacts on the ground do not
let toLaunch // enemy missiles still to come in this wave
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
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  incoming.push({ sx, sy: 0, x: sx, y: 0, tx, ty: GROUND, speed: 0.8 })
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
      blasts.push({ x: s.x, y: s.y, age: 0, own: true })
    }
  }
  shots = shots.filter((s) => !s.done)

  for (const b of blasts) b.age += 1
  blasts = blasts.filter((b) => b.age < BLAST_FRAMES)

  for (const m of incoming) {
    // Caught by an explosion: it explodes too, which can catch the missiles next to it.
    if (blasts.some((b) => b.own && Math.hypot(m.x - b.x, m.y - b.y) <= radius(b))) {
      m.done = true
      blasts.push({ x: m.x, y: m.y, age: 0, own: true })
      continue
    }
    if (stepTowards(m, m.speed)) {
      m.done = true
      blasts.push({ x: m.x, y: m.y, age: 0, own: false })
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
