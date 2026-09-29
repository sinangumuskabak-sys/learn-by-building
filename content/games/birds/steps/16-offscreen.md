---
title: Gone off the screen
title_tr: Ekrandan çıkan gider
skills: [prog.arrays]
---

# --goal--

A bird that flies off the side of the screen would be moved and drawn forever. After each step we keep only the
bodies still near the screen; if the bird is dropped, `bird` becomes `null`.

# --goal-tr--

Sert fırlatılan kuş ekranın sağından çıkıp gidiyor, ama listede kalıyor: görünmediği hâlde her karede hareket
ettiriliyor ve çiziliyor. Sonsuza kadar!

Her adımın sonunda listeyi **süzeceğiz**: ekranın 50 pikselden fazla dışına çıkanlar gider. Giden uçan kuşsa,
`bird` de `null` olur.

# --code--

```js
// Fallen off the world: gone.
bodies = bodies.filter((b) => {
  if (b.x < canvas.width + 50 && b.x + b.w > -50) return true
  if (b === bird) bird = null
  return false
})
```

# --meaning--

- `filter` builds a new array with the items for which the function returns `true`.
- A body stays while its left edge is less than 50 pixels past the right side and its right edge more than 50 pixels
  before the left side.
- For the others, `return false` drops them; if one of them is the flying bird, we forget it.

# --meaning-tr--

- `bodies.filter((b) => { ... })` → listedeki her gövde için fonksiyonu çalıştırır ve yalnız `true` (evet) dediklerini
  tutan **yeni bir liste** yapar. `bodies =` eski listeyi bununla değiştirir.
- `b.x < canvas.width + 50` → sol kenarı, sağ kenarın 50 piksel ötesini geçmemiş.
- `b.x + b.w > -50` → sağ kenarı, sol kenarın 50 piksel gerisine düşmemiş.
- `&&` "ve" demek: ikisi de doğruysa `return true`, gövde kalır.
- Değilse aşağı iner: `if (b === bird) bird = null` → giden uçan kuşsa onu unut. `return false` → gövde gider.

# --task--

In `step`, after the `for` loop's closing `}`, write the comment and the `filter`.

# --task-tr--

1. `step` içinde, `for` döngüsünün kapanan `}` satırından **sonra** (fonksiyonun kapanan `}`'sinden önce) yorumu ve
   `filter` bloğunu yaz.
2. **Çalıştır**, sağ okla çekişi en sona getir ve fırlat: kuş ekrandan çıkıp gider.

# --hint--

`filter` needs its function to `return true` for the bodies that stay. Check the `&&` between the two conditions.

# --hint-tr--

`filter`, kalacak gövdeler için `return true` bekler. İki koşulun arasındaki `&&`'yi kontrol et.

# --tests--

A bird that flies off the screen should be removed.
tr: Ekrandan uçup giden kuş listeden çıkmalı.

```js
aim = { angle: -0.3, pull: 70 }
launch()
$.tick(100)
assert.lengthOf(bodies, 0)
assert.isNull(bird)
```

Bodies off the left side should go too, and bodies on screen should stay.
tr: Solda ekran dışına çıkan da gitmeli, ekrandakiler kalmalı.

```js
bodies.push(body('bird', -100, 100, 20, 20), body('bird', 300, 270, 20, 20))
$.tick()
assert.lengthOf(bodies, 1)
assert.strictEqual(bodies[0].x, 300)
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
  // Fallen off the world: gone.
  bodies = bodies.filter((b) => {
    if (b.x < canvas.width + 50 && b.x + b.w > -50) return true
    if (b === bird) bird = null
    return false
  })
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
