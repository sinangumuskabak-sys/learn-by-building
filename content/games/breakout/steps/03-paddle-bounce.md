---
title: Bounce off the paddle, and aim
title_tr: Raketten sek ve nişan al
skills: [game.collision, game.physics]
---

# --explanation--

The ball should bounce off the paddle's **top face**. It touches when three things are true:

1. it is moving **down** (`vy > 0`), so a ball that just bounced cannot be caught again;
2. its bottom edge has reached the paddle: `ball.y + BALL_R >= PADDLE_Y`, but has not gone far past it (at most one
   frame's movement below the top face), so a ball that already slipped by is not yanked back up;
3. its center is over the paddle: `paddle.x <= ball.x <= paddle.x + PADDLE_W`.

Then send it up (`vy = -Math.abs(vy)`) and put it back on top of the paddle.

As in Pong, where it lands controls the angle. Normalize the hit position to `-1 … 1` across the paddle and use it for
the sideways speed:

```js
const offset = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2)   // -1 left end, 1 right end
ball.vx = offset * 5
```

Hitting the middle sends the ball straight up; the ends send it off at a steep angle. Without this rule the player
has no control over where the ball goes, and the last few bricks become a waiting game.

# --explanation-tr--

Top raketin **üst yüzeyinden** sekmeli. Üç şey birden doğruysa değer:

1. **aşağı** gidiyor (`vy > 0`); böylece az önce seken bir top yeniden yakalanamaz;
2. alt kenarı rakete ulaşmış: `ball.y + BALL_R >= PADDLE_Y`, ama çok da geçmemiş (üst yüzeyin altında en fazla bir
   karelik hareket); böylece çoktan kaçmış bir top yeniden yukarı çekilmez;
3. merkezi raketin üstünde: `paddle.x <= ball.x <= paddle.x + PADDLE_W`.

Sonra onu yukarı gönder (`vy = -Math.abs(vy)`) ve raketin üstüne geri koy.

Pong'daki gibi, nereye düştüğü açıyı belirler. Vuruş konumunu raket boyunca `-1 … 1` aralığına normalleştir ve yatay
hız için kullan:

```js
const offset = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2)   // -1 sol uç, 1 sağ uç
ball.vx = offset * 5
```

Ortaya vurmak topu dümdüz yukarı gönderir; uçlar dik bir açıyla fırlatır. Bu kural olmadan oyuncunun topun nereye
gideceği üzerinde hiç kontrolü olmaz ve son birkaç tuğla bir bekleme oyununa döner.

# --task--

In `update()`, after the wall checks: when the three conditions above hold (use
`ball.y + BALL_R <= PADDLE_Y + PADDLE_H + ball.vy` for "not far past"), set `ball.vx = offset * 5`,
`ball.vy = -Math.abs(ball.vy)` and `ball.y = PADDLE_Y - BALL_R`.

# --task-tr--

`update()` içinde duvar kontrollerinden sonra: yukarıdaki üç koşul sağlanınca ("çok geçmemiş" için
`ball.y + BALL_R <= PADDLE_Y + PADDLE_H + ball.vy` kullan) `ball.vx = offset * 5`, `ball.vy = -Math.abs(ball.vy)` ve
`ball.y = PADDLE_Y - BALL_R` yap.

# --tests--

Landing on the middle of the paddle should send the ball straight up.
tr: Raketin ortasına düşen top dümdüz yukarı gitmeli.

```js
paddle.x = 200
ball = { x: 240, y: 360, vx: 0, vy: 4 }
update()
assert.strictEqual(ball.vy, -4)
assert.strictEqual(ball.vx, 0)
assert.strictEqual(ball.y, 363)
```

Landing near an end should send the ball off at an angle.
tr: Uçlara yakın düşen top açıyla gitmeli.

```js
paddle.x = 200
ball = { x: 272, y: 360, vx: 0, vy: 4 }
update()
assert.closeTo(ball.vx, 4, 0.001)
ball = { x: 210, y: 360, vx: 0, vy: 4 }
update()
assert.closeTo(ball.vx, -3.75, 0.001)
```

A ball that misses the paddle should fall past it.
tr: Raketi ıskalayan top yanından düşmeli.

```js
paddle.x = 200
ball = { x: 150, y: 360, vx: 0, vy: 4 }
update()
assert.strictEqual(ball.vy, 4)
```

A ball moving up, or one that is already below the paddle, should not bounce.
tr: Yukarı giden ya da raketin çoktan altına inmiş bir top sekmemeli.

```js
paddle.x = 200
ball = { x: 240, y: 372, vx: 0, vy: -4 }
update()
assert.strictEqual(ball.vy, -4)
ball = { x: 240, y: 385, vx: 0, vy: 4 }
update()
assert.strictEqual(ball.vy, 4)
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

let paddle = { x: 200 }
let ball

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function resetBall() {
  ball = { x: 240, y: 200, vx: 3, vy: -4 }
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

resetBall()
requestAnimationFrame(loop)
```
