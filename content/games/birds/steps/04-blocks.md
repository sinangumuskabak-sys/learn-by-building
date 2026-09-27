---
title: Blocks that stack and tumble
title_tr: Yığılan ve devrilen bloklar
skills: [game.physics, game.collision]
---

# --explanation--

Now the target: a tower of wood and stone blocks. Every block is a body like the bird, so gravity already pulls it down. What
is missing is how two boxes **push each other**.

When two boxes overlap, we look at how much they overlap on each axis and push them apart along the **smaller** one. A box
resting on another overlaps a tiny bit vertically but a lot horizontally, so it is pushed up, which is exactly what holds a
tower up.

**Mass** decides who moves. A light wood plank hit by a heavy bird flies; a stone block barely notices. We use each body's
inverse mass (`1 / mass`): the push and the change of speed are shared in proportion to it. Then, if the boxes are still
closing in along that axis, they bounce:

```js
const j = (1.2 * closing) / (ia + ib) // the size of the hit
a.vx -= j * nx * ia                   // a light body (big ia) changes a lot
b.vx += j * nx * ib
```

Momentum (`mass × velocity`) is the same before and after, like in real collisions. A little **friction** slows boxes sliding
along each other, so stacks do not skate apart.

The bird now moves fast against small blocks, so, as in the pool game, each frame is split into `SUB = 4` smaller physics
steps. Blocks come from a **level** written as data: `[kind, x, y, width, height]`.

# --explanation-tr--

Şimdi hedef: tahta ve taş bloklardan bir kule. Her blok kuş gibi bir cisimdir, yani yerçekimi onu zaten aşağı çeker. Eksik olan,
iki kutunun **birbirini nasıl ittiği**.

İki kutu üst üste bindiğinde her eksende ne kadar örtüştüklerine bakar ve onları **küçük** olan boyunca ayırırız. Bir başkasının
üstünde duran kutu dikeyde çok az, yatayda çok örtüşür; bu yüzden yukarı itilir ve bir kuleyi ayakta tutan tam olarak budur.

Kimin hareket edeceğine **kütle** karar verir. Ağır bir kuşun çarptığı hafif bir tahta uçar; bir taş blok neredeyse fark etmez.
Her cismin ters kütlesini (`1 / mass`) kullanırız: itme ve hız değişimi onunla orantılı paylaşılır. Sonra kutular o eksende hâlâ
yaklaşıyorsa seker:

```js
const j = (1.2 * closing) / (ia + ib) // çarpmanın büyüklüğü
a.vx -= j * nx * ia                   // hafif bir cisim (büyük ia) çok değişir
b.vx += j * nx * ib
```

Momentum (`kütle × hız`), gerçek çarpışmalardaki gibi öncesinde ve sonrasında aynıdır. Biraz **sürtünme** birbirinin üstünde
kayan kutuları yavaşlatır; böylece yığınlar kayıp dağılmaz.

Kuş artık küçük bloklara karşı hızlı hareket ediyor; bu yüzden bilardo oyunundaki gibi her kare `SUB = 4` küçük fizik adımına
bölünür. Bloklar veri olarak yazılmış bir **seviyeden** gelir: `[kind, x, y, width, height]`.

# --task--

1. Add `wood` (`'#b45309'`, density 1) and `stone` (`'#64748b'`, density 2.5) to `MATERIALS`, the `LEVEL` data, and
   `mass(b)` = area × density / 400. `reset()` makes the bodies from `LEVEL`.
2. Write `collide(a, b)`: if the boxes overlap on both axes, find the axis of least overlap and the normal `(nx, ny)` from
   `a` to `b`; push them apart by the overlap, shared by inverse mass; if they close in along the normal, apply the impulse
   `j = 1.2 × closing / (ia + ib)` and a friction impulse of at most `0.5 × j` against their sliding.
3. Add `SUB = 4`: `step()` adds `GRAVITY / SUB` and moves by `velocity / SUB`, then collides every pair of bodies; `update()`
   runs it `SUB` times per frame.
4. Draw blocks as rectangles in their color (the bird stays a circle).

# --task-tr--

1. `MATERIALS`'a `wood` (`'#b45309'`, yoğunluk 1) ve `stone` (`'#64748b'`, yoğunluk 2.5), `LEVEL` verisi ve alan × yoğunluk / 400
   olan `mass(b)` ekle. `reset()` cisimleri `LEVEL`'dan yapar.
2. `collide(a, b)` yaz: kutular iki eksende de örtüşüyorsa en az örtüşme eksenini ve `a`'dan `b`'ye normal `(nx, ny)`'yi bul;
   onları ters kütleyle paylaştırarak örtüşme kadar ayır; normal boyunca yaklaşıyorlarsa `j = 1.2 × closing / (ia + ib)` itkisini
   ve kaymalarına karşı en fazla `0.5 × j` bir sürtünme itkisini uygula.
3. `SUB = 4` ekle: `step()` `GRAVITY / SUB` ekler ve `hız / SUB` kadar hareket ettirir, sonra her cisim çiftini çarpıştırır;
   `update()` onu karede `SUB` kez çalıştırır.
4. Blokları kendi renklerinde dikdörtgenler olarak çiz (kuş daire kalır).

# --tests--

The tower should stand still on its own.
tr: Kule kendi başına kıpırdamadan durmalı.

```js
assert.lengthOf(bodies, LEVEL.length)
const start = bodies.map((b) => [b.x, b.y])
$.tick(600)
bodies.forEach((b, i) => assert.isBelow(Math.hypot(b.x - start[i][0], b.y - start[i][1]), 1, 'the tower stands still'))
```

A hit should push a block, slow the bird and keep the momentum; stone should be heavier than wood.
tr: Bir çarpma bloğu itmeli, kuşu yavaşlatmalı ve momentumu korumalı; taş tahtadan ağır olmalı.

```js
const a = body('bird', 100, 100, 20, 20)
const b = body('wood', 118, 95, 12, 40)
a.vx = 10
const before = mass(a) * a.vx + mass(b) * b.vx
collide(a, b)
assert.isAbove(b.vx, 0, 'the block is pushed')
assert.isBelow(a.vx, 10, 'the bird slows down')
assert.closeTo(mass(a) * a.vx + mass(b) * b.vx, before, 1e-9, 'momentum is kept')
assert.isAtMost(a.x + a.w, b.x + 1e-9, 'no longer overlapping')
assert.isAbove(mass(body('stone', 0, 0, 10, 10)), mass(body('wood', 0, 0, 10, 10)), 'stone is heavier')
```

A falling block should land on another and stay, and a bird should knock the tower about.
tr: Düşen bir blok başka birinin üstüne inip kalmalı ve bir kuş kuleyi sarsmalı.

```js
bodies = [body('wood', 200, 250, 40, 40), body('wood', 205, 150, 30, 20)]
$.tick(300)
assert.closeTo(bodies[1].y + bodies[1].h, 250, 0.5, 'a falling block lands on the one below and stays')
assert.closeTo(bodies[0].y, 250, 0.5)
aim = { angle: -0.35, pull: 64 }
bodies = LEVEL.map(([kind, x, y, w, h]) => body(kind, x, y, w, h))
launch()
for (let i = 0; i < 1000 && state === 'flying'; i++) $.tick(1)
assert.isAbove(Math.max(...bodies.map((b) => Math.abs(b.x - 380))), 5, 'the bird knocks the tower about')
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
