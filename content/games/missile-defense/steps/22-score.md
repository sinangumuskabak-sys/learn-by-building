---
title: Points for every missile
title_tr: Her füzeye puan
skills: [game.state]
---

# --goal--

Every missile you destroy (directly or in a chain) is worth 25 points.

# --goal-tr--

Yok ettiğin her füze (doğrudan ya da zincirle) **25 puan** getirsin. Zincirler bu yüzden çok değerli: tek atışla
birkaç füze, birkaç kat puan.

# --code--

```js
let score

  score = 0

      score += 25
```

# --meaning--

- `score` is set to 0 by `reset` and grows by 25 for each missile caught in one of your explosions.

# --meaning-tr--

- `let score` → puan; `reset` onu 0 yapar.
- `score += 25` → yakalanan füzenin bloğunda, `m.done = true` satırının altında: her yok edilen füze için bir kez.

# --task--

1. Under `let launchIn` write `let score`.
2. In `reset`, under `blasts = []`, write `score = 0`.
3. In `update`, write `score += 25` under `m.done = true` in the caught-missile block.

# --task-tr--

1. `let launchIn` satırının altına `let score` yaz.
2. `reset` içinde `blasts = []` satırının altına `score = 0` yaz.
3. `update` içinde patlamaya yakalanan füzenin bloğunda `m.done = true` satırının altına `score += 25` yaz.
4. **Çalıştır**: puanı bir sonraki adımda ekranda göreceğiz; kontroller yeşil olmalı.

# --tests--

A destroyed missile should score 25 points.
tr: Yok edilen bir füze 25 puan kazandırmalı.

```js
assert.strictEqual(score, 0)
toLaunch = 0
blasts = [{ x: 200, y: 200, age: 25, own: true }]
incoming = [{ sx: 205, sy: 0, x: 205, y: 205, tx: 205, ty: 370, speed: 0.8 }]
$.tick(1)
assert.strictEqual(score, 25)
```

A chain should score for every missile in it.
tr: Bir zincir içindeki her füze için puan vermeli.

```js
toLaunch = 0
blasts = [{ x: 200, y: 200, age: 25, own: true }]
incoming = [
  { sx: 205, sy: 0, x: 205, y: 205, tx: 205, ty: 370, speed: 0 },
  { sx: 235, sy: 0, x: 235, y: 210, tx: 235, ty: 370, speed: 0 },
]
$.tick(31)
assert.strictEqual(score, 50)
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
let score

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
  incoming = []
  shots = []
  blasts = []
  score = 0
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
      score += 25
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
