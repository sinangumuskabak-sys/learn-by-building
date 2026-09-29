---
title: The march
title_tr: Yürüyüş
skills: [game.state, game.loop]
---

# --goal--

The invaders march together in steps: 10 pixels sideways every half second. When the formation would pass an edge, it
steps down 16 pixels instead and turns around.

# --goal-tr--

İstilacılar **birlikte**, adım adım yürüsün: her yarım saniyede yana 10 piksel. Dizilişin kenarı ekranın kenarını
geçecekse, o adımda yana değil **16 piksel aşağı** insinler ve yön değiştirsinler. Klasik istila yürüyüşü.

# --code--

```js
let dir = 1 // +1 marching right, -1 marching left
let lastStep = 0

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

  if (now - lastStep >= stepInterval()) {
    lastStep = now
    march()
  }
```

# --meaning--

- `left` and `right` are the edges of the living formation (`...` spreads the list of positions into `Math.min`).
- If the next step would cross a 10-pixel margin, everyone moves down and `dir` flips; otherwise everyone moves sideways.
- `stepInterval` is 500 ms for now; it will change later.

# --meaning-tr--

- `dir` → yön: 1 sağa, -1 sola. `lastStep` → son adımın zamanı.
- `living.map((invader) => invader.x)` → yaşayanların x'lerinin listesi; `Math.min(...liste)` en küçüğü. `...` listeyi
  tek tek sayılara **yayar**. Böylece dizilişin sol ve sağ kenarı bulunur.
- `(dir > 0 && right + 10 > canvas.width - 10) || (dir < 0 && left - 10 < 10)` → sağa giderken bir sonraki adım sağ
  kenara 10 pikselden yaklaşacaksa **veya** sola giderken sol kenara: aşağı in (`y += 16`) ve `dir = -dir` ile dön.
- Değilse herkes `10 * dir` piksel yana.
- `update`'te: son adımdan beri `stepInterval()` kadar zaman geçtiyse bir adım at. Aralığı bir fonksiyondan alıyoruz;
  ileride hızlanacak.

# --task--

1. Under the invader loop, write `dir` and `lastStep`.
2. Under `shoot`, write `stepInterval` and `march`.
3. At the end of `update`, take a step when it is time.

# --task-tr--

1. İstilacıları kuran döngünün altına `dir` ve `lastStep` satırlarını yaz.
2. `shoot` fonksiyonunun altına `stepInterval` ve `march` fonksiyonlarını yaz.
3. `update`'in sonuna, bir boş satırdan sonra adım bloğunu yaz.
4. **Çalıştır**: istilacılar yürümeli.

# --tests--

The invaders should step 10 pixels sideways every 500 ms.
tr: İstilacılar her 500 ms'de yana 10 piksel adım atmalı.

```js
$.run(0.45)
assert.strictEqual(invaders[0].x, 40)
$.run(0.1)
assert.strictEqual(invaders[0].x, 50)
```

At the edge they should step down and turn around.
tr: Kenarda aşağı inip dönmeliler.

```js
for (const invader of invaders) invader.x += 70
march()
assert.strictEqual(invaders[0].y, 76)
assert.strictEqual(dir, -1)
march()
assert.strictEqual(invaders[0].x, 100)
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
