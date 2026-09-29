---
title: Does the ball touch a paddle?
title_tr: Top rakete değiyor mu?
skills: [game.collision]
---

# --goal--

Two rectangles overlap when they overlap horizontally **and** vertically. `touches(paddle)` checks the four edges and
answers `true` or `false`.

# --goal-tr--

Raketler topu karşılayabilmeli. Önce şu soruyu cevaplayalım: **top rakete değiyor mu?**

Top da raket de dikdörtgen. İki dikdörtgen, **hem yatayda hem dikeyde** üst üste biniyorsa çakışır. Yatayda biniyor ama
dikeyde binmiyorsa, top raketin üstünden ya da altından geçiyor demektir. Bu adımda yalnız soruyu soran fonksiyonu
yazıyoruz.

# --code--

```js
function touches(paddle) {
  return (
    ball.x < paddle.x + PADDLE_W &&
    ball.x + BALL > paddle.x &&
    ball.y < paddle.y + PADDLE_H &&
    ball.y + BALL > paddle.y
  )
}
```

# --meaning--

- Line 1: the ball's left edge is before the paddle's right edge. Line 2: the ball's right edge is past the paddle's
  left edge. Together: they overlap horizontally.
- Lines 3 and 4 do the same vertically. `&&` means "and": all four must be true.
- The parentheses let one `return` span several lines.

# --meaning-tr--

- `function touches(paddle)` → bir raket alır (parametre) ve `true` ya da `false` **geri verir**.
- `ball.x < paddle.x + PADDLE_W` → topun sol kenarı raketin sağ kenarından **önce** mi?
- `ball.x + BALL > paddle.x` → topun sağ kenarı raketin sol kenarını **geçti** mi? İkisi birlikte: yatayda biniyorlar.
- Son iki satır aynısını dikeyde soruyor: topun üstü raketin altından önce, topun altı raketin üstünü geçmiş.
- `&&` → "**ve**": dördü de doğru olmalı; biri bile yanlışsa `false`.
- `return ( ... )` → parantez, tek bir cevabı birkaç satıra yaymamızı sağlar.

# --task--

Under `clamp`, leave an empty line and write `touches`. Press **Run**.

# --task-tr--

`clamp` fonksiyonunun altına bir boş satır bırak ve `touches` fonksiyonunu yaz (`function update`'in üstünde). **Çalıştır**.

# --predict--

The ball is at x 25, y 300; the left paddle covers y 160 to 240. What does `touches(left)` say?
- [ ] `true`: it is level with the paddle horizontally
- [x] `false`: it is below the paddle
  It overlaps horizontally but not vertically, and all four checks must pass.
- [ ] An error

# --predict-tr--

Top x 25, y 300'de; sol raket y 160 ile 240 arasında. `touches(left)` ne der?
- [ ] `true`: yatayda raketin hizasında
- [x] `false`: raketin altında
  Yatayda biniyor ama dikeyde binmiyor; dört kontrolün hepsi doğru olmalı.
- [ ] Hata

# --tests--

`touches()` should detect overlap on both axes only.
tr: `touches()` yalnızca iki eksende de binmeyi algılamalı.

```js
ball = { x: 25, y: 200, vx: 0, vy: 0 }
assert.isTrue(touches(left))
ball = { x: 25, y: 300, vx: 0, vy: 0 }
assert.isFalse(touches(left), 'below the paddle')
ball = { x: 40, y: 200, vx: 0, vy: 0 }
assert.isFalse(touches(left), 'to the right of the paddle')
ball = { x: 25, y: 150, vx: 0, vy: 0 }
assert.isFalse(touches(left), 'just above: bottom edge exactly on the paddle top')
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
