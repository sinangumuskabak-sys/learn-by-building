---
title: Smaller steps
title_tr: Daha küçük adımlar
skills: [game.physics, game.loop]
---

# --goal--

A fast bird can move more than a thin plank's width in one frame and pass right through it. So each frame is split
into `SUB = 4` smaller physics steps, each with a quarter of the gravity and the movement.

# --goal-tr--

Tam hızdaki kuş bir karede 14 piksel gidiyor; direkler ise 12 piksel enli. Kuş bir karede direğin bir yanında, sonraki
karede öbür yanında olabilir: çarpışma hiç görülmez, kuş **içinden geçer**.

Çözüm: her kareyi 4 küçük **fizik adımına** bölmek. Her adımda gövdeler yolun dörtte birini gider ve her adımda
çarpışmalara bakılır. Bir karede yine aynı yol gidilir, ama hiçbir şey gözden kaçmaz. Kule de daha sakin durur.

# --code--

```js
const SUB = 4 // physics steps per frame

    b.vy += GRAVITY / SUB
    b.x += b.vx / SUB
    b.y += b.vy / SUB

function update() {
  for (let i = 0; i < SUB; i++) step()
```

# --meaning--

- `step` now applies a quarter of the gravity and moves a quarter of the velocity.
- `update` runs it `SUB` times per frame, so in one frame bodies move as far as before, in four small hops.

# --meaning-tr--

- `const SUB = 4` → karedeki fizik adımı sayısı.
- `b.vy += GRAVITY / SUB` → her küçük adımda yerçekiminin dörtte biri.
- `b.x += b.vx / SUB` ve `b.y += b.vy / SUB` → her küçük adımda yolun dörtte biri.
- `for (let i = 0; i < SUB; i++) step()` → `step`'i karede 4 kez çalıştırır. Dört çeyrek bir bütün eder: kuşlar
  eskisi kadar hızlı uçar ama arada 4 kez çarpışmaya bakılır.

# --task--

1. Under `BIRD` write `const SUB = 4`.
2. In `step`, divide the three lines by `SUB`.
3. In `update`, replace `step()` with the `for` line.

# --task-tr--

1. `const BIRD = 10 ...` satırının altına `SUB` satırını yaz.
2. `step` içindeki üç satırın sonuna `/ SUB` ekle.
3. `update` içindeki `step()` satırını `for (let i = 0; i < SUB; i++) step()` ile değiştir.
4. **Çalıştır** ve kuleye tam güçle bir kuş fırlat.

# --tests--

One `step()` should move a body by a quarter of its velocity.
tr: Bir `step()` gövdeyi hızının dörtte biri kadar ilerletmeli.

```js
assert.strictEqual(SUB, 4)
bodies = [body('wood', 100, 100, 10, 10)]
bodies[0].vx = 8
step()
assert.closeTo(bodies[0].x, 102, 1e-9)
assert.closeTo(bodies[0].vy, GRAVITY / 4, 1e-9)
```

A frame should still move bodies by their whole velocity.
tr: Bir kare gövdeleri yine hızlarının tamamı kadar ilerletmeli.

```js
bodies = [body('wood', 100, 100, 10, 10)]
bodies[0].vx = 8
$.tick()
assert.closeTo(bodies[0].x, 108, 1e-9)
```

The tower should stand still on its own.
tr: Kule kendi başına kıpırdamadan durmalı.

```js
const start = bodies.map((b) => [b.x, b.y])
$.tick(600)
bodies.forEach((b, i) => assert.isBelow(Math.hypot(b.x - start[i][0], b.y - start[i][1]), 1, 'the tower stands still'))
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
const SUB = 4 // physics steps per frame
const MATERIALS = {
  wood: { color: '#b45309', density: 1 },
  stone: { color: '#64748b', density: 2.5 },
  bird: { color: '#dc2626', density: 4 },
}
// The level: [kind, x, y, width, height], x and y the top left corner.
const LEVEL = [
  ['wood', 380, 230, 12, 60], ['wood', 440, 230, 12, 60], ['wood', 370, 218, 94, 12], ['stone', 480, 250, 40, 40],
]

let bodies // { kind, x, y, w, h, vx, vy }
let bird // the bird in flight, or null
let aim // { angle, pull }
let dragging
let state // 'aiming' or 'flying'
let calm // frames everything has been still

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0 })
const mass = (b) => (b.w * b.h * MATERIALS[b.kind].density) / 400

function reset() {
  bodies = LEVEL.map(([kind, x, y, w, h]) => body(kind, x, y, w, h))
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

// Two overlapping boxes: push them apart along the axis where they overlap least, then bounce their velocities
// along that axis like a collision between two masses, with a little friction along the other axis.
function collide(a, b) {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  if (ox <= 0 || oy <= 0) return
  const ia = 1 / mass(a)
  const ib = 1 / mass(b)
  let nx = 0
  let ny = 0
  let depth
  if (ox < oy) [nx, depth] = [a.x + a.w / 2 < b.x + b.w / 2 ? 1 : -1, ox]
  else [ny, depth] = [a.y + a.h / 2 < b.y + b.h / 2 ? 1 : -1, oy]
  const push = depth / (ia + ib)
  a.x -= nx * push * ia
  a.y -= ny * push * ia
  b.x += nx * push * ib
  b.y += ny * push * ib
  const closing = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
  if (closing <= 0) return
  const j = (1.2 * closing) / (ia + ib) // 1.2: a slightly bouncy hit
  a.vx -= j * nx * ia
  a.vy -= j * ny * ia
  b.vx += j * nx * ib
  b.vy += j * ny * ib
  // Friction: slow down the sliding along the surface.
  const slide = (a.vx - b.vx) * ny - (a.vy - b.vy) * nx
  const f = Math.max(-0.5 * j, Math.min(0.5 * j, slide / (ia + ib)))
  a.vx -= f * ny * ia
  a.vy += f * nx * ia
  b.vx += f * ny * ib
  b.vy -= f * nx * ib
}

function step() {
  for (const b of bodies) {
    b.vy += GRAVITY / SUB
    b.x += b.vx / SUB
    b.y += b.vy / SUB
    if (b.y + b.h > GROUND) {
      b.y = GROUND - b.h
      b.vy = 0
      b.vx *= 0.9 // the ground is rough
    }
  }
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) collide(bodies[i], bodies[j])
  // Fallen off the world: gone.
  bodies = bodies.filter((b) => {
    if (b.x < canvas.width + 50 && b.x + b.w > -50) return true
    if (b === bird) bird = null
    return false
  })
}

function update() {
  for (let i = 0; i < SUB; i++) step()
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

canvas.addEventListener('pointermove', (event) => {
  if (dragging) pull(toCanvas(event))
})

document.addEventListener('pointerup', () => {
  if (!dragging) return
  dragging = false
  if (aim.pull >= 15) launch()
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
    if (b.kind === 'bird') {
      ctx.beginPath()
      ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(b.x, b.y, b.w, b.h)
    }
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
