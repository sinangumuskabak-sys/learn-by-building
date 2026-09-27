---
title: A round ball and three walls
title_tr: Yuvarlak top ve üç duvar
skills: [game.physics, game.collision]
---

# --explanation--

This time the ball is a **circle**, so its position is its **center**, and its edges are one radius away:

```
left edge = ball.x - BALL_R        right edge  = ball.x + BALL_R
top edge  = ball.y - BALL_R        bottom edge = ball.y + BALL_R
```

Mixing up "position is the corner" (rectangles) and "position is the center" (circles) is behind many collision bugs,
so always ask which one you are dealing with.

The ball bounces off the left, right and top walls by flipping the matching velocity, and is put back inside the
walls so it cannot get stuck. For the top wall, instead of flipping, force the velocity to point **down** with
`Math.abs(ball.vy)`. That can never send it the wrong way, even if it is still inside the wall on the next frame.

The bottom is open. For now, a ball that falls out simply starts again from the middle; losing lives comes later.
Starting again goes in a function, `resetBall()`, because more code will need it.

# --explanation-tr--

Bu sefer top bir **daire**, yani konumu **merkezi**dir ve kenarları bir yarıçap uzaktadır:

```
sol kenar = ball.x - BALL_R        sağ kenar = ball.x + BALL_R
üst kenar = ball.y - BALL_R        alt kenar = ball.y + BALL_R
```

"Konum köşedir" (dikdörtgenler) ile "konum merkezdir" (daireler) ayrımını karıştırmak birçok çarpışma hatasının
arkasındadır; hangisiyle uğraştığını hep kendine sor.

Top sol, sağ ve üst duvarlardan ilgili hızı çevirerek seker ve takılmasın diye duvarların içine geri konur. Üst duvar
için çevirmek yerine hızı `Math.abs(ball.vy)` ile **aşağı** bakmaya zorla. Bu, sonraki karede hâlâ duvarın içinde
olsa bile onu asla yanlış yöne göndermez.

Alt taraf açık. Şimdilik dışarı düşen top ortadan yeniden başlıyor; can kaybetmek sonra gelecek. Yeniden başlatmak
bir fonksiyona gider, `resetBall()`, çünkü başka kodlar da ona ihtiyaç duyacak.

# --task--

1. Add `const BALL_R = 7`, `let ball`, and `function resetBall()` that sets `ball = { x: 240, y: 200, vx: 3, vy: -4 }`.
   Call it once at startup.
2. Write `function update()` that moves the ball by its velocity, then:
   - left/right: if an edge crosses a wall, flip `vx` and clamp `ball.x` between `BALL_R` and
     `canvas.width - BALL_R`;
   - top: if `ball.y - BALL_R < 0`, set `vy` to `Math.abs(ball.vy)` and `ball.y` to `BALL_R`;
   - bottom: if the ball is completely below the canvas (`ball.y - BALL_R > canvas.height`), call `resetBall()`.
3. Call `update()` in the loop before drawing, and draw the ball as a `'#f8fafc'` circle.

# --task-tr--

1. `const BALL_R = 7`, `let ball` ve `ball = { x: 240, y: 200, vx: 3, vy: -4 }` yapan `function resetBall()` ekle.
   Açılışta onu bir kez çağır.
2. Topu hızı kadar taşıyan `function update()` yaz, sonra:
   - sol/sağ: bir kenar duvarı geçerse `vx`'i çevir ve `ball.x`'i `BALL_R` ile `canvas.width - BALL_R` arasında
     sınırla;
   - üst: `ball.y - BALL_R < 0` ise `vy`'yi `Math.abs(ball.vy)`, `ball.y`'yi `BALL_R` yap;
   - alt: top tamamen canvas'ın altındaysa (`ball.y - BALL_R > canvas.height`) `resetBall()` çağır.
3. Döngüde çizmeden önce `update()` çağır ve topu `'#f8fafc'` bir daire olarak çiz.

# --tests--

The ball should start in the middle and move by its velocity.
tr: Top ortada başlamalı ve hızı kadar hareket etmeli.

```js
assert.strictEqual(BALL_R, 7)
assert.deepEqual(ball, { x: 240, y: 200, vx: 3, vy: -4 })
$.tick()
assert.include(ball, { x: 243, y: 196 })
assert.deepEqual($.arcs(), [{ x: 243, y: 196, r: 7, color: '#f8fafc' }])
```

The ball should bounce off the left and right walls.
tr: Top sol ve sağ duvarlardan sekmeli.

```js
ball = { x: 9, y: 200, vx: -3, vy: -4 }
update()
assert.strictEqual(ball.vx, 3)
assert.strictEqual(ball.x, 7)
ball = { x: 471, y: 200, vx: 3, vy: -4 }
update()
assert.strictEqual(ball.vx, -3)
assert.strictEqual(ball.x, 473)
```

The ball should bounce off the top wall.
tr: Top üst duvardan sekmeli.

```js
ball = { x: 100, y: 9, vx: 3, vy: -4 }
update()
assert.strictEqual(ball.vy, 4)
assert.strictEqual(ball.y, 7)
```

A ball that falls out of the bottom should start again from the middle.
tr: Alttan düşen top ortadan yeniden başlamalı.

```js
ball = { x: 100, y: 405, vx: 3, vy: 4 }
update()
assert.deepEqual(ball, { x: 240, y: 200, vx: 3, vy: -4 })
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
