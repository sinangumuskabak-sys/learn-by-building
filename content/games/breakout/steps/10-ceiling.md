---
title: Bounce off the ceiling
title_tr: Tavandan sek
skills: [game.collision, game.physics]
---

# --goal--

The top wall works the same way, with one safer trick: instead of flipping `vy`, we force it to point down with
`Math.abs`.

# --goal-tr--

Üst duvar da (tavan) aynı mantıkla çalışır, ama bu sefer daha sağlam bir yol kullanacağız: hızı ters çevirmek
yerine onu **aşağıyı gösterecek şekilde zorlayacağız**.

Neden? Ters çevirmek iki kez olursa top yine yukarı döner. "Her zaman aşağı" demek ise asla yanlış yöne gidemez.

# --code--

```js
if (ball.y - BALL_R < 0) {
  ball.vy = Math.abs(ball.vy)
  ball.y = BALL_R
}
```

# --meaning--

- `ball.y - BALL_R < 0` is true when the top edge is above the canvas.
- `Math.abs` drops the minus sign: `Math.abs(-4)` is `4`, which always means "down".
- `ball.y = BALL_R` puts the ball just below the ceiling.

# --meaning-tr--

- `ball.y - BALL_R < 0` → topun **üst kenarı** canvas'ın üstüne çıktı mı?
- `Math.abs(ball.vy)` → sayının **mutlak değeri**: eksisini atar. `Math.abs(-4)` → `4`, `Math.abs(4)` → `4`. Sonuç
  hep artı, yani hep **aşağı**.
- `ball.y = BALL_R` → topu tavanın hemen altına koyar (merkezi tavandan bir yarıçap aşağıda).

# --task--

Write the new `if` right under the closing `}` of the side-wall `if`.

# --task-tr--

Yan duvar `if`'inin kapanış `}`'inin **hemen altına** (boş satır bırakmadan) yeni `if`'i yaz. **Çalıştır**: top artık
tavandan da sekmeli; ama alttan düşüp kaybolacak.

# --predict--

If the ball is still touching the ceiling on the next frame, what does `Math.abs` do?
- [x] Keeps it going down
  `Math.abs(4)` is still 4. Flipping with `-ball.vy` would have sent it back up.
- [ ] Sends it back up
- [ ] Stops it

# --predict-tr--

Top bir sonraki karede hâlâ tavana değiyorsa `Math.abs` ne yapar?
- [x] Aşağı gitmeye devam ettirir
  `Math.abs(4)` yine 4'tür. `-ball.vy` ile ters çevirseydik top yeniden yukarı dönerdi.
- [ ] Yukarı geri yollar
- [ ] Durdurur

# --tests--

The ball should bounce off the top wall.
tr: Top üst duvardan sekmeli.

```js
ball = { x: 100, y: 9, vx: 3, vy: -4 }
update()
assert.strictEqual(ball.vy, 4)
assert.strictEqual(ball.y, 7)
```

A ball already going down near the top should keep going down.
tr: Tavana yakın ama zaten aşağı giden top aşağı gitmeye devam etmeli.

```js
ball = { x: 100, y: 2, vx: 3, vy: 4 }
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
