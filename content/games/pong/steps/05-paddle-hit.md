---
title: Hitting the ball back
title_tr: Topu geri vurmak
skills: [game.collision]
---

# --explanation--

The ball and the paddles are both rectangles, so the question "are they touching?" is the classic **AABB** test
(axis-aligned bounding boxes). Two boxes overlap when they overlap on **both** axes:

```js
ball.x < paddle.x + PADDLE_W &&   // ball's left edge is left of the paddle's right edge
ball.x + BALL > paddle.x &&       // ball's right edge is right of the paddle's left edge
ball.y < paddle.y + PADDLE_H &&   // same idea, vertically
ball.y + BALL > paddle.y
```

If any one of the four is false, there is a gap between them on that axis, so they cannot touch. This single
function is probably the most reused piece of code in 2D games.

On a hit, flip `vx`. Two details make it robust:

- **Only bounce when the ball is moving toward the paddle** (`vx < 0` for the left one). Otherwise a ball that is
  still overlapping on the next frame flips back *into* the paddle and gets trapped.
- **Push the ball out** so it sits right against the paddle's face, for the same reason as the walls.

# --explanation-tr--

**Bu adımda:** top raketlere çarpınca geri dönecek. Raketini topun yoluna koyarsan top sekip karşı tarafa gidecek;
ıskalarsan eskisi gibi dışarı uçacak.

**İki dikdörtgen değiyor mu?** Top da raket de dikdörtgendir. İki dikdörtgenin üst üste binip binmediğini anlamanın
klasik yolu (adı **AABB** testi): hem yatayda hem dikeyde üst üste binmeleri gerekir. Dört şartın hepsi doğru
olmalı:

```js
ball.x < paddle.x + PADDLE_W &&   // topun sol kenarı, raketin sağ kenarından solda
ball.x + BALL > paddle.x &&       // topun sağ kenarı, raketin sol kenarından sağda
ball.y < paddle.y + PADDLE_H &&   // topun üstü, raketin altından yukarıda
ball.y + BALL > paddle.y          // topun altı, raketin üstünden aşağıda
```

**"Ve" demek: `&&`.** 4. adımdaki `||` "biri yeterse" idi; `&&` ise "hepsi doğruysa" demektir. Dört şarttan
biri bile yanlışsa aralarında bir boşluk vardır, yani değmiyorlardır. Bu küçük kontrol 2D oyunlarda belki de en çok
tekrar kullanılan koddur.

**Soru soran fonksiyon.** Bunu `touches(paddle)` adlı bir fonksiyona koyarız. `paddle` parametresine hangi raketi
verirsek onu kontrol eder: `touches(left)` ya da `touches(right)`. Sonucu `return` ile `true` ya da `false` olarak
geri verir. Uzun ifade birkaç satıra yayıldığı için `return ( ... )` şeklinde parantez içine alınır.

**Çarpınca ne olur?** `vx`'in işaretini çeviririz, top ters yöne gider. İki ayrıntı önemli:

- **Sadece top rakete doğru geliyorsa sek.** Sol raket için bu `ball.vx < 0` (sola gidiyor) demektir. Yoksa bir
  sonraki karede hâlâ raketin içindeki top tekrar döner ve raketin içinde sıkışır.
- **Topu dışarı it.** Duvarlardaki gibi, topu raketin yüzeyine tam yaslanacak şekilde koyarız: sol raket için
  `left.x + PADDLE_W` (raketin sağ kenarı), sağ raket için `right.x - BALL`.

# --task--

1. Write `function touches(paddle)` that returns `true` when the ball's box overlaps the paddle's box.
2. In `update()`, after moving the ball: if it is moving left (`vx < 0`) and touches `left`, flip `vx` and set
   `ball.x = left.x + PADDLE_W`. If it is moving right and touches `right`, flip `vx` and set
   `ball.x = right.x - BALL`.

# --task-tr--

1. `clamp` fonksiyonunun kapanan `}`'sinden sonra bir boş satır bırak ve (`function update()`'in **üstüne**) şunu
   yaz:

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

2. `update()` fonksiyonunun içinde, üst/alt kenar sekmesini yapan `if (ball.y < 0 || ...) { ... }` bloğunun
   kapanışından sonra, fonksiyonun son `}`'sinden önce raket sekmelerini ekle. Fonksiyonun sonu şöyle olmalı:

   ```js
     if (ball.y < 0 || ball.y + BALL > canvas.height) {
       ball.vy = -ball.vy
       ball.y = clamp(ball.y, 0, canvas.height - BALL)
     }
     if (ball.vx < 0 && touches(left)) {                      // ← yeni
       ball.vx = -ball.vx                                     // ← yeni
       ball.x = left.x + PADDLE_W                             // ← yeni
     }                                                        // ← yeni
     if (ball.vx > 0 && touches(right)) {                     // ← yeni
       ball.vx = -ball.vx                                     // ← yeni
       ball.x = right.x - BALL                                // ← yeni
     }                                                        // ← yeni
   }
   ```

3. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Raketi topun önüne getir (`W`/`S` ya da ↑/↓): top raketten
   sekmeli. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `touches` içindeki `<` ve `>` işaretlerini
   yukarıdakiyle karşılaştır.

# --tests--

`touches()` should detect overlap on both axes only.
tr: `touches()` yalnızca iki eksende de kesişmeyi algılamalı.

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
