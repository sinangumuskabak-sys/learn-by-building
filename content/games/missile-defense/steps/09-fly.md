---
title: Missiles on their way
title_tr: Yoldaki füzeler
skills: [game.physics]
---

# --goal--

Every frame each missile takes one step towards its target, using `stepTowards`.

# --goal-tr--

Füzeleri yürütelim: her karede her füze hedefine doğru **bir adım** atsın. İşin zor kısmını `stepTowards` zaten
yapıyor; bize yalnız onu her füze için çağırmak kalıyor.

Füzeler hâlâ görünmeyecek (çizimi bir sonraki adımda); ama artık yol alıyorlar.

# --code--

```js
for (const m of incoming) {
  stepTowards(m, m.speed)
}
```

# --meaning--

- For each missile in `incoming`, move it `m.speed` pixels towards its target.

# --meaning-tr--

- `for (const m of incoming)` → listedeki her füze için, ona `m` de...
- `stepTowards(m, m.speed)` → onu hedefine doğru kendi hızı kadar (0.8 piksel) kaydır. Fonksiyonun `true`/`false`
  cevabını şimdilik kullanmıyoruz.

# --task--

In `update`, under the countdown `if` block, leave an empty line and write the loop.

# --task-tr--

`update` içinde geri sayım `if` bloğunun kapanış `}`'inin altına bir boş satır bırak ve döngüyü yaz. **Çalıştır**:
kontroller yeşil olmalı.

# --tests--

Each frame, every missile should move towards its target at its speed.
tr: Her karede her füze kendi hızıyla hedefine ilerlemeli.

```js
toLaunch = 0
incoming = [{ sx: 100, sy: 0, x: 100, y: 0, tx: 100, ty: 370, speed: 0.8 }]
$.tick(10)
assert.closeTo(incoming[0].y, 8, 1e-9)
assert.strictEqual(incoming[0].x, 100)
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
    stepTowards(m, m.speed)
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
