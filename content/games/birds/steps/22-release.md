---
title: Drag and let go
title_tr: Sürükle ve bırak
skills: [game.input]
---

# --goal--

While the sling is held, moving the pointer changes the aim. Letting go launches the bird, unless the pull is tiny,
so that a stray tap does not waste a bird.

# --goal-tr--

Sapan tutuluyken göstericiyi hareket ettirmek nişanı değiştirir; **bırakmak** kuşu fırlatır. Ama çekiş çok küçükse
(15'ten az) fırlatmayız: yanlışlıkla bir dokunuş kuşu boşa harcamasın.

# --code--

```js
canvas.addEventListener('pointermove', (event) => {
  if (dragging) pull(toCanvas(event))
})

document.addEventListener('pointerup', () => {
  if (!dragging) return
  dragging = false
  if (aim.pull >= 15) launch()
})
```

# --meaning--

- `pointermove` fires as the pointer moves; while dragging, the aim follows it.
- `pointerup` is listened to on the whole `document`, so letting go outside the canvas still counts.
- On release the sling is let go and, if pulled at least 15 pixels, the bird is launched.

# --meaning-tr--

- `pointermove` → gösterici **hareket ettikçe** çalışır. `if (dragging) pull(toCanvas(event))` → sapan tutuluyorsa
  nişanı yeni noktadan hesapla.
- `pointerup` → basılı tuş ya da parmak **bırakıldığında** çalışır. Bunu `canvas`'a değil `document`'e (bütün
  sayfaya) bağlıyoruz: fare canvas'ın dışında bırakılsa bile yakalanır, sapan elde asılı kalmaz.
- `if (!dragging) return` → `!` "değil": sapan tutulmuyorsa yapacak bir şey yok.
- `dragging = false` → sapanı bırak.
- `if (aim.pull >= 15) launch()` → çekiş en az 15 ise fırlat. `>=` "büyük ya da eşit".

# --task--

Write both listeners above `function draw() {`.

# --task-tr--

1. `function draw() {` satırının **üstüne** `pointermove` ve `pointerup` dinleyicilerini yaz.
2. **Çalıştır**: kuşun yanına bas, sol aşağı sürükle (noktalar değişir) ve bırak: kuş noktaların gösterdiği yoldan
   uçmalı.

# --hint--

`pointerup` goes on `document`, not on `canvas`; `pointermove` goes on `canvas`.

# --hint-tr--

`pointerup` `document`'e, `pointermove` `canvas`'a bağlanır. `if (dragging)` koşulunu unutma: yoksa fare her kıpırdadığında nişan değişir.

# --tests--

Dragging should aim, and letting go should launch.
tr: Sürüklemek nişan almalı, bırakmak fırlatmalı.

```js
$.pointerDown(60, 240)
$.move(0, 220)
assert.strictEqual(aim.pull, MAX_PULL, 'the pull is limited')
assert.closeTo(aim.angle, 0, 1e-9)
$.pointerUp(0, 220)
assert.isFalse(dragging)
assert.strictEqual(state, 'flying')
assert.closeTo(bird.vx, MAX_PULL * LAUNCH, 1e-9)
```

A tiny pull should not launch.
tr: Küçücük bir çekiş fırlatmamalı.

```js
$.pointerDown(85, 225)
$.pointerUp(85, 225)
assert.isFalse(dragging)
assert.strictEqual(state, 'aiming', 'a tiny pull does not launch')
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
