---
title: Move by the velocity
title_tr: Hız kadar ilerle
skills: [game.physics, game.loop]
---

# --goal--

Each frame, every body moves by its velocity. `step` does that for all bodies; `update` is the game's "change the
state" half and runs before `draw` in the loop.

# --goal-tr--

Kuşun hızı var ama kıpırdamıyor. Her karede her gövdeyi **hızı kadar** ilerletmeliyiz: `vx` kadar yana, `vy` kadar
aşağı (ya da eksiyse yukarı).

Bunu iki fonksiyona bölüyoruz: `step` (adım) bütün gövdeleri bir kare ilerletir, `update` (güncelle) oyunun durumunu
değiştiren her şeyi yapar. Döngü her turda önce **günceller**, sonra **çizer**.

# --code--

```js
function step() {
  for (const b of bodies) {
    b.x += b.vx
    b.y += b.vy
  }
}

function update() {
  step()
}

function loop() {
  update()
  draw()
```

# --meaning--

- `b.x += b.vx` adds the velocity to the position: `+=` means "add to".
- `update` calls `step`; later it will also decide when a shot is over.
- The loop now updates first, then draws the new state.

# --meaning-tr--

- `for (const b of bodies) {` → her gövde için:
  - `b.x += b.vx` → konuma yatay hızı ekle. `+=` "üstüne ekle" demek: `b.x = b.x + b.vx` ile aynı.
  - `b.y += b.vy` → konuma dikey hızı ekle.
- `function update() { step() }` → şimdilik yalnız `step`'i çağırıyor; ileride atışın ne zaman bittiğine de burada
  karar vereceğiz.
- `loop` içinde `update()` → önce durumu değiştir, sonra `draw()` ile yeni durumu çiz.

# --task--

1. Above the `keydown` listener write `step` and `update`.
2. In `loop`, write `update()` above `draw()`.

# --task-tr--

1. `document.addEventListener('keydown', ...)` satırının **üstüne** `step` ve `update` fonksiyonlarını yaz.
2. `loop` içinde `draw()` satırının **üstüne** `update()` yaz.
3. **Çalıştır**, oyuna tıkla ve Boşluk'a bas.

# --predict--

What path will the bird take?
- [ ] A curve, like a thrown ball
- [x] A straight line up and to the right, off the screen
  Nothing changes its velocity yet, so it never turns down.
- [ ] It drops to the ground

# --predict-tr--

Kuş nasıl bir yol izleyecek?
- [ ] Atılan bir top gibi kavisli
- [x] Sağ yukarı dümdüz bir çizgi, ekrandan çıkıp gider
  Henüz hızını değiştiren bir şey yok; hiç aşağı dönmez.
- [ ] Yere düşer

# --hint--

If the bird does not move, check that `loop` calls `update()`.

# --hint-tr--

Kuş kıpırdamıyorsa `loop`'un `update()`'i çağırdığından emin ol.

# --tests--

Every frame the bird should move by its velocity.
tr: Her karede kuş hızı kadar ilerlemeli.

```js
launch()
const x = bird.x
const y = bird.y
$.tick()
assert.closeTo(bird.x, x + bird.vx, 1e-9)
$.tick(9)
assert.closeTo(bird.x, x + bird.vx * 10, 1e-9)
assert.isBelow(bird.y, y, 'aimed up, it goes up')
```

# --solution--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 290
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
    b.x += b.vx
    b.y += b.vy
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
