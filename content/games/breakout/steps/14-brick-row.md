---
title: A row of bricks
title_tr: Bir sıra tuğla
skills: [prog.loops, prog.arrays]
---

# --goal--

A row has 8 bricks. Rather than write 8 positions by hand, a `for` loop computes them and `push`es each brick into the
`bricks` array.

# --goal-tr--

Tuğlalar geliyor. Bir sırada **8 tuğla** olacak. Sekiz konumu elle yazmak yerine onları bir **döngü** ile
hesaplayacağız: her tuğla bir öncekinin bir tuğla eni artı bir boşluk sağında.

Tuğlaları bir **dizide** (listede) tutacağız: `bricks`. Bu adımda tuğlalar henüz **çizilmeyecek**; önce listeyi
kuruyoruz.

# --code--

```js
const COLS = 8
const BRICK_W = 54
const BRICK_H = 18
const GAP = 4
const TOP = 50
const LEFT = 10 // (480 - 8 bricks - 7 gaps) / 2, so the wall is centered

let bricks

function buildBricks() {
  bricks = []
  for (let col = 0; col < COLS; col++) {
    bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP, row: 0, alive: true })
  }
}
```

# --meaning--

- The constants: 8 columns, bricks 54×18, a 4-pixel gap, the wall 50 pixels from the top and 10 from the left.
- 8 bricks and 7 gaps take 460 pixels; the 20 left over make two 10-pixel margins, so the row is centered.
- `for (let col = 0; col < COLS; col++)` runs its body for `col` = 0, 1, ... 7.
- `push` adds an object to the end of the array. `alive` will tell us whether the brick is still standing.

# --meaning-tr--

- Sabitler: `COLS` sütun sayısı (8), `BRICK_W` ve `BRICK_H` tuğlanın eni ve boyu, `GAP` aralarındaki boşluk, `TOP`
  duvarın üstten, `LEFT` soldan uzaklığı.
- **`LEFT = 10` nereden geliyor?** 8 tuğla ve 7 boşluk `8 × 54 + 7 × 4 = 460` piksel tutar. 480'den 20 kalır;
  iki kenara 10'ar piksel: sıra **ortalanır**. Böyle sayıları bir kez hesaplayıp adlı sabitlere yazmak,
  pikselleri deneme yanılmayla kaydırmaktan çok daha iyidir.
- `bricks = []` → boş bir **dizi** (liste) ile başla.
- `for (let col = 0; col < COLS; col++) { ... }` → **döngü**. Parantezde üç parça var:
  - `let col = 0` → sayaç 0'dan başlasın.
  - `col < COLS` → sayaç 8'den küçük olduğu sürece devam et.
  - `col++` → her turdan sonra sayacı bir artır (`col += 1` ile aynı).
  Yani içerisi `col` = 0, 1, 2, ... 7 için **8 kez** çalışır.
- `LEFT + col * (BRICK_W + GAP)` → her sütun bir öncekinden 58 piksel sağda. `col = 1` için 10 + 58 = 68.
- `bricks.push({ ... })` → listenin **sonuna** yeni bir tuğla ekler. `row: 0` hangi sırada olduğu, `alive: true`
  "hâlâ ayakta" demek (`true` = evet, `false` = hayır). Kırılınca `false` yapacağız.

# --task--

1. Under `const BALL_R = 7` write the six constants.
2. Under `let ball` write `let bricks`.
3. Leave an empty line under `resetBall` and write `buildBricks`.

# --task-tr--

1. `const BALL_R = 7` satırının altına altı sabiti yaz.
2. `let ball` satırının altına `let bricks` yaz.
3. `resetBall` fonksiyonunun kapanış `}`'inin altına bir boş satır bırak ve `buildBricks` fonksiyonunu yaz.
4. **Çalıştır**: ekran değişmez (henüz kimse `buildBricks()`'i çağırmıyor), kontroller yeşil olmalı.

# --hint--

Inside `for (...)` the three parts are separated by semicolons: `let col = 0; col < COLS; col++`.

# --hint-tr--

`for (...)` parantezindeki üç parça noktalı virgülle ayrılır: `let col = 0; col < COLS; col++`.

# --tests--

`buildBricks()` should make a row of 8 bricks, left to right.
tr: `buildBricks()` soldan sağa 8 tuğlalık bir sıra yapmalı.

```js
buildBricks()
assert.lengthOf(bricks, 8)
assert.deepEqual(bricks[0], { x: 10, y: 50, row: 0, alive: true })
assert.deepEqual(bricks[1], { x: 68, y: 50, row: 0, alive: true })
assert.deepEqual(bricks[7], { x: 416, y: 50, row: 0, alive: true })
```

The row should be centered.
tr: Sıra ortalanmış olmalı.

```js
buildBricks()
const right = Math.max(...bricks.map((b) => b.x + BRICK_W))
assert.strictEqual(480 - right, bricks[0].x)
```

Calling `buildBricks()` again should start a fresh list, not add 8 more.
tr: `buildBricks()`'i yeniden çağırmak 8 tane daha eklememeli, listeyi baştan kurmalı.

```js
buildBricks()
buildBricks()
assert.lengthOf(bricks, 8)
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
const COLS = 8
const BRICK_W = 54
const BRICK_H = 18
const GAP = 4
const TOP = 50
const LEFT = 10 // (480 - 8 bricks - 7 gaps) / 2, so the wall is centered

let paddle = { x: 200 }
let ball
let bricks

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function resetBall() {
  ball = { x: 240, y: 200, vx: 3, vy: -4 }
}

function buildBricks() {
  bricks = []
  for (let col = 0; col < COLS; col++) {
    bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP, row: 0, alive: true })
  }
}

canvas.addEventListener('pointermove', (event) => {
  // Convert page coordinates to canvas pixels (the canvas may be displayed scaled).
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  paddle.x = clamp(x - PADDLE_W / 2, 0, canvas.width - PADDLE_W)
})

function update() {
  ball.x += ball.vx
  ball.y += ball.vy

  if (ball.x - BALL_R < 0 || ball.x + BALL_R > canvas.width) {
    ball.vx = -ball.vx
    ball.x = clamp(ball.x, BALL_R, canvas.width - BALL_R)
  }
  if (ball.y - BALL_R < 0) {
    ball.vy = Math.abs(ball.vy)
    ball.y = BALL_R
  }

  const onPaddle =
    ball.vy > 0 &&
    ball.y + BALL_R >= PADDLE_Y &&
    ball.y + BALL_R <= PADDLE_Y + PADDLE_H + ball.vy &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + PADDLE_W
  if (onPaddle) {
    // -1 at the paddle's left end, 0 in the middle, 1 at the right end
    const offset = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2)
    ball.vx = offset * 5
    ball.vy = -Math.abs(ball.vy)
    ball.y = PADDLE_Y - BALL_R
  }

  if (ball.y - BALL_R > canvas.height) resetBall()
}

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
  update()
  draw()
  requestAnimationFrame(loop)
}

resetBall()
requestAnimationFrame(loop)
```
