---
title: Wood and stone
title_tr: Tahta ve taş
skills: [game.canvas]
---

# --goal--

Now the targets. Blocks are bodies too, made of two new materials: light wood and heavy stone. The bird stays a
circle; every other body is drawn as a rectangle.

# --goal-tr--

Sıra hedeflerde. Kuleleri **bloklardan** kuracağız; bloklar da birer gövde, yani yerçekimi, zemin ve ekrandan çıkma
kuralları onlara da işleyecek. İki yeni malzeme ekliyoruz: hafif **tahta** ve ağır **taş**.

Kuş daire olarak kalır; bloklar dikdörtgen çizilir.

# --code--

```js
const MATERIALS = {
  wood: { color: '#b45309', density: 1 },
  stone: { color: '#64748b', density: 2.5 },
  bird: { color: '#dc2626', density: 4 },
}

    ctx.fillStyle = m.color
    if (b.kind === 'bird') {
      ctx.beginPath()
      ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(b.x, b.y, b.w, b.h)
    }
```

# --meaning--

- `wood` and `stone` get a color and a density (stone is 2.5 times as heavy as wood of the same size).
- In `draw`, `if ... else` picks the shape: a circle for the bird, the body's own box for everything else.

# --meaning-tr--

- `wood: { color: '#b45309', density: 1 }` → tahta: turuncu kahve, yoğunluğu 1.
- `stone: { color: '#64748b', density: 2.5 }` → taş: gri, aynı boydaki tahtadan 2.5 kat ağır.
- `if (b.kind === 'bird') { ... } else { ... }` → gövde kuşsa daire (eski üç satır), **değilse** (`else`)
  kutunun kendisini dikdörtgen olarak çiz: `ctx.fillRect(b.x, b.y, b.w, b.h)`.

# --task--

1. In `MATERIALS`, above the `bird` line, write `wood` and `stone`.
2. At the end of `draw`, wrap the three circle lines in `if (b.kind === 'bird') { ... }` and add the `else` with the
   rectangle.

# --task-tr--

1. `MATERIALS` içinde `bird` satırının **üstüne** `wood` ve `stone` satırlarını yaz.
2. `draw`'un sonundaki gövde döngüsünde, `ctx.fillStyle = m.color` satırının altına `if (b.kind === 'bird') {` yaz;
   daireyi çizen üç satırı iki boşluk içeri al.
3. Altlarına `} else {`, dikdörtgen satırını ve kapanan `}`'yi yaz.
4. **Çalıştır**: ekranda fark yok (henüz blok yok), kontroller yeşil olmalı.

# --try--

Add `bodies.push(body('stone', 300, 50, 40, 40))` at the end of `reset`: a stone falls from the sky and lands. Remove it.

# --try-tr--

`reset`'in sonuna `bodies.push(body('stone', 300, 50, 40, 40))` ekle: gökten bir taş düşüp yere iner. Sonra sil.

# --tests--

Wood and stone should be materials, and stone heavier.
tr: Tahta ve taş malzeme olmalı; taş daha yoğun.

```js
assert.deepEqual(MATERIALS.wood, { color: '#b45309', density: 1 })
assert.deepEqual(MATERIALS.stone, { color: '#64748b', density: 2.5 })
```

Blocks should be drawn as rectangles and the bird as a circle.
tr: Bloklar dikdörtgen, kuş daire olarak çizilmeli.

```js
bodies.push(body('stone', 300, 250, 40, 40), body('wood', 200, 230, 12, 60))
launch()
$.tick()
assert.deepInclude($.rects('#64748b'), { x: 300, y: 250, w: 40, h: 40, color: '#64748b' })
assert.deepInclude($.rects('#b45309'), { x: 200, y: 230, w: 12, h: 60, color: '#b45309' })
assert.lengthOf($.arcs().filter((a) => a.color === '#dc2626'), 1)
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
