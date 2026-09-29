---
title: A level as data
title_tr: Veri olarak seviye
skills: [prog.arrays]
---

# --goal--

A level is just data: a list of rows `[kind, x, y, width, height]`. `reset` turns each row into a body with `map`.
Two posts, a beam across them and a stone block.

# --goal-tr--

Bir seviyeyi kodla değil **veriyle** yazacağız: her blok bir satır, `[tür, x, y, en, boy]`. Sağ tarafa bir kule:
iki tahta direk, üstlerinde yatay bir tahta kiriş ve yanında bir taş blok.

`reset`, boş listeyle başlamak yerine bu satırların her birini bir gövdeye çevirecek. Yeni bir kule istediğinde tek
yapman gereken sayıları değiştirmek.

# --code--

```js
// The level: [kind, x, y, width, height], x and y the top left corner.
const LEVEL = [
  ['wood', 380, 230, 12, 60], ['wood', 440, 230, 12, 60], ['wood', 370, 218, 94, 12], ['stone', 480, 250, 40, 40],
]

  bodies = LEVEL.map(([kind, x, y, w, h]) => body(kind, x, y, w, h))
```

# --meaning--

- `LEVEL` is an array of arrays: each row describes one block.
- `map` makes a new array by turning each item into something else: here each row into a body.
- `([kind, x, y, w, h]) => ...` unpacks the five items of a row into five names.

# --meaning-tr--

- `const LEVEL = [ [...], [...], ... ]` → **dizilerden oluşan bir dizi**. Her iç dizi bir blok: tür, sol üst köşe
  (`x`, `y`), en, boy. Direkler 12 × 60, kiriş 94 × 12, taş 40 × 40.
- `LEVEL.map(...)` → listedeki her elemanı bir fonksiyondan geçirip sonuçlardan **yeni bir liste** yapar.
  `filter` eleman seçiyordu; `map` her elemanı **dönüştürür**.
- `([kind, x, y, w, h]) => body(kind, x, y, w, h)` → gelen satırı (5 elemanlı dizi) beş ayrı ada açar ve onlarla bir
  gövde yapar.

# --task--

1. Under the `MATERIALS` block (after its `}`), write the comment and `LEVEL`.
2. In `reset`, replace `bodies = []` with the `map` line.

# --task-tr--

1. `MATERIALS`'ın kapanan `}` satırının **altına** yorumu ve `LEVEL`'ı yaz.
2. `reset` içinde `bodies = []` satırını sil; yerine `map` satırını yaz.
3. **Çalıştır** ve kuleyi izle.

# --predict--

What will the tower do after Run?
- [ ] Stand still
- [x] The beam falls straight through the posts to the ground
  Blocks only know about the ground, not about each other. That is the next thing to fix.
- [ ] Everything flies off the screen

# --predict-tr--

Çalıştır'a basınca kule ne yapacak?
- [ ] Dimdik durur
- [x] Kiriş direklerin içinden geçip yere düşer
  Bloklar yalnız zemini tanıyor; birbirlerini değil. Sıradaki iş bu.
- [ ] Her şey ekrandan uçup gider

# --tests--

`reset` should build the level's four blocks.
tr: `reset` seviyenin dört bloğunu kurmalı.

```js
assert.lengthOf(LEVEL, 4)
assert.deepEqual(bodies.map((b) => b.kind), ['wood', 'wood', 'wood', 'stone'])
assert.deepInclude(bodies[2], { x: 370, y: 218, w: 94, h: 12, vx: 0, vy: 0 })
```

The blocks should be drawn.
tr: Bloklar çizilmeli.

```js
$.tick()
assert.lengthOf($.rects('#b45309'), 3)
assert.lengthOf($.rects('#64748b'), 1)
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
