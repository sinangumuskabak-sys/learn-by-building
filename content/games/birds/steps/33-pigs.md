---
title: Pigs
title_tr: Domuzlar
skills: [game.state]
---

# --goal--

The pigs arrive: green, round and fragile (25 hp). One sits on the beam, one on the ground; the stone block leaves
the level. `pigs()` returns the pigs still in the game.

# --goal-tr--

Ve domuzlar geliyor: **yeşil, yuvarlak ve kırılgan** (25 can). Biri kirişin üstünde, biri yerde. Taş blok bu
seviyeden çıkıyor.

Bir de küçük bir yardımcı yazıyoruz: `pigs()` oyunda kalan domuzları verir. İleride "domuz kaldı mı?" diye
soracağız.

# --code--

```js
  pig: { color: '#65a30d', density: 1, hp: 25 },

const LEVEL = [
  ['wood', 380, 230, 12, 60], ['wood', 440, 230, 12, 60], ['wood', 370, 218, 94, 12], ['pig', 406, 196, 22, 22],
  ['pig', 480, 268, 22, 22],
]

const pigs = () => bodies.filter((b) => b.kind === 'pig')

    if (b.kind === 'pig' || b.kind === 'bird') {
```

# --meaning--

- `pig` is a new material: as light as wood but with only 25 hp.
- The level's fourth row is a pig on the beam (196 + 22 = 218, the beam's top), the fifth a pig on the ground.
- `pigs()` filters the bodies down to the pigs.
- Pigs are drawn as circles, like the bird.

# --meaning-tr--

- `pig: { color: '#65a30d', density: 1, hp: 25 }` → domuz malzemesi: tahta kadar hafif ama canı yalnız 25. Tahtayı
  kırmak için 4.4, domuzu kırmak için 3 hızlık bir çarpma yeter.
- `LEVEL`'da taş satırı gitti; yerine iki domuz: `['pig', 406, 196, 22, 22]` kirişin üstünde (196 + 22 = 218, kirişin
  tepesi), `['pig', 480, 268, 22, 22]` yerde (268 + 22 = 290, zemin).
- `const pigs = () => bodies.filter((b) => b.kind === 'pig')` → yalnız domuzlardan oluşan yeni bir liste verir.
- `b.kind === 'pig' || b.kind === 'bird'` → `||` "ya da": domuz **ya da** kuşsa daire çiz.

# --task--

1. In `MATERIALS`, under `stone`, write the `pig` line.
2. In `LEVEL`, replace the stone row with the two pigs.
3. Under `mass` write `pigs`.
4. In `draw`, change the circle condition to `b.kind === 'pig' || b.kind === 'bird'`.

# --task-tr--

1. `MATERIALS` içinde `stone` satırının altına `pig` satırını yaz.
2. `LEVEL`'da `['stone', 480, 250, 40, 40]` bloğunu sil; yerine iki domuzu yaz (ikincisi yeni satıra).
3. `const mass = ...` satırının altına `const pigs = ...` satırını yaz.
4. `draw`'un sonundaki `if (b.kind === 'bird') {` satırını `if (b.kind === 'pig' || b.kind === 'bird') {` yap.
5. **Çalıştır**: kirişin üstünde ve yerde birer yeşil domuz görmelisin. Onlara kuş fırlat!

# --hint--

Type the pig rows carefully: the pig on the beam starts at `196`, the one on the ground at `268`. A pig in the wrong place falls and breaks.

# --hint-tr--

Domuz satırlarındaki sayıları dikkatle yaz: kirişteki domuz `196`'da, yerdeki `268`'de başlar. Yanlış yerdeki domuz düşüp kırılır.

# --tests--

The level should have two pigs, and `pigs()` should find them.
tr: Seviyede iki domuz olmalı ve `pigs()` onları bulmalı.

```js
assert.deepEqual(MATERIALS.pig, { color: '#65a30d', density: 1, hp: 25 })
assert.deepEqual(bodies.map((b) => b.kind), ['wood', 'wood', 'wood', 'pig', 'pig'])
assert.lengthOf(pigs(), 2)
assert.isTrue(pigs().every((p) => p.kind === 'pig'))
```

Pigs should be round and green.
tr: Domuzlar yuvarlak ve yeşil olmalı.

```js
$.tick()
assert.lengthOf($.arcs().filter((a) => a.color === '#65a30d'), 2)
assert.lengthOf($.rects('#65a30d').filter((r) => r.y < GROUND), 0, 'not squares')
```

A hard hit should break a pig, and the pigs should stand still on their own.
tr: Sert bir çarpma domuzu kırmalı; domuzlar kendi başına durmalı.

```js
const pig = body('pig', 118, 100, 22, 22)
const b = body('bird', 100, 100, 20, 20)
b.vx = 6
collide(b, pig)
assert.isBelow(pig.hp, 0)
$.tick(600)
assert.lengthOf(pigs(), 2)
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
  wood: { color: '#b45309', density: 1, hp: 60 },
  stone: { color: '#64748b', density: 2.5, hp: 160 },
  pig: { color: '#65a30d', density: 1, hp: 25 },
  bird: { color: '#dc2626', density: 4, hp: Infinity },
}
// The level: [kind, x, y, width, height], x and y the top left corner.
const LEVEL = [
  ['wood', 380, 230, 12, 60], ['wood', 440, 230, 12, 60], ['wood', 370, 218, 94, 12], ['pig', 406, 196, 22, 22],
  ['pig', 480, 268, 22, 22],
]

let bodies // { kind, x, y, w, h, vx, vy, hp }
let bird // the bird in flight, or null
let aim // { angle, pull }
let dragging
let state // 'aiming' or 'flying'
let calm // frames everything has been still

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0, hp: MATERIALS[kind].hp })
const mass = (b) => (b.w * b.h * MATERIALS[b.kind].density) / 400
const pigs = () => bodies.filter((b) => b.kind === 'pig')

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
  damage(a, closing)
  damage(b, closing)
}

// Hits harder than a gentle landing hurt; things fall apart at 0 hp.
function damage(b, speed) {
  if (speed > 2) b.hp -= (speed - 2) * 25
}

function step() {
  for (const b of bodies) {
    b.vy += GRAVITY / SUB
    b.x += b.vx / SUB
    b.y += b.vy / SUB
    if (b.y + b.h > GROUND) {
      if (b.vy > 0) damage(b, b.vy)
      b.y = GROUND - b.h
      b.vy = 0
      b.vx *= 0.9 // the ground is rough
    }
  }
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) collide(bodies[i], bodies[j])
  // Fallen off the world: gone.
  bodies = bodies.filter((b) => {
    if (b.hp > 0 && b.x < canvas.width + 50 && b.x + b.w > -50) return true
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
    if (b.kind === 'pig' || b.kind === 'bird') {
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
