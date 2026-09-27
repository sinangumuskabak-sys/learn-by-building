---
title: Aim with the paddle
title_tr: Raketle nişan al
skills: [game.physics]
---

# --explanation--

With a plain bounce, the ball keeps its angle forever and the player has no control. In the original Pong, **where**
the ball hits the paddle decides where it goes: the middle sends it straight back, the edges send it off at a steep
angle. That single rule turns a toy into a game of skill.

The trick is to turn "where on the paddle" into a number from `-1` to `1`. This is called **normalizing**:

```js
const ballCenter = ball.y + BALL / 2
const paddleCenter = paddle.y + PADDLE_H / 2
const offset = (ballCenter - paddleCenter) / (PADDLE_H / 2)   // -1 top edge, 0 middle, 1 bottom edge
ball.vy = offset * 5
```

Once a value is normalized, you can scale it to anything: `* 5` for a speed, `* 60` for an angle in degrees...
Normalizing is one of the most useful habits in game and graphics code.

To keep rallies exciting, each hit also makes the ball **5% faster**, up to a limit so it never gets faster than a
paddle can follow.

# --explanation-tr--

Düz bir sekmede top açısını sonsuza kadar korur ve oyuncunun hiçbir kontrolü olmaz. Orijinal Pong'da topun rakete
**nereden** çarptığı nereye gideceğine karar verir: orta kısım düz geri gönderir, kenarlar dik bir açıyla fırlatır. Bu
tek kural bir oyuncağı beceri oyununa çevirir.

Hile, "raketin neresi"ni `-1` ile `1` arasında bir sayıya çevirmek. Buna **normalleştirme** denir:

```js
const ballCenter = ball.y + BALL / 2
const paddleCenter = paddle.y + PADDLE_H / 2
const offset = (ballCenter - paddleCenter) / (PADDLE_H / 2)   // -1 üst kenar, 0 orta, 1 alt kenar
ball.vy = offset * 5
```

Bir değer normalleştirildikten sonra onu her şeye ölçekleyebilirsin: hız için `* 5`, derece cinsinden açı için
`* 60`... Normalleştirme, oyun ve grafik kodunda en yararlı alışkanlıklardan biridir.

Ralliler heyecanlı kalsın diye her vuruş topu **%5 hızlandırır**; bir sınıra kadar, ki top hiçbir zaman bir raketin
yetişemeyeceği kadar hızlanmasın.

# --task--

1. Write `function bounceOff(paddle)` that:
   - computes `offset` as above and sets `ball.vy = offset * 5`,
   - sets the horizontal speed to `Math.min(Math.abs(ball.vx) * 1.05, 12)`, pointing right (positive) after the left
     paddle and left (negative) after the right paddle,
   - pushes the ball out of the paddle as before.
2. Use `bounceOff(left)` and `bounceOff(right)` in `update()` instead of the plain flips.

# --task-tr--

1. Şunları yapan `function bounceOff(paddle)` yaz:
   - `offset`'i yukarıdaki gibi hesaplasın ve `ball.vy = offset * 5` yapsın,
   - yatay hızı `Math.min(Math.abs(ball.vx) * 1.05, 12)` yapsın; sol raketten sonra sağa (pozitif), sağ raketten
     sonra sola (negatif) baksın,
   - topu eskisi gibi raketin dışına itsin.
2. `update()` içinde düz çevirmeler yerine `bounceOff(left)` ve `bounceOff(right)` kullan.

# --tests--

Hitting the middle of the paddle should send the ball straight back.
tr: Raketin ortasına çarpmak topu düz geri göndermeli.

```js
ball = { x: 32, y: 195, vx: -4, vy: 0 }
update()
assert.closeTo(ball.vy, 0, 0.001)
assert.closeTo(ball.vx, 4.2, 0.001)
```

Hitting near the bottom edge should send the ball steeply down; the top edge steeply up.
tr: Alt kenara yakın çarpmak topu dik biçimde aşağı, üst kenara yakın çarpmak dik biçimde yukarı göndermeli.

```js
ball = { x: 32, y: 230, vx: -4, vy: 0 }
update()
assert.isAbove(ball.vy, 3.5)
ball = { x: 32, y: 152, vx: -4, vy: 0 }
update()
assert.isBelow(ball.vy, -3.5)
```

The right paddle should send the ball left, 5% faster.
tr: Sağ raket topu %5 daha hızlı sola göndermeli.

```js
ball = { x: 559, y: 195, vx: 6, vy: 0 }
update()
assert.closeTo(ball.vx, -6.3, 0.001)
assert.strictEqual(ball.x, 560)
```

The ball should never go faster than 12 horizontally.
tr: Top yatayda hiçbir zaman 12'den hızlı gitmemeli.

```js
ball = { x: 32, y: 195, vx: -11.8, vy: 0 }
update()
assert.strictEqual(ball.vx, 12)
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

let left = { x: 20, y: 160 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }
let ball = { x: 295, y: 195, vx: 4, vy: 3 }
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
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
  const speed = Math.min(Math.abs(ball.vx) * 1.05, 12)
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
  ctx.fillRect(ball.x, ball.y, BALL, BALL)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
