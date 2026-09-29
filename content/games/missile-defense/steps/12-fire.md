---
title: Fire an interceptor
title_tr: Önleyici ateşle
skills: [game.state]
---

# --goal--

You fight back with interceptors. `fire(tx, ty)` sends one from the base towards a point in the sky, but not towards
the ground.

# --goal-tr--

Karşılık verme zamanı. Senin füzelerine **önleyici** (interceptor) diyeceğiz. `fire(tx, ty)` (ateşle) üsten
`(tx, ty)` noktasına giden bir önleyici yapıp `shots` (atışlar) listesine ekleyecek.

Yere ateş etmek anlamsız; üssün biraz üstünden aşağıdaki noktalar görmezden gelinecek. Bu adımda önleyiciler henüz
görünmüyor ve kıpırdamıyor.

# --code--

```js
let shots // your interceptors on their way: { x, y, tx, ty }

  shots = []

function fire(tx, ty) {
  if (ty > BASE.y - 10) return
  shots.push({ x: BASE.x, y: BASE.y, tx, ty })
}
```

# --meaning--

- `shots` holds your interceptors; `reset` empties it.
- Points lower than 10 pixels above the base are ignored: `return` leaves at once.
- An interceptor starts at the base and remembers its target `tx, ty`, like the enemy missiles.

# --meaning-tr--

- `let shots` → yoldaki önleyicilerin listesi; `reset` onu boşaltır.
- `if (ty > BASE.y - 10) return` → hedef, üssün 10 piksel üstünden daha **aşağıdaysa** (y büyükse) hiçbir şey yapma,
  fonksiyondan çık.
- `shots.push({ x: BASE.x, y: BASE.y, tx, ty })` → önleyici üsten başlar ve hedefini (`tx, ty`) hatırlar; tıpkı düşman
  füzeleri gibi. Bu yüzden onu da `stepTowards` ile yürütebileceğiz.

# --task--

1. Under `let incoming ...` write `let shots` with its comment.
2. In `reset`, under `incoming = []`, write `shots = []`.
3. Above the `// Move a point ...` comment, write `fire`, followed by an empty line.

# --task-tr--

1. `let incoming ...` satırının altına yorumuyla birlikte `let shots` yaz.
2. `reset` içinde `incoming = []` satırının altına `shots = []` yaz.
3. `// Move a point ...` yorumunun **üstüne** `fire` fonksiyonunu yaz; altında bir boş satır kalsın.
4. **Çalıştır**: kontroller yeşil olmalı.

# --tests--

`fire()` should send an interceptor from the base to the point.
tr: `fire()` üsten o noktaya bir önleyici göndermeli.

```js
assert.deepEqual(shots, [])
fire(100, 100)
assert.deepEqual(shots, [{ x: 240, y: 356, tx: 100, ty: 100 }])
```

Points below the top of the base should be ignored.
tr: Üssün tepesinden aşağıdaki noktalar görmezden gelinmeli.

```js
fire(240, 350)
fire(100, 390)
assert.lengthOf(shots, 0)
fire(100, 340)
assert.lengthOf(shots, 1)
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
let shots // your interceptors on their way: { x, y, tx, ty }
let toLaunch // enemy missiles still to come in this wave
let launchIn

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
  incoming = []
  shots = []
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
