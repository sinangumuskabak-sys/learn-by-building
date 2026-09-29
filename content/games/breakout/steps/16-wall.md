---
title: "A whole wall: a loop inside a loop"
title_tr: "Koca bir duvar: döngü içinde döngü"
skills: [prog.loops]
---

# --goal--

Five rows of eight: we wrap the column loop in a row loop. The inner loop runs completely for every row.

# --goal-tr--

Bir sıra yetmez; **5 sıra** istiyoruz. Sütun döngüsünü bir **sıra döngüsünün içine** koyacağız: dıştaki döngü
sıraları gezer, **her sıra için** içteki döngü 8 sütunu baştan sona gezer. 5 × 8 = 40 tuğla.

Bir apartmanın katlarını ve dairelerini sayar gibi: 1. kat 1, 2, 3... daire; sonra 2. kat 1, 2, 3...

# --code--

```js
const ROWS = 5

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP + row * (BRICK_H + GAP), row, alive: true })
    }
  }
```

# --meaning--

- The outer loop counts `row` from 0 to 4; for each row the inner loop counts `col` from 0 to 7.
- Each row down adds one brick height plus a gap to `y`.
- `{ row }` is shorthand for `{ row: row }`.

# --meaning-tr--

- `const ROWS = 5` → sıra sayısı.
- `for (let row = 0; row < ROWS; row++) {` → **dış döngü**: `row` = 0, 1, 2, 3, 4.
- İçteki `for (let col ...)` → **iç döngü**: her `row` için baştan `col` = 0...7. Toplam 40 tur.
- `y: TOP + row * (BRICK_H + GAP)` → her sıra bir öncekinden bir tuğla boyu artı bir boşluk (22 piksel) aşağıda.
  `row = 1` için 50 + 22 = 72.
- `row` (yalnız) → kısaltma: `row: row` ile aynı; "`row` alanına `row` sayacının değerini koy".
- İç döngü iki boşluk daha içeride yazılır; kapanan `}` sayısına dikkat: iki döngü, iki `}`.

# --task--

1. Under `const COLS = 8` write `const ROWS = 5`.
2. In `buildBricks`, wrap the column loop in the row loop and change the `push` line as shown.

# --task-tr--

1. `const COLS = 8` satırının altına `const ROWS = 5` yaz.
2. `buildBricks` içinde sütun döngüsünün **üstüne** `for (let row = 0; row < ROWS; row++) {` yaz, sütun döngüsünü
   iki boşluk içeri al ve altına kapanan `}` ekle.
3. `push` satırında `y: TOP` yerine `y: TOP + row * (BRICK_H + GAP)`, `row: 0` yerine `row` yaz.
4. **Çalıştır**: 5 sıralık kırmızı bir duvar görmelisin.

# --predict--

If you swapped the two loops (columns outside, rows inside), what would change on the screen?
- [x] Nothing: the same 40 bricks, only listed in another order
  The positions are the same; only the order in `bricks` changes.
- [ ] Only one row would be drawn
- [ ] The wall would be turned sideways

# --predict-tr--

İki döngünün yerini değiştirseydin (sütunlar dışta, sıralar içte), ekranda ne değişirdi?
- [x] Hiçbir şey: aynı 40 tuğla, yalnız listede başka sırayla
  Konumlar aynı kalır; yalnız `bricks` içindeki sıra değişir.
- [ ] Yalnız bir sıra çizilirdi
- [ ] Duvar yan yatardı

# --hint--

Count the braces: `buildBricks` ends with three `}` in a row (inner loop, outer loop, function).

# --hint-tr--

Süslü parantezleri say: `buildBricks` art arda üç `}` ile biter (iç döngü, dış döngü, fonksiyon).

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
    ctx.fillStyle = '#ef4444'
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
