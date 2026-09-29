---
title: Through the sides
title_tr: Kenarlardan geç
skills: [game.state]
---

# --goal--

Like the real game, leaving one side brings you back on the other. When the player's middle goes past an edge, it
jumps by the width of the canvas.

# --goal-tr--

Gerçek oyundaki gibi, bir **kenardan** çıkan zıplayan **karşı kenardan** geri gelsin. Zıplayanın **ortası** bir kenarı
geçince, canvas'ın genişliği kadar öbür tarafa atlasın.

# --code--

```js
// Walking off one side brings you back on the other.
if (player.x + player.w / 2 < 0) player.x += canvas.width
if (player.x + player.w / 2 > canvas.width) player.x -= canvas.width
```

# --meaning--

- `player.x + player.w / 2` is the player's middle.
- Past the left edge, add the canvas width; past the right edge, subtract it.

# --meaning-tr--

- `player.x + player.w / 2` → zıplayanın **ortası** (sol kenar + yarım genişlik).
- `< 0` → ortası sol kenarı geçti: `+= canvas.width` ile sağa taşı.
- `> canvas.width` → ortası sağ kenarı geçti: sola taşı.
- Ortaya bakmamızın sebebi: kutunun yarısı dışarıdayken değil, **ortası** geçince atlasın; geçiş doğal görünsün.

# --task--

In `update`, under the steering lines, write the comment and the two lines.

# --task-tr--

`update` içinde yönlendirme satırlarının altına yorumu ve iki satırı yaz. **Çalıştır** ve bir kenardan çık.

# --tests--

Going past the left edge should bring the player back on the right.
tr: Sol kenarı geçmek zıplayanı sağdan geri getirmeli.

```js
player.x = -18
$.press('ArrowLeft')
update()
assert.strictEqual(player.x, -23 + 400)
```

Going past the right edge should bring it back on the left.
tr: Sağ kenarı geçmek soldan geri getirmeli.

```js
player.x = 378
$.press('ArrowRight')
update()
assert.strictEqual(player.x, 383 - 400)
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
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

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

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y, player.w, player.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
