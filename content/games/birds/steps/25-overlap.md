---
title: Push overlapping boxes apart
title_tr: İç içe geçen kutuları ayır
skills: [game.collision]
---

# --goal--

`collide(a, b)` is where boxes meet. First part: if two boxes overlap, push them apart along the axis where they
overlap least. The lighter one moves more, so we need each body's **mass**.

# --goal-tr--

Kutuların birbirinin içinden geçmemesi için `collide(a, b)` (çarpış) fonksiyonunu yazacağız. Uzun bir fonksiyon, o
yüzden üç adımda kuracağız. Üstteki iki satırlık yorum, fonksiyonun bitmiş hâlinin ne yaptığını anlatıyor.

İlk parça: iki kutu **iç içe mi**? Öyleyse onları en az bindikleri yönde ayır. Bir kutunun üstünde duran kutu dikeyde
çok az, yatayda çok binmiştir; bu yüzden **yukarı** itilir. Bir kuleyi ayakta tutan tam budur.

Kim ne kadar itilir? **Kütle** karar verir: hafif tahta çok kıpırdar, ağır taş az. Kütleyi alan × yoğunluktan
hesaplıyoruz.

# --code--

```js
const mass = (b) => (b.w * b.h * MATERIALS[b.kind].density) / 400

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
}
```

# --meaning--

- `mass` is area × density / 400, so a 20×20 wood box weighs 1.
- `ox` and `oy` are how much the boxes overlap sideways and up-down; if either is 0 or less they do not touch.
- `ia` and `ib` are the inverse masses (`1 / mass`): big for light bodies.
- `(nx, ny)` is the **normal**, the direction from `a` to `b` along the axis of least overlap; `depth` is that overlap.
- Each box moves away by its share of `depth`: `push * ia` for `a`, `push * ib` for `b`; the two shares add up to
  `depth`.

# --meaning-tr--

- `const mass = (b) => (b.w * b.h * MATERIALS[b.kind].density) / 400` → **kütle** = alan × yoğunluk / 400. 20 × 20
  bir tahta 1, aynı boy taş 2.5, kuş 4 eder.
- `const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)` → **yatay** bindirme: iki sağ kenardan
  **soldakinden** (küçüğünden) iki sol kenardan **sağdakini** (büyüğünü) çıkarır; sonuç iki kutunun ortak kısmının
  genişliği. `oy` aynı şeyin dikeyi.
- `if (ox <= 0 || oy <= 0) return` → biri 0 ya da eksiyse kutular değmiyor: çık.
- `const ia = 1 / mass(a)` → **ters kütle**. Hafif gövdenin ters kütlesi büyüktür; itmenin büyük payı ona düşer.
- `let nx = 0`, `let ny = 0` → **normal**: itme yönü. `let depth` → ne kadar itilecek.
- `if (ox < oy) [nx, depth] = [..., ox]` → yatayda daha az binmişlerse **yana** ayır. `[nx, depth] = [1, ox]` tek
  satırda iki değişkene iki değer verir.
- `a.x + a.w / 2 < b.x + b.w / 2 ? 1 : -1` → `a`'nın ortası `b`'nin ortasının solundaysa 1 (b sağa itilir), değilse −1.
- `else [ny, depth] = [..., oy]` → değilse **dikey** ayır: `a` üstteyse `ny` 1.
- `const push = depth / (ia + ib)` → itmeyi kütlelere göre paylaştırmak için ortak çarpan.
- `a.x -= nx * push * ia` ... → `a` normalin tersine, `b` normal yönünde itilir. İki pay toplanınca tam `depth`
  eder: kutular artık tam değiyor, iç içe değil.

# --task--

1. Under the `body` helper write `mass`.
2. Above `function step() {` write the comment and `collide`.

# --task-tr--

1. `const body = ...` satırının altına `const mass = ...` satırını yaz.
2. `function step() {` satırının **üstüne** iki yorum satırını ve `collide` fonksiyonunu yaz (sonra bir boş satır).
   Harf harf yaz; her `+` ve `-` önemli.
3. **Çalıştır**: ekranda henüz fark yok; `collide`'ı kimse çağırmıyor. Kontroller yeşil olmalı.

# --hint--

If the boxes move towards each other instead of apart, check the signs: `a` gets `-=`, `b` gets `+=`.

# --hint-tr--

Kutular ayrılacağına birbirine yaklaşıyorsa işaretlere bak: `a` için `-=`, `b` için `+=`.

# --tests--

`mass` should be area × density / 400.
tr: `mass` alan × yoğunluk / 400 olmalı.

```js
assert.strictEqual(mass(body('wood', 0, 0, 20, 20)), 1)
assert.strictEqual(mass(body('stone', 0, 0, 20, 20)), 2.5)
assert.strictEqual(mass(body('bird', 0, 0, 20, 20)), 4)
```

Boxes overlapping sideways should be pushed apart sideways, the lighter one more.
tr: Yana bindiren kutular yana ayrılmalı; hafif olan daha çok.

```js
const a = body('bird', 100, 100, 20, 20)
const b = body('wood', 118, 95, 12, 40)
collide(a, b)
assert.closeTo(a.x + a.w, b.x, 1e-9, 'just touching, no longer overlapping')
assert.isBelow(a.x, 100)
assert.isAbove(b.x - 118, 100 - a.x, 'the light wood moves more than the heavy bird')
assert.strictEqual(a.y, 100)
```

A box sinking a little into the one below should be pushed up.
tr: Alttakine biraz gömülen kutu yukarı itilmeli.

```js
const a = body('wood', 0, 0, 40, 20)
const b = body('stone', 0, 19, 40, 40)
collide(a, b)
assert.isBelow(a.y, 0)
assert.closeTo(a.y + a.h, b.y, 1e-9)
assert.strictEqual(a.x, 0)
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
