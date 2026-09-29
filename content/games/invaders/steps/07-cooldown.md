---
title: A short reload
title_tr: Kısa bir dolum
skills: [game.state, game.loop]
---

# --goal--

Holding Space should not fire a stream of bullets. After a shot, the next one can only come 350 milliseconds later.
We keep the time of each frame in `now` and the time of the last shot in `lastShot`.

# --goal-tr--

Boşluk'a art arda basmak mermi **yağmuru** yapmasın. Bir atıştan sonra sıradaki ancak **350 milisaniye** sonra
gelebilsin; buna dolum süresi (cooldown) denir. Her karenin zamanını `now`'da, son atışın zamanını `lastShot`'ta
tutuyoruz.

# --code--

```js
const COOLDOWN = 350 // milliseconds between shots
let lastShot = -COOLDOWN
let now = 0

  if (now - lastShot < COOLDOWN) return
  lastShot = now

function loop(time) {
  now = time
```

# --meaning--

- `loop` receives the time from the browser and keeps it in `now`.
- A shot is refused while less than 350 ms have passed since the last one.
- `lastShot` starts at -350, so the very first shot is allowed at once.

# --meaning-tr--

- `function loop(time)` → tarayıcı zamanı (ms) verir; `now = time` onu saklar.
- `if (now - lastShot < COOLDOWN) return` → son atıştan beri 350 ms geçmediyse **ateş etme**.
- `lastShot = now` → atış zamanını kaydet.
- `let lastShot = -COOLDOWN` → -350 ile başlar, böylece **ilk** atış hemen yapılabilir.

# --task--

1. Under `BULLET_SPEED`, write `COOLDOWN`; under `bullets`, write `lastShot` and `now`.
2. At the top of `shoot`, write the two cooldown lines.
3. Give `loop` the `time` parameter and keep it in `now`.

# --task-tr--

1. `BULLET_SPEED` satırının altına `COOLDOWN`, `let bullets = []` satırının altına `lastShot` ve `now` yaz.
2. `shoot`'un en üstüne iki dolum satırını yaz.
3. `loop`'u `function loop(time)` yap ve ilk satırına `now = time` yaz.
4. **Çalıştır** ve Boşluk'a hızlı hızlı bas.

# --tests--

A second shot right after the first should be refused.
tr: İlkinin hemen ardından ikinci atış reddedilmeli.

```js
$.tick()
$.tap(' ')
$.tap(' ')
assert.lengthOf(bullets, 1)
```

After 350 ms the next shot should work.
tr: 350 ms sonra sıradaki atış çalışmalı.

```js
$.tick()
$.tap(' ')
$.run(0.4)
$.tap(' ')
assert.lengthOf(bullets, 2)
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

let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
let bullets = []
let lastShot = -COOLDOWN
let now = 0
const keys = {}

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
