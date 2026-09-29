---
title: Three levels of data
title_tr: Veriden üç seviye
skills: [prog.arrays]
---

# --goal--

Because a level is only data, more levels need no new code: `LEVELS` is an array of level arrays. The second level
has stone legs and two floors, the third is a wide fortress with three pigs. For now we still start the first one.

# --goal-tr--

Seviye yalnız **veri** olduğu için yeni seviyeler yeni kod istemez. `LEVEL` listesini, **listelerin listesi** olan
`LEVELS`'a çeviriyoruz: `LEVELS[0]` birinci seviye, `LEVELS[1]` ikinci, `LEVELS[2]` üçüncü (numaralar 0'dan başlar).

İkinci seviyede taş ayaklar ve iki kat var; üçüncüsü üç domuzlu geniş bir kale. Bu adımda yine birinci seviyeyle
başlıyoruz; seviyeler arası geçişi sonraki adımlarda yazacağız.

Seviye tasarlamak, seviyeyi **denemektir**: kendi başına durmalı (ilk kuştan önce yıkılan kule hatadır) ve üç kuşla
temizlenebilmeli. Bu üç seviye ikisini de geçti.

# --code--

```js
// Each level: [kind, x, y, width, height], x and y the top left corner.
const LEVELS = [
  [
    ['wood', 380, 230, 12, 60], ['wood', 440, 230, 12, 60], ['wood', 370, 218, 94, 12], ['pig', 406, 196, 22, 22],
    ['pig', 480, 268, 22, 22],
  ],
  [
    ['stone', 360, 250, 14, 40], ['stone', 450, 250, 14, 40], ['wood', 350, 238, 124, 12], ['pig', 400, 268, 22, 22],
    ['wood', 380, 188, 12, 50], ['wood', 432, 188, 12, 50], ['wood', 372, 176, 80, 12], ['pig', 400, 216, 22, 22],
  ],
  [
    ['wood', 340, 230, 12, 60], ['wood', 400, 230, 12, 60], ['wood', 460, 230, 12, 60], ['stone', 330, 218, 152, 12],
    ['pig', 362, 268, 22, 22], ['pig', 424, 268, 22, 22], ['wood', 360, 168, 12, 50], ['wood', 440, 168, 12, 50],
    ['wood', 352, 156, 108, 12], ['pig', 396, 196, 22, 22], ['stone', 500, 250, 40, 40],
  ],
]

  bodies = LEVELS[0].map(([kind, x, y, w, h]) => body(kind, x, y, w, h))
```

# --meaning--

- `LEVELS` holds three arrays, each one a list of blocks like `LEVEL` was. The first is the old level.
- Every block rests exactly on the one below: a block's `y + h` equals the next one's `y`.
- `LEVELS[0]` is the first level.

# --meaning-tr--

- `const LEVELS = [ [...], [...], [...] ]` → üç seviye, her biri eski `LEVEL` gibi bir blok listesi. Birincisi eski
  seviyenin aynısı.
- Her blok alttakinin **tam üstüne** oturur: bir bloğun `y + h`'si, altındakinin `y`'sine eşittir. İkinci seviyede
  taş ayak `250 + 40 = 290` (zemin), üstündeki kiriş `238 + 12 = 250`.
- `LEVELS[0].map(...)` → köşeli parantezdeki sayı sıra numarası: 0, birinci seviye.

# --task--

1. Replace the `// The level` comment and the whole `LEVEL` block with the comment and `LEVELS`.
2. In `reset`, change `LEVEL.map` to `LEVELS[0].map`.

# --task-tr--

1. `// The level: ...` yorumunu ve bütün `const LEVEL = [ ... ]` bloğunu sil; yerine yeni yorumu ve `LEVELS`'ı yaz.
   Sayıları dikkatle kopyala: birkaç piksel kayan bir blok kulenin kendi kendine yıkılmasına yol açar.
2. `reset` içinde `LEVEL.map` yerine `LEVELS[0].map` yaz.
3. **Çalıştır**: birinci seviye eskisi gibi görünmeli.

# --hint--

If a level does not stand still, compare its numbers one by one with the code above.

# --hint-tr--

Bir seviye kıpırdıyorsa sayılarını yukarıdaki kodla tek tek karşılaştır. Her seviyenin sonunda `],` olduğunu da kontrol et.

# --tests--

There should be three levels, and the game starts on the first one.
tr: Üç seviye olmalı ve oyun birincisiyle başlamalı.

```js
assert.lengthOf(LEVELS, 3)
assert.deepEqual(bodies.map((b) => b.kind), LEVELS[0].map((row) => row[0]))
```

Every level should have pigs and stand still on its own.
tr: Her seviyede domuz olmalı ve kendi başına kıpırdamadan durmalı.

```js
for (let n = 0; n < LEVELS.length; n++) {
  bodies = LEVELS[n].map(([kind, x, y, w, h]) => body(kind, x, y, w, h))
  assert.isAbove(pigs().length, 0)
  const start = bodies.map((b) => [b.x, b.y])
  $.tick(600)
  bodies.forEach((b, i) => assert.isBelow(Math.hypot(b.x - start[i][0], b.y - start[i][1]), 1, 'level ' + (n + 1) + ' stands still'))
}
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
// Each level: [kind, x, y, width, height], x and y the top left corner.
const LEVELS = [
  [
    ['wood', 380, 230, 12, 60], ['wood', 440, 230, 12, 60], ['wood', 370, 218, 94, 12], ['pig', 406, 196, 22, 22],
    ['pig', 480, 268, 22, 22],
  ],
  [
    ['stone', 360, 250, 14, 40], ['stone', 450, 250, 14, 40], ['wood', 350, 238, 124, 12], ['pig', 400, 268, 22, 22],
    ['wood', 380, 188, 12, 50], ['wood', 432, 188, 12, 50], ['wood', 372, 176, 80, 12], ['pig', 400, 216, 22, 22],
  ],
  [
    ['wood', 340, 230, 12, 60], ['wood', 400, 230, 12, 60], ['wood', 460, 230, 12, 60], ['stone', 330, 218, 152, 12],
    ['pig', 362, 268, 22, 22], ['pig', 424, 268, 22, 22], ['wood', 360, 168, 12, 50], ['wood', 440, 168, 12, 50],
    ['wood', 352, 156, 108, 12], ['pig', 396, 196, 22, 22], ['stone', 500, 250, 40, 40],
  ],
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
  bodies = LEVELS[0].map(([kind, x, y, w, h]) => body(kind, x, y, w, h))
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

function next() {
  if (state === 'won' || state === 'lost') reset()
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') aim.angle -= 0.03
  else if (event.key === 'ArrowDown') aim.angle += 0.03
  else if (event.key === 'ArrowRight') aim.pull = Math.min(MAX_PULL, aim.pull + 2)
  else if (event.key === 'ArrowLeft') aim.pull = Math.max(10, aim.pull - 2)
  else if (event.key === ' ') state === 'aiming' ? launch() : next()
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
  if (state === 'won' || state === 'lost') return next()
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
  if (state === 'won' || state === 'lost') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
    ctx.fillRect(130, 110, 300, 80)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(state === 'won' ? 'Level cleared!' : 'Out of birds', canvas.width / 2, 145)
    ctx.font = '15px sans-serif'
    ctx.fillText('Space or tap to play again', canvas.width / 2, 172)
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
