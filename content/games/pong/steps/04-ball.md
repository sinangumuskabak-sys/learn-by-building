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

**Bu adımda:** sahaya bir top koyacağız. Top çapraz gidecek, üst ve alt kenardan sekecek. Şimdilik raketlerin
içinden geçip yanlardan dışarı uçacak; onu sonraki adımlarda düzelteceğiz.

**Top neyi bilmeli?** Nerede olduğunu (`x`, `y`) ve her karede ne kadar kaydığını. Bu kaymaya **hız** (velocity)
denir ve iki parçası vardır:

- `vx` → her karede sağa kaç piksel gideceği. Eksi (negatif) sayı sola gitmek demektir.
- `vy` → her karede aşağı kaç piksel gideceği. Eksi sayı yukarı gitmek demektir.

```js
let ball = { x: 295, y: 195, vx: 4, vy: 3 }   // sağa 4, aşağı 3: sağ alta doğru çapraz
```

Hareket etmek, konuma hızı eklemektir. 3. adımda gördüğün `+=` burada da iş görür:

```js
ball.x += ball.vx
ball.y += ball.vy
```

**Sekme.** Top alt kenara aşağı giderken (`vy = 3`) çarptıysa, artık yukarı gitmeli (`vy = -3`). Yani sadece
`vy`'nin **işaretini çeviririz**; yandan hızı (`vx`) hiç değişmez. Mükemmel bir sekmenin bütün fiziği bu:

```js
ball.vy = -ball.vy   // 3 ise -3, -3 ise 3 olur
```

**"Ya da" demek: `||`.** Top ya tepeden taşarsa ya da dipten taşarsa seksin istiyoruz. İki koşulu `||` ("veya")
ile bağlarız; biri doğruysa bütünü doğrudur:

```js
if (ball.y < 0 || ball.y + BALL > canvas.height) { ... }
```

- `ball.y < 0` → topun üst kenarı canvas'ın üstüne taştı.
- `ball.y + BALL > canvas.height` → topun alt kenarı (üst kenar + boyu) 400'ü geçti. `>` "büyüktür" demektir.

**Gizli bir tuzak.** Top 3'er piksel zıpladığı için kenarın biraz **içine** girebilir. Bir sonraki karede hâlâ
içerideyse işaret yine döner ve top kenara yapışıp titrer. Bu yüzden sekince topu 3. adımdaki `clamp` ile sahanın
kenarına geri koyarız.

**`if` ve süslü parantez.** 3. adımda `if` tek satırlık işi aynı satıra yazıyordu. Birden çok iş varsa
`if (koşul) { ... }` yazılır ve hepsi süslü parantezin içine girer.

# --task--

1. Add `const BALL = 10` (the ball is a `BALL`×`BALL` square) and
   `let ball = { x: 295, y: 195, vx: 4, vy: 3 }`.
2. In `update()`, move the ball by `vx` and `vy`. If its top edge goes above `0` or its bottom edge
   (`ball.y + BALL`) goes below `canvas.height`, flip `vy` and clamp `ball.y` between `0` and
   `canvas.height - BALL`.
3. In `draw()`, draw the ball as a white square.

For now the ball flies through the paddles and off the sides. That comes next.

# --task-tr--

1. `const PADDLE_SPEED = 6` satırının altına top boyutunu ekle (yorumuyla birlikte):

   ```js
   const BALL = 10 // the ball is a BALL×BALL square
   ```

2. `let right = ...` satırının altına (`const keys = {}` satırının üstüne) topu ekle:

   ```js
   let ball = { x: 295, y: 195, vx: 4, vy: 3 }
   ```

3. `update()` fonksiyonunun içinde, `right.y = clamp(...)` satırından sonra, kapanan `}`'den önce bir boş satır
   bırak ve topu hareket ettirip sektiren kodu ekle. Fonksiyonun sonu şöyle olmalı:

   ```js
     right.y = clamp(right.y, 0, canvas.height - PADDLE_H)

     ball.x += ball.vx                                         // ← yeni
     ball.y += ball.vy                                         // ← yeni
     if (ball.y < 0 || ball.y + BALL > canvas.height) {        // ← yeni
       ball.vy = -ball.vy                                      // ← yeni
       ball.y = clamp(ball.y, 0, canvas.height - BALL)         // ← yeni
     }                                                         // ← yeni
   }
   ```

4. `draw()` fonksiyonunda, sağ raketi çizen `ctx.fillRect(right.x, ...)` satırının hemen altına topu çizen satırı
   ekle:

   ```js
   ctx.fillRect(ball.x, ball.y, BALL, BALL)
   ```

5. **Çalıştır**'a bas. Beyaz kare top çapraz gitmeli, alttan ve üstten sekmeli, sonra yandan sahadan çıkıp gitmeli
   (bu şimdilik normal). Alttaki kontrollerin hepsi yeşil olmalı.

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
