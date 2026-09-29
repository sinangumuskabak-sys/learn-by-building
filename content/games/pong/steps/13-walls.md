---
title: Bounce off the top and bottom
title_tr: Üstten ve alttan sek
skills: [game.physics, game.collision]
---

# --goal--

When the ball leaves the court at the top or bottom, it bounces: the vertical speed flips sign, and the ball is put
back inside so it cannot get stuck in the wall.

# --goal-tr--

Top üst ya da alt kenara değince **sekmeli**. Sekmek çok basit: dikey hızın **işaretini çevir**. Aşağı gidiyorsa (+3)
yukarı gitsin (−3), yukarı gidiyorsa aşağı. Duvara atılan bir top gibi.

Bir de küçük bir güvenlik: top duvarın içine girmişse onu sahaya geri koyarız; yoksa bazen duvarda takılıp titrer.

# --code--

```js
if (ball.y < 0 || ball.y + BALL > canvas.height) {
  ball.vy = -ball.vy
  ball.y = clamp(ball.y, 0, canvas.height - BALL)
}
```

# --meaning--

- `ball.y < 0` means the top edge went above the court; `ball.y + BALL > canvas.height` the bottom edge went below it.
  `||` means "or".
- `ball.vy = -ball.vy` flips the direction.
- `clamp` puts the ball back inside the court.

# --meaning-tr--

- `ball.y < 0` → topun üst kenarı tavanı geçti mi?
- `ball.y + BALL > canvas.height` → topun **alt kenarı** (y + 10) zemini geçti mi?
- `||` → "**veya**": biri doğruysa yeter.
- `ball.vy = -ball.vy` → eksi işareti sayıyı ters çevirir: 3 → −3, −3 → 3. Top yön değiştirir.
- `ball.y = clamp(ball.y, 0, canvas.height - BALL)` → önceki adımdaki `clamp`: topu 0 ile 390 arasına geri koy.

# --task--

At the end of `update`, under the two ball lines, write the `if` block.

# --task-tr--

`update` içinde topu hareket ettiren iki satırın **altına** `if` bloğunu yaz. **Çalıştır**: top alttan ve üstten sekmeli, sonra yandan çıkıp gitmeli (raketleri sonra ekleyeceğiz).

# --hint--

The bottom edge of the ball is `ball.y + BALL`, not `ball.y`.

# --hint-tr--

Topun alt kenarı `ball.y` değil, `ball.y + BALL`.

# --tests--

The ball should bounce off the bottom edge without going through it.
tr: Top alt kenardan içinden geçmeden sekmeli.

```js
ball = { x: 100, y: 388, vx: 4, vy: 3 }
update()
assert.strictEqual(ball.vy, -3)
assert.isAtMost(ball.y + BALL, 400)
update()
assert.isBelow(ball.y, 390, 'it should now move up')
```

The ball should bounce off the top edge.
tr: Top üst kenardan sekmeli.

```js
ball = { x: 100, y: 2, vx: 4, vy: -3 }
update()
assert.strictEqual(ball.vy, 3)
assert.isAtLeast(ball.y, 0)
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 10
const PADDLE_H = 80
const PADDLE_SPEED = 6
const BALL = 10 // the ball is a BALL×BALL square

let left = { x: 20, y: 160 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }
let ball = { x: 295, y: 195, vx: 4, vy: 3 }
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function update() {
  if (keys.w) left.y -= PADDLE_SPEED
  if (keys.s) left.y += PADDLE_SPEED
  if (keys.ArrowUp) right.y -= PADDLE_SPEED
  if (keys.ArrowDown) right.y += PADDLE_SPEED
  left.y = clamp(left.y, 0, canvas.height - PADDLE_H)
  right.y = clamp(right.y, 0, canvas.height - PADDLE_H)

  ball.x += ball.vx
  ball.y += ball.vy
  if (ball.y < 0 || ball.y + BALL > canvas.height) {
    ball.vy = -ball.vy
    ball.y = clamp(ball.y, 0, canvas.height - BALL)
  }
}

function draw() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
  }

  ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)
  ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)
  ctx.fillRect(ball.x, ball.y, BALL, BALL)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
