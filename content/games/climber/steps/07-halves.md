---
title: Half here, half there
title_tr: Yarısı burada, yarısı orada
skills: [game.canvas]
---

# --goal--

While the player crosses an edge, part of it is off the canvas. Drawing it a second time, shifted by the canvas width,
shows that part on the other side.

# --goal-tr--

Zıplayan kenardan geçerken bir kısmı canvas'ın **dışında** kalıyor ve görünmüyor. Onu bir kez daha, canvas genişliği
kadar kaydırarak çizersek, dışarıda kalan kısım **öbür tarafta** görünür; geçiş kesintisiz olur.

# --code--

```js
// Half off one side: draw the other half on the far side.
if (player.x < 0) ctx.fillRect(player.x + canvas.width, player.y, player.w, player.h)
if (player.x + player.w > canvas.width) ctx.fillRect(player.x - canvas.width, player.y, player.w, player.h)
```

# --meaning--

- Sticking out on the left (`x < 0`): draw a copy one canvas width to the right; sticking out on the right: to the left.
- Whatever falls outside the canvas is simply not shown, so each copy shows exactly the missing part.

# --meaning-tr--

- `if (player.x < 0)` → sol kenardan taşıyor: bir kopyasını canvas genişliği kadar **sağa** çiz.
- `if (player.x + player.w > canvas.width)` → sağdan taşıyor: kopyası **sola**.
- Canvas'ın dışına düşen kısımlar zaten çizilmez; iki çizim birlikte tam bir kutu gibi görünür.

# --task--

In `draw`, under the player's `fillRect`, write the comment and the two lines.

# --task-tr--

`draw` içinde zıplayanı çizen satırın altına yorumu ve iki satırı yaz. **Çalıştır** ve kenardan geç.

# --tests--

A player sticking out on the left should also be drawn on the right.
tr: Soldan taşan zıplayan sağda da çizilmeli.

```js
player.x = -10
draw()
assert.sameDeepMembers($.rects('#f59e0b').map((r) => r.x), [-10, 390])
```

A player fully inside should be drawn once.
tr: Tamamen içerideki zıplayan bir kez çizilmeli.

```js
player.x = 100
draw()
assert.lengthOf($.rects('#f59e0b'), 1)
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
