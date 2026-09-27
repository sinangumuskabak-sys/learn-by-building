---
title: A wall of bricks
title_tr: Tuğla duvarı
skills: [prog.loops, prog.arrays]
---

# --explanation--

The wall is 5 rows of 8 bricks. Rather than list 40 positions by hand, **compute** them with two loops, one inside the
other. The outer loop walks the rows; for each row, the inner loop walks the columns:

```js
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP + row * (BRICK_H + GAP), row, alive: true })
  }
}
```

Each step to the right adds one brick width plus a gap; each row down adds one brick height plus a gap. `{ row }` is
shorthand for `{ row: row }`.

Where does `LEFT = 10` come from? Eight bricks and seven gaps take `8 × 54 + 7 × 4 = 460` pixels, which leaves 20 of
the 480 for the two margins: 10 each, so the wall is centered. Working numbers like this out once, and writing them
as named constants, beats nudging pixels until it looks right.

Bricks carry an `alive` flag instead of being deleted right away, and the drawing code simply skips dead ones. The
color comes from a list indexed by the row: `COLORS[brick.row]`.

# --explanation-tr--

Duvar 8 tuğlalık 5 sıradan oluşuyor. 40 konumu elle yazmak yerine onları biri diğerinin içinde iki döngüyle
**hesapla**. Dış döngü sıraları, her sıra için iç döngü sütunları gezer:

```js
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP + row * (BRICK_H + GAP), row, alive: true })
  }
}
```

Sağa her adım bir tuğla genişliği artı bir boşluk ekler; aşağı her sıra bir tuğla yüksekliği artı bir boşluk. `{ row }`,
`{ row: row }`'un kısaltmasıdır.

`LEFT = 10` nereden geliyor? Sekiz tuğla ve yedi boşluk `8 × 54 + 7 × 4 = 460` piksel tutar; 480'in 20'si iki kenar
payına kalır: her biri 10, böylece duvar ortalanır. Böyle sayıları bir kez hesaplayıp adlı sabitler olarak yazmak,
doğru görünene kadar pikselleri itip kakmaktan iyidir.

Tuğlalar hemen silinmek yerine bir `alive` bayrağı taşır; çizim kodu da ölüleri atlar. Renk, sıraya göre indekslenen
bir listeden gelir: `COLORS[brick.row]`.

# --task--

1. Add constants `COLS = 8`, `ROWS = 5`, `BRICK_W = 54`, `BRICK_H = 18`, `GAP = 4`, `TOP = 50`, `LEFT = 10` and
   `COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']` (one per row).
2. Add `let bricks` and `function buildBricks()` that fills it with the 40 bricks as above (row by row, left to right).
   Call it at startup.
3. In `draw()`, draw every brick that is `alive` in `COLORS[brick.row]`, `BRICK_W` × `BRICK_H`.

# --task-tr--

1. `COLS = 8`, `ROWS = 5`, `BRICK_W = 54`, `BRICK_H = 18`, `GAP = 4`, `TOP = 50`, `LEFT = 10` ve
   `COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']` (her sıra için bir) sabitlerini ekle.
2. `let bricks` ve onu yukarıdaki gibi 40 tuğlayla (sıra sıra, soldan sağa) dolduran `function buildBricks()` ekle.
   Açılışta çağır.
3. `draw()` içinde `alive` olan her tuğlayı `COLORS[brick.row]` renginde, `BRICK_W` × `BRICK_H` boyutunda çiz.

# --tests--

There should be 40 bricks, laid out row by row.
tr: Sıra sıra dizilmiş 40 tuğla olmalı.

```js
assert.lengthOf(bricks, 40)
assert.deepEqual(bricks[0], { x: 10, y: 50, row: 0, alive: true })
assert.deepEqual(bricks[1], { x: 68, y: 50, row: 0, alive: true })
assert.deepEqual(bricks[8], { x: 10, y: 72, row: 1, alive: true })
assert.deepEqual(bricks[39], { x: 416, y: 138, row: 4, alive: true })
```

The wall should be centered.
tr: Duvar ortalanmış olmalı.

```js
const right = Math.max(...bricks.map((b) => b.x + BRICK_W))
assert.strictEqual(480 - right, bricks[0].x)
```

Each row should be drawn in its own color.
tr: Her sıra kendi renginde çizilmeli.

```js
$.tick()
assert.lengthOf($.rects('#ef4444'), 8)
assert.lengthOf($.rects('#3b82f6'), 8)
assert.deepEqual($.rects('#3b82f6')[0], { x: 10, y: 138, w: 54, h: 18, color: '#3b82f6' })
```

Dead bricks should not be drawn.
tr: Ölü tuğlalar çizilmemeli.

```js
bricks[0].alive = false
bricks[9].alive = false
$.tick()
assert.lengthOf($.rects('#ef4444'), 7)
assert.lengthOf($.rects('#f97316'), 7)
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
