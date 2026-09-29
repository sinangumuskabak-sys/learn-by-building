---
title: See the path before you shoot
title_tr: Atmadan önce yolu gör
skills: [game.physics]
---

# --goal--

Aiming blind is frustrating. We know the physics, so we can draw the path before the shot: a dot every 4 frames, from
a formula for where the bird will be after `t` frames.

# --goal-tr--

Körlemesine nişan almak sinir bozucu. Fiziği bildiğimize göre kuşun yolunu **atıştan önce** çizebiliriz: beyaz
noktalardan bir yay.

`t` kare sonra kuş nerede olacak? İki parçası var:

- **Yana doğru** hız hiç değişmez: `x` her karede `vx` kadar büyür → `SLING.x + vx * t`.
- **Aşağı doğru** hız her karede `GRAVITY` kadar artar; düşülen yol zamanın **karesiyle** büyür →
  `SLING.y + vy * t + (GRAVITY * t * t) / 2`.

# --code--

```js
const { vx, vy } = launchVelocity()

ctx.stroke()
ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
for (let t = 4; t <= 60; t += 4) {
  // Where the bird will be after t frames: x grows steadily, y follows a parabola.
  const x = SLING.x + vx * t
  const y = SLING.y + vy * t + (GRAVITY * t * t) / 2
  if (y > GROUND) break
  ctx.fillRect(x - 2, y - 2, 4, 4)
}
```

# --meaning--

- The velocity the bird would get is computed first, at the top of the `if`.
- `for (let t = 4; t <= 60; t += 4)` counts `t = 4, 8, 12, ... 60`.
- `(GRAVITY * t * t) / 2` is how far gravity has pulled it down after `t` frames.
- `break` ends the loop at the first dot below the ground. Each dot is a 4×4 square centered on the point.
- The real bird ends up a hair lower than the dots, because the game adds gravity in whole-frame steps; for aiming it
  does not matter.

# --meaning-tr--

- `const { vx, vy } = launchVelocity()` → fırlatılsaydı kuşun alacağı hız. `if`'in en üstünde hesaplanır.
- `ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'` → biraz saydam beyaz. `rgba`'daki son sayı **saydamlıktır**
  (1 tam dolu, 0 görünmez).
- `for (let t = 4; t <= 60; t += 4) {` → sayma döngüsü: `t` 4'ten başlar, her turda 4 artar (`t += 4`), 60'ı
  geçince durur. `t` = 4, 8, 12, ... 60: dört karede bir nokta.
- `const x = SLING.x + vx * t` → yatay yer: sabit hızla gidildiği için hız × zaman.
- `const y = SLING.y + vy * t + (GRAVITY * t * t) / 2` → dikey yer: yukarı hız × zaman **artı** yerçekiminin o ana
  kadar aşağı çektiği yol. `t * t` zamanın karesi: düşüş gittikçe hızlanır. Bu formül bir **parabol**.
- `if (y > GROUND) break` → nokta zeminin altına düştüyse `break` döngüyü **hemen bitirir**; sonrakiler çizilmez.
- `ctx.fillRect(x - 2, y - 2, 4, 4)` → 4 × 4'lük minik kare; `- 2` onu noktanın tam ortasına oturtur.
- Gerçek kuş noktaların bir tık altından geçer: oyun yerçekimini kare kare, basamak basamak ekler, formül ise pürüzsüz
  hâlidir. Nişan için bu fark önemsiz.

# --task--

1. In `draw`, right under `if (state === 'aiming') {`, write the `launchVelocity` line.
2. Under the band's `ctx.stroke()`, write the dots (the `fillStyle` line and the `for` loop).

# --task-tr--

1. `draw` içinde `if (state === 'aiming') {` satırının **hemen altına** `const { vx, vy } = launchVelocity()` yaz.
2. Lastiği boyayan `ctx.stroke()` satırının **altına** noktaların `fillStyle` satırını ve `for` döngüsünü yaz.
3. **Çalıştır**: sapandan sağa uzanan beyaz noktalı bir yay görmelisin. Oklarla nişanı değiştir; yay da değişmeli.
   Fırlat: kuş noktaları izlemeli.

# --hint--

If the parabola check fails, look at the brackets in `(GRAVITY * t * t) / 2`.

# --hint-tr--

Parabol kontrolü kırmızıysa `(GRAVITY * t * t) / 2` içindeki parantezlere bak. Noktalar hiç yoksa `ctx.fillRect(x - 2, y - 2, 4, 4)` satırının döngünün içinde olduğundan emin ol.

# --try--

Change `t <= 60` to `t <= 200`: the whole path to the ground shows up. Put 60 back if you like a challenge.

# --try-tr--

`t <= 60`'ı `t <= 200` yap: zemine kadar bütün yol görünür. Zorluk seviyorsan 60'a geri al.

# --tests--

The dots should follow the parabola, and stop at the ground.
tr: Noktalar parabolü izlemeli ve zeminde bitmeli.

```js
aim = { angle: -0.5, pull: 40 }
$.tick()
const { vx, vy } = launchVelocity()
const dots = $.rects('rgba(255, 255, 255, 0.8)')
assert.isAbove(dots.length, 5)
assert.closeTo(dots[0].x + 2, SLING.x + vx * 4, 1e-9)
assert.closeTo(dots[0].y + 2, SLING.y + vy * 4 + (GRAVITY * 16) / 2, 1e-9, 'y follows a parabola')
for (const d of dots) assert.isAtMost(d.y + 2, GROUND, 'no dots under the ground')
```

The bird should fly along the dots, and no dots are drawn in flight.
tr: Kuş noktalar boyunca uçmalı; uçuşta nokta çizilmemeli.

```js
aim = { angle: -0.5, pull: 40 }
const { vx, vy } = launchVelocity()
launch()
$.tick(20)
assert.closeTo(bird.x + BIRD, SLING.x + vx * 20, 1e-6, 'the bird flies along the dots')
assert.closeTo(bird.y + BIRD, SLING.y + vy * 20 + (GRAVITY * 400) / 2, 3)
assert.lengthOf($.rects('rgba(255, 255, 255, 0.8)'), 0)
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
