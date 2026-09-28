---
title: A wall of bricks
title_tr: Tuğla duvarı
skills: [prog.loops, prog.arrays]
---

# --explanation--

The wall is 5 rows of 8 bricks. Rather than list 40 positions by hand, **compute** them with two loops, one inside the
other. The outer loop walks the rows; for each row, the inner loop walks the columns:

```js
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP + row * (BRICK_H + GAP), row, alive: true })
  }
}
```

Each step to the right adds one brick width plus a gap; each row down adds one brick height plus a gap. `{ row }` is
shorthand for `{ row: row }`.

Where does `LEFT = 10` come from? Eight bricks and seven gaps take `8 × 54 + 7 × 4 = 460` pixels, which leaves 20 of
the 480 for the two margins: 10 each, so the wall is centered. Working numbers like this out once, and writing them
as named constants, beats nudging pixels until it looks right.

Bricks carry an `alive` flag instead of being deleted right away, and the drawing code simply skips dead ones. The
color comes from a list indexed by the row: `COLORS[brick.row]`.

# --explanation-tr--

**Bu adımda:** ekranın üst kısmına rengârenk bir tuğla duvarı dizeceğiz: 5 sıra, her sırada 8 tuğla, her sıra ayrı
renkte (kırmızı, turuncu, sarı, yeşil, mavi). Top şimdilik tuğlaların içinden geçer; kırmayı sonraki adımda
ekleyeceğiz.

**Dizi (array): sıralı bir liste.** 40 tuğlayı tek tek ayrı değişkenlerde tutmak yerine hepsini bir **listede**
tutarız. Liste köşeli parantezle yazılır:

```js
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
```

Listedeki her elemanın bir sıra numarası (**index**) vardır ve sayma **0'dan başlar**: `COLORS[0]` kırmızı,
`COLORS[1]` turuncu, ... `COLORS[4]` mavi. `bricks.push(x)` listenin sonuna `x`'i ekler.

**Döngü: aynı işi tekrar tekrar yapmak.** 40 konumu elle yazmak yerine onları **hesaplarız**. `for` döngüsü bir
sayacı adım adım artırarak içindeki kodu tekrar tekrar çalıştırır:

```js
for (let col = 0; col < COLS; col++) {
  // bu kısım col = 0, 1, 2, ... 7 için birer kez çalışır
}
```

Parantezin içinde noktalı virgülle ayrılmış üç parça var:

- `let col = 0` → sayaç 0'dan başlasın.
- `col < COLS` → sayaç 8'den küçük olduğu sürece devam et.
- `col++` → her turdan sonra sayacı bir artır (`col += 1` ile aynı).

**İç içe döngü.** Duvar sıralardan, sıralar tuğlalardan oluşur. Dıştaki döngü sıraları gezer; **her sıra için**
içteki döngü sütunları gezer. Böylece 5 × 8 = 40 kez çalışır:

```js
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP + row * (BRICK_H + GAP), row, alive: true })
  }
}
```

Sağa her adım bir tuğla genişliği artı bir boşluk ekler; aşağı her sıra bir tuğla yüksekliği artı bir boşluk.
Örneğin 2. sütun (`col = 1`): `10 + 1 × (54 + 4)` = 68. `{ row }` kısaltmadır: `{ row: row }` ile aynı ("`row`
alanına `row` sayacının değerini koy").

**`LEFT = 10` nereden geliyor?** Sekiz tuğla ve yedi boşluk `8 × 54 + 7 × 4 = 460` piksel tutar. 480'den geriye 20
piksel kalır; iki kenara 10'ar piksel, yani duvar ortalanır. Böyle sayıları bir kez hesaplayıp adlı sabitlere yazmak,
"güzel görünene kadar pikselleri kaydırmaktan" çok daha iyidir.

**Hayatta mı?** Tuğlaları kırılınca hemen silmek yerine üstlerine `alive` (canlı) diye bir doğru/yanlış
**bayrağı** koyarız (`true` = evet, `false` = hayır). Çizim kodu ölü tuğlaları atlar:

```js
for (const brick of bricks) {
  if (!brick.alive) continue
  ...
}
```

- `for (const brick of bricks)` → "listedeki her eleman için, ona sırayla `brick` de".
- `!` "değil" demektir: `!brick.alive` = "canlı değilse".
- `continue` → "bu elemanı bırak, döngünün bir sonraki elemanına geç".

Renk, tuğlanın sıra numarasıyla listeden seçilir: `COLORS[brick.row]`.

# --task--

1. Add constants `COLS = 8`, `ROWS = 5`, `BRICK_W = 54`, `BRICK_H = 18`, `GAP = 4`, `TOP = 50`, `LEFT = 10` and
   `COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']` (one per row).
2. Add `let bricks` and `function buildBricks()` that fills it with the 40 bricks as above (row by row, left to right).
   Call it at startup.
3. In `draw()`, draw every brick that is `alive` in `COLORS[brick.row]`, `BRICK_W` × `BRICK_H`.

# --task-tr--

1. `const BALL_R = 7` satırının altına duvarın ayarlarını ekle:

   ```js
   const COLS = 8
   const ROWS = 5
   const BRICK_W = 54
   const BRICK_H = 18
   const GAP = 4
   const TOP = 50
   const LEFT = 10 // (480 - 8 bricks - 7 gaps) / 2, so the wall is centered
   const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
   ```

   Sütun ve sıra sayısı, tuğla eni ve boyu, aralarındaki boşluk, duvarın üstten ve soldan uzaklığı, sıra renkleri.

2. `let ball` satırının altına:

   ```js
   let bricks
   ```

3. `resetBall()` fonksiyonunun kapanış `}`'inden sonra bir boş satır bırak ve duvarı kuran fonksiyonu yaz:

   ```js
   function buildBricks() {
     bricks = []
     for (let row = 0; row < ROWS; row++) {
       for (let col = 0; col < COLS; col++) {
         bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP + row * (BRICK_H + GAP), row, alive: true })
       }
     }
   }
   ```

   Önce listeyi boşaltır, sonra 40 tuğlayı sıra sıra, soldan sağa ekler.

4. `draw()` fonksiyonunda, arka planı boyayan `ctx.fillRect(0, 0, canvas.width, canvas.height)` satırının altına
   (raketten **önce**) tuğlaları çizen döngüyü ekle:

   ```js
     for (const brick of bricks) {
       if (!brick.alive) continue
       ctx.fillStyle = COLORS[brick.row]
       ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H)
     }
   ```

5. En alttaki `resetBall()` satırının **üstüne** duvarı kuran çağrıyı ekle:

   ```js
   buildBricks()
   resetBall()
   requestAnimationFrame(loop)
   ```

6. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Üstte 5 renkli sıradan oluşan, ortalanmış bir tuğla duvarı görmelisin.
   Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa sayıları ve `push` satırındaki parantezleri kontrol et;
   iki döngünün sırası önemli: dışta `row`, içte `col`.

# --tests--

There should be 40 bricks, laid out row by row.
tr: Sıra sıra dizilmiş 40 tuğla olmalı.

```js
assert.lengthOf(bricks, 40)
assert.deepEqual(bricks[0], { x: 10, y: 50, row: 0, alive: true })
assert.deepEqual(bricks[1], { x: 68, y: 50, row: 0, alive: true })
assert.deepEqual(bricks[8], { x: 10, y: 72, row: 1, alive: true })
assert.deepEqual(bricks[39], { x: 416, y: 138, row: 4, alive: true })
```

The wall should be centered.
tr: Duvar ortalanmış olmalı.

```js
const right = Math.max(...bricks.map((b) => b.x + BRICK_W))
assert.strictEqual(480 - right, bricks[0].x)
```

Each row should be drawn in its own color.
tr: Her sıra kendi renginde çizilmeli.

```js
$.tick()
assert.lengthOf($.rects('#ef4444'), 8)
assert.lengthOf($.rects('#3b82f6'), 8)
assert.deepEqual($.rects('#3b82f6')[0], { x: 10, y: 138, w: 54, h: 18, color: '#3b82f6' })
```

Dead bricks should not be drawn.
tr: Ölü tuğlalar çizilmemeli.

```js
bricks[0].alive = false
bricks[9].alive = false
$.tick()
assert.lengthOf($.rects('#ef4444'), 7)
assert.lengthOf($.rects('#f97316'), 7)
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
