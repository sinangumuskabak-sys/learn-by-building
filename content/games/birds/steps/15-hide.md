---
title: An empty sling in flight
title_tr: Uçuşta boş sapan
skills: [game.state]
---

# --goal--

While the bird flies, the sling should be empty: the pulled-back bird and the band are drawn only while aiming.

# --goal-tr--

Kuş uçarken sapanda hâlâ bir kuş ve gergin bir lastik görünüyor. Kuş gittiyse sapan **boş** olmalı. Geri çekilmiş kuşu
ve lastiği yalnız **nişan alırken** çizeceğiz.

# --code--

```js
if (state === 'aiming') {
  const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
  ...
  ctx.arc(bx, by, BIRD, 0, Math.PI * 2)
  ctx.fill()
}
```

# --meaning--

- Everything between `{` and `}` runs only when the state is `'aiming'`.
- The lines inside move two spaces to the right, so the block is easy to see.

# --meaning-tr--

- `if (state === 'aiming') {` → süslü parantezin içindeki her şey **yalnız nişan alırken** çalışır.
- İçerideki satırlar iki boşluk daha içeri alınır; böylece bloğun nerede başlayıp bittiği bir bakışta görünür.
- Sapan direği `if`'in **dışında**: o her zaman çizilir.

# --task--

Wrap the lines from `const bx = ...` down to the bird's `ctx.fill()` in `if (state === 'aiming') { ... }`.

# --task-tr--

1. `draw` içinde `const bx = ...` satırının **üstüne** `if (state === 'aiming') {` yaz.
2. `const bx` satırından kuşu boyayan `ctx.fill()` satırına kadar (12 satır) hepsini iki boşluk içeri al.
3. Altlarına kapanan `}` yaz (boş satırdan ve `for` döngüsünden önce).
4. **Çalıştır** ve fırlat: kuş gidince sapan boş kalmalı.

# --hint--

The closing `}` goes right after the bird's `ctx.fill()`, before the empty line and the `for` loop.

# --hint-tr--

Kapanan `}`, kuşun `ctx.fill()` satırından hemen sonra gelir; boş satırdan ve `for` döngüsünden önce.

# --tests--

While aiming, the bird and the band should be in the sling.
tr: Nişan alırken kuş ve lastik sapanda olmalı.

```js
$.tick()
assert.lengthOf($.arcs().filter((a) => a.color === '#dc2626'), 1)
assert.isTrue($.screen().some((c) => c.op === 'lineTo'), 'the band')
```

In flight the sling should be empty: only the flying bird is drawn.
tr: Uçuşta sapan boş olmalı: yalnız uçan kuş çizilir.

```js
launch()
$.tick()
const red = $.arcs().filter((a) => a.color === '#dc2626')
assert.lengthOf(red, 1, 'one bird: the one in the air')
assert.closeTo(red[0].x, bird.x + 10, 1e-9)
assert.isFalse($.screen().some((c) => c.op === 'lineTo'), 'no band in flight')
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
let state // 'aiming' or 'flying'

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0 })

function reset() {
  bodies = []
  bird = null
  aim = { angle: -0.6, pull: 50 }
  state = 'aiming'
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
}

function update() {
  step()
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

function draw() {
  ctx.fillStyle = '#bae6fd'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  // The sling and, while aiming, the pulled-back bird and the path it will take.
  ctx.fillStyle = '#78350f'
  ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
  if (state === 'aiming') {
    const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
    const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
    ctx.strokeStyle = '#451a03'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(SLING.x, SLING.y)
    ctx.lineTo(bx, by)
    ctx.stroke()
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
