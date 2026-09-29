---
title: Move the ball
title_tr: Topu yürüt
skills: [game.physics, game.loop]
---

# --goal--

Every frame the ball moves by its velocity. That goes in `update`, and the loop calls `update` before `draw`.

# --goal-tr--

Her oyunun iki işi vardır: **güncelle** (durumu değiştir) ve **çiz** (durumu göster). Çizeni yazmıştık; şimdi
güncelleyeni yazıyoruz. `update` her karede topun konumuna hızını ekleyecek.

Döngü artık her turda önce `update()`, sonra `draw()` çağıracak.

# --code--

```js
function update() {
  ball.x += ball.vx
  ball.y += ball.vy
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}
```

# --meaning--

- `ball.x += ball.vx` adds the velocity to the position: 240 becomes 243, then 246...
- The loop calls `update()` first, so every picture shows the newest position.

# --meaning-tr--

- `ball.x += ball.vx` → "`ball.x`'e `ball.vx`'i **ekle**". `+=` üstüne ekle demek: 240 → 243 → 246...
- `ball.y += ball.vy` → aynısı dikeyde. `vy` eksi olduğu için y azalır: top **yukarı** gider.
- `loop` içinde `update()` `draw()`'dan önce: önce durumu değiştir, sonra en yeni hâlini çiz.

# --task--

1. Write `update` just above `function draw() {`, with an empty line between them.
2. In `loop`, add `update()` above `draw()`.

# --task-tr--

1. `function draw() {` satırının **üstüne** `update` fonksiyonunu yaz; ikisinin arasında bir boş satır kalsın.
2. `loop` içinde `draw()` satırının **üstüne** `update()` yaz.
3. **Çalıştır** ve topu izle.

# --predict--

What will the ball do?
- [ ] Bounce around the field
- [x] Fly up and to the right, out of the field
  Nothing checks the walls yet, so it just keeps going.
- [ ] Stay in the middle

# --predict-tr--

Top ne yapacak?
- [ ] Alanın içinde sekecek
- [x] Sağa ve yukarı uçup alandan çıkacak
  Henüz duvarlara bakan bir kod yok; top yoluna devam eder.
- [ ] Ortada duracak

# --tests--

Each frame the ball should move by its velocity.
tr: Her karede top hızı kadar ilerlemeli.

```js
$.tick()
assert.include(ball, { x: 243, y: 196 })
assert.deepEqual($.arcs(), [{ x: 243, y: 196, r: 7, color: '#f8fafc' }])
```

`update()` should use the ball's own velocity.
tr: `update()` topun kendi hızını kullanmalı.

```js
ball = { x: 100, y: 100, vx: -2, vy: 5 }
update()
assert.deepEqual(ball, { x: 98, y: 105, vx: -2, vy: 5 })
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
