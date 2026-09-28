---
title: Bounce off the paddle, and aim
title_tr: Raketten sek ve nişan al
skills: [game.collision, game.physics]
---

# --explanation--

The ball should bounce off the paddle's **top face**. It touches when three things are true:

1. it is moving **down** (`vy > 0`), so a ball that just bounced cannot be caught again;
2. its bottom edge has reached the paddle: `ball.y + BALL_R >= PADDLE_Y`, but has not gone far past it (at most one
   frame's movement below the top face), so a ball that already slipped by is not yanked back up;
3. its center is over the paddle: `paddle.x <= ball.x <= paddle.x + PADDLE_W`.

Then send it up (`vy = -Math.abs(vy)`) and put it back on top of the paddle.

As in Pong, where it lands controls the angle. Normalize the hit position to `-1 … 1` across the paddle and use it for
the sideways speed:

```js
const offset = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2)   // -1 left end, 1 right end
ball.vx = offset * 5
```

Hitting the middle sends the ball straight up; the ends send it off at a steep angle. Without this rule the player
has no control over where the ball goes, and the last few bricks become a waiting game.

# --explanation-tr--

**Bu adımda:** top raketten sekecek. Raketi topun altına getirirsen top yukarı geri dönecek; raketin ortasına
denk gelirse dümdüz, uçlarına denk gelirse yana doğru açılı gidecek. Böylece topu nişan alabileceksin.

**Top rakete ne zaman değer?** Topun raketin **üst yüzüne** değdiğini söylemek için üç şeyin aynı anda doğru olması
gerekir:

1. Top **aşağı** gidiyor (`ball.vy > 0`). Böylece az önce seken top ikinci kez yakalanmaz.
2. Topun alt kenarı rakete ulaştı (`ball.y + BALL_R >= PADDLE_Y`) ama raketi fazla geçmedi: en fazla bir karelik
   hareket kadar (`ball.y + BALL_R <= PADDLE_Y + PADDLE_H + ball.vy`). Böylece raketin yanından çoktan kaçmış bir
   top geri yukarı çekilmez.
3. Topun merkezi raketin üstünde: `ball.x`, `paddle.x` ile `paddle.x + PADDLE_W` arasında.

Yeni işaretler:

- `>=` "büyük veya eşit mi?", `<=` "küçük veya eşit mi?"
- `&&` "**ve**": iki tarafı da doğruysa sonuç doğrudur. Beş parçayı `&&` ile bağlayınca "hepsi doğru mu?" diye
  sormuş oluruz.

Bu uzun sorunun cevabını (doğru ya da yanlış) bir ada koyarız: `onPaddle` ("raketin üstünde"). Uzun bir satırı
okunur olsun diye birkaç satıra bölebiliriz; `&&` satır sonunda durdukça bilgisayar devam ettiğini anlar:

```js
const onPaddle =
  ball.vy > 0 &&
  ball.y + BALL_R >= PADDLE_Y &&
  ...
```

Değdiyse topu yukarı göndeririz (`ball.vy = -Math.abs(ball.vy)`: eksisi atılıp başına eksi konan sayı her zaman
eksidir, yani yukarı) ve raketin tam üstüne koyarız (`ball.y = PADDLE_Y - BALL_R`).

**Nişan almak.** Topun rakete nereden değdiği açıyı belirler. Değdiği yeri raket boyunca `-1 … 1` arasına çeviririz:

```js
const offset = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2)
ball.vx = offset * 5
```

Parça parça:

- `paddle.x + PADDLE_W / 2` → raketin ortası. (Önce bölme yapılır, sonra toplama; matematikteki gibi.)
- `ball.x - (raketin ortası)` → top ortadan ne kadar sağda (artı) ya da solda (eksi).
- `/ (PADDLE_W / 2)` → bunu yarım raket boyuna bölünce sonuç sol uçta `-1`, ortada `0`, sağ uçta `1` olur.
- `* 5` → yan hız en fazla 5 piksel.

Ortadan vurmak topu dümdüz yukarı yollar; uçlar sert bir açıyla. Bu kural olmasaydı oyuncunun topun gideceği yere
hiç etkisi olmazdı ve son birkaç tuğla bir bekleme oyununa dönerdi.

# --task--

In `update()`, after the wall checks: when the three conditions above hold (use
`ball.y + BALL_R <= PADDLE_Y + PADDLE_H + ball.vy` for "not far past"), set `ball.vx = offset * 5`,
`ball.vy = -Math.abs(ball.vy)` and `ball.y = PADDLE_Y - BALL_R`.

# --task-tr--

1. `update()` fonksiyonunda, tavan kontrolünün (`if (ball.y - BALL_R < 0) { ... }`) kapanış `}`'inden sonra ve en
   alttaki `if (ball.y - BALL_R > canvas.height) resetBall()` satırından **önce**, raket kontrolünü ekle. Fonksiyon
   şöyle görünmeli:

   ```js
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

     const onPaddle =                                        // ← yeni
       ball.vy > 0 &&                                        // ← yeni
       ball.y + BALL_R >= PADDLE_Y &&                        // ← yeni
       ball.y + BALL_R <= PADDLE_Y + PADDLE_H + ball.vy &&   // ← yeni
       ball.x >= paddle.x &&                                 // ← yeni
       ball.x <= paddle.x + PADDLE_W                         // ← yeni
     if (onPaddle) {                                         // ← yeni
       // -1 at the paddle's left end, 0 in the middle, 1 at the right end
       const offset = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2)   // ← yeni
       ball.vx = offset * 5                                  // ← yeni
       ball.vy = -Math.abs(ball.vy)                          // ← yeni
       ball.y = PADDLE_Y - BALL_R                            // ← yeni
     }                                                       // ← yeni

     if (ball.y - BALL_R > canvas.height) resetBall()
   }
   ```

   `// ← yeni` yorumlarını yazman gerekmez.

2. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Fareyle raketi topun altına getir: top raketten sekmeli; raketin
   ucuyla vurursan yana açılı gitmeli. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa beş koşul
   satırının her birinin (sonuncusu hariç) `&&` ile bittiğinden emin ol.

# --tests--

Landing on the middle of the paddle should send the ball straight up.
tr: Raketin ortasına düşen top dümdüz yukarı gitmeli.

```js
paddle.x = 200
ball = { x: 240, y: 360, vx: 0, vy: 4 }
update()
assert.strictEqual(ball.vy, -4)
assert.strictEqual(ball.vx, 0)
assert.strictEqual(ball.y, 363)
```

Landing near an end should send the ball off at an angle.
tr: Uçlara yakın düşen top açıyla gitmeli.

```js
paddle.x = 200
ball = { x: 272, y: 360, vx: 0, vy: 4 }
update()
assert.closeTo(ball.vx, 4, 0.001)
ball = { x: 210, y: 360, vx: 0, vy: 4 }
update()
assert.closeTo(ball.vx, -3.75, 0.001)
```

A ball that misses the paddle should fall past it.
tr: Raketi ıskalayan top yanından düşmeli.

```js
paddle.x = 200
ball = { x: 150, y: 360, vx: 0, vy: 4 }
update()
assert.strictEqual(ball.vy, 4)
```

A ball moving up, or one that is already below the paddle, should not bounce.
tr: Yukarı giden ya da raketin çoktan altına inmiş bir top sekmemeli.

```js
paddle.x = 200
ball = { x: 240, y: 372, vx: 0, vy: -4 }
update()
assert.strictEqual(ball.vy, -4)
ball = { x: 240, y: 385, vx: 0, vy: 4 }
update()
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
