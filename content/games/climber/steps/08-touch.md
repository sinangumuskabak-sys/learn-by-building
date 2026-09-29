---
title: Touch steering
title_tr: Dokunarak yönlendir
skills: [game.input]
---

# --goal--

On a phone: holding a finger on the left half steers left, on the right half steers right. The touch simply "holds" the
matching arrow key in `keys`, so `update` needs no change.

# --goal-tr--

Telefonda: parmağı ekranın **sol yarısında** tutmak sola, **sağ yarısında** tutmak sağa yönlendirsin. İşin güzeli,
dokunuş `keys` içinde ilgili ok tuşunu "basılı" yapıyor; `update`'i hiç değiştirmemize gerek yok.

# --code--

```js
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
```

# --meaning--

- `left` is true when the touch is in the left half of the canvas as shown on screen.
- Lifting the finger (or the browser cancelling the touch) lets go of both arrows.

# --meaning-tr--

- `event.clientX - rect.left < rect.width / 2` → dokunuş canvas'ın (ekranda göründüğü hâliyle) sol yarısında mı?
- `keys[left ? 'ArrowLeft' : 'ArrowRight'] = true` → o tarafın ok tuşunu "basılı" yap.
- `stopSteering` → iki oku da bırak. Parmak kalkınca (`pointerup`) ya da tarayıcı dokunuşu iptal edince
  (`pointercancel`, ör. bir bildirim gelince) çalışır.

# --task--

Under the `keyup` listener, write the touch listeners.

# --task-tr--

`keyup` dinleyicisinin altına bir boş satır bırakıp yorumu ve dokunma satırlarını yaz. **Çalıştır**.

# --tests--

Holding the left half should steer left until the finger lifts.
tr: Sol yarıyı basılı tutmak parmak kalkana kadar sola yönlendirmeli.

```js
$.pointerDown(50, 300)
update()
assert.strictEqual(player.x, 175)
$.pointerUp(50, 300)
update()
assert.strictEqual(player.x, 175)
```

Holding the right half should steer right.
tr: Sağ yarıyı basılı tutmak sağa yönlendirmeli.

```js
$.pointerDown(350, 300)
update()
assert.strictEqual(player.x, 185)
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
