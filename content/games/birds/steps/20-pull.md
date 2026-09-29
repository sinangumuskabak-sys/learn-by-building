---
title: From a point to an aim
title_tr: Bir noktadan nişana
skills: [game.input, game.physics]
---

# --goal--

Next we aim with the mouse or a finger, like a real sling. Two helpers first: `toCanvas` turns a pointer event into a
point in canvas pixels, and `pull` turns a point behind the sling into an angle and a pull.

# --goal-tr--

Şimdi fareyle (ya da parmakla) gerçek bir sapan gibi nişan almaya hazırlanıyoruz: sapanı tut, geri çek, bırak. Önce
iki yardımcı:

- `toCanvas(event)`: farenin ekrandaki yerini **canvas pikseline** çevirir. Canvas ekranda büyütülmüş ya da
  küçültülmüş olabilir; ekran pikseli ile canvas pikseli aynı olmayabilir.
- `pull(point)`: sapanın gerisindeki bir noktadan **açıyı ve çekişi** hesaplar. Göstericiden sapana doğru olan ok, kuşun
  uçacağı yöndür.

# --code--

```js
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
```

# --meaning--

- `getBoundingClientRect()` gives where the canvas is on the page and how big it is shown. Subtracting `rect.left`
  and scaling by `canvas.width / rect.width` turns page pixels into canvas pixels.
- `dx, dy` is the arrow from the point to the sling. `Math.atan2(dy, dx)` is the direction of that arrow as an angle,
  `Math.hypot(dx, dy)` its length (the straight distance).

# --meaning-tr--

- `canvas.getBoundingClientRect()` → canvas'ın sayfadaki yeri (`left`, `top`) ve ekranda göründüğü boy (`width`,
  `height`).
- `event.clientX - rect.left` → göstericinin canvas'ın sol kenarından uzaklığı (ekran pikseliyle).
- `* canvas.width / rect.width` → ekran pikselini canvas pikseline çeviren oran. Canvas ekranda iki kat büyük
  gösteriliyorsa oran 0.5 olur.
- `return { x: ..., y: ... }` → iki sayıyı bir nesne olarak geri verir.
- `const dx = SLING.x - point.x` ve `const dy = SLING.y - point.y` → noktadan **sapana doğru** olan ok. Sapanın sol
  altına çekersen ok sağ üste bakar: kuş sağ üste uçar.
- `Math.atan2(dy, dx)` → bir okun **yönünü** radyan olarak verir: açı.
- `Math.hypot(dx, dy)` → okun **uzunluğu**, iki nokta arasındaki düz uzaklık (Pisagor): çekiş. `Math.min` onu
  `MAX_PULL`'da keser.

# --task--

Write both functions above `function draw() {`.

# --task-tr--

1. `function draw() {` satırının **üstüne** `toCanvas` ve `pull` fonksiyonlarını yaz (her birinden sonra bir boş satır).
2. **Çalıştır**: ekranda fark yok; fareyi bir sonraki adımda bağlayacağız. Kontroller yeşil olmalı.

# --hint--

`Math.atan2` takes `dy` first, then `dx`.

# --hint-tr--

`Math.atan2` önce `dy`'yi, sonra `dx`'i alır. Sıra ters olursa açı yanlış çıkar.

# --tests--

`toCanvas` should turn a pointer event into canvas pixels.
tr: `toCanvas` bir gösterici olayını canvas pikseline çevirmeli.

```js
assert.deepEqual(toCanvas({ clientX: 120, clientY: 45 }), { x: 120, y: 45 })
```

`pull` should aim away from the point, up to the maximum pull.
tr: `pull` noktanın tersine nişan almalı, en fazla çekişe kadar.

```js
pull({ x: 60, y: 240 })
assert.closeTo(aim.angle, Math.atan2(-20, 30), 1e-9, 'pulling down and left aims up and right')
assert.closeTo(aim.pull, Math.hypot(30, 20), 1e-9)
pull({ x: 0, y: 220 })
assert.closeTo(aim.angle, 0, 1e-9)
assert.strictEqual(aim.pull, MAX_PULL, 'the pull is limited')
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
let calm // frames everything has been still

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0 })

function reset() {
  bodies = []
  bird = null
  aim = { angle: -0.6, pull: 50 }
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
