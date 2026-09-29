---
title: The next bird
title_tr: Sıradaki kuş
skills: [game.state]
---

# --goal--

After 60 calm frames (one second), or as soon as the bird is off the right edge, the shot is over: the bird is
removed and the sling is ready again.

# --goal-tr--

Şimdi karar anı. Atış iki durumda biter:

- **60 sakin kare** geçtiyse (yaklaşık bir saniye hiçbir şey kıpırdamadıysa),
- ya da kuş ekranın **sağından çıktıysa** (beklemeye gerek yok).

Atış bitince kuş listeden çıkarılır ve durum yeniden `'aiming'` olur: sapana yeni kuş gelir.

# --code--

```js
  calm = moving ? 0 : calm + 1
  if (calm < 60 && !(bird && bird.x > canvas.width)) return
  if (bird) {
    bodies = bodies.filter((b) => b !== bird)
    bird = null
  }
  state = 'aiming'
}
```

# --meaning--

- The first line leaves (the shot goes on) while there have been fewer than 60 calm frames **and** the bird is not
  past the right edge. `!` means "not".
- Otherwise the landed bird is taken out of `bodies` and forgotten, and we go back to aiming.

# --meaning-tr--

- `if (calm < 60 && !(bird && bird.x > canvas.width)) return` → atış **sürüyorsa** çık. Sürüyor demek:
  - `calm < 60` → henüz bir saniye sakin geçmedi, **ve**
  - `!(bird && bird.x > canvas.width)` → kuş sağdan çıkmış **değil**. `!` "değil" demek; parantez içi "kuş var ve
    sağ kenarı geçti".
- Buradan aşağısı atış bitince çalışır:
  - `if (bird) { ... }` → yerde bir kuş kaldıysa: `filter` ile listeden çıkar (`b !== bird`: kuş olmayanlar kalır),
    `bird = null`.
  - `state = 'aiming'` → nişana dön. Sapanda yeni kuş belirir.

# --task--

In `update`, under `calm = moving ? 0 : calm + 1`, write the new lines.

# --task-tr--

1. `update` içinde `calm = moving ? 0 : calm + 1` satırının **altına** yeni satırları yaz.
2. **Çalıştır**: bir kuş fırlat; yere inip durduktan bir saniye sonra kaybolmalı ve sapana yenisi gelmeli.

# --predict--

You launch, the bird lands and stops. When does the next bird appear?
- [ ] At once
- [x] About a second after the bird stops
  `calm` has to reach 60 frames first.
- [ ] Never

# --predict-tr--

Fırlattın; kuş indi ve durdu. Sıradaki kuş ne zaman gelir?
- [ ] Hemen
- [x] Kuş durduktan yaklaşık bir saniye sonra
  Önce `calm`'ın 60 kareye ulaşması gerekiyor.
- [ ] Hiç

# --tests--

After the bird stops, the sling should be ready again.
tr: Kuş durunca sapan yeniden hazır olmalı.

```js
aim = { angle: -0.2, pull: 20 }
launch()
for (let i = 0; i < 400 && state === 'flying'; i++) $.tick()
assert.strictEqual(state, 'aiming', 'once it stops, the next bird can go')
assert.lengthOf(bodies, 0)
assert.isNull(bird)
```

It should not end too early: the bird must be still for about a second.
tr: Erken bitmemeli: kuş yaklaşık bir saniye durmuş olmalı.

```js
aim = { angle: -0.2, pull: 20 }
launch()
$.tick(40)
assert.strictEqual(state, 'flying')
```

A bird that flies off the screen ends the shot too.
tr: Ekrandan uçup giden kuş da atışı bitirmeli.

```js
aim = { angle: -0.3, pull: 70 }
launch()
for (let i = 0; i < 200 && state === 'flying'; i++) $.tick()
assert.strictEqual(state, 'aiming')
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
