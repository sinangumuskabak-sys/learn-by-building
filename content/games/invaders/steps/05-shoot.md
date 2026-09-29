---
title: Fire
title_tr: Ateş
skills: [game.input, prog.arrays]
---

# --goal--

Space fires a bullet from the cannon. Bullets live in a list, each a small box starting just above the ship.

# --goal-tr--

**Boşluk** namludan bir mermi atsın. Mermiler bir **listede** duruyor; her biri geminin hemen üstünden başlayan küçük
bir kutu. Bu adımda mermiler oluşuyor; uçmalarını sonraki adımda ekliyoruz.

# --code--

```js
const BULLET_SPEED = 8
let bullets = []

function shoot() {
  bullets.push({ x: ship.x + SHIP_W / 2 - 2, y: ship.y - 12, w: 4, h: 12 })
}

  if (event.key === ' ') shoot()
```

# --meaning--

- A bullet is 4×12, centered on the cannon: `ship.x + SHIP_W / 2 - 2`.
- `shoot` adds it to `bullets`; Space calls `shoot`.

# --meaning-tr--

- `const BULLET_SPEED = 8` → merminin karede kaç piksel yükseleceği (sonraki adımda).
- `let bullets = []` → havadaki mermiler.
- `bullets.push({ ... })` → 4×12'lik yeni bir mermi: geminin ortasından 2 piksel sola (ortalanır), namlunun üstünde.
- `if (event.key === ' ') shoot()` → Boşluk ateş eder.

# --task--

1. Under `SHIP_SPEED`, write `BULLET_SPEED`; under `ship`, write `let bullets = []`.
2. Under `keys`, write `shoot`; in `keydown`, fire on Space.

# --task-tr--

1. `SHIP_SPEED` satırının altına `BULLET_SPEED`, `ship` satırının altına `let bullets = []` yaz.
2. `keys` satırının altına `shoot` fonksiyonunu yaz; `keydown` dinleyicisine Boşluk satırını ekle.
3. **Çalıştır**. (Mermiler henüz görünmüyor.)

# --tests--

Space should add a bullet above the cannon.
tr: Boşluk namlunun üstüne bir mermi eklemeli.

```js
$.tap(' ')
assert.deepEqual(bullets, [{ x: 238, y: 468, w: 4, h: 12 }])
```

# --solution--

```js
// Invaders, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_Y = 480
const SHIP_W = 36
const SHIP_H = 16
const SHIP_SPEED = 4
const BULLET_SPEED = 8

let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
let bullets = []
const keys = {}

function shoot() {
  bullets.push({ x: ship.x + SHIP_W / 2 - 2, y: ship.y - 12, w: 4, h: 12 })
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ') shoot()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowLeft) ship.x -= SHIP_SPEED
  if (keys.ArrowRight) ship.x += SHIP_SPEED
  ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
