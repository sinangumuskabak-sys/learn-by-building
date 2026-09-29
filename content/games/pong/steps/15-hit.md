---
title: The paddles hit back
title_tr: Raketler geri vurur
skills: [game.collision, game.physics]
---

# --goal--

A ball moving left that touches the left paddle turns around, and is placed just outside the paddle so it does not
touch it again next frame. The same on the right.

# --goal-tr--

Artık raketler topu **geri vuracak**. Sola giden top sol rakete değerse yatay hızının işareti döner: sağa gider. Sağda da
aynısı.

İki incelik:

- Yalnız rakete **doğru gelen** topa bakarız (sola giden top ve sol raket). Yoksa yeni dönmüş top hâlâ raketin içindeyse
  bir kez daha döner ve raketin içinde titrer.
- Topu raketin hemen **dışına** koyarız; bir sonraki karede yeniden değmesin.

# --code--

```js
if (ball.vx < 0 && touches(left)) {
  ball.vx = -ball.vx
  ball.x = left.x + PADDLE_W
}
if (ball.vx > 0 && touches(right)) {
  ball.vx = -ball.vx
  ball.x = right.x - BALL
}
```

# --meaning--

- `ball.vx < 0` means moving left; together with `touches(left)`, the left paddle hits it.
- `ball.vx = -ball.vx` turns it around.
- `left.x + PADDLE_W` is the left paddle's right edge: the ball is put right next to it. For the right paddle, just
  before its left edge.

# --meaning-tr--

- `if (ball.vx < 0 && touches(left)) {` → top **sola** gidiyorsa (hız eksi) **ve** sol rakete değiyorsa...
  - `ball.vx = -ball.vx` → ...yatay yön döner: sağa.
  - `ball.x = left.x + PADDLE_W` → ...topu raketin sağ kenarına (30) koy: dışarıda.
- İkinci blok sağ raket için: `ball.vx > 0` (sağa gidiyor), top raketin sol kenarının hemen önüne: `right.x - BALL` (560).

# --task--

At the end of `update`, under the wall bounce block, write the two paddle blocks.

# --task-tr--

`update` içinde duvar sekmesi bloğunun kapanan `}` işaretinin **altına** (fonksiyonun son `}` işaretinden önce) iki raket bloğunu yaz. **Çalıştır**, raketi topun önüne getir: top sekmeli.

# --hint--

Check the signs: the left paddle only hits a ball with `vx < 0`, the right paddle one with `vx > 0`.

# --hint-tr--

İşaretleri kontrol et: sol raket yalnız `vx < 0` olan topa, sağ raket `vx > 0` olan topa vurur.

# --tests--

The left paddle should send the ball back to the right.
tr: Sol raket topu sağa geri göndermeli.

```js
ball = { x: 32, y: 190, vx: -4, vy: 0 }
update()
assert.strictEqual(ball.vx, 4)
assert.strictEqual(ball.x, 30)
update()
assert.strictEqual(ball.x, 34, 'the ball should move away, not get stuck')
```

The right paddle should send the ball back to the left.
tr: Sağ raket topu sola geri göndermeli.

```js
ball = { x: 559, y: 190, vx: 4, vy: 0 }
update()
assert.strictEqual(ball.vx, -4)
assert.strictEqual(ball.x, 560)
```

A ball that misses the paddle should keep going.
tr: Raketi ıskalayan top yoluna devam etmeli.

```js
ball = { x: 32, y: 300, vx: -4, vy: 0 }
update()
assert.strictEqual(ball.vx, -4)
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
