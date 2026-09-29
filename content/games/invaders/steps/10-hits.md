---
title: Hit!
title_tr: Vurdun!
skills: [game.collision]
---

# --goal--

A bullet that overlaps a living invader destroys it and is used up. `overlaps` is the classic check for two boxes.

# --goal-tr--

Yaşayan bir istilacıya **değen** mermi onu yok etsin ve kendisi de harcansın. İki kutunun üst üste binip binmediğini
söyleyen klasik bir fonksiyon yazıyoruz: `overlaps` (çakışıyor mu).

# --code--

```js
function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

  for (const bullet of bullets) {
    const hit = invaders.find((invader) => invader.alive && overlaps(bullet, invader))
    if (hit) {
      hit.alive = false
      bullet.y = -100 // used up; removed below
    }
  }
```

# --meaning--

- Two boxes overlap when each starts before the other ends, both sideways and up/down.
- `find` gives the first living invader the bullet touches.
- The hit invader is marked dead; the bullet is moved off the screen, so the `filter` below drops it.

# --meaning-tr--

- `overlaps(a, b)` → dört karşılaştırma, hepsi doğru olmalı: `a`'nın solu `b`'nin sağından önce, `a`'nın sağı `b`'nin
  solundan sonra; üst ve alt için de aynısı.
- `invaders.find((invader) => invader.alive && overlaps(bullet, invader))` → mermiye değen **ilk** yaşayan istilacı.
- `hit.alive = false` → artık ölü: çizilmez, vurulmaz.
- `bullet.y = -100` → mermiyi ekranın üstüne at; hemen alttaki `filter` onu listeden çıkarır. Döngü sürerken listeden
  silmek yerine böyle işaretlemek daha güvenli.

# --task--

1. Above `alive`, write `overlaps`.
2. In `update`, between moving and filtering the bullets, write the hits loop.

# --task-tr--

1. `alive` fonksiyonunun üstüne `overlaps` fonksiyonunu yaz.
2. `update` içinde mermileri hareket ettiren satır ile süzen satırın arasına, bir boş satırdan sonra vuruş döngüsünü yaz.
3. **Çalıştır** ve istilacıları vur.

# --tests--

A bullet touching an invader should destroy it and be used up.
tr: İstilacıya değen mermi onu yok etmeli ve harcanmalı.

```js
bullets = [{ x: 50, y: 80, w: 4, h: 12 }]
update()
assert.isFalse(invaders[0].alive)
assert.lengthOf(bullets, 0)
```

A bullet between invaders should fly on.
tr: İstilacıların arasındaki mermi uçmaya devam etmeli.

```js
bullets = [{ x: 72, y: 80, w: 4, h: 12 }]
update()
assert.lengthOf(bullets, 1)
assert.strictEqual(alive().length, 45)
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
const COOLDOWN = 350 // milliseconds between shots
const ROWS = 5
const COLS = 9
const INVADER_W = 28
const INVADER_H = 20
const SPACING_X = 44
const SPACING_Y = 36
const ROW_COLORS = ['#f472b6', '#a78bfa', '#a78bfa', '#34d399', '#34d399']

let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
let bullets = []
let lastShot = -COOLDOWN
let invaders = []
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    invaders.push({ x: 40 + col * SPACING_X, y: 60 + row * SPACING_Y, w: INVADER_W, h: INVADER_H, row, alive: true })
  }
}
let dir = 1 // +1 marching right, -1 marching left
let lastStep = 0
let now = 0
const keys = {}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function alive() {
  return invaders.filter((invader) => invader.alive)
}

function shoot() {
  if (now - lastShot < COOLDOWN) return
  lastShot = now
  bullets.push({ x: ship.x + SHIP_W / 2 - 2, y: ship.y - 12, w: 4, h: 12 })
}

function stepInterval() {
  return 500
}

function march() {
  const living = alive()
  const left = Math.min(...living.map((invader) => invader.x))
  const right = Math.max(...living.map((invader) => invader.x + invader.w))
  if ((dir > 0 && right + 10 > canvas.width - 10) || (dir < 0 && left - 10 < 10)) {
    for (const invader of living) invader.y += 16
    dir = -dir
  } else {
    for (const invader of living) invader.x += 10 * dir
  }
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

  for (const bullet of bullets) bullet.y -= BULLET_SPEED

  for (const bullet of bullets) {
    const hit = invaders.find((invader) => invader.alive && overlaps(bullet, invader))
    if (hit) {
      hit.alive = false
      bullet.y = -100 // used up; removed below
    }
  }
  bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)

  if (now - lastStep >= stepInterval()) {
    lastStep = now
    march()
  }
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const invader of alive()) {
    ctx.fillStyle = ROW_COLORS[invader.row]
    ctx.fillRect(invader.x, invader.y, invader.w, invader.h)
  }

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)

  ctx.fillStyle = '#f8fafc'
  for (const bullet of bullets) ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h)
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
