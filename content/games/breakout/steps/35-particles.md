---
title: A burst of particles
title_tr: Bir avuç parçacık
skills: [prog.arrays, game.physics]
---

# --goal--

The game works; now it should feel good. When a brick breaks we will throw out a dozen tiny **particles**. First the
function that makes them: `burst(brick)`.

# --goal-tr--

Oyun çalışıyor; şimdi **iyi hissettirsin**. Tuğla kırılınca sadece yok oluyor, anın hiç etkisi yok. Oyun
geliştiriciler bunun çözümüne **juice** (meyve suyu) der: kuralları değiştirmeyen ama her hareketi tatmin edici yapan
küçük efektler.

En bilinen efekt: kırılan tuğladan bir avuç **parçacık** (particle) saçılır. Her parçacık kendi konumu, hızı ve kalan
**ömrü** olan küçük bir nesnedir. Bu adımda onları üreten `burst` (patlama) fonksiyonunu yazıyoruz.

# --code--

```js
let particles

  particles = []

function burst(brick) {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: brick.x + BRICK_W / 2,
      y: brick.y + BRICK_H / 2,
      vx: Math.random() * 6 - 3,
      vy: Math.random() * 6 - 3,
      life: 30,
      color: COLORS[brick.row],
    })
  }
}
```

# --meaning--

- `particles` is a list that `newGame()` empties.
- `burst` adds 12 particles at the brick's center, each with a random velocity between -3 and 3.
- `life: 30` means it lives 30 frames (half a second); `color` is the brick's color.

# --meaning-tr--

- `let particles` → parçacık listesi. `newGame()` içindeki `particles = []` her oyunda onu boşaltır.
- `for (let i = 0; i < 12; i++)` → 12 kez çalış: 12 parçacık.
- Uzun bir nesneyi okunur olsun diye her alanı ayrı satıra yazabiliriz; her alanın sonuna virgül konur.
- `x: brick.x + BRICK_W / 2`, `y: brick.y + BRICK_H / 2` → tuğlanın **ortası**: hepsi oradan çıkar.
- `Math.random()` → her çağrıldığında 0 ile 1 arasında **rastgele** bir sayı. `* 6` onu 0–6 arasına büyütür, `- 3`
  ile **-3 ile 3** arası olur. Böylece her parçacık başka bir yöne uçar.
- `life: 30` → parçacık 30 kare (yarım saniye kadar) yaşar.
- `color: COLORS[brick.row]` → tuğlanın kendi rengi.

# --task--

1. Above `let lives` write `let particles`.
2. In `newGame`, under `buildBricks()`, write `particles = []`.
3. Leave an empty line under `buildBricks` (the function) and write `burst`.

# --task-tr--

1. `let lives` satırının **üstüne** `let particles` yaz.
2. `newGame` içinde `buildBricks()` satırının altına `particles = []` yaz.
3. `buildBricks` fonksiyonunun kapanış `}`'inin altına bir boş satır bırak ve `burst` fonksiyonunu yaz.
4. **Çalıştır**: henüz bir şey görünmez; kontroller yeşil olmalı.

# --hint--

Each field in the multi-line object ends with a comma, and the object closes with `})` before the loop's `}`.

# --hint-tr--

Çok satırlı nesnede her alan virgülle biter; nesne döngünün `}`'inden önce `})` ile kapanır.

# --tests--

A new game should start with no particles.
tr: Yeni oyun parçacıksız başlamalı.

```js
assert.deepEqual(particles, [])
particles.push({ x: 0, y: 0, vx: 0, vy: 0, life: 5, color: 'red' })
newGame()
assert.deepEqual(particles, [])
```

`burst()` should release 12 particles of the brick's color from its center.
tr: `burst()` tuğlanın merkezinden onun renginde 12 parçacık saçmalı.

```js
burst({ x: 100, y: 100, row: 2, alive: false })
assert.lengthOf(particles, 12)
for (const p of particles) {
  assert.include(p, { x: 127, y: 109, life: 30, color: '#eab308' })
  assert.isAtLeast(p.vx, -3)
  assert.isAtMost(p.vx, 3)
  assert.isAtLeast(p.vy, -3)
  assert.isAtMost(p.vy, 3)
}
```

`burst()` should give particles different directions.
tr: `burst()` parçacıklara farklı yönler vermeli.

```js
burst({ x: 0, y: 0, row: 0, alive: false })
assert.isAbove(new Set(particles.map((p) => p.vx)).size, 6)
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
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']

let paddle = { x: 200 }
let ball
let bricks
let particles
let lives
let score
let state // 'serve', 'playing', 'won' or 'lost'
const keys = {}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function newGame() {
  buildBricks()
  particles = []
  lives = 3
  score = 0
  resetBall()
}

function resetBall() {
  state = 'serve'
  ball = { x: paddle.x + PADDLE_W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 }
}

function launch() {
  if (state === 'won' || state === 'lost') {
    newGame()
    return
  }
  if (state !== 'serve') return
  state = 'playing'
  ball.vx = 3
  ball.vy = -4
}

function buildBricks() {
  bricks = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP + row * (BRICK_H + GAP), row, alive: true })
    }
  }
}

function burst(brick) {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: brick.x + BRICK_W / 2,
      y: brick.y + BRICK_H / 2,
      vx: Math.random() * 6 - 3,
      vy: Math.random() * 6 - 3,
      life: 30,
      color: COLORS[brick.row],
    })
  }
}

canvas.addEventListener('pointermove', (event) => {
  // Convert page coordinates to canvas pixels (the canvas may be displayed scaled).
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  paddle.x = clamp(x - PADDLE_W / 2, 0, canvas.width - PADDLE_W)
})
canvas.addEventListener('pointerdown', launch)

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ') launch()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function hitsBrick(brick) {
  // The point of the brick closest to the ball's center; they touch if it is within one radius.
  const nearestX = clamp(ball.x, brick.x, brick.x + BRICK_W)
  const nearestY = clamp(ball.y, brick.y, brick.y + BRICK_H)
  const dx = ball.x - nearestX
  const dy = ball.y - nearestY
  return dx * dx + dy * dy <= BALL_R * BALL_R
}

function update() {
  if (keys.ArrowLeft) paddle.x -= 7
  if (keys.ArrowRight) paddle.x += 7
  paddle.x = clamp(paddle.x, 0, canvas.width - PADDLE_W)

  if (state === 'serve') {
    ball.x = paddle.x + PADDLE_W / 2
    return
  }
  if (state !== 'playing') return

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

  // Break at most one brick per frame, or two flips could cancel out.
  const brick = bricks.find((b) => b.alive && hitsBrick(b))
  if (brick) {
    brick.alive = false
    score += 10
    const throughTopOrBottom = ball.x >= brick.x && ball.x <= brick.x + BRICK_W
    if (throughTopOrBottom) ball.vy = -ball.vy
    else ball.vx = -ball.vx
    if (bricks.every((b) => !b.alive)) state = 'won'
  }

  if (ball.y - BALL_R > canvas.height) {
    lives -= 1
    if (lives === 0) state = 'lost'
    else resetBall()
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const brick of bricks) {
    if (!brick.alive) continue
    ctx.fillStyle = COLORS[brick.row]
    ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H)
  }

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)

  if (state === 'serve' || state === 'playing') {
    ctx.fillStyle = '#f8fafc'
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'white'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Lives: ' + lives, 10, 26)
  ctx.textAlign = 'right'
  ctx.fillText('Score: ' + score, canvas.width - 10, 26)

  ctx.textAlign = 'center'
  if (state === 'serve') ctx.fillText('Click or press Space to launch', canvas.width / 2, 260)
  if (state === 'won' || state === 'lost') {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(state === 'won' ? 'You win!' : 'Game Over', canvas.width / 2, 250)
    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 280)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
