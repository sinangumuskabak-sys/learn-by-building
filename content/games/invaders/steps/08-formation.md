---
title: The invaders
title_tr: İstilacılar
skills: [prog.arrays, prog.loops]
---

# --goal--

Five rows of nine invaders, each row with its own color. Each invader remembers its row and whether it is still alive;
only the living ones are drawn.

# --goal-tr--

Beş sıra, her sırada dokuz **istilacı**; her sıranın kendi rengi var. Her istilacı hangi sırada olduğunu ve hâlâ
**yaşayıp** yaşamadığını hatırlıyor; yalnız yaşayanlar çiziliyor. İç içe iki döngüyle 45 istilacıyı kuruyoruz.

# --code--

```js
const ROWS = 5
const COLS = 9
const INVADER_W = 28
const INVADER_H = 20
const SPACING_X = 44
const SPACING_Y = 36
const ROW_COLORS = ['#f472b6', '#a78bfa', '#a78bfa', '#34d399', '#34d399']

let invaders = []
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    invaders.push({ x: 40 + col * SPACING_X, y: 60 + row * SPACING_Y, w: INVADER_W, h: INVADER_H, row, alive: true })
  }
}

function alive() {
  return invaders.filter((invader) => invader.alive)
}

  for (const invader of alive()) {
    ctx.fillStyle = ROW_COLORS[invader.row]
    ctx.fillRect(invader.x, invader.y, invader.w, invader.h)
  }
```

# --meaning--

- Each invader is placed `SPACING_X` apart sideways and `SPACING_Y` apart downward, starting at (40, 60).
- `row` (short for `row: row`) remembers its row, used for its color and later its points.
- `alive()` gives the invaders still alive.

# --meaning-tr--

- `SPACING_X = 44`, `SPACING_Y = 36` → istilacıların aralıkları (kendi boyları + boşluk).
- `for (let row ...)` içinde `for (let col ...)` → 5 × 9 = 45 tur.
- `x: 40 + col * SPACING_X` → soldan 40 pikselden başlayıp her sütunda 44 piksel sağa.
- `row` → `row: row`'un kısası: istilacı sırasını hatırlar (rengi ve ileride puanı için).
- `alive: true` → yaşıyor. Vurulunca `false` olacak; listeden silmek yerine işaretliyoruz.
- `alive()` → yaşayanları `filter` ile verir.
- `ROW_COLORS[invader.row]` → sırasına göre renk.

# --task--

1. Under `COOLDOWN`, write the invader constants and `ROW_COLORS`.
2. Under `lastShot`, build `invaders`.
3. Above `shoot`, write `alive`; in `draw`, draw the living invaders after the background.

# --task-tr--

1. `COOLDOWN` satırının altına istilacı sabitlerini ve `ROW_COLORS`'u yaz.
2. `let lastShot` satırının altına `invaders` listesini ve onu dolduran iç içe döngüleri yaz.
3. `shoot` fonksiyonunun üstüne `alive` fonksiyonunu yaz; `draw`'da arka plandan sonra istilacı döngüsünü yaz.
4. **Çalıştır**.

# --tests--

There should be 45 invaders in 5 rows of 9, all alive.
tr: 5 sıra 9'dan 45 istilacı olmalı; hepsi canlı.

```js
assert.lengthOf(invaders, 45)
assert.deepEqual(invaders[0], { x: 40, y: 60, w: 28, h: 20, row: 0, alive: true })
assert.deepEqual(invaders[44], { x: 40 + 8 * 44, y: 60 + 4 * 36, w: 28, h: 20, row: 4, alive: true })
```

Only living invaders should be drawn, in their row's color.
tr: Yalnız yaşayan istilacılar sırasının renginde çizilmeli.

```js
invaders[0].alive = false
$.tick()
assert.lengthOf($.rects('#f472b6'), 8)
assert.lengthOf($.rects('#34d399'), 18)
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
let now = 0
const keys = {}

function alive() {
  return invaders.filter((invader) => invader.alive)
}

function shoot() {
  if (now - lastShot < COOLDOWN) return
  lastShot = now
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
