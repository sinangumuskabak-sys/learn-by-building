---
title: Impacts explode too
title_tr: Yere düşen de patlar
skills: [game.state]
---

# --goal--

A missile that reaches the ground should not just vanish: it explodes too, with the same kind of blast.

# --goal-tr--

Yere düşen düşman füzesi de öylece kaybolmasın; o da **patlasın**. Aynı patlama listesini kullanıyoruz; bir satır
yetiyor.

# --code--

```js
blasts.push({ x: m.x, y: m.y, age: 0 })
```

# --meaning--

- When a missile arrives, a new blast of age 0 is added where it landed.

# --meaning-tr--

- `blasts.push({ x: m.x, y: m.y, age: 0 })` → füzenin düştüğü yerde yeni, 0 yaşında bir patlama. Onu çizen ve
  yaşlandıran kod zaten var.

# --task--

In `update`, in the missile loop, write the line right under `m.done = true`.

# --task-tr--

`update` içindeki füze döngüsünde `m.done = true` satırının hemen altına bu satırı yaz. **Çalıştır** ve bekle: şehre
düşen füze patlamalı.

# --predict--

A missile explodes on the ground right next to another missile. What happens to the other one?
- [x] Nothing: explosions do not destroy missiles yet
  Nothing checks whether a missile is inside an explosion. That is the next step.
- [ ] It is destroyed
- [ ] It bounces away

# --predict-tr--

Bir füze, başka bir füzenin hemen yanında yere çarpıp patlıyor. Öteki füzeye ne olur?
- [x] Hiçbir şey: patlamalar henüz füze yok etmiyor
  Bir füzenin patlamanın içinde olup olmadığına bakan kod yok. Bir sonraki adım bu.
- [ ] Yok olur
- [ ] Sekip uzaklaşır

# --tests--

A missile that reaches the ground should explode.
tr: Yere ulaşan bir füze patlamalı.

```js
toLaunch = 0
incoming = [{ sx: 50, sy: 300, x: 50, y: 369, tx: 50, ty: 370, speed: 0.8 }]
$.tick(2)
assert.lengthOf(blasts, 1)
assert.deepEqual([blasts[0].x, blasts[0].y], [50, 370])
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
