---
title: Limited ammo
title_tr: Sınırlı cephane
skills: [game.state]
---

# --goal--

With unlimited interceptors you could fill the sky with explosions. With limited **ammo**, every shot is a choice.

# --goal-tr--

Sınırsız önleyiciyle gökyüzünü patlamayla doldurup rahatça kazanırdın. **Cephane** sınırlı olunca her atış bir
karar olur: erken ateş edip ıskalamayı mı göze alırsın, bekleyip bir füzeyi kaçırmayı mı? Zincirler de cephane
kazandırdığı için daha değerli hâle gelir.

# --code--

```js
let ammo

  ammo = 14

  if (ammo === 0 || ty > BASE.y - 10) return
  ammo -= 1
```

# --meaning--

- `ammo` starts at 14.
- `fire` does nothing with no ammo left (`||` means "or"); otherwise each shot uses one.

# --meaning-tr--

- `let ammo` → cephane; `reset` onu 14 yapar.
- `if (ammo === 0 || ty > BASE.y - 10) return` → cephane bittiyse **veya** nokta çok alçaksa ateş etme. `||` "veya".
- `ammo -= 1` → her atış bir önleyici harcar. Bu satır `return`'den sonra olduğu için ıskalanan (yere yapılan)
  tıklamalar cephane harcamaz.

# --task--

1. Above `let score` write `let ammo`.
2. In `reset`, under `launchIn = 30`, write `ammo = 14`.
3. In `fire`, change the first line and write `ammo -= 1` under it.

# --task-tr--

1. `let score` satırının **üstüne** `let ammo` yaz.
2. `reset` içinde `launchIn = 30` satırının altına `ammo = 14` yaz.
3. `fire` içinde ilk satırı kodda görüldüğü gibi değiştir ve altına `ammo -= 1` yaz.
4. **Çalıştır** ve 15 kez tıkla: 15. atış çıkmamalı.

# --tests--

Each shot should use ammo, and an empty base should not fire.
tr: Her atış cephane harcamalı ve boş bir üs ateş etmemeli.

```js
assert.strictEqual(ammo, 14)
fire(100, 100)
assert.strictEqual(ammo, 13)
ammo = 0
fire(100, 100)
assert.lengthOf(shots, 1)
assert.strictEqual(ammo, 0)
```

A click on the ground should not use ammo.
tr: Zemine tıklamak cephane harcamamalı.

```js
fire(100, 390)
assert.strictEqual(ammo, 14)
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
let ammo
let score

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
  incoming = []
  shots = []
  blasts = []
  score = 0
  toLaunch = 20
  launchIn = 30
  ammo = 14
}

// A new enemy missile from a random point at the top towards a random living city (or the base).
function launch() {
  const sx = Math.random() * canvas.width
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  incoming.push({ sx, sy: 0, x: sx, y: 0, tx, ty: GROUND, speed: 0.8 })
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
