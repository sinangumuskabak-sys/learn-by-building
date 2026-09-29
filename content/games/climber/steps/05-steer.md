---
title: Steer left and right
title_tr: Sağa sola yönlendir
skills: [game.input]
---

# --goal--

While bouncing, the arrow keys move the player sideways. A `keys` object remembers which keys are held down, and every
frame the player moves 5 pixels toward the held arrow.

# --goal-tr--

Sekerken **ok tuşları** zıplayanı yana kaydırsın. Bir `keys` (tuşlar) nesnesi hangi tuşların **basılı** olduğunu
hatırlasın; her karede zıplayan basılı oka doğru 5 piksel kaysın.

# --code--

```js
const SPEED = 5 // sideways pixels per frame

const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

  const direction = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  player.x += direction * SPEED
```

# --meaning--

- `keys[event.key] = true` on press and `false` on release: `keys.ArrowLeft` says whether that key is held right now.
- `direction` is 1 for right, -1 for left, 0 for none or both.
- `preventDefault` stops the arrows from scrolling the page.

# --meaning-tr--

- `keys[event.key] = true` → basılan tuşun **adıyla** bir alan: `keys.ArrowLeft = true`. Bırakınca `false`. Böylece bir
  tuşun **şu anda** basılı olup olmadığını biliriz.
- `(keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)` → sağ basılıysa 1, sol basılıysa -1, ikisi de ya da hiçbiri
  basılı değilse 0.
- `player.x += direction * SPEED` → o yöne 5 piksel.
- `event.preventDefault()` → ok tuşları sayfayı kaydırmasın.

# --task--

1. Under `JUMP`, write `SPEED`.
2. Under `player`, write `keys` and the two key listeners.
3. At the top of `update`, write the two steering lines.

# --task-tr--

1. `JUMP` satırının altına `SPEED` satırını yaz.
2. `player` satırının altına `keys` nesnesini ve iki tuş dinleyicisini yaz.
3. `update`'in **en üstüne** iki yönlendirme satırını ve bir boş satır yaz.
4. **Çalıştır**, oyuna tıkla ve oklarla yönlendir.

# --tests--

Holding an arrow should move the player 5 pixels each frame that way.
tr: Bir oku basılı tutmak zıplayanı her karede o yöne 5 piksel kaydırmalı.

```js
$.press('ArrowRight')
update()
assert.strictEqual(player.x, 185)
$.release('ArrowRight')
$.press('ArrowLeft')
update()
update()
assert.strictEqual(player.x, 175)
```

Letting go should stop the sideways move.
tr: Bırakınca yana kayma durmalı.

```js
$.press('ArrowLeft')
$.release('ArrowLeft')
update()
assert.strictEqual(player.x, 180)
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
