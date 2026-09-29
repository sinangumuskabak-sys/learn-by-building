---
title: Bounce off the paddle
title_tr: Raketten sek
skills: [game.collision]
---

# --goal--

The ball should bounce off the paddle's top face. We ask five questions at once and store the answer in `onPaddle`.

# --goal-tr--

Şimdi raket işe yarasın: top raketin **üst yüzüne** değince yukarı seksin. Topun değdiğini söylemek için birkaç
şeyin **aynı anda** doğru olması gerekir:

1. Top **aşağı** gidiyor (az önce seken top ikinci kez yakalanmasın).
2. Topun alt kenarı rakete ulaştı, ama raketi **fazla geçmedi** (yanından kaçmış bir top geri çekilmesin).
3. Topun merkezi raketin **sol ve sağ ucu arasında**.

Bu uzun sorunun cevabını (doğru ya da yanlış) bir ada koyuyoruz: `onPaddle` ("raketin üstünde").

# --code--

```js
const onPaddle =
  ball.vy > 0 &&
  ball.y + BALL_R >= PADDLE_Y &&
  ball.y + BALL_R <= PADDLE_Y + PADDLE_H + ball.vy &&
  ball.x >= paddle.x &&
  ball.x <= paddle.x + PADDLE_W
if (onPaddle) {
  ball.vy = -Math.abs(ball.vy)
  ball.y = PADDLE_Y - BALL_R
}
```

# --meaning--

- `&&` means "and": `onPaddle` is `true` only when all five parts are true.
- Line 3 allows at most one frame's movement below the paddle's top face, so a ball that slipped past is not caught.
- `-Math.abs(ball.vy)` is always negative: up. `ball.y = PADDLE_Y - BALL_R` puts the ball on top of the paddle.

# --meaning-tr--

- `&&` → "**ve**": iki tarafı da doğruysa sonuç doğrudur. Beş parçayı `&&` ile bağlayınca "hepsi doğru mu?" diye
  sormuş oluruz. `>=` "büyük veya eşit mi?", `<=` "küçük veya eşit mi?" demek.
- Uzun bir satırı okunur olsun diye bölebiliriz: satır sonunda `&&` durdukça bilgisayar devam ettiğini anlar.
- `ball.vy > 0` → top aşağı gidiyor.
- `ball.y + BALL_R >= PADDLE_Y` → topun alt kenarı raketin üst yüzüne ulaştı.
- `ball.y + BALL_R <= PADDLE_Y + PADDLE_H + ball.vy` → ama raketi en fazla **bir karelik hareket** kadar geçti.
- Son iki satır → topun merkezi raketin sol ucu ile sağ ucu arasında.
- `ball.vy = -Math.abs(ball.vy)` → eksisi atılıp başına eksi konan sayı her zaman eksidir: top **yukarı** gider.
- `ball.y = PADDLE_Y - BALL_R` → topu raketin tam üstüne oturtur.

# --task--

In `update`, between the ceiling `if` and the last line, leave an empty line on both sides and write the paddle check.

# --task-tr--

1. `update` içinde tavan `if`'inin kapanış `}`'i ile en alttaki `if (ball.y - BALL_R > canvas.height) resetBall()`
   satırının **arasına** raket kontrolünü yaz. Üstünde ve altında birer boş satır kalsın.
2. Her koşul satırı (sonuncusu hariç) `&&` ile bitmeli.
3. **Çalıştır**: raketi topun altına getir, top yukarı sekmeli.

# --hint--

Every condition line except the last must end with `&&`. If the ball bounces from far below the paddle, check the
third line.

# --hint-tr--

Sonuncusu hariç her koşul satırı `&&` ile bitmeli. Top raketin çok altından seğiyorsa üçüncü satırı kontrol et.

# --tests--

Landing on the paddle should send the ball back up.
tr: Rakete düşen top yukarı geri gitmeli.

```js
paddle.x = 200
ball = { x: 240, y: 360, vx: 0, vy: 4 }
update()
assert.strictEqual(ball.vy, -4)
assert.strictEqual(ball.y, 363)
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
