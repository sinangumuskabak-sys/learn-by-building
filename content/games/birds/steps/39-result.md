---
title: Won or lost
title_tr: Kazandın mı, kaybettin mi
skills: [game.state]
---

# --goal--

When a shot has settled, the game decides: no pigs left means the level is **won**, and every unused bird is worth
1000; pigs left and no birds means **lost**; otherwise, the next bird. Once it is over, the physics stops.

# --goal-tr--

Atış bitince (her şey bir saniye durunca) oyun karar verir:

- **domuz kalmadı** → seviye temizlendi: `'won'`. Kullanmadığın her kuş **1000 puan** eder.
- domuz var ama **kuş yok** → `'lost'`.
- değilse → sıradaki kuş: `'aiming'`.

Sakinliği beklemek burada önemli: bir kule çarpmadan sonra bir saniye daha yıkılmaya devam edebilir; en sonda ezilen
domuz da sayılmalı. Kullanılmayan kuşa bonus ise oyuncuyu seviyeyi tekrar oynatır: tek mükemmel atış, üç atıştan
2000 puan fazla eder. Oyun bitince fizik de durur.

# --code--

```js
let state // 'aiming', 'flying', 'won' or 'lost'

function update() {
  if (state !== 'flying' && state !== 'aiming') return
  ...
  if (pigs().length === 0) {
    score += birdsLeft * 1000 // unused birds are worth a lot
    state = 'won'
  } else if (birdsLeft === 0) state = 'lost'
  else state = 'aiming'
}
```

# --meaning--

- `state` can now be two more words.
- The first line of `update` stops everything once the game is won or lost.
- `pigs().length === 0` asks whether any pig is left; the `if ... else if ... else` picks one of three outcomes.

# --meaning-tr--

- `let state` yorumu → durum artık dört kelimeden biri olabilir.
- `if (state !== 'flying' && state !== 'aiming') return` → ne uçuyor ne nişan alıyorsak (oyun bittiyse) `update`
  hiçbir şey yapmaz: fizik donar.
- `pigs().length === 0` → domuz listesinin uzunluğu 0: hiç domuz kalmadı.
  - `score += birdsLeft * 1000` → kalan her kuş 1000 puan.
  - `state = 'won'` → kazandın.
- `else if (birdsLeft === 0) state = 'lost'` → domuz var ama kuş yok: kaybettin.
- `else state = 'aiming'` → ikisi de değilse sapana yeni kuş.

# --task--

1. Change the `let state` comment.
2. In `update`, write the new first line.
3. At the end of `update`, replace `state = 'aiming'` with the `if ... else if ... else`.

# --task-tr--

1. `let state` satırının yorumunu `// 'aiming', 'flying', 'won' or 'lost'` yap.
2. `update`'in **ilk satırı** olarak `if (state !== 'flying' && state !== 'aiming') return` yaz.
3. `update`'in sonundaki `state = 'aiming'` satırını sil; yerine karar bloğunu yaz.
4. **Çalıştır** ve oyna: iki domuzu da düşürürsen puan bonusla artmalı; ekranda henüz yazı yok (bir sonraki adım).

# --hint--

The bonus goes on the score before `state = 'won'`; count the birds that are still left, `birdsLeft`.

# --hint-tr--

Bonus, `state = 'won'`'dan önce puana eklenir; kalan kuşları, yani `birdsLeft`'i sayar.

# --tests--

Three birds that miss should lose the level.
tr: Iskalayan üç kuş seviyeyi kaybettirmeli.

```js
aim = { angle: -1.2, pull: 20 }
for (let n = 3; n > 0; n--) {
  launch()
  assert.strictEqual(birdsLeft, n - 1)
  for (let i = 0; i < 2000 && state === 'flying'; i++) $.tick()
}
assert.strictEqual(state, 'lost', 'out of birds with pigs left')
```

Clearing the last pig should win, with 1000 points for each unused bird.
tr: Son domuzu temizlemek kazandırmalı; kullanılmayan her kuş 1000 puan.

```js
bodies = bodies.filter((b) => b.kind !== 'pig')
bodies.push(body('pig', 480, 268, 22, 22))
bodies[bodies.length - 1].hp = -1
aim = { angle: -1.2, pull: 20 }
launch()
for (let i = 0; i < 2000 && state === 'flying'; i++) $.tick()
assert.strictEqual(state, 'won')
assert.strictEqual(score, 500 + 2 * 1000, 'each unused bird is worth 1000')
```

Once the game is over, nothing should move.
tr: Oyun bitince hiçbir şey kıpırdamamalı.

```js
state = 'lost'
bodies.push(body('wood', 200, 0, 10, 10))
$.tick(10)
assert.strictEqual(bodies[bodies.length - 1].y, 0)
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
let birdsLeft
let aim // { angle, pull }
let dragging
let score
let state // 'aiming', 'flying', 'won' or 'lost'
let calm // frames everything has been still

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0, hp: MATERIALS[kind].hp })
const mass = (b) => (b.w * b.h * MATERIALS[b.kind].density) / 400
const pigs = () => bodies.filter((b) => b.kind === 'pig')

function reset() {
  bodies = LEVEL.map(([kind, x, y, w, h]) => body(kind, x, y, w, h))
  bird = null
  birdsLeft = 3
  aim = { angle: -0.6, pull: 50 }
  dragging = false
  state = 'aiming'
  score = 0
  calm = 0
}

// The launch velocity: pulled back by `pull` pixels, the bird flies the opposite way.
const launchVelocity = () => ({ vx: Math.cos(aim.angle) * aim.pull * LAUNCH, vy: Math.sin(aim.angle) * aim.pull * LAUNCH })

function launch() {
  if (state !== 'aiming' || birdsLeft === 0) return
  const { vx, vy } = launchVelocity()
  bird = body('bird', SLING.x - BIRD, SLING.y - BIRD, BIRD * 2, BIRD * 2)
  bird.vx = vx
  bird.vy = vy
  bodies.push(bird)
  birdsLeft -= 1
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
  // Broken or fallen off the world: gone. Every pig and block that goes scores.
  bodies = bodies.filter((b) => {
    if (b.hp > 0 && b.x < canvas.width + 50 && b.x + b.w > -50) return true
    if (b === bird) bird = null
    else score += b.kind === 'pig' ? 500 : 100
    return false
  })
}

function update() {
  if (state !== 'flying' && state !== 'aiming') return
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
  if (pigs().length === 0) {
    score += birdsLeft * 1000 // unused birds are worth a lot
    state = 'won'
  } else if (birdsLeft === 0) state = 'lost'
  else state = 'aiming'
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
  if (state === 'aiming' && birdsLeft > 0) {
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
      // Cracks show how hurt a block is.
      if (b.hp < m.hp / 2) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
        ctx.fillRect(b.x + b.w / 2 - 1, b.y, 2, b.h)
      }
    }
  }

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Birds ' + birdsLeft + '  Score ' + score, 10, 22)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
