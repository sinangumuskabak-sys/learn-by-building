---
title: The ball moves
title_tr: Top hareket eder
skills: [game.physics]
---

# --goal--

The ball gets a velocity: `vx` pixels to the right and `vy` pixels down every frame. `update` adds them to its position.

# --goal-tr--

Top hareket etsin. Hareket iki sayıyla anlatılır: her karede x ne kadar değişecek (`vx`, yatay hız) ve y ne kadar
değişecek (`vy`, dikey hız). Hız, "her karede kaç piksel" demek.

`vx: 4, vy: 3` → her karede 4 piksel sağa, 3 piksel aşağı: top **çapraz** gider.

# --code--

```js
let ball = { x: 295, y: 195, vx: 4, vy: 3 }

  ball.x += ball.vx
  ball.y += ball.vy
```

# --meaning--

- `vx` and `vy` are the ball's speed in pixels per frame. A negative `vx` would go left, a negative `vy` up.
- Each frame the position grows by the speed.

# --meaning-tr--

- `vx: 4, vy: 3` → topun nesnesine hız bilgisi (v: velocity, hız). Eksi `vx` sola, eksi `vy` yukarı demek olurdu.
- `ball.x += ball.vx` → x'e hızı ekle: sağa 4 piksel.
- `ball.y += ball.vy` → y'ye hızı ekle: aşağı 3 piksel.
- Bu satırlar `update`'in sonunda, raketlerden sonra.

# --task--

1. Add `vx: 4, vy: 3` to `ball`.
2. At the end of `update`, leave an empty line and write the two ball lines.

# --task-tr--

1. `let ball = ...` satırında `y: 195`'ten sonra `, vx: 4, vy: 3` ekle.
2. `update` içinde son `clamp` satırının altına bir boş satır bırak ve topu hareket ettiren iki satırı yaz.
3. **Çalıştır**: top çapraz gidip sahadan çıkmalı (bu şimdilik normal).

# --try--

Start the ball with `vx: -4` and run: it goes left. Put `4` back.

# --try-tr--

Topu `vx: -4` ile başlat ve çalıştır: sola gider. Sonra `4`'e geri al.

# --tests--

The ball should move by its velocity every frame.
tr: Top her karede hızı kadar hareket etmeli.

```js
$.tick()
assert.include(ball, { x: 299, y: 198 })
$.tick(2)
assert.include(ball, { x: 307, y: 204 })
```

The ball on screen should follow its position.
tr: Ekrandaki top konumunu izlemeli.

```js
$.tick(5)
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
