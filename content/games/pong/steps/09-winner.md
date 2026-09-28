---
title: First to five wins
title_tr: Beşi ilk bulan kazanır
skills: [game.state, prog.functions]
---

# --explanation--

A match needs an end. The first player to reach `WIN_SCORE` points wins, the game freezes on a victory message, and
Space starts a new match.

This is the same shape you will see in almost every game:

```
reset()  →  'playing'  →  someone wins  →  'over'  →  Space  →  reset()
```

Two refactors make it clean:

- **`reset()`** sets up a whole new match (paddles, scores, state, first serve) and is called at startup *and* on
  restart, so both always start the same way.
- **`point(winner)`** handles everything that happens when someone scores: add the point, check for a win, serve. The
  two "ball left the court" checks in `update()` become one-liners. When the rules change (win by two?), there is one
  place to change.

Pulling repeated steps into a well-named function is called **extracting a function**. It is the most common and most
useful refactoring there is.

# --explanation-tr--

**Bu adımda:** maçın bir sonu olacak. İlk 5 sayıya ulaşan kazanacak, oyun durup ortada "Left player wins!" gibi bir
mesaj gösterecek; Boşluk (Space) tuşuna basınca yeni maç başlayacak.

**Oyunun hâli: `state`.** Oyun ya oynanıyordur (`'playing'`) ya da bitmiştir (`'over'`). Bunu bir yazı olarak
`state` değişkeninde tutarız. Neredeyse her oyunda aynı döngü vardır:

```
reset()  →  'playing'  →  biri kazanır  →  'over'  →  Boşluk  →  reset()
```

**Değersiz değişken.** `let left` gibi `=` olmadan yazılan değişken açılır ama içi boştur (`undefined`). Değerini
sonra `reset()` verecek.

**İki yeni fonksiyon.** Kodu toparlamak için tekrar eden işleri adı olan fonksiyonlara çıkarırız (buna
**fonksiyon çıkarmak**, extracting a function, denir):

- **`reset()`**: yepyeni bir maç kurar: raketler baştan, skorlar sıfır, `state = 'playing'`, ilk servis. Hem oyun
  açılırken hem yeniden başlarken çağrılır; ikisi hep aynı şekilde başlar.
- **`point(winner)`**: biri sayı alınca olan her şey: sayıyı ekle, kazandı mı bak, servis at. `update()`'teki iki
  "top dışarı çıktı" kontrolü tek satıra iner. Kurallar değişirse tek yeri değiştirirsin.

**Erken çıkmak: `return`.** 3. adımda `return` bir sonucu geri veriyordu. Tek başına `return` ise "burada dur,
fonksiyonun gerisini yapma" demektir:

```js
if (state !== 'playing') return   // oyun bitmişse update hiçbir şey yapmasın
```

`!==` "eşit değil mi" demektir (`===`'nin tersi). `>=` "büyük veya eşit" demektir: skor 5 ya da üstüyse.

**Kime servis?** `winner === left ? 1 : -1` → kazanan sol oyuncuysa top sağa (sayıyı kaybeden sağ oyuncuya), değilse
sola gider.

**Yazıları birleştirmek.** `+` yazılar arasında kullanılınca onları uç uca ekler:
`'Left' + ' player wins!'` → `'Left player wins!'`.

**Boşluk tuşu.** Boşluk tuşunun adı tek bir boşluk karakteridir: `' '`. Maç sürerken yanlışlıkla sıfırlamasın diye
yalnızca oyun bitmişken `reset()` çağırırız; iki koşul `&&` ("ve") ile bağlanır.

# --task--

1. Add `const WIN_SCORE = 5` and `let state`. Declare `let left`, `let right` and `let ball` without values.
2. Write `function reset()` that creates both paddles (as before, with `score: 0`), sets `state = 'playing'` and
   calls `serve(1)`. Call `reset()` before starting the loop.
3. Write `function point(winner)`: add 1 to `winner.score`; if it reached `WIN_SCORE`, set `state = 'over'`;
   otherwise serve toward the other player (`serve(winner === left ? 1 : -1)`). Use it in `update()`.
4. `update()` should do nothing unless the state is `'playing'`.
5. When the state is `'over'`, draw `Left player wins!` or `Right player wins!` and `Press Space to play again` in the
   middle, and make Space call `reset()` (only when the game is over).

# --task-tr--

1. `const BALL = 10 ...` satırının altına kazanma sayısını ekle:

   ```js
   const WIN_SCORE = 5
   ```

2. `let left = ...`, `let right = ...` ve `let ball = ...` satırlarını **sil** ve yerlerine değersiz değişkenleri yaz.
   `let twoPlayers = false` ile `const keys = {}` yerinde kalır. Bu bölüm şöyle olmalı:

   ```js
   let left                               // ← değişti
   let right                              // ← değişti
   let ball                               // ← değişti
   let state // 'playing' or 'over'       // ← yeni
   let twoPlayers = false
   const keys = {}
   ```

3. `const keys = {}` satırından sonra bir boş satır bırak ve `reset()` fonksiyonunu yaz:

   ```js
   function reset() {
     left = { x: 20, y: 160, score: 0 }
     right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }
     state = 'playing'
     serve(1)
   }
   ```

4. `keydown` dinleyicisine Boşluk satırını ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
     if (event.key === '2') twoPlayers = !twoPlayers
     if (event.key === ' ' && state === 'over') reset()    // ← yeni
   })
   ```

5. `serve` fonksiyonunun kapanan `}`'sinden sonra bir boş satır bırak ve (`function touches`'ın **üstüne**) şunu yaz:

   ```js
   function point(winner) {
     winner.score += 1
     if (winner.score >= WIN_SCORE) {
       state = 'over'
       return
     }
     // Serve toward the player who just lost the point.
     serve(winner === left ? 1 : -1)
   }
   ```

6. `update()`'in en başına, `function update() {` satırının hemen altına ekle:

   ```js
   function update() {
     if (state !== 'playing') return          // ← yeni
     if (keys.w) left.y -= PADDLE_SPEED
   ```

7. `update()`'in sonundaki skor bloğunu (`if (ball.x + BALL < 0) { ... } else if (...) { ... }`, 7 satırın tamamı)
   sil ve yerine şu iki satırı yaz:

   ```js
     if (ball.x + BALL < 0) point(right)        // ← değişti
     else if (ball.x > canvas.width) point(left) // ← değişti
   }
   ```

8. `draw()` içinde topu çizen satırı, top sadece oyun sürerken çizilsin diye değiştir:

   ```js
     if (state === 'playing') ctx.fillRect(ball.x, ball.y, BALL, BALL)   // ← değişti
   ```

9. `draw()` içinde, sağ skoru yazan `ctx.fillText(String(right.score), ...)` satırından sonra bir boş satır bırak ve
   (gri ipucu satırlarının **üstüne**) kazanan mesajını ekle:

   ```js
     if (state === 'over') {
       const winner = left.score >= WIN_SCORE ? 'Left' : 'Right'
       ctx.font = 'bold 32px sans-serif'
       ctx.fillText(winner + ' player wins!', canvas.width / 2, canvas.height / 2)
       ctx.font = '16px sans-serif'
       ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
     }
   ```

10. En alttaki `requestAnimationFrame(loop)` satırının hemen **üstüne** maçı kuran çağrıyı ekle:

    ```js
    reset()
    requestAnimationFrame(loop)
    ```

11. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Biri 5 sayıya ulaşınca top kaybolmalı, ortada kazanan yazısı
    çıkmalı; Boşluk'a basınca skorlar sıfırlanıp yeni maç başlamalı. Alttaki kontrollerin hepsi yeşil olmalı.
    Kırmızı kalırsa `reset()` satırını `requestAnimationFrame(loop)`'tan **önce** yazdığından emin ol.

# --tests--

A new match should start from zero, serving to the right.
tr: Yeni bir maç sıfırdan başlamalı ve sağa servis atmalı.

```js
assert.strictEqual(WIN_SCORE, 5)
assert.strictEqual(state, 'playing')
assert.include(left, { x: 20, y: 160, score: 0 })
assert.include(right, { x: 570, y: 160, score: 0 })
assert.strictEqual(ball.vx, 4)
```

`point()` should add a point and serve toward the other player.
tr: `point()` bir sayı eklemeli ve diğer oyuncuya doğru servis atmalı.

```js
point(right)
assert.strictEqual(right.score, 1)
assert.strictEqual(ball.vx, -4)
point(left)
assert.strictEqual(left.score, 1)
assert.strictEqual(ball.vx, 4)
```

Reaching 5 points should end the match with a winner message.
tr: 5 sayıya ulaşmak maçı bir kazanan mesajıyla bitirmeli.

```js
left.score = 4
ball = { x: 598, y: 200, vx: 4, vy: 0 }
update()
assert.strictEqual(left.score, 5)
assert.strictEqual(state, 'over')
const frozen = JSON.stringify(ball)
update()
assert.strictEqual(JSON.stringify(ball), frozen, 'nothing moves after the match')
draw()
assert.include($.texts(), 'Left player wins!')
```

Space should start a new match only after the match is over.
tr: Boşluk yeni maçı yalnızca maç bittikten sonra başlatmalı.

```js
left.score = 3
$.tap(' ')
assert.strictEqual(left.score, 3, 'Space during a match does nothing')
right.score = 4
point(right)
assert.strictEqual(state, 'over')
$.tap(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(left.score, 0)
assert.strictEqual(right.score, 0)
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
const AI_SPEED = 4 // slower than the player, so the computer can be beaten
const BALL = 10 // the ball is a BALL×BALL square
const WIN_SCORE = 5

let left
let right
let ball
let state // 'playing' or 'over'
let twoPlayers = false
const keys = {}

function reset() {
  left = { x: 20, y: 160, score: 0 }
  right = { x: canvas.width - 20 - PADDLE_W, y: 160, score: 0 }
  state = 'playing'
  serve(1)
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === '2') twoPlayers = !twoPlayers
  if (event.key === ' ' && state === 'over') reset()
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

function point(winner) {
  winner.score += 1
  if (winner.score >= WIN_SCORE) {
    state = 'over'
    return
  }
  // Serve toward the player who just lost the point.
  serve(winner === left ? 1 : -1)
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
  if (state !== 'playing') return
  if (keys.w) left.y -= PADDLE_SPEED
  if (keys.s) left.y += PADDLE_SPEED
  if (twoPlayers) {
    if (keys.ArrowUp) right.y -= PADDLE_SPEED
    if (keys.ArrowDown) right.y += PADDLE_SPEED
  } else if (ball.vx > 0) {
    const target = ball.y + BALL / 2 - PADDLE_H / 2
    right.y += clamp(target - right.y, -AI_SPEED, AI_SPEED)
  }
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

  if (ball.x + BALL < 0) point(right)
  else if (ball.x > canvas.width) point(left)
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
  if (state === 'playing') ctx.fillRect(ball.x, ball.y, BALL, BALL)

  ctx.font = '48px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(String(left.score), canvas.width / 4, 60)
  ctx.fillText(String(right.score), (canvas.width * 3) / 4, 60)

  if (state === 'over') {
    const winner = left.score >= WIN_SCORE ? 'Left' : 'Right'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText(winner + ' player wins!', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
  }

  ctx.fillStyle = '#888'
  ctx.font = '14px sans-serif'
  const hint = twoPlayers ? 'Two players · press 2 to play the computer' : 'W/S to move · press 2 for two players'
  ctx.fillText(hint, canvas.width / 2, canvas.height - 12)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
