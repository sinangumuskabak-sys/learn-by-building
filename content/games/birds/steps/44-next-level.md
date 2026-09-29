---
title: On to the next level
title_tr: Sonraki seviyeye
skills: [game.state]
---

# --goal--

After a win, `next()` starts the next level with the score kept, or starts over after the last one. After a loss, the
score goes back to 0 and the same level starts again. The top line shows the level number.

# --goal-tr--

`next()` artık daha akıllı:

- **Kazandıysan**: son seviyeyse baştan (`reset()`), değilse bir sonraki seviye (`startLevel(level + 1)`); puan
  korunur.
- **Kaybettiysen**: puan 0'a döner ve **aynı** seviye yeniden başlar.

Üst satıra da seviye numarası geliyor: `Level 1  Birds 3  Score 0`.

# --code--

```js
function next() {
  if (state === 'won') level === LEVELS.length - 1 ? reset() : startLevel(level + 1)
  else if (state === 'lost') {
    score = 0
    startLevel(level)
  }
}

  ctx.fillText('Level ' + (level + 1) + '  Birds ' + birdsLeft + '  Score ' + score, 10, 22)
```

# --meaning--

- `LEVELS.length - 1` is the number of the last level (2 when there are 3).
- `(level + 1)` is in brackets so it is added as numbers before being joined to the text; people count from 1.

# --meaning-tr--

- `LEVELS.length - 1` → son seviyenin numarası: 3 seviye varsa 2.
- `level === LEVELS.length - 1 ? reset() : startLevel(level + 1)` → son seviyeyse baştan başla, değilse bir sonrakine
  geç.
- `else if (state === 'lost') { score = 0; startLevel(level) }` → kaybettiysen puan sıfır, aynı seviye.
- `'Level ' + (level + 1)` → ekranda `level + 1` gösteririz; insanlar 1'den sayar. Parantez önemli: parantezsiz
  `'Level ' + level + 1` yazı ile birleşip `'Level 01'` olurdu.

# --task--

1. Replace the inside of `next` as shown.
2. In `draw`, put `'Level ' + (level + 1) + '  ` in front of the Birds text.

# --task-tr--

1. `next` fonksiyonunun içini yeni hâliyle değiştir.
2. `draw`'da üst yazı satırını `ctx.fillText('Level ' + (level + 1) + '  Birds ' + ...` olacak şekilde değiştir.
3. **Çalıştır**: sol üstte `Level 1  Birds 3  Score 0` görmelisin. Seviyeyi temizle ve Boşluk'a bas: iki katlı
   kuleye geçmelisin.

# --tests--

Winning should move on to the next level with the score kept.
tr: Kazanmak puanı koruyarak sonraki seviyeye geçirmeli.

```js
bodies = bodies.filter((b) => b.kind !== 'pig')
state = 'flying'
calm = 59
$.tick()
assert.strictEqual(state, 'won')
const kept = score
$.press(' ')
assert.strictEqual(level, 1, 'on to level 2')
assert.strictEqual(birdsLeft, 3)
assert.strictEqual(score, kept, 'the score carries on')
$.tick()
assert.include($.texts(), 'Level 2 Birds 3 Score ' + kept)
```

Losing should retry the same level from 0; winning the last level should start over.
tr: Kaybetmek aynı seviyeyi 0'dan denetmeli; son seviyeyi kazanmak baştan başlatmalı.

```js
startLevel(1)
score = 800
state = 'lost'
$.press(' ')
assert.strictEqual(level, 1, 'try the same level again')
assert.strictEqual(score, 0)
startLevel(2)
state = 'won'
$.press(' ')
assert.strictEqual(level, 0, 'back to the start')
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
let level
let score
let state // 'aiming', 'flying', 'won' or 'lost'
let calm // frames everything has been still

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0, hp: MATERIALS[kind].hp })
const mass = (b) => (b.w * b.h * MATERIALS[b.kind].density) / 400
const pigs = () => bodies.filter((b) => b.kind === 'pig')

function startLevel(n) {
  level = n
  bodies = LEVELS[n].map(([kind, x, y, w, h]) => body(kind, x, y, w, h))
  bird = null
  birdsLeft = 3
  aim = { angle: -0.6, pull: 50 }
  dragging = false
  state = 'aiming'
  calm = 0
}

function reset() {
  score = 0
  startLevel(0)
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
  if (state === 'won') level === LEVELS.length - 1 ? reset() : startLevel(level + 1)
  else if (state === 'lost') {
    score = 0
    startLevel(level)
  }
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
  ctx.fillText('Level ' + (level + 1) + '  Birds ' + birdsLeft + '  Score ' + score, 10, 22)
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
