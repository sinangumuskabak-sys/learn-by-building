---
title: First to five
title_tr: Beşe ilk ulaşan
skills: [game.state]
---

# --goal--

A match ends when a player reaches 5 points. The game keeps a `state`: `'playing'` or `'over'`; when it is over,
nothing moves.

# --goal-tr--

Maç sonsuza kadar sürmesin: **5 sayıya** ilk ulaşan kazansın. Oyunun bir **durumu** (`state`) olacak: `'playing'`
(oynanıyor) ya da `'over'` (bitti). Bittiğinde hiçbir şey hareket etmesin.

# --code--

```js
const WIN_SCORE = 5
let state = 'playing' // 'playing' or 'over'

  if (winner.score >= WIN_SCORE) {
    state = 'over'
    return
  }

function update() {
  if (state !== 'playing') return
```

# --meaning--

- `WIN_SCORE` names the target once.
- In `point`, reaching it ends the game and `return` skips the serve.
- `update` does nothing unless the game is being played.

# --meaning-tr--

- `const WIN_SCORE = 5` → kazanma skoru tek yerde. 3 ya da 11 yapmak istersen yalnız burayı değiştirirsin.
- `let state = 'playing'` → oyunun durumu: başta "oynanıyor".
- `if (winner.score >= WIN_SCORE) { state = 'over'; return }` → kazanan 5'e ulaştıysa oyun biter; `return` servisi
  atlar (yeni top gelmez).
- `if (state !== 'playing') return` → `update`'in en başında: oynanmıyorsa hemen çık; raketler ve top donar.

# --task--

1. Under `BALL`, write `WIN_SCORE`; under `let ball`, write `let state`.
2. In `point`, write the check under `winner.score += 1`.
3. Make `if (state !== 'playing') return` the first line of `update`.

# --task-tr--

1. `const BALL = ...` satırının altına `WIN_SCORE`, `let ball` satırının altına `let state` satırını yaz.
2. `point` içinde `winner.score += 1` satırının altına `if (winner.score >= WIN_SCORE)` bloğunu yaz.
3. `update` fonksiyonunun **ilk satırı** `if (state !== 'playing') return` olsun.
4. **Çalıştır**.

# --tests--

Reaching 5 points should end the game without a new serve.
tr: 5 sayıya ulaşmak oyunu yeni servis olmadan bitirmeli.

```js
left.score = 4
ball = { x: 610, y: 100, vx: 4, vy: 3 }
update()
assert.strictEqual(left.score, 5)
assert.strictEqual(state, 'over')
assert.isAbove(ball.x, 600, 'no new serve')
```

Nothing should move once the game is over.
tr: Oyun bitince hiçbir şey hareket etmemeli.

```js
state = 'over'
ball = { x: 100, y: 100, vx: 4, vy: 3 }
update()
assert.strictEqual(ball.x, 100)
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

let left = { x: 20, y: 160, score: 0 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }
let ball
let state = 'playing' // 'playing' or 'over'
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

  ctx.font = '48px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(String(left.score), canvas.width / 4, 60)
  ctx.fillText(String(right.score), (canvas.width * 3) / 4, 60)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

serve(1)
requestAnimationFrame(loop)
```
