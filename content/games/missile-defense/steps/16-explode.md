---
title: Explode on arrival
title_tr: Varınca patla
skills: [game.state]
---

# --goal--

An interceptor that arrives becomes an explosion. Every frame each explosion gets one frame older, and old ones are
removed.

# --goal-tr--

Hedefine varan önleyici bir **patlamaya** dönüşsün. Patlamaları `blasts` listesinde tutacağız. Her karede her
patlama bir kare **yaşlanacak**; ömrü (50 kare) dolanlar listeden çıkacak.

Patlamaları bir sonraki adımda çizeceğiz; bu adımda yalnız doğup ölüyorlar.

# --code--

```js
let blasts // explosions: { x, y, age }

  blasts = []

      blasts.push({ x: s.x, y: s.y, age: 0 })

  for (const b of blasts) b.age += 1
  blasts = blasts.filter((b) => b.age < BLAST_FRAMES)
```

# --meaning--

- An arriving interceptor adds a blast of age 0 at its position.
- `for (const b of blasts) b.age += 1`: a loop with a single command can be written on one line.
- `filter` keeps only the blasts younger than `BLAST_FRAMES`.

# --meaning-tr--

- `let blasts` → patlama listesi; `reset` onu boşaltır.
- `blasts.push({ x: s.x, y: s.y, age: 0 })` → önleyici vardığı yerde, **0 yaşında** bir patlama bırakır.
- `for (const b of blasts) b.age += 1` → her patlamayı bir kare yaşlandır. Tek komutluk bir döngü, `{ }` olmadan tek
  satırda yazılabilir.
- `blasts.filter((b) => b.age < BLAST_FRAMES)` → yaşı 50'den küçük olanları tut; ömrü dolanlar gider.

# --task--

1. Under `let shots ...` write `let blasts` with its comment; in `reset`, under `shots = []`, write `blasts = []`.
2. In `update`, under `s.done = true`, write the `blasts.push` line.
3. Under the `shots = shots.filter(...)` line, leave an empty line and write the two blast lines.

# --task-tr--

1. `let shots ...` satırının altına yorumuyla `let blasts` yaz; `reset` içinde `shots = []` satırının altına
   `blasts = []` yaz.
2. `update` içinde `s.done = true` satırının altına `blasts.push(...)` satırını yaz.
3. `shots = shots.filter(...)` satırının altına bir boş satır bırak ve patlamaları yaşlandıran iki satırı yaz.
4. **Çalıştır**: kontroller yeşil olmalı.

# --tests--

An interceptor should explode where it arrives.
tr: Önleyici vardığı yerde patlamalı.

```js
toLaunch = 0
$.click(240, 100)
$.tick(37)
assert.lengthOf(shots, 0)
assert.lengthOf(blasts, 1)
assert.deepEqual([blasts[0].x, blasts[0].y], [240, 100])
```

An explosion should age every frame and end after `BLAST_FRAMES` frames.
tr: Bir patlama her karede yaşlanmalı ve `BLAST_FRAMES` kare sonra bitmeli.

```js
toLaunch = 0
blasts = [{ x: 100, y: 100, age: 0 }]
$.tick(24)
assert.strictEqual(blasts[0].age, 24)
$.tick(25)
assert.lengthOf(blasts, 1)
$.tick(1)
assert.lengthOf(blasts, 0)
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
