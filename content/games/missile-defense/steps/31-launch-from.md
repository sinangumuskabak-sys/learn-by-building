---
title: Launch from anywhere
title_tr: Her yerden fırlat
skills: [prog.functions]
---

# --goal--

Soon some missiles will split in the air. The pieces must start where the missile is, not at the top. So `launch` gets
a starting point, with the top edge as the **default**.

# --goal-tr--

Birazdan bazı füzeler havada **bölünecek**. Parçalar üstten değil, füzenin o anki yerinden çıkmalı. `launch`'u yeniden
yazmak yerine ona bir **başlangıç noktası** verebilelim: `launch(x, y)`.

Ama normal füzeler yine üstten, rastgele bir yerden gelsin. Bunun için **varsayılan parametre** kullanacağız:
değer verilmezse kullanılacak değer.

# --code--

```js
function launch(sx = Math.random() * canvas.width, sy = 0) {

  incoming.push({ sx, sy, x: sx, y: sy, tx, ty: GROUND, speed: 0.5 + wave * 0.15 })
```

# --meaning--

- `sx = ...` and `sy = 0` are default parameters: used only when `launch` is called without them.
- `launch()` still makes a normal missile at the top; `launch(100, 150)` starts one at (100, 150).
- The old `const sx` line is no longer needed.

# --meaning-tr--

- `function launch(sx = Math.random() * canvas.width, sy = 0)` → iki **parametre**, ikisinin de **varsayılan**
  değeri var. `launch()` diye boş çağrılırsa `sx` rastgele, `sy` 0 olur: eskisi gibi. `launch(100, 150)` diye
  çağrılırsa füze (100, 150)'den çıkar.
- Eski `const sx = Math.random() * canvas.width` satırı artık gereksiz; o iş parametreye taşındı.
- `push` içinde `sy: 0` yerine `sy`, `y: 0` yerine `y: sy`: füze verilen yükseklikten başlar.

# --task--

1. Change the `launch` line as shown and delete the `const sx = ...` line under it.
2. In the `push` line, use `sy` instead of `sy: 0`, and `y: sy` instead of `y: 0`.

# --task-tr--

1. `function launch() {` satırını kodda görüldüğü gibi değiştir ve altındaki `const sx = ...` satırını sil.
2. `push` satırında `sy: 0` yerine `sy`, `y: 0` yerine `y: sy` yaz.
3. **Çalıştır**: oyun eskisi gibi oynanmalı.

# --tests--

`launch(x, y)` should start a missile at that point.
tr: `launch(x, y)` füzeyi o noktadan başlatmalı.

```js
launch(100, 150)
const m = incoming[incoming.length - 1]
assert.deepEqual([m.sx, m.sy, m.x, m.y], [100, 150, 100, 150])
```

`launch()` without a point should still start at the top.
tr: Noktasız `launch()` yine üstten başlatmalı.

```js
launch()
const m = incoming[incoming.length - 1]
assert.strictEqual(m.sy, 0)
assert.strictEqual(m.y, 0)
assert.strictEqual(m.x, m.sx)
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
let state // 'playing', 'between' (a pause after a wave) or 'over'
let pause

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
  state = 'playing'
}

// A new enemy missile from a random point at the top towards a random living city (or the base).
function launch(sx = Math.random() * canvas.width, sy = 0) {
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  incoming.push({ sx, sy, x: sx, y: sy, tx, ty: GROUND, speed: 0.5 + wave * 0.15 })
}

function fire(tx, ty) {
  if (state !== 'playing' || ammo === 0 || ty > BASE.y - 10) return
  ammo -= 1
  shots.push({ x: BASE.x, y: BASE.y, tx, ty })
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'over') {
    reset()
    return
  }
  const rect = canvas.getBoundingClientRect()
  fire(((event.clientX - rect.left) * canvas.width) / rect.width, ((event.clientY - rect.top) * canvas.height) / rect.height)
})
document.addEventListener('keydown', (event) => {
  if (event.key === ' ' && state === 'over') {
    event.preventDefault()
    reset()
  }
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
  if (state === 'over') return
  if (state === 'between') {
    pause -= 1
    if (pause <= 0) nextWave()
    return
  }

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

  if (!cities.some((c) => c.alive)) {
    state = 'over'
    return
  }
  if (toLaunch === 0 && incoming.length === 0 && blasts.length === 0) {
    // Bonus for every city still standing and every interceptor left.
    score += cities.filter((c) => c.alive).length * 100 + ammo * 5
    state = 'between'
    pause = 90
  }
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
  ctx.textAlign = 'right'
  ctx.fillText('Wave ' + wave + '  Ammo ' + ammo, canvas.width - 10, 22)
  ctx.textAlign = 'center'
  if (state === 'between') ctx.fillText('Wave ' + wave + ' cleared!', canvas.width / 2, 180)
  if (state === 'over') {
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('The end', canvas.width / 2, 180)
    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 210)
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
