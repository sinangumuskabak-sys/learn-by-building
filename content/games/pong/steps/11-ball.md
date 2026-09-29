---
title: The ball
title_tr: Top
skills: [game.canvas, game.state]
---

# --goal--

In the original Pong the ball is a small square. We keep its position in an object `ball`, in the middle of the court,
and draw it as a white 10×10 square.

# --goal-tr--

Orijinal Pong'da top yuvarlak değil, **küçük bir kare**! Biz de öyle yapacağız: 10×10 piksellik beyaz bir kare.

Topun yerini de bir nesnede tutuyoruz: `ball`. Sahanın tam ortasında başlıyor.

# --code--

```js
const BALL = 10 // the ball is a BALL×BALL square

let ball = { x: 295, y: 195 }

  ctx.fillRect(ball.x, ball.y, BALL, BALL)
```

# --meaning--

- `BALL` is the ball's size.
- (295, 195) is its top-left corner: 300 - 5 and 200 - 5, so its center is the middle of the court.
- The ball is drawn right after the paddles, in `draw`.

# --meaning-tr--

- `const BALL = 10` → topun eni ve boyu.
- `let ball = { x: 295, y: 195 }` → topun **sol üst köşesi**. Ortası (300, 200) olsun diye yarım top (5) geri: 295, 195.
- `ctx.fillRect(ball.x, ball.y, BALL, BALL)` → `draw` içinde, raketlerin altına: 10×10 beyaz kare.

# --task--

1. Under `PADDLE_SPEED`, write `BALL`.
2. Under the `right` line, write `ball`.
3. In `draw`, under the right paddle's `fillRect`, write the ball's `fillRect`.

# --task-tr--

1. `const PADDLE_SPEED = 6` satırının altına `BALL` satırını yaz.
2. `let right = ...` satırının altına `let ball = ...` yaz (`const keys` onun altında kalsın).
3. `draw` içinde sağ raketi çizen satırın **altına** topu çizen satırı yaz.
4. **Çalıştır**: sahanın ortasında küçük beyaz bir kare görmelisin.

# --tests--

The ball should start in the middle.
tr: Top ortada başlamalı.

```js
assert.strictEqual(BALL, 10)
assert.include(ball, { x: 295, y: 195 })
```

The ball should be drawn as a white 10×10 square.
tr: Top beyaz 10×10 bir kare olarak çizilmeli.

```js
$.tick()
const squares = $.rects('white').filter((r) => r.w === 10 && r.h === 10)
assert.deepEqual(squares, [{ x: 295, y: 195, w: 10, h: 10, color: 'white' }])
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
let ball = { x: 295, y: 195 }
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
