---
title: Aim with the paddle
title_tr: Raketle nişan al
skills: [game.physics]
---

# --goal--

Where the ball lands on the paddle should decide its angle: the middle sends it straight up, the ends send it off
to the side. That gives the player control.

# --goal-tr--

Şu an top raketten hep aynı açıyla sekiyor; oyuncunun topun gideceği yere hiç etkisi yok ve son tuğlalar bir
bekleme oyununa döner. Kural koyalım: topun rakete **nereden** değdiği açıyı belirlesin.

- Raketin **ortası** → top dümdüz yukarı.
- Raketin **uçları** → top yana doğru sert bir açıyla.

Değdiği yeri raket boyunca `-1` (sol uç) ile `1` (sağ uç) arasında bir sayıya çevireceğiz.

# --code--

```js
// -1 at the paddle's left end, 0 in the middle, 1 at the right end
const offset = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2)
ball.vx = offset * 5
```

# --meaning--

- `paddle.x + PADDLE_W / 2` is the paddle's middle; `ball.x` minus it is how far right (+) or left (-) the ball is.
- Dividing by half the paddle's width turns that into a number from -1 to 1.
- `* 5`: the sideways speed is at most 5 pixels per frame.

# --meaning-tr--

- `paddle.x + PADDLE_W / 2` → raketin **ortası**.
- `ball.x - (raketin ortası)` → top ortadan ne kadar sağda (artı) ya da solda (eksi).
- `/ (PADDLE_W / 2)` → bunu yarım raket boyuna (40) bölünce sonuç sol uçta `-1`, ortada `0`, sağ uçta `1` olur.
- `ball.vx = offset * 5` → yan hız en fazla 5 piksel. Ortadan vurursan 0: dümdüz yukarı.

# --task--

Write the three lines at the top of the `if (onPaddle) {` block, above `ball.vy = ...`.

# --task-tr--

`if (onPaddle) {` satırının hemen **altına**, `ball.vy = -Math.abs(ball.vy)` satırının üstüne üç satırı yaz.
**Çalıştır**: topu raketin ucuyla karşıla; yana doğru açılı gitmeli.

# --predict--

The ball lands exactly on the paddle's right end. What is `offset`?
- [ ] 0
- [ ] -1
- [x] 1
  The right end is half a paddle to the right of the middle: 40 / 40 = 1.

# --predict-tr--

Top raketin tam sağ ucuna düşüyor. `offset` kaç olur?
- [ ] 0
- [ ] -1
- [x] 1
  Sağ uç ortanın yarım raket sağında: 40 / 40 = 1.

# --try--

Change `* 5` to `* 8` and play: much sharper angles. Put 5 back.

# --try-tr--

`* 5` yerine `* 8` yaz ve oyna: açılar çok daha keskin olur. Sonra 5'e geri al.

# --tests--

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

Landing in the middle should send the ball straight up.
tr: Ortaya düşen top dümdüz yukarı gitmeli.

```js
paddle.x = 200
ball = { x: 237, y: 360, vx: 3, vy: 4 }
update()
assert.strictEqual(ball.vx, 0)
assert.strictEqual(ball.vy, -4)
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
