---
title: Circle meets box
title_tr: Daire kutuyla buluşuyor
skills: [game.collision]
---

# --explanation--

Checking box against box is the simplest collision test. But the ball is a circle, and treating it as a box makes it clip bricks it
visibly misses, especially at the corners. The proper test is short:

1. Find the **point of the brick closest to the ball's center**. That is just the center, clamped into the brick's
   rectangle:
   ```js
   const nearestX = clamp(ball.x, brick.x, brick.x + BRICK_W)
   const nearestY = clamp(ball.y, brick.y, brick.y + BRICK_H)
   ```
2. They touch when that point is within one radius of the center. Compare **squared** distances, which avoids a slow
   `Math.sqrt` and gives the same answer:
   ```js
   dx * dx + dy * dy <= BALL_R * BALL_R
   ```

Which way should it bounce? If the ball's center is within the brick's horizontal span, it came in through the top or
bottom face, so flip `vy`. Otherwise it hit a side, so flip `vx`.

Break at most **one brick per frame**. If the ball touches two at once and flips twice, the two flips cancel out and
the ball ploughs straight through the wall. `array.find` gives you just the first hit.

# --explanation-tr--

**Bu adımda:** top tuğlaları kıracak. Top bir tuğlaya değince o tuğla kaybolacak ve top geri sekecek: alttan ya da
üstten değerse yukarı/aşağı yönü, yandan değerse sağ/sol yönü dönecek.

**Daire ile kutu.** Topu da bir kutu gibi düşünüp iki kutuyu karşılaştırabilirdik, ama o zaman top, köşelerde
gözle görülür biçimde ıskaladığı tuğlaları da kırardı. Doğru yöntem kısa:

**1. Tuğlanın topun merkezine en yakın noktasını bul.** Bu, topun merkezini tuğlanın dikdörtgeninin içine
sıkıştırmaktır (1. adımda yazdığın `clamp` tam bunu yapar):

```js
const nearestX = clamp(ball.x, brick.x, brick.x + BRICK_W)
const nearestY = clamp(ball.y, brick.y, brick.y + BRICK_H)
```

Top tuğlanın solundaysa en yakın nokta sol kenardadır, üstündeyse üst kenarda, köşeye yakınsa köşede...

**2. O nokta merkeze bir yarıçaptan yakınsa değiyorlar.** İki nokta arasındaki uzaklık, okuldaki Pisagor
bağıntısıyla bulunur: yatay fark `dx`, dikey fark `dy` ise uzaklık `√(dx² + dy²)`'dir. Karekök yavaş bir işlemdir;
iki tarafın **karesini** karşılaştırmak aynı cevabı verir:

```js
dx * dx + dy * dy <= BALL_R * BALL_R
```

**Hangi yöne seksin?** Topun merkezi tuğlanın yatay aralığındaysa (tuğlanın tam altında ya da üstündeyse) üst veya
alt yüzden girmiştir: `vy`'yi ters çevir. Değilse bir yana çarpmıştır: `vx`'i ters çevir.

```js
if (throughTopOrBottom) ball.vy = -ball.vy
else ball.vx = -ball.vx
```

`else` "değilse" demektir: `if`'in koşulu yanlışsa `else`'ten sonraki komut çalışır.

**Karede en fazla bir tuğla.** Top aynı anda iki tuğlaya değer ve iki kez ters dönerse, iki dönüş birbirini siler
ve top duvarı dümdüz delip geçer. Bu yüzden sadece **ilk** değen tuğlayı alırız. `find` bunu yapar:

```js
const brick = bricks.find((b) => b.alive && hitsBrick(b))
```

"`bricks` listesinde, canlı **ve** topla değen ilk tuğlayı bul." Bulamazsa "hiçbir şey" (`undefined`) verir. Bu
yüzden sonraki satır `if (brick)` ile "bir tuğla bulunduysa" diye sorar.

# --task--

1. Write `function hitsBrick(brick)` that returns `true` when the circle touches the brick, using the nearest-point
   test above.
2. In `update()`, after the paddle check: find the first `alive` brick the ball hits. If there is one, set
   `alive = false`, then flip `vy` if `ball.x` is within `brick.x … brick.x + BRICK_W`, otherwise flip `vx`.

# --task-tr--

1. `canvas.addEventListener('pointermove', ...)` kodunun kapanış `})`'inden sonra bir boş satır bırak ve dairenin
   tuğlaya değip değmediğini soran fonksiyonu yaz:

   ```js
   function hitsBrick(brick) {
     // The point of the brick closest to the ball's center; they touch if it is within one radius.
     const nearestX = clamp(ball.x, brick.x, brick.x + BRICK_W)
     const nearestY = clamp(ball.y, brick.y, brick.y + BRICK_H)
     const dx = ball.x - nearestX
     const dy = ball.y - nearestY
     return dx * dx + dy * dy <= BALL_R * BALL_R
   }
   ```

   `return` bu karşılaştırmanın cevabını (doğru ya da yanlış) geri verir.

2. `update()` fonksiyonunda, raket kontrolünün `if (onPaddle) { ... }` kapanış `}`'inden sonra ve en alttaki
   `if (ball.y - BALL_R > canvas.height) resetBall()` satırından **önce**, tuğla kontrolünü ekle:

   ```js
       ball.y = PADDLE_Y - BALL_R
     }

     // Break at most one brick per frame, or two flips could cancel out.
     const brick = bricks.find((b) => b.alive && hitsBrick(b))                // ← yeni
     if (brick) {                                                              // ← yeni
       brick.alive = false                                                     // ← yeni
       const throughTopOrBottom = ball.x >= brick.x && ball.x <= brick.x + BRICK_W   // ← yeni
       if (throughTopOrBottom) ball.vy = -ball.vy                              // ← yeni
       else ball.vx = -ball.vx                                                 // ← yeni
     }                                                                         // ← yeni

     if (ball.y - BALL_R > canvas.height) resetBall()
   }
   ```

   `brick.alive = false` tuğlayı öldürür; çizim kodu onu artık atlayacağı için ekrandan kaybolur.

3. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Oynamak için önce oyuna tıkla ve raketle topu karşıla. Top değdiği
   tuğlaları tek tek kırmalı ve geri sekmeli. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `nearestX`
   ve `nearestY` satırlarında `BRICK_W` ile `BRICK_H`'nin yerini karıştırmadığından emin ol.

# --tests--

`hitsBrick()` should use the real distance, not the bounding box.
tr: `hitsBrick()` sınır kutusunu değil gerçek uzaklığı kullanmalı.

```js
const brick = { x: 100, y: 100, row: 0, alive: true }
ball = { x: 127, y: 125, vx: 0, vy: 0 }
assert.isTrue(hitsBrick(brick), 'exactly one radius below the bottom face')
ball = { x: 127, y: 126, vx: 0, vy: 0 }
assert.isFalse(hitsBrick(brick))
ball = { x: 95, y: 95, vx: 0, vy: 0 }
assert.isFalse(hitsBrick(brick), 'near the corner: the boxes overlap but the circle does not reach')
ball = { x: 96, y: 97, vx: 0, vy: 0 }
assert.isTrue(hitsBrick(brick))
```

Hitting a brick from below should break it and send the ball back down.
tr: Bir tuğlaya alttan çarpmak onu kırmalı ve topu aşağı geri göndermeli.

```js
bricks = [{ x: 100, y: 100, row: 0, alive: true }]
ball = { x: 127, y: 129, vx: 0, vy: -4 }
update()
assert.isFalse(bricks[0].alive)
assert.strictEqual(ball.vy, 4)
```

Hitting the side of a brick should flip the horizontal direction.
tr: Bir tuğlanın yanına çarpmak yatay yönü çevirmeli.

```js
bricks = [{ x: 100, y: 100, row: 0, alive: true }]
ball = { x: 92, y: 109, vx: 3, vy: 0 }
update()
assert.isFalse(bricks[0].alive)
assert.strictEqual(ball.vx, -3)
assert.strictEqual(ball.vy, 0)
```

Only one brick should break per frame, and dead bricks should be ignored.
tr: Karede yalnızca bir tuğla kırılmalı ve ölü tuğlalar görmezden gelinmeli.

```js
bricks = [
  { x: 100, y: 100, row: 0, alive: false },
  { x: 100, y: 100, row: 0, alive: true },
  { x: 100, y: 100, row: 0, alive: true },
]
ball = { x: 127, y: 129, vx: 0, vy: -4 }
update()
assert.deepEqual(bricks.map((b) => b.alive), [false, false, true])
assert.strictEqual(ball.vy, 4)
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
const ROWS = 5
const BRICK_W = 54
const BRICK_H = 18
const GAP = 4
const TOP = 50
const LEFT = 10 // (480 - 8 bricks - 7 gaps) / 2, so the wall is centered
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']

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
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP + row * (BRICK_H + GAP), row, alive: true })
    }
  }
}

canvas.addEventListener('pointermove', (event) => {
  // Convert page coordinates to canvas pixels (the canvas may be displayed scaled).
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  paddle.x = clamp(x - PADDLE_W / 2, 0, canvas.width - PADDLE_W)
})

function hitsBrick(brick) {
  // The point of the brick closest to the ball's center; they touch if it is within one radius.
  const nearestX = clamp(ball.x, brick.x, brick.x + BRICK_W)
  const nearestY = clamp(ball.y, brick.y, brick.y + BRICK_H)
  const dx = ball.x - nearestX
  const dy = ball.y - nearestY
  return dx * dx + dy * dy <= BALL_R * BALL_R
}

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

  // Break at most one brick per frame, or two flips could cancel out.
  const brick = bricks.find((b) => b.alive && hitsBrick(b))
  if (brick) {
    brick.alive = false
    const throughTopOrBottom = ball.x >= brick.x && ball.x <= brick.x + BRICK_W
    if (throughTopOrBottom) ball.vy = -ball.vy
    else ball.vx = -ball.vx
  }

  if (ball.y - BALL_R > canvas.height) resetBall()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const brick of bricks) {
    if (!brick.alive) continue
    ctx.fillStyle = COLORS[brick.row]
    ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H)
  }

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

buildBricks()
resetBall()
requestAnimationFrame(loop)
```
