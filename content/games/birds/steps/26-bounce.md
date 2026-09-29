---
title: Bounce by mass
title_tr: Kütleye göre sek
skills: [game.physics, game.collision]
---

# --goal--

Pushing apart fixes the positions; the velocities must change too. If the boxes are still closing in along the
normal, they bounce: a hit of size `j` is shared by inverse mass, so a light block hit by a heavy bird flies off.

# --goal-tr--

Ayırmak konumları düzeltti; ama **hızlar** hâlâ birbirine doğru. Kuş bir bloğa çarpınca blok itilmeli, kuş
yavaşlamalı.

`closing`, iki kutunun normal yönünde birbirine **ne hızla yaklaştığı**. Artıysa bir **darbe** (impulse)
uygularız. Darbeyi yine ters kütleyle paylaştırırız: ağır kuşun çarptığı hafif tahta uçar, taş blok zor kıpırdar.

Biri ne kadar kaybederse öbürü o kadar kazanır: **momentum** (kütle × hız) çarpmadan önce ve sonra aynı kalır, tıpkı
gerçek çarpışmalardaki gibi.

# --code--

```js
const closing = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
if (closing <= 0) return
const j = (1.2 * closing) / (ia + ib) // 1.2: a slightly bouncy hit
a.vx -= j * nx * ia
a.vy -= j * ny * ia
b.vx += j * nx * ib
b.vy += j * ny * ib
```

# --meaning--

- `closing` is the relative velocity along the normal; 0 or less means they are already moving apart.
- `j` is the size of the hit. With `1.2` the boxes end up moving apart a little (a slightly bouncy hit).
- Each velocity changes by `j` times its inverse mass: light bodies change a lot, heavy ones little. Momentum is kept.

# --meaning-tr--

- `const closing = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny` → `a`'nın `b`'ye göre hızının **normal yönündeki** payı:
  birbirlerine ne hızla yaklaşıyorlar.
- `if (closing <= 0) return` → zaten ayrılıyorlarsa sekecek bir şey yok.
- `const j = (1.2 * closing) / (ia + ib)` → **darbenin büyüklüğü**. 1 olsaydı yaklaşma tam durur, yapışırlardı; 1.2
  onları biraz geri iter: hafif sekmeli bir çarpma.
- `a.vx -= j * nx * ia` ... → `a` normalin tersine, `b` normal yönünde hız kazanır; her biri kendi ters kütlesi
  kadar. Hafif gövde (büyük ters kütle) çok değişir.

# --task--

In `collide`, under the last push line (`b.y += ny * push * ib`), write the seven lines.

# --task-tr--

1. `collide` içinde son itme satırının (`b.y += ny * push * ib`) **altına** yedi satırı yaz.
2. **Çalıştır**: ekranda yine fark yok; `collide`'ı bir sonraki adımda çağıracağız.

# --predict--

A heavy bird (mass 4) hits a light plank (mass 1.2) at speed 10. Which one ends up faster?
- [ ] The bird: it is heavier
- [x] The plank: it gets the bigger share of the hit
  Each velocity changes by `j` times its inverse mass, and the plank's is more than three times the bird's.
- [ ] Both stop

# --predict-tr--

Ağır bir kuş (kütle 4), hafif bir tahtaya (kütle 1.2) 10 hızla çarpıyor. Sonunda hangisi daha hızlı?
- [ ] Kuş: daha ağır
- [x] Tahta: darbenin büyük payı ona düşer
  Her hız `j` × ters kütle kadar değişir; tahtanın ters kütlesi kuşunkinin üç katından fazla.
- [ ] İkisi de durur

# --tests--

A hit should push the block, slow the bird and keep the momentum.
tr: Çarpma bloğu itmeli, kuşu yavaşlatmalı ve momentumu korumalı.

```js
const a = body('bird', 100, 100, 20, 20)
const b = body('wood', 118, 95, 12, 40)
a.vx = 10
const before = mass(a) * a.vx + mass(b) * b.vx
collide(a, b)
assert.isAbove(b.vx, 0, 'the block is pushed')
assert.isAbove(b.vx, a.vx, 'the light block ends up faster than the heavy bird')
assert.isBelow(a.vx, 10, 'the bird slows down')
assert.closeTo(mass(a) * a.vx + mass(b) * b.vx, before, 1e-9, 'momentum is kept')
```

Boxes already moving apart should keep their speeds.
tr: Zaten ayrılan kutuların hızı değişmemeli.

```js
const a = body('wood', 100, 100, 20, 20)
const b = body('wood', 118, 100, 20, 20)
a.vx = -1
collide(a, b)
assert.strictEqual(a.vx, -1)
assert.strictEqual(b.vx, 0)
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
