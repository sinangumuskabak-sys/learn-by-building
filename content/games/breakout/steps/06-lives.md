---
title: Serving and lives
title_tr: Servis ve canlar
skills: [game.state, game.input]
---

# --explanation--

Right now a missed ball instantly reappears in the middle, flying, before the player is ready. Real Breakout **holds
the ball on the paddle** until the player launches it, and each miss costs one of three lives.

That is a new state machine:

```
'serve'  --click / Space-->  'playing'  --ball lost, lives left-->  'serve'
                                        --ball lost, no lives-->    'lost'
```

While serving, the ball has no velocity; `update()` just keeps it sitting on top of the paddle, wherever the paddle
moves. Launching gives it a velocity and switches to `'playing'`.

One `launch()` function is called from both the mouse (`pointerdown`) and the keyboard (Space). The arrow keys also
move the paddle, using the "held keys" pattern: events record what is held, the loop moves the paddle every frame.

# --explanation-tr--

**Bu adımda:** servis ve can ekleyeceğiz. Top artık raketin üstünde bekleyecek ve raketle birlikte kayacak;
tıklayınca ya da Boşluk'a basınca fırlayacak. Sol üstte `Lives: 3` yazacak; topu her kaçırışta bir can gidecek,
canlar bitince `Game Over` çıkacak. Raketi ok tuşlarıyla da sürebileceksin.

**Şu anki sorun.** Kaçırılan top, oyuncu hazır olmadan anında ortada belirip uçmaya devam ediyor. Gerçek Breakout'ta
top oyuncu fırlatana kadar **raketin üstünde bekler** ve her kaçırış üç candan birini götürür.

**Durum makinesi.** Oyunun o anda hangi aşamada olduğunu tek bir değişkende tutarız: `state` (durum). Her an şu üç
yazıdan tam olarak biridir:

```
'serve' (servis)  --tıkla / Boşluk-->  'playing' (oyunda)  --top düştü, can var-->  'serve'
                                                           --top düştü, can yok-->  'lost' (kaybetti)
```

Servis sırasında topun hızı sıfırdır; `update()` onu sadece raketin ortasının üstünde tutar, raket nereye giderse.
Fırlatınca (`launch`) topa hız verilir ve durum `'playing'` olur.

**`return` ile erken çıkmak.** Bir fonksiyonda `return`'e gelinince fonksiyonun geri kalanı çalışmaz:

```js
if (state !== 'serve') return   // servis durumunda değilsek hiçbir şey yapma
```

`!==` "eşit değil mi?", `===` "eşit mi?" diye sorar. (Tek `=` ise "içine koy" demektir; soru sormaz.)

**Olaylar.** `'pointerdown'` canvas'a tıklandığında (ya da dokunulduğunda), `'keydown'` bir tuşa basıldığında,
`'keyup'` tuş bırakıldığında olur. `event.key` basılan tuşun adıdır: Boşluk için `' '` (tırnak içinde bir boşluk),
oklar için `'ArrowLeft'`, `'ArrowRight'`.

**Basılı tuşlar deseni.** Raketi ok tuşlarıyla sürmek için şunu yaparız: olaylar sadece **hangi tuşun basılı**
olduğunu not eder, döngü de her karede o nota bakıp raketi kaydırır. Tuşa basılı tuttuğun sürece raket akıcı
biçimde gider.

```js
const keys = {}                                                    // boş bir not defteri (nesne)
document.addEventListener('keydown', (event) => { keys[event.key] = true })
document.addEventListener('keyup', (event) => { keys[event.key] = false })
```

`keys[event.key] = true` → "`keys` nesnesinde, adı basılan tuş olan alanı `true` (evet) yap". Köşeli parantez,
alanın adı bir değişkende durduğunda kullanılır. Sol ok basılıyken `keys.ArrowLeft` doğrudur. (`const` ile verilen
ad başka bir nesneye bağlanamaz ama nesnenin **içi** değiştirilebilir.)

`paddle.x -= 7` → "`paddle.x`'ten 7 çıkar" (`+=`'nin tersi).

**Can kaybı.** `lives -= 1` bir can düşer. Sonra:

```js
if (lives === 0) state = 'lost'
else resetBall()
```

`else` "**değilse**" demektir: can kalmadıysa oyun biter, kaldıysa top servise döner.

**Yazı yazmak.**

```js
ctx.font = '16px sans-serif'              // yazı tipi ve boyu
ctx.textAlign = 'left'                    // verilen nokta yazının solu olsun ('center' = ortası)
ctx.fillText('Lives: ' + lives, 10, 26)   // yazıyı (10, 26) noktasına boya
```

`'Lives: ' + lives` yazı ile sayıyı birleştirir: `lives` 3 ise `'Lives: 3'` olur. Yazılarda `+` "ucuna ekle"
demektir.

# --task--

1. Add `let lives = 3` and `let state` (`'serve'`, `'playing'` or `'lost'`).
2. Change `resetBall()` to set `state = 'serve'` and put the ball on the paddle:
   `{ x: paddle.x + PADDLE_W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 }`.
3. Write `function launch()`: when serving, switch to `'playing'` and give the ball `vx = 3`, `vy = -4`. Call it on
   `pointerdown` on the canvas and when Space is pressed.
4. Track held keys in `keys`; in `update()`, move the paddle 7 px per frame while `ArrowLeft`/`ArrowRight` are held
   and clamp it. Then, while serving, keep the ball on the paddle's center and stop there; only move the ball while
   `'playing'`.
5. When the ball falls out, subtract a life; if none are left, set `state = 'lost'`, otherwise `resetBall()`.
6. Draw `Lives: 3` in the top-left corner (white, `16px sans-serif`); while serving, draw
   `Click or press Space to launch`; when lost, draw `Game Over`.

# --task-tr--

1. `let bricks` satırının altına canları, durumu ve basılı tuş defterini ekle:

   ```js
   let lives = 3
   let state // 'serve', 'playing' or 'lost'
   const keys = {}
   ```

2. `resetBall()` fonksiyonunu, topu raketin üstüne koyacak şekilde değiştir ve hemen altına fırlatma fonksiyonunu
   yaz:

   ```js
   function resetBall() {
     state = 'serve'                                                              // ← yeni
     ball = { x: paddle.x + PADDLE_W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 }   // ← değişti
   }

   function launch() {
     if (state !== 'serve') return
     state = 'playing'
     ball.vx = 3
     ball.vy = -4
   }
   ```

   Top raketin ortasında (`paddle.x + PADDLE_W / 2`), raketin hemen üstünde (`PADDLE_Y - BALL_R`), hızsız durur.

3. `canvas.addEventListener('pointermove', ...)` kodunun kapanış `})`'inin hemen altına tıklamayı ve tuşları
   dinleyen kodu ekle:

   ```js
   canvas.addEventListener('pointerdown', launch)

   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
     if (event.key === ' ') launch()
   })
   document.addEventListener('keyup', (event) => {
     keys[event.key] = false
   })
   ```

4. `update()` fonksiyonunun **en başına**, `ball.x += ball.vx` satırından önce şunları ekle:

   ```js
   function update() {
     if (keys.ArrowLeft) paddle.x -= 7                          // ← yeni
     if (keys.ArrowRight) paddle.x += 7                         // ← yeni
     paddle.x = clamp(paddle.x, 0, canvas.width - PADDLE_W)     // ← yeni

     if (state === 'serve') {                                   // ← yeni
       ball.x = paddle.x + PADDLE_W / 2                         // ← yeni
       return                                                   // ← yeni
     }                                                          // ← yeni
     if (state !== 'playing') return                            // ← yeni

     ball.x += ball.vx
     ball.y += ball.vy
     ...
   ```

   Önce raket oklarla kayar ve ekrandan taşmaz. Servisteyken top raketin ortasını izler ve fonksiyon orada biter;
   oyunda değilsek (kaybettiysek) de biter. Top sadece `'playing'` durumunda hareket eder.

5. `update()` fonksiyonunun en sonundaki `if (ball.y - BALL_R > canvas.height) resetBall()` satırını şununla
   değiştir:

   ```js
     if (ball.y - BALL_R > canvas.height) {
       lives -= 1
       if (lives === 0) state = 'lost'
       else resetBall()
     }
   ```

6. `draw()` fonksiyonunda topu çizen dört satırı (`ctx.fillStyle = '#f8fafc'` ile başlayan, `ctx.fill()` ile biten)
   bir `if` içine al ve altına yazıları ekle. Fonksiyonun sonu şöyle olmalı:

   ```js
     if (state !== 'lost') {                              // ← yeni
       ctx.fillStyle = '#f8fafc'
       ctx.beginPath()
       ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
       ctx.fill()
     }                                                    // ← yeni

     ctx.fillStyle = 'white'                              // ← yeni
     ctx.font = '16px sans-serif'                         // ← yeni
     ctx.textAlign = 'left'                               // ← yeni
     ctx.fillText('Lives: ' + lives, 10, 26)              // ← yeni

     ctx.textAlign = 'center'                             // ← yeni
     if (state === 'serve') ctx.fillText('Click or press Space to launch', canvas.width / 2, 260)   // ← yeni
     if (state === 'lost') {                              // ← yeni
       ctx.font = 'bold 36px sans-serif'                  // ← yeni
       ctx.fillText('Game Over', canvas.width / 2, 250)   // ← yeni
     }                                                    // ← yeni
   }
   ```

   Oyun bitince top çizilmez; sol üstte canlar, ortada duruma göre bir mesaj yazar.

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Top raketin üstünde beklemeli ve `Click or press Space to launch`
   yazmalı. Oynamak için önce oyuna tıkla: top fırlamalı. Topu kaçırınca `Lives:` bir azalmalı ve top rakete
   dönmeli. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa ekrandaki yazıları (`Lives: `,
   `Click or press Space to launch`, `Game Over`) harf harf karşılaştır.

# --tests--

The game should start with the ball resting on the paddle.
tr: Oyun top raketin üstünde dururken başlamalı.

```js
assert.strictEqual(lives, 3)
assert.strictEqual(state, 'serve')
assert.deepEqual(ball, { x: 240, y: 363, vx: 0, vy: 0 })
$.tick(30)
assert.deepEqual(ball, { x: 240, y: 363, vx: 0, vy: 0 })
assert.include($.texts(), 'Lives: 3')
assert.include($.texts(), 'Click or press Space to launch')
```

While serving, the ball should ride along with the paddle.
tr: Servis sırasında top raketle birlikte gitmeli.

```js
$.move(100, 300)
$.tick()
assert.strictEqual(ball.x, 100)
$.press('ArrowRight')
$.tick(10)
assert.strictEqual(paddle.x, 130)
assert.strictEqual(ball.x, 170)
```

Clicking or pressing Space should launch the ball.
tr: Tıklamak ya da Boşluk'a basmak topu fırlatmalı.

```js
$.click(240, 300)
assert.strictEqual(state, 'playing')
assert.deepEqual([ball.vx, ball.vy], [3, -4])
$.tick(5)
assert.isBelow(ball.y, 363)
```

Losing the ball should cost a life and go back to serving.
tr: Topu kaçırmak bir cana mal olmalı ve servise dönmeli.

```js
$.tap(' ')
ball = { x: 50, y: 405, vx: 0, vy: 4 }
update()
assert.strictEqual(lives, 2)
assert.strictEqual(state, 'serve')
assert.strictEqual(ball.y, 363)
```

Losing the last life should end the game.
tr: Son canı kaybetmek oyunu bitirmeli.

```js
$.tap(' ')
lives = 1
ball = { x: 50, y: 405, vx: 0, vy: 4 }
update()
assert.strictEqual(lives, 0)
assert.strictEqual(state, 'lost')
$.tap(' ')
assert.strictEqual(state, 'lost', 'launching does nothing after game over')
draw()
assert.include($.texts(), 'Game Over')
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
let lives = 3
let state // 'serve', 'playing' or 'lost'
const keys = {}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function resetBall() {
  state = 'serve'
  ball = { x: paddle.x + PADDLE_W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 }
}

function launch() {
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
    const throughTopOrBottom = ball.x >= brick.x && ball.x <= brick.x + BRICK_W
    if (throughTopOrBottom) ball.vy = -ball.vy
    else ball.vx = -ball.vx
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

  if (state !== 'lost') {
    ctx.fillStyle = '#f8fafc'
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'white'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Lives: ' + lives, 10, 26)

  ctx.textAlign = 'center'
  if (state === 'serve') ctx.fillText('Click or press Space to launch', canvas.width / 2, 260)
  if (state === 'lost') {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, 250)
  }
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
