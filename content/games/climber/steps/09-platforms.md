---
title: Platforms
title_tr: Platformlar
skills: [prog.arrays]
---

# --goal--

Six green platforms, one above the other, in a list. They are only drawn for now; the player falls through them.

# --goal-tr--

Altı yeşil **platform**, üst üste, bir **listede**. Şimdilik yalnız çiziliyorlar; zıplayan içlerinden geçip gidiyor.
Üstlerine konmayı sonraki adımda öğreteceğiz.

# --code--

```js
const platforms = [
  { x: 170, y: 500, w: 60, h: 12 },
  { x: 50, y: 410, w: 60, h: 12 },
  { x: 250, y: 320, w: 60, h: 12 },
  { x: 120, y: 230, w: 60, h: 12 },
  { x: 290, y: 140, w: 60, h: 12 },
  { x: 30, y: 60, w: 60, h: 12 },
]

  ctx.fillStyle = '#16a34a'
  for (const p of platforms) {
    ctx.fillRect(p.x, p.y, p.w, p.h)
  }
```

# --meaning--

- Each platform is a 60×12 box; each is 90 pixels above the one before, well within a bounce.
- They are drawn before the player, so the player is drawn on top.

# --meaning-tr--

- Her platform 60×12'lik bir kutu. Her biri bir öncekinden **90 piksel** yukarıda: bir sekişin (~170 piksel) rahatça
  ulaşacağı kadar.
- `for (const p of platforms)` → her platformu yeşil çiz. Zıplayandan **önce** çizildikleri için zıplayan üstlerinde
  görünür.

# --task--

1. Under `player`, write the `platforms` list.
2. In `draw`, after the background, draw the platforms.

# --task-tr--

1. `player` satırının altına `platforms` listesini yaz.
2. `draw` içinde arka plandan sonra, zıplayandan önce platform döngüsünü yaz.
3. **Çalıştır**.

# --tests--

Six green platforms should be drawn.
tr: Altı yeşil platform çizilmeli.

```js
$.tick()
const drawn = $.rects('#16a34a')
assert.lengthOf(drawn, 6)
assert.deepEqual(drawn[0], { x: 170, y: 500, w: 60, h: 12, color: '#16a34a' })
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
const keys = {}

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

  player.vy += GRAVITY
  player.y += player.vy
  // Touching the floor starts the next bounce.
  if (player.y + player.h >= FLOOR) {
    player.y = FLOOR - player.h
    player.vy = JUMP
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#16a34a'
  for (const p of platforms) {
    ctx.fillRect(p.x, p.y, p.w, p.h)
  }

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y, player.w, player.h)
  // Half off one side: draw the other half on the far side.
  if (player.x < 0) ctx.fillRect(player.x + canvas.width, player.y, player.w, player.h)
  if (player.x + player.w > canvas.width) ctx.fillRect(player.x - canvas.width, player.y, player.w, player.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
