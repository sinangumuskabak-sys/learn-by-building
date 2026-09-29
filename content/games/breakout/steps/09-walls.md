---
title: Bounce off the side walls
title_tr: Yan duvarlardan sek
skills: [game.collision, game.physics]
---

# --goal--

When the ball's left or right **edge** passes a wall, we flip its horizontal velocity and put it back inside.

# --goal-tr--

Top duvara değince geri sekmeli. Top bir daire: **kenarı** merkezinden bir yarıçap uzakta.

```
sol kenar = ball.x - BALL_R        sağ kenar = ball.x + BALL_R
```

Sol kenar 0'ın soluna **veya** sağ kenar canvas'ın sağına geçtiyse yatay hızı ters çeviririz. "Konum köşe mi,
merkez mi?" karışıklığı pek çok çarpışma hatasının kaynağıdır; her seferinde hangisiyle uğraştığını sor.

# --code--

```js
if (ball.x - BALL_R < 0 || ball.x + BALL_R > canvas.width) {
  ball.vx = -ball.vx
  ball.x = clamp(ball.x, BALL_R, canvas.width - BALL_R)
}
```

# --meaning--

- `||` means "or": the `if` runs when either edge is past a wall.
- `ball.vx = -ball.vx` flips the direction: 3 becomes -3.
- `clamp` puts the ball back inside the walls, so it cannot get stuck and flip again on the next frame.

# --meaning-tr--

- `if (koşul) { ... }` → koşul doğruysa süslü parantezin içini yap, değilse atla.
- `ball.x - BALL_R < 0` → sol kenar 0'ın solunda mı? `ball.x + BALL_R > canvas.width` → sağ kenar 480'i geçti mi?
- `||` → "**veya**": ikisinden biri doğruysa koşul doğrudur.
- `ball.vx = -ball.vx` → yatay hızı **ters çevirir**: 3 ise -3, -3 ise 3 olur. Top geri döner.
- `ball.x = clamp(ball.x, BALL_R, canvas.width - BALL_R)` → topu duvarların **içine geri koyar**. Bu olmazsa top
  bir sonraki karede hâlâ duvarın içinde kalıp yeniden ters dönebilir ve duvarda titreyerek sıkışır.

# --task--

In `update`, leave an empty line under `ball.y += ball.vy` and write the `if`.

# --task-tr--

`update` içinde `ball.y += ball.vy` satırının altına bir boş satır bırak ve `if` bloğunu yaz. **Çalıştır**: top
sağ duvardan sekecek (ama yukarıdan yine kaçacak).

# --hint--

Compare the ball's **edges**, not its center: `ball.x - BALL_R` and `ball.x + BALL_R`.

# --hint-tr--

Topun merkezini değil **kenarlarını** karşılaştır: `ball.x - BALL_R` ve `ball.x + BALL_R`.

# --tests--

The ball should bounce off the left wall.
tr: Top sol duvardan sekmeli.

```js
ball = { x: 9, y: 200, vx: -3, vy: -4 }
update()
assert.strictEqual(ball.vx, 3)
assert.strictEqual(ball.x, 7)
```

The ball should bounce off the right wall.
tr: Top sağ duvardan sekmeli.

```js
ball = { x: 471, y: 200, vx: 3, vy: -4 }
update()
assert.strictEqual(ball.vx, -3)
assert.strictEqual(ball.x, 473)
```

In the middle the ball should just fly on.
tr: Ortada top yoluna devam etmeli.

```js
ball = { x: 200, y: 200, vx: 3, vy: -4 }
update()
assert.deepEqual(ball, { x: 203, y: 196, vx: 3, vy: -4 })
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
