---
title: Interceptors fly
title_tr: Önleyiciler uçuyor
skills: [game.physics, game.canvas]
---

# --goal--

Interceptors fly like enemy missiles, only much faster (7 pixels per frame), and are drawn as green lines from the base.

# --goal-tr--

Önleyiciler de düşman füzeleri gibi `stepTowards` ile uçacak; ama çok daha **hızlı**: karede 7 piksel. Hedefe varan
önleyici listeden çıkacak (patlamayı sonra ekleyeceğiz). Her birini üsten kendisine uzanan **yeşil** bir çizgiyle
çizeceğiz.

# --code--

```js
const SHOT_SPEED = 7

  for (const s of shots) {
    if (stepTowards(s, SHOT_SPEED)) {
      s.done = true
    }
  }
  shots = shots.filter((s) => !s.done)

  ctx.strokeStyle = '#a3e635'
  for (const s of shots) {
    ctx.beginPath()
    ctx.moveTo(BASE.x, BASE.y)
    ctx.lineTo(s.x, s.y)
    ctx.stroke()
  }
```

# --meaning--

- `SHOT_SPEED` is the interceptors' speed.
- In `update`, the same mark-then-filter pattern as the missiles. The `{ }` stay: the next steps add more inside.
- In `draw`, each interceptor is a green line from the base to where it is.

# --meaning-tr--

- `const SHOT_SPEED = 7` → önleyici hızı: düşman füzesinden (0.8) neredeyse on kat hızlı.
- `update` içinde füzelerdeki desenin aynısı: adım at; vardıysa `done` diye işaretle; döngüden sonra `filter` ile
  işaretlileri at. `{ }` şimdilik tek satırlık ama yakında içine bir satır daha gelecek.
- `draw` içinde: renk yeşil (`lineWidth` hâlâ 2), her önleyici için üsten (`BASE.x, BASE.y`) önleyiciye bir çizgi.

# --task--

1. Under `const CITY_XS = ...` write `const SHOT_SPEED = 7`.
2. In `update`, between the countdown block and the missile loop, write the shots loop and its `filter` (empty line
   above).
3. In `draw`, under the missile trail loop, write the green lines.

# --task-tr--

1. `const CITY_XS = ...` satırının altına `const SHOT_SPEED = 7` yaz.
2. `update` içinde geri sayım bloğu ile füze döngüsünün **arasına** önleyici döngüsünü ve `filter` satırını yaz;
   üstünde bir boş satır kalsın.
3. `draw` içinde füze izi döngüsünün kapanış `}`'inin hemen altına yeşil çizgi satırlarını yaz.
4. **Çalıştır** ve gökyüzüne tıkla: üsten yeşil bir çizgi tıkladığın yere fırlamalı.

# --predict--

You click right on top of a falling missile. What happens?
- [ ] The missile is destroyed
- [x] The interceptor reaches the point and just disappears
  Nothing explodes yet. Explosions come in the next steps.
- [ ] The interceptor follows the missile

# --predict-tr--

Düşen bir füzenin tam üstüne tıklıyorsun. Ne olur?
- [ ] Füze yok olur
- [x] Önleyici noktaya varır ve öylece kaybolur
  Henüz hiçbir şey patlamıyor. Patlamalar sonraki adımlarda.
- [ ] Önleyici füzeyi takip eder

# --tests--

An interceptor should fly to the point and then disappear.
tr: Önleyici noktaya uçmalı ve sonra kaybolmalı.

```js
toLaunch = 0
$.click(240, 100)
$.tick(36)
assert.lengthOf(shots, 1)
$.tick(1)
assert.lengthOf(shots, 0)
```

Interceptors should be drawn as green lines from the base.
tr: Önleyiciler üsten çıkan yeşil çizgiler olarak çizilmeli.

```js
toLaunch = 0
fire(240, 100)
$.tick()
const calls = $.screen()
assert.isTrue(calls.some((c) => c.op === 'moveTo' && c.args[0] === 240 && c.args[1] === 356))
assert.isTrue(calls.some((c) => c.op === 'lineTo' && c.args[0] === 240 && c.args[1] === 349))
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
    }
  }
  shots = shots.filter((s) => !s.done)

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
