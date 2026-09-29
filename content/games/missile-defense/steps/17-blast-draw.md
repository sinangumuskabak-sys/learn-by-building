---
title: Draw the explosions
title_tr: Patlamaları çiz
skills: [game.canvas]
---

# --goal--

Each explosion is a filled circle of its current radius. It flickers between yellow and orange every three frames.

# --goal-tr--

Patlamaları görelim: her biri o anki yarıçapında, içi dolu bir **daire**. Canlı görünsün diye her üç karede bir
**sarı** ile **turuncu** arasında titreyecek.

# --code--

```js
for (const b of blasts) {
  ctx.fillStyle = b.age % 6 < 3 ? '#fde047' : '#fb923c'
  ctx.beginPath()
  ctx.arc(b.x, b.y, radius(b), 0, Math.PI * 2)
  ctx.fill()
}
```

# --meaning--

- `%` is the remainder: `b.age % 6` counts 0 to 5 again and again, so the color changes every 3 frames.
- `arc(x, y, r, 0, Math.PI * 2)` describes a full circle; `fill()` paints it.

# --meaning-tr--

- `b.age % 6` → `%` **bölümden kalan**: yaş 6'ya bölününce kalan. 0, 1, 2, 3, 4, 5, 0, 1, 2... diye tekrar eder.
- `b.age % 6 < 3 ? '#fde047' : '#fb923c'` → kalan 0–2 ise sarı, 3–5 ise turuncu: renk üç karede bir değişir.
- `ctx.beginPath()` → yeni bir şekle başla.
- `ctx.arc(b.x, b.y, radius(b), 0, Math.PI * 2)` → merkezi patlamanın yeri, yarıçapı `radius(b)` olan bir daire.
  Açılar radyanla: `0`'dan `Math.PI * 2`'ye tam bir tur.
- `ctx.fill()` → daireyi boya.

# --task--

In `draw`, under the interceptor lines loop, write the explosion loop.

# --task-tr--

`draw` içinde önleyici çizgilerini çizen döngünün kapanış `}`'inin hemen altına patlama döngüsünü yaz. **Çalıştır** ve
gökyüzüne tıkla: tıkladığın yerde büyüyüp küçülen, titreyen bir patlama görmelisin.

# --try--

Change `BLAST` to `60` and click: huge explosions. Put 32 back.

# --try-tr--

`BLAST`'ı `60` yap ve tıkla: kocaman patlamalar. Sonra 32'ye geri al.

# --tests--

An explosion should be drawn as a circle of its radius.
tr: Bir patlama kendi yarıçapında bir daire olarak çizilmeli.

```js
blasts = [{ x: 100, y: 100, age: 25 }]
draw()
assert.deepInclude($.arcs(), { x: 100, y: 100, r: 32, color: '#fde047' })
```

The color should flicker every three frames.
tr: Renk üç karede bir titremeli.

```js
blasts = [{ x: 100, y: 100, age: 28 }]
draw()
const arc = $.arcs().find((a) => a.x === 100 && a.y === 100)
assert.strictEqual(arc.color, '#fb923c')
assert.closeTo(arc.r, 28.16, 1e-9)
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
