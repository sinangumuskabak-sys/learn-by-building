---
title: A bouncing ball
title_tr: Seken top
skills: [game.physics, game.collision]
---

# --explanation--

The ball has a position and a **velocity in two directions**: `vx` (how far it moves right each frame; negative means
left) and `vy` (down; negative means up). Moving is just adding them:

```js
ball.x += ball.vx
ball.y += ball.vy
```

Bouncing off a wall is surprisingly simple: **flip the sign** of the velocity that points into the wall. Hitting the
floor while moving down (`vy = 3`) turns into moving up (`vy = -3`), and the sideways speed is untouched. That is the
whole physics of a perfect bounce.

One subtle bug to avoid: the ball moves 3 pixels at a time, so it can end up slightly **inside** the wall. If it is
still inside on the next frame, the sign flips again and the ball gets stuck, jittering along the edge. So after
flipping, also put the ball back on the court edge.

# --explanation-tr--

Topun bir konumu ve **iki yönde hızı** vardır: `vx` (her karede ne kadar sağa gittiği; negatif sol demek) ve `vy`
(aşağı; negatif yukarı demek). Hareket etmek onları eklemekten ibaret:

```js
ball.x += ball.vx
ball.y += ball.vy
```

Duvardan sekmek şaşırtıcı derecede basit: duvara doğru bakan hızın **işaretini çevir**. Aşağı giderken (`vy = 3`)
zemine çarpmak yukarı gitmeye (`vy = -3`) dönüşür, yatay hız hiç değişmez. Kusursuz bir sekmenin bütün fiziği bu.

Kaçınılması gereken ince bir hata var: top 3'er piksel ilerlediği için duvarın biraz **içinde** kalabilir. Sonraki
karede hâlâ içerideyse işaret yeniden döner ve top kenar boyunca titreyerek takılır. Bu yüzden işareti çevirdikten
sonra topu saha kenarına da geri koy.

# --task--

1. Add `const BALL = 10` (the ball is a `BALL`×`BALL` square) and
   `let ball = { x: 295, y: 195, vx: 4, vy: 3 }`.
2. In `update()`, move the ball by `vx` and `vy`. If its top edge goes above `0` or its bottom edge
   (`ball.y + BALL`) goes below `canvas.height`, flip `vy` and clamp `ball.y` between `0` and
   `canvas.height - BALL`.
3. In `draw()`, draw the ball as a white square.

For now the ball flies through the paddles and off the sides. That comes next.

# --task-tr--

1. `const BALL = 10` (top `BALL`×`BALL` bir kare) ve `let ball = { x: 295, y: 195, vx: 4, vy: 3 }` ekle.
2. `update()` içinde topu `vx` ve `vy` kadar taşı. Üst kenarı `0`'ın üstüne ya da alt kenarı (`ball.y + BALL`)
   `canvas.height`'ın altına geçerse `vy`'yi çevir ve `ball.y`'yi `0` ile `canvas.height - BALL` arasında sınırla.
3. `draw()` içinde topu beyaz bir kare olarak çiz.

Şimdilik top raketlerin içinden geçip yanlardan çıkıyor. Sırada o var.

# --tests--

The ball should move by its velocity every frame.
tr: Top her karede hızı kadar hareket etmeli.

```js
assert.strictEqual(BALL, 10)
$.tick()
assert.include(ball, { x: 299, y: 198 })
$.tick(2)
assert.include(ball, { x: 307, y: 204 })
```

The ball should bounce off the bottom edge without going through it.
tr: Top alt kenardan içinden geçmeden sekmeli.

```js
ball = { x: 100, y: 388, vx: 4, vy: 3 }
update()
assert.strictEqual(ball.vy, -3)
assert.isAtMost(ball.y + BALL, 400)
update()
assert.isBelow(ball.y, 390, 'it should now move up')
```

The ball should bounce off the top edge.
tr: Top üst kenardan sekmeli.

```js
ball = { x: 100, y: 2, vx: 4, vy: -3 }
update()
assert.strictEqual(ball.vy, 3)
assert.isAtLeast(ball.y, 0)
```

The ball should be drawn as a white 10×10 square.
tr: Top beyaz 10×10 bir kare olarak çizilmeli.

```js
$.tick()
const squares = $.rects('white').filter((r) => r.w === 10 && r.h === 10)
assert.deepEqual(squares, [{ x: ball.x, y: ball.y, w: 10, h: 10, color: 'white' }])
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
