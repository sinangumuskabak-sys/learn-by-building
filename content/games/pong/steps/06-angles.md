---
title: Aim with the paddle
title_tr: Raketle nişan al
skills: [game.physics]
---

# --explanation--

With a plain bounce, the ball keeps its angle forever and the player has no control. In the original Pong, **where**
the ball hits the paddle decides where it goes: the middle sends it straight back, the edges send it off at a steep
angle. That single rule turns a toy into a game of skill.

The trick is to turn "where on the paddle" into a number from `-1` to `1`. This is called **normalizing**:

```js
const ballCenter = ball.y + BALL / 2
const paddleCenter = paddle.y + PADDLE_H / 2
const offset = (ballCenter - paddleCenter) / (PADDLE_H / 2)   // -1 top edge, 0 middle, 1 bottom edge
ball.vy = offset * 5
```

Once a value is normalized, you can scale it to anything: `* 5` for a speed, `* 60` for an angle in degrees...
Normalizing is one of the most useful habits in game and graphics code.

To keep rallies exciting, each hit also makes the ball **5% faster**, up to a limit so it never gets faster than a
paddle can follow.

# --explanation-tr--

**Bu adımda:** topun raketin **neresine** çarptığı, nereye gideceğini belirleyecek. Ortaya çarparsa düz döner,
kenarlara çarparsa dik bir açıyla yukarı ya da aşağı kaçar. Her vuruşta top biraz da hızlanır.

**Neden?** Şu anki sekmede top açısını hiç değiştirmiyor; oyuncunun topa bir etkisi yok. Orijinal Pong'daki tek
bir kural oyunu beceri oyununa çevirir: raketin ortası düz, kenarları açılı gönderir.

**"Raketin neresi?" sorusunu bir sayıya çevirmek.** Önce topun ve raketin **ortasını** buluruz. `/` bölmedir:

- topun ortası: `ball.y + BALL / 2` (üst kenar + boyunun yarısı)
- raketin ortası: `paddle.y + PADDLE_H / 2`

İkisinin farkı, topun raketin ortasından kaç piksel aşağıda (artı) ya da yukarıda (eksi) olduğunu söyler. Bu farkı
raketin yarı boyuna (40) bölersek sonuç hep **-1 ile 1 arasında** bir sayı olur: -1 üst kenar, 0 orta, 1 alt kenar.
Bir değeri böyle ortak bir aralığa getirmeye **normalleştirme** (normalizing) denir. Sonra onu istediğimiz ölçüye
büyütebiliriz: `offset * 5` → -5 ile 5 arası bir dikey hız.

Matematikteki gibi parantez önce hesaplanır; bölme ve çarpma, toplama ve çıkarmadan önce yapılır.

**Hızlanma.** Her vuruşta yatay hız %5 artar (`* 1.05`), ama en fazla 12 olur ki raket yetişebilsin:

- `Math.abs(sayı)` → sayının işaretsiz hâli (mutlak değer): `Math.abs(-4)` → 4.
- `Math.min(..., 12)` → 3. adımdan hatırla: ikisinden küçüğü. Yani 12'yi asla geçmez.

**Hangi raket? `===` ve `else`.** Sol raketten sonra top sağa (artı), sağ raketten sonra sola (eksi) gitmeli.
`paddle === left` "bu raket sol raketle aynı mı?" diye sorar (`===` "eşit mi" demektir; tek `=` ise değer atar).
`if (...) { ... } else { ... }` → koşul doğruysa ilk blok, değilse `else`'in ("yoksa") bloğu çalışır.

Kısacası `bounceOff(paddle)`, 5. adımdaki iki sekme bloğunun yaptığı işi (yön çevirme + dışarı itme) açıyla ve
hızlanmayla birlikte tek yerde yapar.

# --task--

1. Write `function bounceOff(paddle)` that:
   - computes `offset` as above and sets `ball.vy = offset * 5`,
   - sets the horizontal speed to `Math.min(Math.abs(ball.vx) * 1.05, 12)`, pointing right (positive) after the left
     paddle and left (negative) after the right paddle,
   - pushes the ball out of the paddle as before.
2. Use `bounceOff(left)` and `bounceOff(right)` in `update()` instead of the plain flips.

# --task-tr--

1. `touches` fonksiyonunun kapanan `}`'sinden sonra bir boş satır bırak ve (`function update()`'in **üstüne**) şunu
   yaz:

   ```js
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
   ```

2. `update()` içinde, 5. adımda yazdığın iki raket bloğunu (`if (ball.vx < 0 && touches(left)) { ... }` ve
   `if (ball.vx > 0 && touches(right)) { ... }`, süslü parantezleri ve içleriyle birlikte) **sil**. Yerlerine şu iki
   satırı yaz:

   ```js
     if (ball.vx < 0 && touches(left)) bounceOff(left)       // ← değişti
     if (ball.vx > 0 && touches(right)) bounceOff(right)     // ← değişti
   }
   ```

   Son `}`, `update()` fonksiyonunun kapanışıdır; o yerinde kalır.

3. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Topu raketin ucuyla karşıla: dik bir açıyla sekmeli. Ortayla
   karşılarsan düz dönmeli. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `offset` satırındaki
   parantezleri tek tek say.

# --tests--

Hitting the middle of the paddle should send the ball straight back.
tr: Raketin ortasına çarpmak topu düz geri göndermeli.

```js
ball = { x: 32, y: 195, vx: -4, vy: 0 }
update()
assert.closeTo(ball.vy, 0, 0.001)
assert.closeTo(ball.vx, 4.2, 0.001)
```

Hitting near the bottom edge should send the ball steeply down; the top edge steeply up.
tr: Alt kenara yakın çarpmak topu dik biçimde aşağı, üst kenara yakın çarpmak dik biçimde yukarı göndermeli.

```js
ball = { x: 32, y: 230, vx: -4, vy: 0 }
update()
assert.isAbove(ball.vy, 3.5)
ball = { x: 32, y: 152, vx: -4, vy: 0 }
update()
assert.isBelow(ball.vy, -3.5)
```

The right paddle should send the ball left, 5% faster.
tr: Sağ raket topu %5 daha hızlı sola göndermeli.

```js
ball = { x: 559, y: 195, vx: 6, vy: 0 }
update()
assert.closeTo(ball.vx, -6.3, 0.001)
assert.strictEqual(ball.x, 560)
```

The ball should never go faster than 12 horizontally.
tr: Top yatayda hiçbir zaman 12'den hızlı gitmemeli.

```js
ball = { x: 32, y: 195, vx: -11.8, vy: 0 }
update()
assert.strictEqual(ball.vx, 12)
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
  if (ball.vx < 0 && touches(left)) bounceOff(left)
  if (ball.vx > 0 && touches(right)) bounceOff(right)
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
