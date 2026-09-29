---
title: Aim with the paddle
title_tr: Raketle nişan al
skills: [game.physics, prog.functions]
---

# --goal--

Right now the ball always bounces at the same angle. In real Pong, where the ball hits the paddle decides where it
goes: near the top edge it flies up, near the bottom it flies down, in the middle straight.

# --goal-tr--

Şu an top raketten hep **aynı açıyla** sekiyor; oyuncu nişan alamıyor. Gerçek Pong'da topun raketin **neresine**
çarptığı, nereye gideceğini belirler: üst kenara yakınsa yukarı, alt kenara yakınsa aşağı, ortadaysa düz gider.
İki raketin sekme kodunu da tek bir `bounceOff` fonksiyonunda topluyoruz.

# --code--

```js
function bounceOff(paddle) {
  // -1 at the paddle's top edge, 0 in the middle, 1 at the bottom edge
  const offset = (ball.y + BALL / 2 - (paddle.y + PADDLE_H / 2)) / (PADDLE_H / 2)
  const speed = Math.abs(ball.vx)
  ball.vy = offset * 5
  if (paddle === left) {
    ball.vx = speed
    ball.x = left.x + PADDLE_W
  } else {
    ball.vx = -speed
    ball.x = right.x - BALL
  }
}

  if (ball.vx < 0 && touches(left)) bounceOff(left)
  if (ball.vx > 0 && touches(right)) bounceOff(right)
```

# --meaning--

- `offset` compares the ball's middle with the paddle's middle and divides by half the paddle height: -1 at the top
  edge, 0 in the middle, 1 at the bottom.
- `ball.vy = offset * 5` sends it up or down that much.
- `Math.abs` gives the speed without its sign; the left paddle sends the ball right (+), the right one left (-).

# --meaning-tr--

- `ball.y + BALL / 2` → topun **ortası**; `paddle.y + PADDLE_H / 2` → raketin **ortası**.
- İkisinin farkı `/ (PADDLE_H / 2)` → raketin yarı boyuna bölünce sonuç **-1 ile 1 arası** olur: üst kenar -1, orta 0,
  alt kenar 1. Buna `offset` (kayma) diyoruz.
- `ball.vy = offset * 5` → kenara ne kadar yakınsa o kadar dik açı: en fazla 5 yukarı ya da aşağı.
- `Math.abs(ball.vx)` → **mutlak değer**: işaretsiz hız (`-4` → `4`).
- Sol raket topu sağa (`speed`), sağ raket sola (`-speed`) yollar; top da raketin önüne alınır (içine gömülmesin).
- `update`'teki iki uzun blok artık tek satır: `bounceOff(left)` ve `bounceOff(right)`.

# --task--

1. Under `touches`, write `bounceOff`.
2. In `update`, replace the two paddle blocks with the two one-line calls.

# --task-tr--

1. `touches` fonksiyonunun altına bir boş satır bırakıp `bounceOff` fonksiyonunu yaz.
2. `update` içindeki iki raket bloğunu (`if (ball.vx < 0 && touches(left)) { ... }` ve sağdakini) sil; yerine iki tek
   satırlık çağrıyı yaz.
3. **Çalıştır** ve topa raketin kenarıyla vur.

# --predict--

The ball hits the very bottom edge of the left paddle. Where does it go?
- [ ] Straight right
- [x] Right and steeply down
  `offset` is close to 1 there, so `vy` is close to 5.
- [ ] Back to the left

# --predict-tr--

Top sol raketin en alt kenarına çarpıyor. Nereye gider?
- [ ] Dümdüz sağa
- [x] Sağa ve dik bir açıyla aşağı
  Orada `offset` 1'e yakın, yani `vy` 5'e yakın olur.
- [ ] Geri sola

# --tests--

A ball hitting the top edge of a paddle should fly upward.
tr: Raketin üst kenarına çarpan top yukarı gitmeli.

```js
left.y = 160
ball = { x: 32, y: 158, vx: -4, vy: 0 }
bounceOff(left)
assert.isBelow(ball.vy, -3)
assert.strictEqual(ball.vx, 4)
assert.strictEqual(ball.x, 30)
```

A ball hitting the middle should go straight, and the right paddle should send it left.
tr: Ortaya çarpan top düz gitmeli; sağ raket topu sola yollamalı.

```js
right.y = 160
ball = { x: 568, y: 195, vx: 4, vy: 3 }
bounceOff(right)
assert.strictEqual(ball.vy, 0)
assert.strictEqual(ball.vx, -4)
assert.strictEqual(ball.x, 560)
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 10
const PADDLE_H = 80
const PADDLE_SPEED = 6
const BALL = 10 // the ball is a BALL×BALL square
const WIN_SCORE = 5

let left
let right
let ball
let state // 'playing' or 'over'
const keys = {}

function reset() {
  left = { x: 20, y: 160, score: 0 }
  right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }
  state = 'playing'
  serve(1)
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ' && state === 'over') reset()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function serve(direction) {
  ball = {
    x: canvas.width / 2 - BALL / 2,
    y: canvas.height / 2 - BALL / 2,
    vx: 4 * direction,
    vy: Math.random() < 0.5 ? -3 : 3,
  }
}

function point(winner) {
  winner.score += 1
  if (winner.score >= WIN_SCORE) {
    state = 'over'
    return
  }
  // Serve toward the player who just lost the point.
  serve(winner === left ? 1 : -1)
}

function touches(paddle) {
  return (
    ball.x < paddle.x + PADDLE_W &&
    ball.x + BALL > paddle.x &&
    ball.y < paddle.y + PADDLE_H &&
    ball.y + BALL > paddle.y
  )
}

function bounceOff(paddle) {
  // -1 at the paddle's top edge, 0 in the middle, 1 at the bottom edge
  const offset = (ball.y + BALL / 2 - (paddle.y + PADDLE_H / 2)) / (PADDLE_H / 2)
  const speed = Math.abs(ball.vx)
  ball.vy = offset * 5
  if (paddle === left) {
    ball.vx = speed
    ball.x = left.x + PADDLE_W
  } else {
    ball.vx = -speed
    ball.x = right.x - BALL
  }
}

function update() {
  if (state !== 'playing') return
  if (keys.w) left.y -= PADDLE_SPEED
  if (keys.s) left.y += PADDLE_SPEED
  if (keys.ArrowUp) right.y -= PADDLE_SPEED
  if (keys.ArrowDown) right.y += PADDLE_SPEED
  left.y = clamp(left.y, 0, canvas.height - PADDLE_H)
  right.y = clamp(right.y, 0, canvas.height - PADDLE_H)

  ball.x += ball.vx
  ball.y += ball.vy
  if (ball.y < 0 || ball.y + BALL > canvas.height) {
    ball.vy = -ball.vy
    ball.y = clamp(ball.y, 0, canvas.height - BALL)
  }
  if (ball.vx < 0 && touches(left)) bounceOff(left)
  if (ball.vx > 0 && touches(right)) bounceOff(right)

  if (ball.x + BALL < 0) point(right)
  else if (ball.x > canvas.width) point(left)
}

function draw() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
  }

  ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)
  ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)
  if (state === 'playing') ctx.fillRect(ball.x, ball.y, BALL, BALL)

  ctx.font = '48px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(String(left.score), canvas.width / 4, 60)
  ctx.fillText(String(right.score), (canvas.width * 3) / 4, 60)

  if (state === 'over') {
    const winner = left.score >= WIN_SCORE ? 'Left' : 'Right'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText(winner + ' player wins!', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
