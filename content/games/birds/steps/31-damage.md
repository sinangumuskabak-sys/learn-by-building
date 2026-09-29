---
title: Hard hits hurt
title_tr: Sert çarpan acıtır
skills: [game.collision]
---

# --goal--

How hard was a hit? `collide` already knows: `closing`. Only the speed **above** 2 hurts, 25 hp per unit, so a block
settling on another is never hurt. Landing on the ground hurts with the falling speed.

# --goal-tr--

Çarpma ne kadar sertti? `collide` bunu zaten biliyor: `closing`, kutuların birbirine ne hızla yaklaştığıydı.

Nazik bir dokunuş (bir bloğun ötekinin üstüne oturması gibi) hiçbir şey yapmamalı. O yüzden yalnız 2'nin **üstündeki**
hız sayılır, her birimi 25 can. Örnek: 4 hızla çarpan tahta `(4 - 2) × 25 = 50` can kaybeder, 60'tan 10'a düşer;
1.5 hızla dokunan hiç kaybetmez.

Bu tek eşik oyunun hissinin büyük kısmını verir: kulede duran bloklar asla zarar görmez, tam hızla gelen kuş tahtayı
parçalar. Yere düşmek de sayılır: düşüş hızıyla.

# --code--

```js
  damage(a, closing)
  damage(b, closing)
}

// Hits harder than a gentle landing hurt; things fall apart at 0 hp.
function damage(b, speed) {
  if (speed > 2) b.hp -= (speed - 2) * 25
}

    if (b.y + b.h > GROUND) {
      if (b.vy > 0) damage(b, b.vy)
```

# --meaning--

- At the end of `collide`, both bodies are damaged by the closing speed.
- `damage` takes away `(speed - 2) * 25` hp, only when `speed` is over 2.
- Hitting the ground while falling (`vy > 0`) damages a body by its falling speed.

# --meaning-tr--

- `damage(a, closing)` ve `damage(b, closing)` → `collide`'ın sonunda iki gövde de yaklaşma hızı kadar hasar alır.
  (Ayrılan kutular için `closing <= 0` olduğunda fonksiyon daha önce `return` ile çıkmıştı; onlara hasar yok.)
- `function damage(b, speed) {` → hasar kuralı:
  - `if (speed > 2)` → yalnız 2'den hızlı çarpmalar sayılır.
  - `b.hp -= (speed - 2) * 25` → eşiğin üstündeki her hız birimi 25 can götürür.
- `if (b.vy > 0) damage(b, b.vy)` → zemine **düşerken** çarpan (`vy` artı: aşağı gidiyor) düşüş hızı kadar hasar
  alır. Kuleden düşen bir şey düşüşten kırılabilir.

# --task--

1. At the end of `collide`, under the last friction line, write the two `damage` calls.
2. Between `collide` and `step`, write the `damage` function.
3. In `step`, write the ground-damage line as the first line inside `if (b.y + b.h > GROUND) {`.

# --task-tr--

1. `collide`'ın **sonuna**, son sürtünme satırının (`b.vy -= f * nx * ib`) altına iki `damage` satırını yaz.
2. `collide`'ın kapanan `}`'sinden sonra, `function step() {` satırının **üstüne** yorumu ve `damage` fonksiyonunu
   yaz.
3. `step` içinde `if (b.y + b.h > GROUND) {` satırının hemen **altına** `if (b.vy > 0) damage(b, b.vy)` yaz.
4. **Çalıştır**: ekranda henüz fark yok; canı biten şeyleri bir sonraki adımda kaldıracağız.

# --hint--

`damage` must be written outside `collide`, after its closing `}`.

# --hint-tr--

`damage` fonksiyonu `collide`'ın **dışında**, onun kapanan `}`'sinden sonra olmalı.

# --tests--

`damage` should ignore gentle touches and hurt hard ones.
tr: `damage` nazik dokunuşları saymamalı, sertleri saymalı.

```js
const w = body('wood', 0, 0, 12, 60)
damage(w, 1.5)
assert.strictEqual(w.hp, 60, 'a gentle touch does nothing')
damage(w, 4)
assert.strictEqual(w.hp, 10)
```

A hard hit should hurt both bodies; the bird never breaks.
tr: Sert bir çarpma iki gövdeye de hasar vermeli; kuş hiç kırılmaz.

```js
const a = body('bird', 100, 100, 20, 20)
const b = body('wood', 118, 95, 12, 40)
a.vx = 10
collide(a, b)
assert.isBelow(b.hp, 0, 'a hit at full speed smashes wood')
assert.strictEqual(a.hp, Infinity)
```

A block falling from high up should be hurt by the ground, but the tower never.
tr: Yüksekten düşen blok zeminden hasar almalı, kule ise hiç.

```js
bodies.push(body('wood', 200, 0, 12, 20))
$.tick(120)
assert.isBelow(bodies[4].hp, 60)
for (let i = 0; i < 4; i++) assert.strictEqual(bodies[i].hp, MATERIALS[bodies[i].kind].hp, 'standing still never hurts')
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
  bird: { color: '#dc2626', density: 4, hp: Infinity },
}
// The level: [kind, x, y, width, height], x and y the top left corner.
const LEVEL = [
  ['wood', 380, 230, 12, 60], ['wood', 440, 230, 12, 60], ['wood', 370, 218, 94, 12], ['stone', 480, 250, 40, 40],
]

let bodies // { kind, x, y, w, h, vx, vy, hp }
let bird // the bird in flight, or null
let aim // { angle, pull }
let dragging
let state // 'aiming' or 'flying'
let calm // frames everything has been still

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0, hp: MATERIALS[kind].hp })
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
