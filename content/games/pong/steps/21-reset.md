---
title: Play again
title_tr: Yeniden oyna
skills: [game.state, prog.functions]
---

# --goal--

A `reset` function gathers everything a new match needs: paddles in place, scores at 0, playing, first serve. Space
calls it after a match.

# --goal-tr--

Yeni bir maç için her şeyi başa almalıyız: raketler yerine, skorlar sıfıra, durum "oynanıyor", ilk servis. Hepsini
tek bir `reset` (sıfırla) fonksiyonunda topluyoruz. Maç bitince **Boşluk** onu çağıracak; oyun açılırken de bir kez
çalışacak.

# --code--

```js
let left
let right
let ball
let state // 'playing' or 'over'

function reset() {
  left = { x: 20, y: 160, score: 0 }
  right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }
  state = 'playing'
  serve(1)
}

  if (event.key === ' ' && state === 'over') reset()

reset()
```

# --meaning--

- The variables are declared at the top without values; `reset` gives them their starting values.
- Space only restarts when the match is over.
- `reset()` at the bottom starts the first match (it replaces the old `serve(1)`).

# --meaning-tr--

- `let left` ... → değişkenler en üstte **değersiz** tanımlanır; değerlerini `reset` verir.
- `function reset() { ... }` → yeni maçın kurulumu: raketler, sıfır skor, `'playing'`, ilk servis. İçeride `let` yok,
  çünkü değişkenler yukarıda tanımlı; burada yalnız değer veriyoruz.
- `if (event.key === ' ' && state === 'over') reset()` → Boşluk'a basıldıysa **ve** maç bittiyse yeni maç.
- En alttaki `reset()` → eski `serve(1)`'in yerine; oyun açılırken ilk maçı kurar.

# --task--

1. Replace the four variable lines (`left` to `state`) with the plain declarations, and write `reset` under `const keys = {}`.
2. In the `keydown` listener, add the Space line.
3. Replace `serve(1)` at the bottom with `reset()`.

# --task-tr--

1. `let left = { ... }` satırından `let state = 'playing' ...` satırına kadar olan dört satırı, değer vermeyen
   tanımlarla değiştir (`let state // 'playing' or 'over'`).
2. `const keys = {}` satırının altına bir boş satır bırakıp `reset` fonksiyonunu yaz.
3. `keydown` dinleyicisinde `keys[event.key] = true` satırının altına Boşluk satırını yaz.
4. En alttaki `serve(1)` satırını `reset()` yap.
5. **Çalıştır**, bir maçı bitir ve Boşluk'a bas.

# --tests--

`reset()` should start a fresh match.
tr: `reset()` yepyeni bir maç başlatmalı.

```js
left.score = 5
right.score = 2
state = 'over'
reset()
assert.deepEqual([left.score, right.score, state], [0, 0, 'playing'])
assert.strictEqual(ball.x, 295)
```

Space should start a new match only when the match is over.
tr: Boşluk yeni maçı yalnız maç bitince başlatmalı.

```js
left.score = 3
$.tap(' ')
assert.strictEqual(left.score, 3, 'Space during a match does nothing')
state = 'over'
$.tap(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(left.score, 0)
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
