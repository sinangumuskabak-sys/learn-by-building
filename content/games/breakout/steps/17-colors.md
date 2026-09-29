---
title: A color for every row
title_tr: Her sıraya bir renk
skills: [prog.arrays]
---

# --goal--

Each row gets its own color from a list: red, orange, yellow, green, blue. The brick's `row` picks the color.

# --goal-tr--

Duvar tek renk olunca sıkıcı. Her sıraya ayrı bir renk verelim: kırmızı, turuncu, sarı, yeşil, mavi. Renkleri bir
**listede** tutacağız; her tuğla kendi sıra numarasıyla listeden rengini seçecek.

# --code--

```js
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']

    ctx.fillStyle = COLORS[brick.row]
```

# --meaning--

- `COLORS` is an array of five colors, one per row.
- `COLORS[brick.row]` reads the item at that index; counting starts at 0, so row 0 is red.

# --meaning-tr--

- `const COLORS = [...]` → beş renkten oluşan bir **liste**, her sıraya bir tane.
- `COLORS[brick.row]` → listenin `brick.row` numaralı elemanı. Sayma **0'dan** başlar: `COLORS[0]` kırmızı,
  `COLORS[1]` turuncu ... `COLORS[4]` mavi. Tuğla 3. sıradaysa (`row: 2`) sarı olur.

# --task--

1. Under the `const LEFT` line write `COLORS`.
2. In `draw`, replace `'#ef4444'` in the brick loop with `COLORS[brick.row]`.

# --task-tr--

1. `const LEFT = 10 ...` satırının altına `COLORS` listesini yaz.
2. `draw` içindeki tuğla döngüsünde `ctx.fillStyle = '#ef4444'` satırındaki `'#ef4444'` yerine `COLORS[brick.row]`
   yaz.
3. **Çalıştır**: gökkuşağı gibi 5 renkli bir duvar görmelisin.

# --try--

Swap two colors in the list and run: the rows swap colors too. Put them back.

# --try-tr--

Listede iki rengin yerini değiştir ve çalıştır: sıraların renkleri de yer değiştirir. Sonra geri al.

# --tests--

Each row should be drawn in its own color.
tr: Her sıra kendi renginde çizilmeli.

```js
$.tick()
assert.lengthOf($.rects('#ef4444'), 8)
assert.lengthOf($.rects('#f97316'), 8)
assert.lengthOf($.rects('#3b82f6'), 8)
assert.deepEqual($.rects('#3b82f6')[0], { x: 10, y: 138, w: 54, h: 18, color: '#3b82f6' })
```

# --solution--

```js
// Breakout, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 80
const PADDLE_H = 12
const PADDLE_Y = 370
const BALL_R = 7
const COLS = 8
const ROWS = 5
const BRICK_W = 54
const BRICK_H = 18
const GAP = 4
const TOP = 50
const LEFT = 10 // (480 - 8 bricks - 7 gaps) / 2, so the wall is centered
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']

let paddle = { x: 200 }
let ball
let bricks

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function resetBall() {
  ball = { x: 240, y: 200, vx: 3, vy: -4 }
}

function buildBricks() {
  bricks = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP + row * (BRICK_H + GAP), row, alive: true })
    }
  }
}

canvas.addEventListener('pointermove', (event) => {
  // Convert page coordinates to canvas pixels (the canvas may be displayed scaled).
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  paddle.x = clamp(x - PADDLE_W / 2, 0, canvas.width - PADDLE_W)
})

function update() {
  ball.x += ball.vx
  ball.y += ball.vy

  if (ball.x - BALL_R < 0 || ball.x + BALL_R > canvas.width) {
    ball.vx = -ball.vx
    ball.x = clamp(ball.x, BALL_R, canvas.width - BALL_R)
  }
  if (ball.y - BALL_R < 0) {
    ball.vy = Math.abs(ball.vy)
    ball.y = BALL_R
  }

  const onPaddle =
    ball.vy > 0 &&
    ball.y + BALL_R >= PADDLE_Y &&
    ball.y + BALL_R <= PADDLE_Y + PADDLE_H + ball.vy &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + PADDLE_W
  if (onPaddle) {
    // -1 at the paddle's left end, 0 in the middle, 1 at the right end
    const offset = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2)
    ball.vx = offset * 5
    ball.vy = -Math.abs(ball.vy)
    ball.y = PADDLE_Y - BALL_R
  }

  if (ball.y - BALL_R > canvas.height) resetBall()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const brick of bricks) {
    if (!brick.alive) continue
    ctx.fillStyle = COLORS[brick.row]
    ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H)
  }

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)

  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

buildBricks()
resetBall()
requestAnimationFrame(loop)
```
