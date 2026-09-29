---
title: Grab the sling
title_tr: Sapanı tut
skills: [game.input]
---

# --goal--

Pressing the pointer near the sling (within 60 pixels) while aiming grabs it: `dragging` becomes `true` and the aim
follows the point.

# --goal-tr--

Sapanı tutmak: nişan alırken sapana **60 pikselden yakın** bir yere basarsan sapanı yakalarsın. O andan itibaren
sürüklüyorsun (`dragging`) ve nişan bastığın noktadan hesaplanıyor.

Uzağa basmak hiçbir şey yapmaz; böylece ekranın başka bir yerine yanlışlıkla dokunmak nişanı bozmaz.

# --code--

```js
let dragging

  dragging = false

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'aiming') return
  const point = toCanvas(event)
  if (Math.hypot(point.x - SLING.x, point.y - SLING.y) > 60) return
  dragging = true
  pull(point)
})
```

# --meaning--

- `pointerdown` fires when a mouse button or a finger goes down on the canvas.
- `Math.hypot(point.x - SLING.x, point.y - SLING.y)` is the distance from the sling; more than 60 means "not on the
  sling".
- `dragging` remembers that the sling is held, for the next step.

# --meaning-tr--

- `let dragging` → sapan şu an tutuluyor mu? `true` ya da `false`. `reset` onu `false` ile başlatır.
- `canvas.addEventListener('pointerdown', ...)` → canvas'a fare tuşu ya da parmak **basıldığında** çalışır.
  (`pointer` hem fareyi hem dokunmayı kapsar.)
- `if (state !== 'aiming') return` → kuş uçarken sapan tutulmaz.
- `const point = toCanvas(event)` → basılan yer, canvas pikseliyle.
- `Math.hypot(point.x - SLING.x, point.y - SLING.y) > 60` → sapana uzaklık 60'tan büyükse çık.
- `dragging = true` → sapan tutuldu. `pull(point)` → nişanı bu noktadan hesapla.

# --task--

1. Under `let aim` write `let dragging`; in `reset`, under `aim = ...`, write `dragging = false`.
2. Above `function draw() {` write the `pointerdown` listener.

# --task-tr--

1. `let aim` satırının altına `let dragging` yaz.
2. `reset` içinde `aim = ...` satırının altına `dragging = false` yaz.
3. `function draw() {` satırının **üstüne** `pointerdown` dinleyicisini yaz.
4. **Çalıştır**: kuşun yanına bas ve basılı tut; nişan bastığın noktaya göre değişmeli. (Sürükleme ve bırakma bir
   sonraki adımda.)

# --tests--

Pressing near the sling should grab it and aim away from the point.
tr: Sapanın yakınına basmak onu tutmalı ve noktanın tersine nişan almalı.

```js
assert.isFalse(dragging)
$.pointerDown(60, 240)
assert.isTrue(dragging)
assert.closeTo(aim.angle, Math.atan2(-20, 30), 1e-9)
assert.closeTo(aim.pull, Math.hypot(30, 20), 1e-9)
```

Pressing far from the sling, or in flight, should do nothing.
tr: Sapandan uzağa ya da uçuşta basmak hiçbir şey yapmamalı.

```js
$.pointerDown(400, 100)
assert.isFalse(dragging, 'you have to grab the sling')
assert.deepEqual(aim, { angle: -0.6, pull: 50 })
launch()
$.pointerDown(80, 230)
assert.isFalse(dragging, 'not while the bird flies')
```

# --solution--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 290
const GRAVITY = 0.25
const SLING = { x: 90, y: 220 } // where the bird sits before it is launched
const MAX_PULL = 70
const LAUNCH = 0.2 // speed per pixel of pull
const BIRD = 10 // the bird is a 20 by 20 box
const MATERIALS = {
  bird: { color: '#dc2626', density: 4 },
}

let bodies // { kind, x, y, w, h, vx, vy }
let bird // the bird in flight, or null
let aim // { angle, pull }
let dragging
let state // 'aiming' or 'flying'
let calm // frames everything has been still

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0 })

function reset() {
  bodies = []
  bird = null
  aim = { angle: -0.6, pull: 50 }
  dragging = false
  state = 'aiming'
  calm = 0
}

// The launch velocity: pulled back by `pull` pixels, the bird flies the opposite way.
const launchVelocity = () => ({ vx: Math.cos(aim.angle) * aim.pull * LAUNCH, vy: Math.sin(aim.angle) * aim.pull * LAUNCH })

function launch() {
  if (state !== 'aiming') return
  const { vx, vy } = launchVelocity()
  bird = body('bird', SLING.x - BIRD, SLING.y - BIRD, BIRD * 2, BIRD * 2)
  bird.vx = vx
  bird.vy = vy
  bodies.push(bird)
  state = 'flying'
  calm = 0
}

function step() {
  for (const b of bodies) {
    b.vy += GRAVITY
    b.x += b.vx
    b.y += b.vy
    if (b.y + b.h > GROUND) {
      b.y = GROUND - b.h
      b.vy = 0
      b.vx *= 0.9 // the ground is rough
    }
  }
  // Fallen off the world: gone.
  bodies = bodies.filter((b) => {
    if (b.x < canvas.width + 50 && b.x + b.w > -50) return true
    if (b === bird) bird = null
    return false
  })
}

function update() {
  step()
  if (state !== 'flying') return
  // Wait until everything has stopped for a second before the next bird.
  const moving = bodies.some((b) => Math.abs(b.vx) > 0.1 || Math.abs(b.vy) > 0.3)
  calm = moving ? 0 : calm + 1
  if (calm < 60 && !(bird && bird.x > canvas.width)) return
  if (bird) {
    bodies = bodies.filter((b) => b !== bird)
    bird = null
  }
  state = 'aiming'
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') aim.angle -= 0.03
  else if (event.key === 'ArrowDown') aim.angle += 0.03
  else if (event.key === 'ArrowRight') aim.pull = Math.min(MAX_PULL, aim.pull + 2)
  else if (event.key === 'ArrowLeft') aim.pull = Math.max(10, aim.pull - 2)
  else if (event.key === ' ') launch()
  else return
  event.preventDefault()
})

function toCanvas(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  }
}

// Drag back from the sling like a real one: the bird flies the other way, harder the further you pull.
function pull(point) {
  const dx = SLING.x - point.x
  const dy = SLING.y - point.y
  aim.angle = Math.atan2(dy, dx)
  aim.pull = Math.min(MAX_PULL, Math.hypot(dx, dy))
}

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'aiming') return
  const point = toCanvas(event)
  if (Math.hypot(point.x - SLING.x, point.y - SLING.y) > 60) return
  dragging = true
  pull(point)
})

function draw() {
  ctx.fillStyle = '#bae6fd'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  // The sling and, while aiming, the pulled-back bird and the path it will take.
  ctx.fillStyle = '#78350f'
  ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
  if (state === 'aiming') {
    const { vx, vy } = launchVelocity()
    const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
    const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
    ctx.strokeStyle = '#451a03'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(SLING.x, SLING.y)
    ctx.lineTo(bx, by)
    ctx.stroke()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    for (let t = 4; t <= 60; t += 4) {
      // Where the bird will be after t frames: x grows steadily, y follows a parabola.
      const x = SLING.x + vx * t
      const y = SLING.y + vy * t + (GRAVITY * t * t) / 2
      if (y > GROUND) break
      ctx.fillRect(x - 2, y - 2, 4, 4)
    }
    ctx.fillStyle = MATERIALS.bird.color
    ctx.beginPath()
    ctx.arc(bx, by, BIRD, 0, Math.PI * 2)
    ctx.fill()
  }

  for (const b of bodies) {
    const m = MATERIALS[b.kind]
    ctx.fillStyle = m.color
    ctx.beginPath()
    ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2)
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
