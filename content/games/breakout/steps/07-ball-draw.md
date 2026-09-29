---
title: Draw a round ball
title_tr: Yuvarlak top çiz
skills: [game.canvas]
---

# --goal--

There is no "fill a circle" command. We describe a circle with `arc` and then fill it. And we call `resetBall()` once
at the start so the ball exists.

# --goal-tr--

Canvas'ta hazır bir "daire boya" komutu yok. Önce şekli **tarif ederiz** (merkez, yarıçap, tam bir tur), sonra
**boyarız**. Ayrıca oyun başlarken `resetBall()`'u bir kez çağıracağız ki top gerçekten var olsun.

Bu adımdan sonra ortada beyaz, yuvarlak bir top göreceksin; henüz kıpırdamıyor.

# --code--

```js
  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
  ctx.fill()

resetBall()
```

# --meaning--

- `beginPath()` starts a new shape; `arc(x, y, r, start, end)` adds a circle around `(x, y)`; `fill()` paints it.
- Angles are in radians: from `0` to `Math.PI * 2` is one full turn.
- `resetBall()` above `requestAnimationFrame(loop)` sets the ball before the first frame is drawn.

# --meaning-tr--

- `ctx.fillStyle = '#f8fafc'` → neredeyse beyaz bir renk.
- `ctx.beginPath()` → "yeni bir şekle başlıyorum". Bunu unutursan önceki şekiller de yeniden boyanabilir.
- `ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)` → merkezi `(ball.x, ball.y)`, yarıçapı `BALL_R` olan bir
  **yay** çizer. Son iki sayı başlangıç ve bitiş açısı. Açılar **radyan** ile verilir: `0`'dan `Math.PI * 2`'ye
  (2π ≈ 6.28) kadar **tam bir tur**, yani bir daire.
- `ctx.fill()` → tarif edilen şekli boyar.
- `resetBall()` → topu ilk kez yerleştirir. Döngü başlamadan önce olmalı; yoksa ilk çizimde `ball` boş olur ve
  `ball.x` hata verir.

# --task--

1. In `draw`, under the paddle's `fillRect` line, leave an empty line and write the four ball lines.
2. Write `resetBall()` on its own line just above the last `requestAnimationFrame(loop)`.

# --task-tr--

1. `draw` içinde raketi çizen `ctx.fillRect(paddle.x, ...)` satırının altına bir boş satır bırak ve topu çizen dört
   satırı yaz.
2. En alttaki `requestAnimationFrame(loop)` satırının **hemen üstüne** `resetBall()` yaz.
3. **Çalıştır**: ortada beyaz bir top görmelisin.

# --hint--

If the screen goes empty, open the console: `Cannot read properties of undefined` means `resetBall()` is missing or is
below `requestAnimationFrame(loop)`.

# --hint-tr--

Ekran boşaldıysa: `Cannot read properties of undefined` hatası `resetBall()`'un eksik olduğunu ya da
`requestAnimationFrame(loop)` satırının altında kaldığını gösterir.

# --try--

Change `Math.PI * 2` to `Math.PI`: you get half a ball. Put it back.

# --try-tr--

`Math.PI * 2` yerine `Math.PI` yaz: yarım top çıkar. Sonra geri al.

# --tests--

The ball should start in the middle.
tr: Top ortada başlamalı.

```js
assert.deepEqual(ball, { x: 240, y: 200, vx: 3, vy: -4 })
```

The ball should be drawn as a white circle of radius 7.
tr: Top 7 yarıçaplı beyaz bir daire olarak çizilmeli.

```js
$.tick()
assert.deepEqual($.arcs(), [{ x: 240, y: 200, r: 7, color: '#f8fafc' }])
```

# --solution--

```js
// Breakout, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 80
const PADDLE_H = 12
const PADDLE_Y = 370
const BALL_R = 7

let paddle = { x: 200 }
let ball

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function resetBall() {
  ball = { x: 240, y: 200, vx: 3, vy: -4 }
}

canvas.addEventListener('pointermove', (event) => {
  // Convert page coordinates to canvas pixels (the canvas may be displayed scaled).
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  paddle.x = clamp(x - PADDLE_W / 2, 0, canvas.width - PADDLE_W)
})

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)

  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

resetBall()
requestAnimationFrame(loop)
```
