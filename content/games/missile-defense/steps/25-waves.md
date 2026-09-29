---
title: Waves
title_tr: Dalgalar
skills: [game.state, prog.functions]
---

# --goal--

The game comes in waves. `nextWave()` starts the next one: a few more missiles each time, and a little more ammo.
`reset()` starts from wave 0 and calls it.

# --goal-tr--

Oyun **dalgalar** hâlinde gelir. Her dalgada biraz daha fazla füze gelir, sen de biraz daha fazla cephane alırsın.
Bir dalgayı başlatan işleri tek bir fonksiyona topluyoruz: `nextWave` (sonraki dalga).

`reset` artık füze sayısını ve cephaneyi kendisi ayarlamıyor; dalgayı 0'a çekip `nextWave()`'i çağırıyor. Böylece
1. dalga da tıpkı sonrakiler gibi aynı koddan başlıyor.

# --code--

```js
let wave

function nextWave() {
  wave += 1
  toLaunch = 8 + wave * 2
  launchIn = 30
  ammo = 12 + wave * 2
}

  wave = 0
  score = 0
  nextWave()
```

# --meaning--

- `nextWave` adds 1 to `wave` and sets up that wave: `8 + wave * 2` missiles and `12 + wave * 2` interceptors.
- Wave 1 has 10 missiles and 14 ammo; wave 2 has 12 and 16.
- `reset` sets `wave = 0`, so its call to `nextWave()` starts wave 1.

# --meaning-tr--

- `let wave` → kaçıncı dalgadayız.
- `wave += 1` → bir sonraki dalgaya geç.
- `toLaunch = 8 + wave * 2` → 1. dalgada 10, 2. dalgada 12 füze... Çarpma toplamadan önce yapılır.
- `launchIn = 30` → dalganın ilk füzesi yarım saniye sonra.
- `ammo = 12 + wave * 2` → 1. dalgada 14, 2. dalgada 16 önleyici.
- `reset` içinde `wave = 0` sonra `nextWave()` → dalga 0'dan 1'e çıkar: oyun 1. dalgayla başlar.

# --task--

1. Above `let toLaunch` write `let wave`.
2. Above the `// A new enemy missile ...` comment, write `nextWave`, followed by an empty line.
3. In `reset`, replace the lines `score = 0`, `toLaunch = 20`, `launchIn = 30`, `ammo = 14` with the three new lines.

# --task-tr--

1. `let toLaunch ...` satırının **üstüne** `let wave` yaz.
2. `// A new enemy missile ...` yorumunun **üstüne** `nextWave` fonksiyonunu yaz; altında bir boş satır kalsın.
3. `reset` içindeki son dört satırı (`score = 0`, `toLaunch = 20`, `launchIn = 30`, `ammo = 14`) sil; yerine
   `wave = 0`, `score = 0` ve `nextWave()` yaz.
4. **Çalıştır**: artık 20 değil 10 füze gelmeli.

# --tests--

The game should start with wave 1: 10 missiles and 14 ammo.
tr: Oyun 1. dalgayla başlamalı: 10 füze ve 14 cephane.

```js
assert.deepEqual([wave, ammo, toLaunch, launchIn, score], [1, 14, 10, 30, 0])
```

`nextWave()` should bring more missiles and more ammo.
tr: `nextWave()` daha çok füze ve daha çok cephane getirmeli.

```js
ammo = 3
nextWave()
assert.deepEqual([wave, ammo, toLaunch, launchIn], [2, 16, 12, 30])
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
