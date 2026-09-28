---
title: Play again, beat your best
title_tr: Yeniden oyna, rekorunu kır
skills: [game.state]
---

# --explanation--

The last piece is the loop every arcade game has: game over, see your score against the best, press a button, play
again.

Because all setup already lives in `newGame()`, restarting is a single call. That is the payoff of the "one function
sets up a fresh game" habit you have used in every game: adding a restart never means hunting for all the variables that
need resetting.

The best score goes in `localStorage` at the one place the game ends, `endGame()`, so it is saved whether the player ran
out of lives or the invaders landed.

# --explanation-tr--

**Bu adımda:** oyunun son parçası: oyun bitince en iyi skorunu göreceksin, Boşluk'a basınca yeni oyun başlayacak.
`GAME OVER`'ın altında `BEST 480   SPACE TO PLAY AGAIN` gibi bir satır çıkacak.

**Yeniden başlatmak tek satır.** Her salon oyununda bu döngü vardır: oyun biter, skorunu en iyisiyle karşılaştırırsın,
bir düğmeye basarsın, yeniden oynarsın. Bütün kurulum 6. adımda `newGame()`'e taşındığı için yeniden başlatmak tek bir
çağrıdır. "Yeni oyunu tek bir fonksiyon kurar" alışkanlığının ödülü bu: yeniden başlatma eklerken sıfırlanması gereken
değişkenleri tek tek aramak zorunda kalmazsın.

**Boşluk'un iki görevi.** Oyun bittiyse yeni oyun, sürüyorsa ateş:

```js
if (event.key === ' ') {
  if (state === 'over') newGame()
  else shoot()
}
```

Bir `if`'in içine başka bir `if` koyabilirsin. `else`'ten sonra tek komut varsa süslü parantez gerekmez.

**Tarayıcının küçük defteri: `localStorage`.** Sayfayı kapatsan bile silinmeyen bir not defteridir. Her notun bir adı
ve bir değeri vardır:

```js
localStorage.setItem('invaders-best', 480)   // 'invaders-best' adıyla 480 yaz
localStorage.getItem('invaders-best')        // okur: '480' (yazı olarak!)
```

Defter her şeyi **yazı** olarak saklar. Okurken `Number(...)` ile yazıyı sayıya çeviririz.

```js
let best = Number(localStorage.getItem('invaders-best')) || 0
```

İlk kez oynarken defterde not yoktur; `getItem` "hiçbir şey" (`null`) verir. `a || b` burada "a boş ya da sıfırsa b'yi
kullan" demektir; yani not yoksa `best` 0 olur.

**Nerede kaydedilir?** Oyunun bittiği tek yerde: `endGame()`. Böylece canlar bitse de, istilacılar insen de kayıt
yapılır. Yalnızca yeni skor eskisinden büyükse (`score > best`) yazarız.

Yazının içindeki üç boşluk (`'   SPACE TO PLAY AGAIN'`) en iyi skorla talimat arasında boşluk bırakır; kontroller
tam olarak üç boşluk bekler.

# --task--

1. Add `let best = Number(localStorage.getItem('invaders-best')) || 0`. In `endGame()`, save a higher score as the new
   best under `'invaders-best'`.
2. When Space is pressed and the game is over, start a `newGame()`; while playing, it shoots as before.
3. Under `GAME OVER`, draw `BEST 480   SPACE TO PLAY AGAIN` (the real best, three spaces) in `'16px monospace'`.

# --task-tr--

1. `let now = 0` satırının altına en iyi skoru okuyan satırı ekle:

   ```js
   let best = Number(localStorage.getItem('invaders-best')) || 0
   ```

2. `endGame()` fonksiyonunu şöyle yap:

   ```js
   function endGame() {
     state = 'over'
     if (score > best) { // ← yeni
       best = score // ← yeni
       localStorage.setItem('invaders-best', best) // ← yeni
     } // ← yeni
   }
   ```

3. `keydown` bloğunu şöyle yap:

   ```js
   document.addEventListener('keydown', (event) => {
     keys[event.key] = true
     if (event.key === ' ') { // ← değişti
       if (state === 'over') newGame() // ← yeni
       else shoot() // ← yeni
     } // ← yeni
   })
   ```

4. `draw()` içinde, `ctx.fillText('GAME OVER', canvas.width / 2, 250)` satırının altına (hâlâ `if (state === 'over')`
   bloğunun içinde) iki satır ekle:

   ```js
       ctx.font = '16px monospace'
       ctx.fillText('BEST ' + best + '   SPACE TO PLAY AGAIN', canvas.width / 2, 290)
   ```

5. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Oyun bitince `GAME OVER`'ın altında en iyi skor ve
   `SPACE TO PLAY AGAIN` yazmalı; Boşluk'a basınca 3 can ve `WAVE 1` ile yeni oyun başlamalı. Alttaki kontrollerin hepsi
   yeşil olmalı. `BEST` kontrolü kırmızıysa `BEST ` sonrasındaki ve `SPACE`'ten önceki boşlukları say.

# --tests--

A new best should be saved when the game ends.
tr: Oyun bitince yeni rekor kaydedilmeli.

```js
score = 480
endGame()
assert.strictEqual(best, 480)
assert.strictEqual(localStorage.getItem('invaders-best'), '480')
draw()
assert.include($.texts(), 'BEST 480   SPACE TO PLAY AGAIN')
```

A lower score should not replace the best.
tr: Daha düşük bir skor rekorun yerini almamalı.

```js
best = 900
score = 100
endGame()
assert.strictEqual(best, 900)
```

Space after game over should start a fresh game.
tr: Oyun bittikten sonra Boşluk yepyeni bir oyun başlatmalı.

```js
score = 250
lives = 0
wave = 3
endGame()
$.tap(' ')
assert.strictEqual(state, 'playing')
assert.deepEqual([score, lives, wave], [0, 3, 1])
assert.lengthOf(alive(), 45)
```

# --solution--

```js
// Invaders, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_Y = 480
const SHIP_W = 36
const SHIP_H = 16
const SHIP_SPEED = 4
const BULLET_SPEED = 8
const BOMB_SPEED = 3
const COOLDOWN = 350 // milliseconds between shots
const ROWS = 5
const COLS = 9
const INVADER_W = 28
const INVADER_H = 20
const SPACING_X = 44
const SPACING_Y = 36
const ROW_POINTS = [30, 20, 20, 10, 10]
const ROW_COLORS = ['#f472b6', '#a78bfa', '#a78bfa', '#34d399', '#34d399']

let ship
let bullets
let invaders
let bombs
let dir // +1 marching right, -1 marching left
let lastStep
let lastShot
let wave
let score
let lives
let state // 'playing' or 'over'
let now = 0
let best = Number(localStorage.getItem('invaders-best')) || 0
const keys = {}

function spawnWave() {
  invaders = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      invaders.push({ x: 40 + col * SPACING_X, y: 60 + row * SPACING_Y, w: INVADER_W, h: INVADER_H, row, alive: true })
    }
  }
  bullets = []
  bombs = []
  dir = 1
  lastStep = now
}

function newGame() {
  ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
  wave = 1
  score = 0
  lives = 3
  lastShot = -COOLDOWN
  state = 'playing'
  spawnWave()
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function alive() {
  return invaders.filter((invader) => invader.alive)
}

function shoot() {
  if (now - lastShot < COOLDOWN) return
  lastShot = now
  bullets.push({ x: ship.x + SHIP_W / 2 - 2, y: ship.y - 12, w: 4, h: 12 })
}

// Fewer invaders march faster: from 600 ms with all 45 alive down to 60 ms for the last one, quicker in later waves.
function stepInterval() {
  return Math.max(40, 60 + (alive().length - 1) * 12 - (wave - 1) * 40)
}

function march() {
  const living = alive()
  const left = Math.min(...living.map((invader) => invader.x))
  const right = Math.max(...living.map((invader) => invader.x + invader.w))
  if ((dir > 0 && right + 10 > canvas.width - 10) || (dir < 0 && left - 10 < 10)) {
    for (const invader of living) invader.y += 16
    dir = -dir
  } else {
    for (const invader of living) invader.x += 10 * dir
  }
}

// Only the lowest invader in a column can fire, so bombs never pass through other invaders.
function dropBomb() {
  const living = alive()
  const shooter = living[Math.floor(Math.random() * living.length)]
  const lowest = living.filter((invader) => invader.x === shooter.x).reduce((a, b) => (b.y > a.y ? b : a))
  bombs.push({ x: lowest.x + INVADER_W / 2 - 2, y: lowest.y + INVADER_H, w: 4, h: 10 })
}

function loseLife() {
  lives -= 1
  bombs = []
  if (lives <= 0) endGame()
}

function endGame() {
  state = 'over'
  if (score > best) {
    best = score
    localStorage.setItem('invaders-best', best)
  }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ') {
    if (state === 'over') newGame()
    else shoot()
  }
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (state !== 'playing') return

  if (keys.ArrowLeft) ship.x -= SHIP_SPEED
  if (keys.ArrowRight) ship.x += SHIP_SPEED
  ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))

  for (const bullet of bullets) bullet.y -= BULLET_SPEED
  for (const bomb of bombs) bomb.y += BOMB_SPEED

  for (const bullet of bullets) {
    const hit = invaders.find((invader) => invader.alive && overlaps(bullet, invader))
    if (hit) {
      hit.alive = false
      bullet.y = -100 // used up; removed below
      score += ROW_POINTS[hit.row]
    }
  }
  bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)
  bombs = bombs.filter((bomb) => bomb.y < canvas.height)

  if (bombs.some((bomb) => overlaps(bomb, ship))) loseLife()
  if (state !== 'playing') return

  if (alive().length === 0) {
    wave += 1
    spawnWave()
    return
  }

  if (now - lastStep >= stepInterval()) {
    lastStep = now
    march()
    if (Math.random() < 0.35) dropBomb()
  }
  if (alive().some((invader) => invader.y + invader.h >= SHIP_Y)) endGame()
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const invader of alive()) {
    ctx.fillStyle = ROW_COLORS[invader.row]
    ctx.fillRect(invader.x, invader.y, invader.w, invader.h)
  }

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)

  ctx.fillStyle = '#f8fafc'
  for (const bullet of bullets) ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h)
  ctx.fillStyle = '#fb923c'
  for (const bomb of bombs) ctx.fillRect(bomb.x, bomb.y, bomb.w, bomb.h)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('SCORE ' + score, 10, 24)
  ctx.textAlign = 'center'
  ctx.fillText('WAVE ' + wave, canvas.width / 2, 24)
  ctx.textAlign = 'right'
  ctx.fillText('LIVES ' + lives, canvas.width - 10, 24)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 200, canvas.width, 120)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 32px monospace'
    ctx.fillText('GAME OVER', canvas.width / 2, 250)
    ctx.font = '16px monospace'
    ctx.fillText('BEST ' + best + '   SPACE TO PLAY AGAIN', canvas.width / 2, 290)
  }
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
