---
title: Serve again
title_tr: Yeniden servis
skills: [game.state, prog.functions]
---

# --goal--

When the ball gets past a paddle it is gone for good. Now a `serve` function puts a new ball in the middle and sends it
toward the player who missed.

# --goal-tr--

Top bir raketi geçince sonsuza kadar kayboluyor. Bir **servis** fonksiyonu yazıyoruz: yeni topu ortaya koyar ve
kaçıran oyuncuya doğru yollar. Yukarı mı aşağı mı gideceği ise **rastgele** olsun, her servis aynı olmasın.

# --code--

```js
let ball

function serve(direction) {
  ball = {
    x: canvas.width / 2 - BALL / 2,
    y: canvas.height / 2 - BALL / 2,
    vx: 4 * direction,
    vy: Math.random() < 0.5 ? -3 : 3,
  }
}

  if (ball.x + BALL < 0) serve(-1)
  else if (ball.x > canvas.width) serve(1)

serve(1)
```

# --meaning--

- `serve(direction)` makes a new ball object in the middle. `direction` is `1` (to the right) or `-1` (to the left).
- `Math.random() < 0.5 ? -3 : 3` goes up or down, each half of the time.
- A ball fully past the left edge (`ball.x + BALL < 0`) means the left player missed: serve to the left (-1).
- `serve(1)` at the bottom makes the first ball.

# --meaning-tr--

- `let ball` → top artık baştan değer almıyor; onu `serve` kuracak.
- `function serve(direction)` → `direction` **yön**: `1` sağa, `-1` sola.
- `x: canvas.width / 2 - BALL / 2` → tam orta (topun genişliğinin yarısı kadar sola, ki ortası ortaya gelsin).
- `vx: 4 * direction` → hızın işaretini yön belirler: `4` ya da `-4`.
- `Math.random() < 0.5 ? -3 : 3` → **koşul ? evetse : hayırsa**: yarı yarıya yukarı (`-3`) ya da aşağı (`3`).
- `if (ball.x + BALL < 0) serve(-1)` → topun **sağ kenarı** bile sol duvarı geçtiyse sol oyuncu kaçırdı: servis ona
  doğru, sola.
- `else if (ball.x > canvas.width) serve(1)` → sağdan çıktıysa sağa doğru.
- En alttaki `serve(1)` → oyun başlarken ilk top.

# --task--

1. Change `let ball = { ... }` to just `let ball`.
2. Under `clamp`, write `serve`.
3. At the end of `update`, after an empty line, write the two out-of-bounds lines.
4. Call `serve(1)` right above `requestAnimationFrame(loop)` at the bottom.

# --task-tr--

1. `let ball = { x: 295, ... }` satırını yalnız `let ball` yap.
2. `clamp` fonksiyonunun altına bir boş satır bırakıp `serve` fonksiyonunu yaz.
3. `update` fonksiyonunun sonunda, sağ raket bloğunun kapanan `}` işaretinin altına bir boş satır bırak ve iki satırı
   yaz (fonksiyonun kendi `}` işaretinden önce).
4. En alttaki `requestAnimationFrame(loop)` satırının hemen **üstüne** `serve(1)` yaz.
5. **Çalıştır** ve bir topu kaçır: yenisi ortadan gelmeli.

# --hint--

`ball.x + BALL < 0` checks the ball's right edge, so the ball is really gone before the new serve.

# --hint-tr--

`ball.x + BALL < 0` topun **sağ kenarına** bakar; böylece yeni servisten önce top gerçekten ekrandan çıkmış olur.

# --tests--

`serve` should put a new ball in the middle, moving in the given direction.
tr: `serve` ortaya, verilen yöne giden yeni bir top koymalı.

```js
serve(-1)
assert.strictEqual(ball.x, 295)
assert.strictEqual(ball.y, 195)
assert.strictEqual(ball.vx, -4)
assert.include([-3, 3], ball.vy)
```

A ball past the left edge should be served again toward the left player.
tr: Sol kenarı geçen top sol oyuncuya doğru yeniden servis edilmeli.

```js
ball = { x: -20, y: 100, vx: -4, vy: 3 }
update()
assert.strictEqual(ball.x, 295)
assert.strictEqual(ball.vx, -4)
```

A ball past the right edge should be served toward the right player.
tr: Sağ kenarı geçen top sağ oyuncuya doğru servis edilmeli.

```js
ball = { x: 610, y: 100, vx: 4, vy: 3 }
update()
assert.strictEqual(ball.x, 295)
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

let left = { x: 20, y: 160 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }
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

  if (ball.x + BALL < 0) serve(-1)
  else if (ball.x > canvas.width) serve(1)
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
