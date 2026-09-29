---
title: Bullets fly
title_tr: Mermiler uçuyor
skills: [game.physics]
---

# --goal--

Every frame each bullet rises 8 pixels; bullets gone off the top are dropped. They are drawn white.

# --goal-tr--

Her karede her mermi **8 piksel yükselsin**; ekranın üstünden çıkanlar listeden atılsın. Mermiler beyaz çizilsin.

# --code--

```js
for (const bullet of bullets) bullet.y -= BULLET_SPEED
bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)

ctx.fillStyle = '#f8fafc'
for (const bullet of bullets) ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h)
```

# --meaning--

- `y -= 8` moves up (y grows downward).
- `filter` keeps only bullets whose bottom (`y + h`) is still below the top of the screen.

# --meaning-tr--

- `bullet.y -= BULLET_SPEED` → yukarı 8 piksel (y aşağı doğru büyür, yukarı gitmek azaltmak demek).
- `bullets.filter((bullet) => bullet.y + bullet.h > 0)` → **alt kenarı** hâlâ ekranda olanları tut; tamamen çıkanları
  unut.
- `for (...) ctx.fillRect(...)` → her mermiyi çiz. Tek satırlık gövdede süslü paranteze gerek yok.

# --task--

1. At the end of `update`, move and filter the bullets.
2. At the end of `draw`, draw them.

# --task-tr--

1. `update`'in sonuna, bir boş satırdan sonra mermileri hareket ettiren ve süzen iki satırı yaz.
2. `draw`'ın sonuna mermileri çizen iki satırı yaz.
3. **Çalıştır** ve Boşluk'a bas.

# --tests--

A bullet should rise 8 pixels a frame and be drawn.
tr: Mermi karede 8 piksel yükselmeli ve çizilmeli.

```js
$.tap(' ')
$.tick()
assert.strictEqual(bullets[0].y, 460)
assert.lengthOf($.rects('#f8fafc'), 1)
```

A bullet off the top should be dropped.
tr: Üstten çıkan mermi atılmalı.

```js
bullets = [{ x: 100, y: -5, w: 4, h: 12 }]
update()
assert.lengthOf(bullets, 0)
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

  for (const bullet of bullets) bullet.y -= BULLET_SPEED
  bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)

  ctx.fillStyle = '#f8fafc'
  for (const bullet of bullets) ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
