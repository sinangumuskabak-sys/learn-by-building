---
title: Draw the bricks
title_tr: Tuğlaları çiz
skills: [prog.loops, game.canvas]
---

# --goal--

We build the row at the start and draw every brick that is still alive, with another kind of loop: `for ... of`.

# --goal-tr--

Şimdi tuğlaları görelim. Oyun başlarken `buildBricks()`'i çağıracağız, `draw` içinde de listedeki **her tuğlayı**
çizeceğiz. Ama yalnız ayakta olanları: kırılmış (`alive: false`) tuğlalar atlanacak.

Bu sefer başka bir döngü kullanıyoruz: `for ... of`. Sayaç tutmadan "listedeki her eleman için" der.

# --code--

```js
  for (const brick of bricks) {
    if (!brick.alive) continue
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H)
  }

buildBricks()
```

# --meaning--

- `for (const brick of bricks)` runs the body once per brick, calling the current one `brick`.
- `!` means "not"; `continue` skips to the next brick. So dead bricks are not drawn.
- The bricks are drawn right after the background, so the paddle and ball are drawn on top.
- `buildBricks()` at the bottom builds the row once, before the loop starts.

# --meaning-tr--

- `for (const brick of bricks) {` → "`bricks` listesindeki **her eleman için**, sırayla, ona `brick` de ve içini
  çalıştır". 8 tuğla = 8 tur.
- `if (!brick.alive) continue` → `!` "**değil**" demek: `!brick.alive` = "ayakta değilse". `continue` → "bu elemanı
  bırak, sıradakine geç". Kırılmış tuğla çizilmez.
- `ctx.fillStyle = '#ef4444'` → kırmızı. `ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H)` → tuğlayı kendi yerine
  çizer.
- Tuğlalar arka plandan hemen **sonra** çiziliyor; raket ve top daha sonra çizildiği için onların üstünde kalır.
- `buildBricks()` → sırayı oyun başında bir kez kurar.

# --task--

1. In `draw`, under the background's `fillRect` line, leave an empty line and write the `for` loop.
2. Write `buildBricks()` just above `resetBall()` at the bottom.

# --task-tr--

1. `draw` içinde arka planı boyayan `ctx.fillRect(0, 0, canvas.width, canvas.height)` satırının altına bir boş satır
   bırak ve `for` döngüsünü yaz.
2. En alttaki `resetBall()` satırının **üstüne** `buildBricks()` yaz.
3. **Çalıştır**: üstte ortalanmış 8 kırmızı tuğla görmelisin.

# --predict--

What happens when the ball reaches the bricks?
- [ ] They break
- [x] It flies straight through them
  Nothing checks the bricks in `update` yet.
- [ ] It bounces off them

# --predict-tr--

Top tuğlalara ulaşınca ne olur?
- [ ] Kırılırlar
- [x] Top içlerinden geçip gider
  `update` henüz tuğlalara bakmıyor.
- [ ] Top onlardan seker

# --tests--

A row of 8 red bricks should be drawn at the top.
tr: Üstte 8 kırmızı tuğlalık bir sıra çizilmeli.

```js
$.tick()
const red = $.rects('#ef4444')
assert.lengthOf(red, 8)
assert.deepEqual(red[0], { x: 10, y: 50, w: 54, h: 18, color: '#ef4444' })
```

Dead bricks should not be drawn.
tr: Kırılmış tuğlalar çizilmemeli.

```js
bricks[0].alive = false
bricks[3].alive = false
$.tick()
assert.lengthOf($.rects('#ef4444'), 6)
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
  for (let col = 0; col < COLS; col++) {
    bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP, row: 0, alive: true })
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
