---
title: A computer opponent
title_tr: Bilgisayar rakip
skills: [game.state]
---

# --explanation--

Playing against yourself gets old. A computer opponent sounds like "AI", but a good Pong opponent is three lines:
**move the paddle toward the ball**.

```js
const target = ball.y + BALL / 2 - PADDLE_H / 2   // where the paddle's top should be to center the ball
right.y += clamp(target - right.y, -AI_SPEED, AI_SPEED)
```

`target - right.y` is how far the paddle is from where it wants to be. Clamping that to `±AI_SPEED` limits how fast it
can get there. That limit **is** the difficulty:

- a computer that moves instantly never misses, which is no fun;
- with `AI_SPEED = 4`, slower than the player's `6`, a fast, steep ball can beat it.

Game AI is rarely about being smart. It is about being **beatable in an interesting way**. A second touch makes it
feel more human: it only chases the ball when the ball is coming toward it, and drifts otherwise.

Keep two-player mode too: the `2` key toggles between the computer and a second human on the arrow keys.

# --explanation-tr--

Kendinle oynamak bir süre sonra sıkar. Bilgisayar rakip "yapay zekâ" gibi görünür ama iyi bir Pong rakibi üç
satırdır: **raketi topa doğru götür**.

```js
const target = ball.y + BALL / 2 - PADDLE_H / 2   // topu ortalamak için raketin üst kenarı nerede olmalı
right.y += clamp(target - right.y, -AI_SPEED, AI_SPEED)
```

`target - right.y`, raketin olmak istediği yere ne kadar uzak olduğudur. Bunu `±AI_SPEED` ile sınırlamak oraya ne
kadar hızlı gidebileceğini kısıtlar. Bu sınır zorluğun **ta kendisidir**:

- anında hareket eden bir bilgisayar hiç ıskalamaz, bu da eğlenceli değildir;
- oyuncunun `6`'sından yavaş olan `AI_SPEED = 4` ile hızlı ve dik bir top onu yenebilir.

Oyun yapay zekâsı nadiren akıllı olmakla ilgilidir. Asıl mesele **ilginç bir biçimde yenilebilir** olmaktır. İkinci
bir dokunuş onu daha insansı hissettirir: topu yalnızca top kendisine doğru gelirken kovalar, yoksa bekler.

İki oyunculu modu da koru: `2` tuşu bilgisayar ile ok tuşlarını kullanan ikinci bir insan arasında geçiş yapsın.

# --task--

1. Add `const AI_SPEED = 4` and `let twoPlayers = false`. In the `keydown` handler, pressing `'2'` should toggle
   `twoPlayers`.
2. In `update()`: move `right` with the arrow keys only when `twoPlayers` is true. Otherwise, when the ball is moving
   right (`ball.vx > 0`), move `right.y` toward `ball.y + BALL / 2 - PADDLE_H / 2` by at most `AI_SPEED` per frame.
3. Draw a small hint at the bottom center, for example in `'14px sans-serif'` and color `'#888'`:
   `W/S to move · press 2 for two players` (or `Two players · press 2 to play the computer` in two-player mode).

# --task-tr--

1. `const AI_SPEED = 4` ve `let twoPlayers = false` ekle. `keydown` işleyicisinde `'2'`'ye basmak `twoPlayers`'ı
   tersine çevirmeli.
2. `update()` içinde: `right`'ı ok tuşlarıyla yalnızca `twoPlayers` doğruysa hareket ettir. Değilse, top sağa
   giderken (`ball.vx > 0`) `right.y`'yi `ball.y + BALL / 2 - PADDLE_H / 2`'ye doğru karede en çok `AI_SPEED` kadar
   taşı.
3. Alt ortaya küçük bir ipucu çiz, örneğin `'14px sans-serif'` ve `'#888'` renginde:
   `W/S to move · press 2 for two players` (iki oyunculu modda `Two players · press 2 to play the computer`).

# --tests--

The computer should chase the ball at `AI_SPEED` while the ball comes toward it.
tr: Top kendisine doğru gelirken bilgisayar onu `AI_SPEED` hızında kovalamalı.

```js
assert.strictEqual(AI_SPEED, 4)
assert.isFalse(twoPlayers)
ball = { x: 300, y: 50, vx: 2, vy: 0 }
for (let i = 0; i < 10; i++) update()
assert.strictEqual(right.y, 120)
```

The computer should stop exactly on target instead of overshooting.
tr: Bilgisayar hedefi aşmadan tam üzerinde durmalı.

```js
ball = { x: 300, y: 197, vx: 1, vy: 0 }
right.y = 158
for (let i = 0; i < 5; i++) update()
assert.strictEqual(right.y, 162)
```

The computer should not chase a ball moving away from it.
tr: Bilgisayar kendisinden uzaklaşan topu kovalamamalı.

```js
ball = { x: 300, y: 50, vx: -2, vy: 0 }
for (let i = 0; i < 10; i++) update()
assert.strictEqual(right.y, 160)
```

The arrow keys should only move the right paddle in two-player mode, toggled with 2.
tr: Ok tuşları sağ raketi yalnızca `2` ile açılan iki oyunculu modda hareket ettirmeli.

```js
ball = { x: 300, y: 195, vx: -2, vy: 0 }
$.press('ArrowUp')
for (let i = 0; i < 5; i++) update()
assert.strictEqual(right.y, 160, 'arrows are ignored against the computer')
$.tap('2')
assert.isTrue(twoPlayers)
for (let i = 0; i < 5; i++) update()
assert.strictEqual(right.y, 130)
$.tap('2')
assert.isFalse(twoPlayers)
```

A hint about the controls should be drawn.
tr: Kontrollerle ilgili bir ipucu çizilmeli.

```js
$.tick()
assert.isTrue($.texts().some((text) => text.includes('press 2')))
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
const AI_SPEED = 4 // slower than the player, so the computer can be beaten
const BALL = 10 // the ball is a BALL×BALL square

let left = { x: 20, y: 160, score: 0 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }
let ball = { x: 295, y: 195, vx: 4, vy: 3 }
let twoPlayers = false
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === '2') twoPlayers = !twoPlayers
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
  if (twoPlayers) {
    if (keys.ArrowUp) right.y -= PADDLE_SPEED
    if (keys.ArrowDown) right.y += PADDLE_SPEED
  } else if (ball.vx > 0) {
    const target = ball.y + BALL / 2 - PADDLE_H / 2
    right.y += clamp(target - right.y, -AI_SPEED, AI_SPEED)
  }
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

  if (ball.x + BALL < 0) {
    right.score += 1
    serve(-1)
  } else if (ball.x > canvas.width) {
    left.score += 1
    serve(1)
  }
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

  ctx.fillStyle = '#888'
  ctx.font = '14px sans-serif'
  const hint = twoPlayers ? 'Two players · press 2 to play the computer' : 'W/S to move · press 2 for two players'
  ctx.fillText(hint, canvas.width / 2, canvas.height - 12)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
