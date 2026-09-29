---
title: Each wave is harder
title_tr: Her dalga daha zor
skills: [game.state]
---

# --goal--

Later waves should be harder: missiles fly faster and come closer together, but never less than 20 frames apart.

# --goal-tr--

Sonraki dalgalar **daha zor** olsun: füzeler daha hızlı uçsun ve daha sık gelsin. Ama sonsuza kadar değil; iki füze
arası en az 20 kare kalsın, yoksa oyun oynanamaz olur.

# --code--

```js
incoming.push({ sx, sy: 0, x: sx, y: 0, tx, ty: GROUND, speed: 0.5 + wave * 0.15 })

    launchIn = Math.max(20, 70 - wave * 6)
```

# --meaning--

- The speed is 0.65 in wave 1, 0.8 in wave 2, 0.95 in wave 3...
- The gap is 64 frames in wave 1, 58 in wave 2...; `Math.max(20, ...)` never lets it go below 20.

# --meaning-tr--

- `speed: 0.5 + wave * 0.15` → 1. dalgada 0.65, 2. dalgada 0.8, 3. dalgada 0.95... piksel/kare.
- `70 - wave * 6` → iki füze arası: 1. dalgada 64, 2. dalgada 58 kare...
- `Math.max(20, ...)` → iki sayıdan **büyüğünü** verir: bekleme 20 karenin altına asla inmez. Hız sınırı bu.

# --task--

1. In `launch`, replace `speed: 0.8` with `speed: 0.5 + wave * 0.15`.
2. In `update`, replace `launchIn = 60` with the `Math.max` line.

# --task-tr--

1. `launch` içinde `speed: 0.8` yerine `speed: 0.5 + wave * 0.15` yaz.
2. `update` içinde geri sayım bloğundaki `launchIn = 60` yerine `launchIn = Math.max(20, 70 - wave * 6)` yaz.
3. **Çalıştır**: 1. dalgada füzeler biraz daha yavaş gelmeli.

# --try--

Try `speed: 0.5 + wave * 0.4`: by wave 3 the missiles rain down. Put 0.15 back.

# --try-tr--

`speed: 0.5 + wave * 0.4` dene: 3. dalgada füzeler yağmur gibi yağar. Sonra 0.15'e geri al.

# --tests--

Missiles should fly faster in later waves.
tr: Füzeler sonraki dalgalarda daha hızlı uçmalı.

```js
launch()
assert.closeTo(incoming[0].speed, 0.65, 1e-9)
wave = 4
launch()
assert.closeTo(incoming[1].speed, 1.1, 1e-9)
```

Missiles should come closer together in later waves, but at least 20 frames apart.
tr: Füzeler sonraki dalgalarda daha sık gelmeli, ama en az 20 kare arayla.

```js
wave = 4
launchIn = 1
update()
assert.strictEqual(launchIn, 46)
wave = 10
launchIn = 1
update()
assert.strictEqual(launchIn, 20)
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
let wave
let toLaunch // enemy missiles still to come in this wave
let launchIn
let ammo
let score

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
  incoming = []
  shots = []
  blasts = []
  wave = 0
  score = 0
  nextWave()
}

function nextWave() {
  wave += 1
  toLaunch = 8 + wave * 2
  launchIn = 30
  ammo = 12 + wave * 2
}

// A new enemy missile from a random point at the top towards a random living city (or the base).
function launch() {
  const sx = Math.random() * canvas.width
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  incoming.push({ sx, sy: 0, x: sx, y: 0, tx, ty: GROUND, speed: 0.5 + wave * 0.15 })
}

function fire(tx, ty) {
  if (ammo === 0 || ty > BASE.y - 10) return
  ammo -= 1
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
      launchIn = Math.max(20, 70 - wave * 6)
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 10, 22)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
