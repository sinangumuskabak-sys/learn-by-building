---
title: Marching in step
title_tr: Adım adım yürüyüş
skills: [game.loop, game.state]
---

# --explanation--

The formation does not glide; it **steps**: every half second, all invaders jump 10 pixels sideways together. When the
formation reaches a side of the screen, the next step is **down** instead, and the direction flips.

The rule must look at the **edges of the living formation**, not at any single invader:

```js
const left = Math.min(...living.map((invader) => invader.x))
const right = Math.max(...living.map((invader) => invader.x + invader.w))
```

`Math.min(...array)` spreads the array into arguments, so it finds the smallest value in one call. Using the living
invaders matters later: when a whole side column has been shot away, the formation must keep marching until its new
edge touches the wall, just like the arcade original.

The whole group shares one direction, `dir`. Moving many objects as one unit by giving them a shared rule is how flocks,
armies and formations work in games.

# --explanation-tr--

Düzen kaymaz; **adım atar**: her yarım saniyede bütün istilacılar birlikte 10 piksel yana sıçrar. Düzen ekranın bir
yanına ulaşınca bir sonraki adım **aşağı** olur ve yön tersine döner.

Kural tek bir istilacıya değil, **canlı düzenin kenarlarına** bakmalı:

```js
const left = Math.min(...living.map((invader) => invader.x))
const right = Math.max(...living.map((invader) => invader.x + invader.w))
```

`Math.min(...dizi)` diziyi argümanlara yayar; böylece en küçük değeri tek çağrıda bulur. Canlı istilacıları kullanmak
ileride önemli: bir yandaki bütün sütun vurulup gidince, arcade orijinalindeki gibi düzen yeni kenarı duvara değene kadar
yürümeye devam etmeli.

Bütün grup tek bir yönü paylaşır, `dir`. Birçok nesneyi ortak bir kural vererek tek birim gibi hareket ettirmek, oyunlarda
sürülerin, orduların ve düzenlerin çalışma biçimidir.

# --task--

1. Add `let dir = 1` and `let lastStep = 0`, and `function stepInterval()` returning `500` for now.
2. Write `function march()`: find the living formation's `left` and `right` edges. If moving right and `right + 10`
   would pass `canvas.width - 10`, or moving left and `left - 10` would pass `10`, move every living invader down 16
   pixels and flip `dir`. Otherwise move every living invader `10 * dir` pixels sideways.
3. In `update()`, call `march()` whenever at least `stepInterval()` ms have passed since `lastStep` (then set
   `lastStep = now`).

# --task-tr--

1. `let dir = 1` ve `let lastStep = 0` ekle; şimdilik `500` döndüren `function stepInterval()` yaz.
2. `function march()` yaz: canlı düzenin `left` ve `right` kenarlarını bul. Sağa giderken `right + 10`
   `canvas.width - 10`'u geçecekse ya da sola giderken `left - 10` `10`'u geçecekse, her canlı istilacıyı 16 piksel
   aşağı indir ve `dir`'i çevir. Değilse her canlı istilacıyı `10 * dir` piksel yana taşı.
3. `update()` içinde `lastStep`'ten beri en az `stepInterval()` ms geçtiğinde `march()` çağır (sonra `lastStep = now`).

# --tests--

The formation should step 10 pixels sideways every 500 ms.
tr: Düzen her 500 ms'de 10 piksel yana adım atmalı.

```js
$.run(0.45)
assert.strictEqual(invaders[0].x, 40)
$.run(0.1)
assert.strictEqual(invaders[0].x, 50)
$.run(0.5)
assert.strictEqual(invaders[0].x, 60)
assert.strictEqual(invaders[0].y, 60)
```

At the right wall, the formation should step down and turn around.
tr: Sağ duvarda düzen aşağı inmeli ve geri dönmeli.

```js
for (const invader of invaders) invader.x += 50 // right edge now at 470, the wall is at 470
march()
assert.strictEqual(invaders[0].y, 76, 'stepped down')
assert.strictEqual(dir, -1)
march()
assert.strictEqual(invaders[0].x, 80, 'now marching left')
```

Only the living invaders should decide where the edge is.
tr: Kenarın nerede olduğuna yalnızca canlı istilacılar karar vermeli.

```js
for (const invader of invaders) if (invader.x === 392) invader.alive = false // the whole right column is gone
for (const invader of invaders) invader.x += 40
march()
assert.strictEqual(dir, 1, 'the new right edge (416) is not at the wall yet')
assert.strictEqual(invaders[0].x, 90)
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
