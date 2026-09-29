---
title: Show the score
title_tr: Skoru göster
skills: [game.canvas]
---

# --goal--

The scores go on the screen, big, one on each half of the court, like the classic Pong.

# --goal-tr--

Skorlar ekrana gelsin: **büyük** rakamlarla, sahanın her yarısının ortasında bir tane; tıpkı klasik Pong gibi.

# --code--

```js
ctx.font = '48px monospace'
ctx.textAlign = 'center'
ctx.fillText(String(left.score), canvas.width / 4, 60)
ctx.fillText(String(right.score), (canvas.width * 3) / 4, 60)
```

# --meaning--

- `monospace` is a font where every character is the same width, like old computer screens.
- `canvas.width / 4` is the middle of the left half; `(canvas.width * 3) / 4` the middle of the right half.
- `String(...)` turns the number into text for `fillText`.

# --meaning-tr--

- `ctx.font = '48px monospace'` → 48 piksel, **eşit genişlikli** bir yazı tipi: eski bilgisayar ekranlarındaki gibi.
- `ctx.textAlign = 'center'` → yazı verilen noktaya ortalanır.
- `canvas.width / 4` → sol yarının ortası (600'ün dörtte biri = 150). `(canvas.width * 3) / 4` → sağ yarının ortası
  (450).
- `String(left.score)` → sayıyı yazıya çevirir.
- `60` → yazının taban çizgisi, yukarıdan 60 piksel.

# --task--

At the end of `draw`, under the ball line, leave an empty line and write the four lines.

# --task-tr--

`draw` fonksiyonunun sonunda, topu çizen satırın altına bir boş satır bırak ve dört satırı yaz. **Çalıştır**.

# --tests--

Both scores should be drawn.
tr: İki skor da çizilmeli.

```js
left.score = 3
right.score = 1
$.tick()
assert.include($.texts(), '3')
assert.include($.texts(), '1')
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

let left = { x: 20, y: 160, score: 0 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }
let ball
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

function serve(direction) {
  ball = {
    x: canvas.width / 2 - BALL / 2,
    y: canvas.height / 2 - BALL / 2,
    vx: 4 * direction,
    vy: Math.random() < 0.5 ? -3 : 3,
  }
}

function point(winner) {
  winner.score += 1
  // Serve toward the player who just lost the point.
  serve(winner === left ? 1 : -1)
}

function touches(paddle) {
  return (
    ball.x < paddle.x + PADDLE_W &&
    ball.x + BALL > paddle.x &&
    ball.y < paddle.y + PADDLE_H &&
    ball.y + BALL > paddle.y
  )
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
  if (ball.vx < 0 && touches(left)) {
    ball.vx = -ball.vx
    ball.x = left.x + PADDLE_W
  }
  if (ball.vx > 0 && touches(right)) {
    ball.vx = -ball.vx
    ball.x = right.x - BALL
  }

  if (ball.x + BALL < 0) point(right)
  else if (ball.x > canvas.width) point(left)
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

  ctx.font = '48px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(String(left.score), canvas.width / 4, 60)
  ctx.fillText(String(right.score), (canvas.width * 3) / 4, 60)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

serve(1)
requestAnimationFrame(loop)
```
