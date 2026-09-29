---
title: How hard should it be?
title_tr: Ne kadar zor olsun?
skills: [prog.functions]
---

# --goal--

The higher you climb, the harder it should get. `difficulty` turns a world height into a number from 0 (the start) to 1
(10 000 pixels up).

# --goal-tr--

Yükseldikçe oyun **zorlaşmalı**. `difficulty` (zorluk) fonksiyonu bir dünya yüksekliğini 0 (başlangıç) ile 1 (10 000
piksel yukarı) arasında bir sayıya çevirsin. Sonraki adımlarda platform aralıklarını ve türlerini bu sayıya göre
seçeceğiz.

# --code--

```js
const START_Y = 500 // world y of the first platform

// 0 at the start, growing to 1 after climbing 10000 pixels.
function difficulty(y) {
  return Math.min(1, (START_Y - y) / 10000)
}
```

# --meaning--

- `START_Y - y` is how far above the first platform the height `y` is.
- Divided by 10 000 it grows from 0; `Math.min(1, ...)` stops it at 1.

# --meaning-tr--

- `START_Y - y` → `y` yüksekliği ilk platformun ne kadar üstünde (yukarısı eksi y olduğu için çıkarma böyle).
- `/ 10000` → 10 000 piksel yukarıda 1 olur; `Math.min(1, ...)` onu 1'de tutar.

# --task--

1. Under `SPEED`, write `START_Y`.
2. Above the `keydown` listener, write the comment and `difficulty`.

# --task-tr--

1. `SPEED` satırının altına `START_Y` satırını yaz.
2. `keydown` dinleyicisinin **üstüne** yorumu ve `difficulty` fonksiyonunu yaz (arada bir boş satır).
3. **Çalıştır**.

# --tests--

`difficulty` should go from 0 at the start to 1 at 10 000 pixels up.
tr: `difficulty` başlangıçta 0'dan 10 000 piksel yukarıda 1'e gitmeli.

```js
assert.strictEqual(difficulty(500), 0)
assert.strictEqual(difficulty(500 - 5000), 0.5)
assert.strictEqual(difficulty(500 - 20000), 1)
```

# --solution--

```js
// Doodle Jump-style climber, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.35
const JUMP = -11 // every bounce starts with this speed (negative = up)
const SPEED = 5 // sideways pixels per frame
const START_Y = 500 // world y of the first platform
const FLOOR = 600 // the bottom of the canvas

let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }
const platforms = [
  { x: 170, y: 500, w: 60, h: 12 },
  { x: 50, y: 410, w: 60, h: 12 },
  { x: 250, y: 320, w: 60, h: 12 },
  { x: 120, y: 230, w: 60, h: 12 },
  { x: 290, y: 140, w: 60, h: 12 },
  { x: 30, y: 60, w: 60, h: 12 },
]
let cameraY = 0 // the world y shown at the top of the screen: the camera
const keys = {}

// 0 at the start, growing to 1 after climbing 10000 pixels.
function difficulty(y) {
  return Math.min(1, (START_Y - y) / 10000)
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

// Touch: hold the left or right half of the game to steer.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const left = event.clientX - rect.left < rect.width / 2
  keys[left ? 'ArrowLeft' : 'ArrowRight'] = true
})
function stopSteering() {
  keys.ArrowLeft = false
  keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopSteering)
canvas.addEventListener('pointercancel', stopSteering)

function update() {
  const direction = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  player.x += direction * SPEED
  // Walking off one side brings you back on the other.
  if (player.x + player.w / 2 < 0) player.x += canvas.width
  if (player.x + player.w / 2 > canvas.width) player.x -= canvas.width

  const oldBottom = player.y + player.h
  player.vy += GRAVITY
  player.y += player.vy
  const bottom = player.y + player.h

  // Platforms only catch you on the way down, when your feet cross their top in this frame.
  if (player.vy > 0) {
    for (const p of platforms) {
      const over = player.x + player.w - 8 > p.x && player.x + 8 < p.x + p.w
      if (over && oldBottom <= p.y && bottom >= p.y) {
        player.y = p.y - player.h
        player.vy = JUMP
        break
      }
    }
  }

  // The camera only ever moves up, keeping the player in the upper part of the screen.
  if (player.y < cameraY + 200) cameraY = player.y - 200

  // For now the floor still bounces you back up.
  if (player.y + player.h >= FLOOR) {
    player.y = FLOOR - player.h
    player.vy = JUMP
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Faint lines fixed to the world, so you can see the climb even between platforms.
  ctx.fillStyle = '#e2e8f0'
  for (let y = ((-cameraY % 40) + 40) % 40; y < canvas.height; y += 40) ctx.fillRect(0, y, canvas.width, 1)

  ctx.fillStyle = '#16a34a'
  for (const p of platforms) {
    ctx.fillRect(p.x, p.y - cameraY, p.w, p.h)
  }

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y - cameraY, player.w, player.h)
  // Half off one side: draw the other half on the far side.
  if (player.x < 0) ctx.fillRect(player.x + canvas.width, player.y - cameraY, player.w, player.h)
  if (player.x + player.w > canvas.width) ctx.fillRect(player.x - canvas.width, player.y - cameraY, player.w, player.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
