---
title: Land on the ground
title_tr: Yere in
skills: [game.physics, game.collision]
---

# --goal--

When a body's bottom goes below the ground, we put it back on top of the ground, stop its fall and let the rough
ground rub its sideways speed away.

# --goal-tr--

Kuş zeminin içinden geçip gitmesin. Her karede bakacağız: gövdenin **alt kenarı** zeminin altına geçti mi? Geçtiyse:

1. onu zeminin **üstüne** geri koy,
2. düşüşünü durdur,
3. yatay hızını biraz azalt: zemin pürüzlü, kuş kayarak yavaşça durur.

# --code--

```js
b.y += b.vy
if (b.y + b.h > GROUND) {
  b.y = GROUND - b.h
  b.vy = 0
  b.vx *= 0.9 // the ground is rough
}
```

# --meaning--

- `b.y + b.h` is the body's bottom edge (top plus height).
- `b.y = GROUND - b.h` puts the bottom exactly on the ground; `b.vy = 0` stops the fall.
- `b.vx *= 0.9` keeps 90% of the sideways speed each frame, so it slides to a stop.

# --meaning-tr--

- `b.y + b.h` → gövdenin **alt kenarı**: üst kenar + boy.
- `if (b.y + b.h > GROUND) {` → alt kenar zeminin altına geçtiyse:
  - `b.y = GROUND - b.h` → gövdeyi yukarı kaldırır; alt kenarı tam zemine oturur.
  - `b.vy = 0` → aşağı düşüşü durdurur.
  - `b.vx *= 0.9` → yatay hızı 0.9 ile çarpar (`*=` "kendisiyle çarp"): her karede hızın %90'ı kalır. 10 → 9 → 8.1 →
    ... kuş kayarak durur.

# --task--

In `step`, under `b.y += b.vy` (still inside the `for` loop), write the `if` block.

# --task-tr--

1. `step` içinde `b.y += b.vy` satırının **altına**, hâlâ `for` döngüsünün içinde kalacak şekilde `if` bloğunu yaz.
2. **Çalıştır** ve Boşluk'a bas: kuş düşüp çimenin üstünde kaymalı ve durmalı.

# --hint--

Check that the `if` block is inside the `for` loop (it uses `b`), right after `b.y += b.vy`.

# --hint-tr--

`if` bloğunun `for` döngüsünün **içinde** olduğundan emin ol (`b`'yi kullanıyor), `b.y += b.vy`'nin hemen altında.

# --tests--

The bird should never go below the ground, and it should slide to a stop.
tr: Kuş hiç zeminin altına geçmemeli ve kayarak durmalı.

```js
aim = { angle: -0.2, pull: 20 }
launch()
let landed = false
for (let i = 0; i < 300; i++) {
  $.tick()
  assert.isAtMost(bird.y + bird.h, GROUND, 'never under the ground')
  if (bird.y + bird.h === GROUND) landed = true
}
assert.isTrue(landed)
assert.isBelow(Math.abs(bird.vx), 0.1, 'the rough ground stops it')
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

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0 })

function reset() {
  bodies = []
  bird = null
  aim = { angle: -0.6, pull: 50 }
}

// The launch velocity: pulled back by `pull` pixels, the bird flies the opposite way.
const launchVelocity = () => ({ vx: Math.cos(aim.angle) * aim.pull * LAUNCH, vy: Math.sin(aim.angle) * aim.pull * LAUNCH })

function launch() {
  const { vx, vy } = launchVelocity()
  bird = body('bird', SLING.x - BIRD, SLING.y - BIRD, BIRD * 2, BIRD * 2)
  bird.vx = vx
  bird.vy = vy
  bodies.push(bird)
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
