---
title: Points and serving
title_tr: Sayılar ve servis
skills: [game.state, prog.functions]
---

# --explanation--

When the ball gets past a paddle and leaves the court, the other player wins the point. The ball then has to be
**served** again from the middle.

"Put the ball in the middle and send it off" is needed in more than one place (after each point, and later when a
new game starts), so give it a name: a `serve(direction)` function. `direction` is `1` to send it right or `-1` to
send it left, and multiplying keeps the code short:

```js
vx: 4 * direction   // 4 or -4
```

A little randomness keeps serves from being predictable: `Math.random() < 0.5 ? -3 : 3` picks up or down with equal
chance. This is the conditional (ternary) operator, `condition ? valueIfTrue : valueIfFalse`, an expression you can use
anywhere a value goes.

Scores belong to the players, so store them on the paddle objects: `left.score`, `right.score`.

# --explanation-tr--

**Bu adımda:** skor tutacağız. Top bir raketi geçip sahadan çıkınca karşı oyuncu bir sayı alacak, top ortadan
yeniden başlayacak. Sahanın üstünde iki büyük skor yazısı göreceksin.

**Skor kimin?** Oyuncunun. O yüzden her raketin nesnesine bir alan daha ekleriz: `score: 0`. Artık `left.score` ve
`right.score` diye okuyabiliriz.

**Servis fonksiyonu.** "Topu ortaya koy ve yola çıkar" işi birden fazla yerde gerekiyor (her sayıdan sonra, ileride
yeni oyun başlarken). Bu yüzden ona bir ad veririz: `serve(direction)`. `direction` (yön) parametresi `1` ise top
sağa, `-1` ise sola gider. Çarpma işi kısaltır:

```js
vx: 4 * direction   // 4 ya da -4
```

Top nesnesini baştan yeni bir nesneyle değiştiririz. Uzun nesneleri böyle birkaç satıra bölüp yazabilirsin; her
alandan sonra virgül koyulur:

```js
ball = {
  x: canvas.width / 2 - BALL / 2,     // 300 - 5 = 295: tam orta
  y: canvas.height / 2 - BALL / 2,
  vx: 4 * direction,
  vy: Math.random() < 0.5 ? -3 : 3,
}
```

**Biraz şans.** `Math.random()` her çağrıldığında 0 ile 1 arasında rastgele bir sayı verir (1 hariç). "0.5'ten küçük
mü?" sorusu yazı-tura atmak gibidir: yarı yarıya ihtimal.

**Soru işaretli kısa karar: `? :`.** `koşul ? evetse : hayırsa` → koşul doğruysa ilk değeri, değilse ikinciyi
verir. `Math.random() < 0.5 ? -3 : 3` "yazı gelirse -3 (yukarı), tura gelirse 3 (aşağı)" demektir. Bu, bir değer
yazılabilen her yere yazılabilir.

**Top dışarıda mı?** Sol kenardan tamamen çıktıysa sağ kenarı bile 0'ın solundadır: `ball.x + BALL < 0`. Sağdan
çıktıysa sol kenarı 600'ü geçmiştir: `ball.x > canvas.width`. İki durum aynı anda olamayacağı için
`if ... else if ...` kullanırız: ilki doğru değilse ikincisine bakılır. `+= 1` skoru bir artırır. Top, sayıyı
kaybeden oyuncuya doğru servis edilir.

**Yazı çizmek.** Fırçayla yazı da yazılır:

```js
ctx.font = '48px monospace'   // yazı boyu ve türü
ctx.textAlign = 'center'      // verilen x, yazının ortası olsun
ctx.fillText('7', 150, 60)    // yazı, x, y
```

`fillText` yazı ister; skor bir sayı olduğu için `String(left.score)` ile yazıya çeviririz.

# --task--

1. Give both paddles `score: 0`.
2. Write `function serve(direction)` that puts the ball in the center
   (`x: canvas.width / 2 - BALL / 2`, `y: canvas.height / 2 - BALL / 2`) with `vx: 4 * direction` and a random `vy`
   of `-3` or `3`.
3. In `update()`, after the paddle checks: if the ball is completely off the left edge (`ball.x + BALL < 0`), give
   `right` a point and `serve(-1)`. If it is completely off the right edge (`ball.x > canvas.width`), give `left` a
   point and `serve(1)`. (The ball goes toward the player who just lost the point.)
4. In `draw()`, show each score in white `48px monospace` text, centered at `x = canvas.width / 4` and
   `x = canvas.width * 3 / 4`, `y = 60`.

# --task-tr--

1. Raket satırlarına `score: 0` ekle. İki satır şöyle olmalı:

   ```js
   let left = { x: 20, y: 160, score: 0 }                               // ← değişti
   let right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }    // ← değişti
   ```

2. `clamp` fonksiyonunun kapanan `}`'sinden sonra bir boş satır bırak ve (`function touches`'ın **üstüne**) servis
   fonksiyonunu yaz:

   ```js
   function serve(direction) {
     ball = {
       x: canvas.width / 2 - BALL / 2,
       y: canvas.height / 2 - BALL / 2,
       vx: 4 * direction,
       vy: Math.random() < 0.5 ? -3 : 3,
     }
   }
   ```

3. `update()` içinde, `if (ball.vx > 0 && touches(right)) bounceOff(right)` satırından sonra, fonksiyonun son
   `}`'sinden önce bir boş satır bırak ve şunu ekle:

   ```js
     if (ball.vx > 0 && touches(right)) bounceOff(right)

     if (ball.x + BALL < 0) {              // ← yeni
       right.score += 1                    // ← yeni
       serve(-1)                           // ← yeni
     } else if (ball.x > canvas.width) {   // ← yeni
       left.score += 1                     // ← yeni
       serve(1)                            // ← yeni
     }                                     // ← yeni
   }
   ```

4. `draw()` içinde, topu çizen `ctx.fillRect(ball.x, ball.y, BALL, BALL)` satırından sonra bir boş satır bırak ve
   skorları yazan satırları ekle (fırça hâlâ beyaz):

   ```js
     ctx.font = '48px monospace'
     ctx.textAlign = 'center'
     ctx.fillText(String(left.score), canvas.width / 4, 60)
     ctx.fillText(String(right.score), (canvas.width * 3) / 4, 60)
   ```

   `canvas.width / 4` sol yarının ortası (150), `(canvas.width * 3) / 4` sağ yarının ortası (450).

5. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Topu kaçır: karşı tarafın skoru bir artmalı ve top ortadan
   yeniden çıkmalı. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

Both players should start with 0 points.
tr: İki oyuncu da 0 sayıyla başlamalı.

```js
assert.strictEqual(left.score, 0)
assert.strictEqual(right.score, 0)
```

`serve()` should put the ball in the middle, moving the given way.
tr: `serve()` topu ortaya koymalı ve verilen yöne göndermeli.

```js
serve(-1)
assert.include(ball, { x: 295, y: 195, vx: -4 })
assert.strictEqual(Math.abs(ball.vy), 3)
serve(1)
assert.strictEqual(ball.vx, 4)
```

A ball off the left edge should score for the right player and serve toward the left.
tr: Sol kenardan çıkan top sağ oyuncuya sayı yazmalı ve sola doğru servis edilmeli.

```js
ball = { x: -8, y: 200, vx: -4, vy: 0 }
update()
assert.strictEqual(right.score, 1)
assert.strictEqual(left.score, 0)
assert.include(ball, { x: 295, y: 195, vx: -4 })
```

A ball off the right edge should score for the left player.
tr: Sağ kenardan çıkan top sol oyuncuya sayı yazmalı.

```js
ball = { x: 598, y: 200, vx: 4, vy: 0 }
update()
assert.strictEqual(left.score, 1)
assert.strictEqual(ball.vx, 4)
```

The scores should be drawn.
tr: Skorlar çizilmeli.

```js
left.score = 3
right.score = 7
$.tick()
assert.includeMembers($.texts(), ['3', '7'])
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

let left = { x: 20, y: 160, score: 0 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }
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

  if (ball.x + BALL < 0) {
    right.score += 1
    serve(-1)
  } else if (ball.x > canvas.width) {
    left.score += 1
    serve(1)
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

  ctx.font = '48px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(String(left.score), canvas.width / 4, 60)
  ctx.fillText(String(right.score), (canvas.width * 3) / 4, 60)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
