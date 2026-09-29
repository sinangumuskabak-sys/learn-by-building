---
title: The open floor
title_tr: Açık zemin
skills: [game.state]
---

# --goal--

The bottom has no wall: that is where the ball is lost. For now, a ball that falls out starts again from the middle.

# --goal-tr--

Alt kenarda duvar yok; top **oradan kaçar**. Can kaybetmeyi daha sonra ekleyeceğiz. Şimdilik alttan tamamen çıkan
top ortadan yeniden başlasın. Bunun için zaten bir fonksiyonumuz var: `resetBall()`.

# --code--

```js
if (ball.y - BALL_R > canvas.height) resetBall()
```

# --meaning--

- `ball.y - BALL_R > canvas.height` is true when even the top edge is below the canvas: the ball is fully gone.
- An `if` with a single command can be written on one line without `{ }`.

# --meaning-tr--

- `ball.y - BALL_R > canvas.height` → topun **üst kenarı** bile canvas'ın dibinin (400) altında mı? O zaman top
  tamamen görünmez olmuştur.
- `resetBall()` → topu ortaya, ilk hızıyla geri koyar. Fonksiyon yazmanın faydası: aynı işi ikinci kez yazmadık.
- Tek komutluk bir `if`, süslü parantez olmadan tek satırda yazılabilir.

# --task--

Write the line right under the ceiling `if`'s closing `}`, still inside `update`.

# --task-tr--

Tavan `if`'inin kapanış `}`'inin hemen altına, hâlâ `update`'in içinde, bu satırı yaz. **Çalıştır** ve bekle: top
alttan düşünce ortadan yeniden fırlamalı.

# --predict--

The paddle is under the ball. What happens?
- [ ] The ball bounces off the paddle
- [x] The ball passes through the paddle and falls out
  Nothing checks the paddle yet. That is the next step.
- [ ] The game stops

# --predict-tr--

Raket topun altında. Ne olur?
- [ ] Top raketten seker
- [x] Top raketin içinden geçip alttan düşer
  Henüz rakete bakan bir kod yok. Onu bir sonraki adımda yazacağız.
- [ ] Oyun durur

# --tests--

A ball that falls out of the bottom should start again from the middle.
tr: Alttan düşen top ortadan yeniden başlamalı.

```js
ball = { x: 100, y: 405, vx: 3, vy: 4 }
update()
assert.deepEqual(ball, { x: 240, y: 200, vx: 3, vy: -4 })
```

A ball still partly visible at the bottom should not be reset yet.
tr: Altta hâlâ kısmen görünen top henüz sıfırlanmamalı.

```js
ball = { x: 100, y: 398, vx: 3, vy: 4 }
update()
assert.deepEqual(ball, { x: 103, y: 402, vx: 3, vy: 4 })
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
