---
title: Score, winning and a new game
title_tr: Skor, kazanmak ve yeni oyun
skills: [game.state, prog.functions]
---

# --explanation--

Two things are missing: a score, and a way to **win**. The player wins when no brick is left alive. `array.every` asks
exactly that question:

```js
bricks.every((brick) => !brick.alive)   // true when every brick is dead
```

`every` and `some` are opposites of each other: "is it true for all?" and "is it true for at least one?". Together with
`find`, `filter` and `map`, they replace most hand-written loops over arrays, and the code says what it means.

Both endings, `'won'` and `'lost'`, lead to the same place: a click or Space starts a **new game**. That means
rebuilding the wall, refilling the lives, zeroing the score and serving again. Put all of it in `newGame()` and call it
at startup too, the same "one reset function" rule as in every game so far.

# --explanation-tr--

**Bu adımda:** skor, kazanma ve yeni oyun ekleyeceğiz. Sağ üstte `Score: 0` yazacak ve her kırılan tuğla 10 puan
getirecek. Bütün tuğlaları kırınca `You win!` çıkacak; kazansan da kaybetsen de altında `Click to play again`
yazacak ve tıklayınca (ya da Boşluk'a basınca) duvar yeniden kurulup yeni oyun başlayacak.

**Ne zaman kazanılır?** Hiç canlı tuğla kalmadığında. Listeler bu soruyu doğrudan sorabilir:

```js
bricks.every((b) => !b.alive)   // bütün tuğlalar ölü mü?
```

`every` ("her biri") listedeki her elemanı sırayla küçük fonksiyona verir; **hepsi** için cevap doğruysa sonuç
doğrudur. Tersi `some`'dır: "**en az biri** için doğru mu?". Önceki adımlarda gördüğün `find` (ilk uyanı bul) ile
birlikte bunlar, listeler üzerinde elle yazılan döngülerin çoğunun yerini tutar ve kod ne demek istediğini
doğrudan söyler.

**İki son, tek kapı.** İki bitiş (`'won'` kazandı ve `'lost'` kaybetti) aynı yere çıkar: bir tıklama ya da Boşluk
**yeni bir oyun** başlatır. Yeni oyun demek: duvarı yeniden kur, canları doldur, skoru sıfırla, servise dön. Bunların
hepsini tek bir `newGame()` fonksiyonuna koyarız ve oyunun en başında da onu çağırırız. İlk oyunla onuncu oyun aynı
koddan başlasın ki farklı başlamasınlar.

`newGame()`, kendisinden daha aşağıda yazılmış `buildBricks()`'i çağırıyor; bu sorun değil. Önemli olan, `newGame()`
**çalıştırıldığı** anda (en alttaki çağrıda) bütün fonksiyonların tanımlanmış olmasıdır.

**Kısa bir "eğer": `? :`.** Kazandıysak `You win!`, kaybettiysek `Game Over` yazmak için tek satırlık bir seçim
kullanırız:

```js
state === 'won' ? 'You win!' : 'Game Over'
```

"Soru `?` evetse şu `:` değilse bu" diye okunur. Durum `'won'` ise sonuç `'You win!'`, değilse `'Game Over'` olur.

**Sağa yaslı yazı.** `ctx.textAlign = 'right'` verilen noktayı yazının **sağ ucu** yapar. Skoru
`canvas.width - 10` noktasına yazınca, sayı kaç haneli olursa olsun sağ kenardan 10 piksel içeride biter.

# --task--

1. Add `let score`. Each broken brick adds `10`.
2. After breaking a brick, if every brick is dead, set `state = 'won'`.
3. Write `function newGame()` that calls `buildBricks()`, sets `lives = 3` and `score = 0`, and calls `resetBall()`.
   Use it at startup instead of the separate calls.
4. In `launch()`: if the game is `'won'` or `'lost'`, start a `newGame()` instead.
5. Draw `Score: 120` in the top-right corner (right-aligned at `canvas.width - 10`), and `You win!` when won. When the
   game is won or lost, also draw `Click to play again` under the message.

# --task-tr--

1. `let lives = 3` ve `let state ...` satırlarını şu üç satırla değiştir (canlara artık değeri `newGame()` verecek):

   ```js
   let lives
   let score
   let state // 'serve', 'playing', 'won' or 'lost'
   ```

2. `clamp()` fonksiyonunun kapanış `}`'inden sonra, `function resetBall()`'dan **önce**, yeni oyun fonksiyonunu
   yaz:

   ```js
   function newGame() {
     buildBricks()
     lives = 3
     score = 0
     resetBall()
   }
   ```

3. `launch()` fonksiyonunun başına, oyun bittiyse yeni oyun başlatan kısmı ekle:

   ```js
   function launch() {
     if (state === 'won' || state === 'lost') {   // ← yeni
       newGame()                                  // ← yeni
       return                                     // ← yeni
     }                                            // ← yeni
     if (state !== 'serve') return
     state = 'playing'
     ball.vx = 3
     ball.vy = -4
   }
   ```

4. `update()` fonksiyonunda tuğla kıran `if (brick) { ... }` bloğunu şöyle değiştir:

   ```js
     if (brick) {
       brick.alive = false
       score += 10                                                   // ← yeni
       const throughTopOrBottom = ball.x >= brick.x && ball.x <= brick.x + BRICK_W
       if (throughTopOrBottom) ball.vy = -ball.vy
       else ball.vx = -ball.vx
       if (bricks.every((b) => !b.alive)) state = 'won'              // ← yeni
     }
   ```

5. `draw()` fonksiyonunda üç yeri değiştir:

   - Topu çizen bloğun başındaki `if (state !== 'lost') {` satırını şöyle yap (top sadece servis ve oyun
     sırasında görünsün):

     ```js
       if (state === 'serve' || state === 'playing') {
     ```

   - `ctx.fillText('Lives: ' + lives, 10, 26)` satırının hemen altına skoru ekle:

     ```js
       ctx.textAlign = 'right'
       ctx.fillText('Score: ' + score, canvas.width - 10, 26)
     ```

   - En alttaki `if (state === 'lost') { ... }` bloğunu şununla değiştir:

     ```js
       if (state === 'won' || state === 'lost') {
         ctx.font = 'bold 36px sans-serif'
         ctx.fillText(state === 'won' ? 'You win!' : 'Game Over', canvas.width / 2, 250)
         ctx.font = '16px sans-serif'
         ctx.fillText('Click to play again', canvas.width / 2, 280)
       }
     ```

6. En alttaki `buildBricks()` ve `resetBall()` satırlarını sil, yerine tek bir çağrı yaz:

   ```js
   newGame()
   requestAnimationFrame(loop)
   ```

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağ üstte `Score: 0` görmelisin. Oynamak için önce oyuna tıkla; her
   kırılan tuğla skoru 10 artırmalı. Oyun bitince tıklamak yeni bir oyun başlatmalı. Alttaki kontrollerin hepsi
   yeşil olmalı. Kırmızı kalırsa `You win!`'deki ünlemi ve `every` satırındaki `!b.alive`'ı kontrol et.

# --tests--

Breaking a brick should score 10 points.
tr: Bir tuğla kırmak 10 puan kazandırmalı.

```js
assert.strictEqual(score, 0)
$.tap(' ')
bricks = [{ x: 100, y: 100, row: 0, alive: true }, { x: 300, y: 100, row: 0, alive: true }]
ball = { x: 127, y: 129, vx: 0, vy: -4 }
update()
assert.strictEqual(score, 10)
draw()
assert.include($.texts(), 'Score: 10')
```

Breaking the last brick should win the game.
tr: Son tuğlayı kırmak oyunu kazandırmalı.

```js
$.tap(' ')
bricks = [{ x: 100, y: 100, row: 0, alive: true }, { x: 300, y: 100, row: 0, alive: false }]
ball = { x: 127, y: 129, vx: 0, vy: -4 }
update()
assert.strictEqual(state, 'won')
draw()
assert.include($.texts(), 'You win!')
```

Clicking after winning should start a new game.
tr: Kazandıktan sonra tıklamak yeni bir oyun başlatmalı.

```js
state = 'won'
score = 400
lives = 1
bricks = []
$.click(240, 300)
assert.strictEqual(state, 'serve')
assert.strictEqual(score, 0)
assert.strictEqual(lives, 3)
assert.lengthOf(bricks, 40)
```

Pressing Space after losing should start a new game too.
tr: Kaybettikten sonra Boşluk'a basmak da yeni bir oyun başlatmalı.

```js
state = 'lost'
lives = 0
$.tap(' ')
assert.strictEqual(state, 'serve')
assert.strictEqual(lives, 3)
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
let lives
let score
let state // 'serve', 'playing', 'won' or 'lost'
const keys = {}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function newGame() {
  buildBricks()
  lives = 3
  score = 0
  resetBall()
}

function resetBall() {
  state = 'serve'
  ball = { x: paddle.x + PADDLE_W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 }
}

function launch() {
  if (state === 'won' || state === 'lost') {
    newGame()
    return
  }
  if (state !== 'serve') return
  state = 'playing'
  ball.vx = 3
  ball.vy = -4
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
canvas.addEventListener('pointerdown', launch)

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ') launch()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
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
  if (keys.ArrowLeft) paddle.x -= 7
  if (keys.ArrowRight) paddle.x += 7
  paddle.x = clamp(paddle.x, 0, canvas.width - PADDLE_W)

  if (state === 'serve') {
    ball.x = paddle.x + PADDLE_W / 2
    return
  }
  if (state !== 'playing') return

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
    score += 10
    const throughTopOrBottom = ball.x >= brick.x && ball.x <= brick.x + BRICK_W
    if (throughTopOrBottom) ball.vy = -ball.vy
    else ball.vx = -ball.vx
    if (bricks.every((b) => !b.alive)) state = 'won'
  }

  if (ball.y - BALL_R > canvas.height) {
    lives -= 1
    if (lives === 0) state = 'lost'
    else resetBall()
  }
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

  if (state === 'serve' || state === 'playing') {
    ctx.fillStyle = '#f8fafc'
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'white'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Lives: ' + lives, 10, 26)
  ctx.textAlign = 'right'
  ctx.fillText('Score: ' + score, canvas.width - 10, 26)

  ctx.textAlign = 'center'
  if (state === 'serve') ctx.fillText('Click or press Space to launch', canvas.width / 2, 260)
  if (state === 'won' || state === 'lost') {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(state === 'won' ? 'You win!' : 'Game Over', canvas.width / 2, 250)
    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 280)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
