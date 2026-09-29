---
title: Keep the score
title_tr: Skoru tut
skills: [game.state]
---

# --goal--

Each paddle gets a score. When the ball gets past a player, the other one wins the point, then the serve goes to the
player who lost it.

# --goal-tr--

Her raket kendi **skorunu** taşısın. Top bir oyuncuyu geçince **öbürü** sayı alır, sonra servis sayıyı kaybedene
yapılır. Bunu `point` (sayı) adında bir fonksiyonda topluyoruz.

# --code--

```js
let left = { x: 20, y: 160, score: 0 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }

function point(winner) {
  winner.score += 1
  // Serve toward the player who just lost the point.
  serve(winner === left ? 1 : -1)
}

  if (ball.x + BALL < 0) point(right)
  else if (ball.x > canvas.width) point(left)
```

# --meaning--

- The paddle objects get a `score` field starting at 0.
- `point(winner)` adds a point to the paddle that won it.
- If the left player won, the loser is on the right, so the serve goes right (`1`), otherwise left (`-1`).

# --meaning-tr--

- `score: 0` → raket nesnelerine yeni bir alan: skor, 0'dan başlar.
- `function point(winner)` → parametre `winner` (kazanan) bir raket nesnesi: `left` ya da `right`.
- `winner.score += 1` → kazananın skoruna 1 ekle. Aynı fonksiyon iki oyuncu için de çalışır, çünkü hangi raketin
  verildiğine bakar.
- `winner === left ? 1 : -1` → kazanan soldaysa kaybeden sağdadır: servis **sağa** (`1`); değilse sola.
- Sol kenardan çıkan top: sağ oyuncu kazandı → `point(right)`. Sağdan çıkan: `point(left)`.

# --task--

1. Add `score: 0` to both paddles.
2. Under `serve`, write `point`.
3. In `update`, change the two `serve(...)` calls to `point(right)` and `point(left)`.

# --task-tr--

1. `left` ve `right` nesnelerine, `y: 160`'tan sonra `, score: 0` ekle.
2. `serve` fonksiyonunun altına bir boş satır bırakıp `point` fonksiyonunu yaz.
3. `update`'in sonundaki iki satırda `serve(-1)` yerine `point(right)`, `serve(1)` yerine `point(left)` yaz.
4. **Çalıştır**. (Skoru bir sonraki adımda ekranda göreceğiz.)

# --tests--

A ball past the left player should give the right player a point and serve to the left.
tr: Sol oyuncuyu geçen top sağ oyuncuya sayı vermeli ve sola servis edilmeli.

```js
ball = { x: -20, y: 100, vx: -4, vy: 3 }
update()
assert.strictEqual(right.score, 1)
assert.strictEqual(left.score, 0)
assert.strictEqual(ball.vx, -4)
```

A ball past the right player should give the left player a point.
tr: Sağ oyuncuyu geçen top sol oyuncuya sayı vermeli.

```js
ball = { x: 610, y: 100, vx: 4, vy: 3 }
update()
assert.strictEqual(left.score, 1)
assert.strictEqual(ball.vx, 4)
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

let left = { x: 20, y: 160, score: 0 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }
let ball
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
  if (ball.vx < 0 && touches(left)) {
    ball.vx = -ball.vx
    ball.x = left.x + PADDLE_W
  }
  if (ball.vx > 0 && touches(right)) {
    ball.vx = -ball.vx
    ball.x = right.x - BALL
  }

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
  ctx.fillRect(ball.x, ball.y, BALL, BALL)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

serve(1)
requestAnimationFrame(loop)
```
