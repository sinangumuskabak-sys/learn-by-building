---
title: Stomp, or get hurt
title_tr: Ez ya da incin
skills: [game.collision, game.state]
---

# --explanation--

Touching an enemy now has two outcomes, and the difference is only **direction**:

- Coming down onto its head: a **stomp**. The enemy is squashed and the player bounces up.
- Anything else (walking into it, jumping into its side): the player gets hurt.

The rule used here is simple and forgiving: it is a stomp if the player is **falling** (`vy > 0`) and its feet are
still in the **top half** of the enemy. Players judge "I landed on it" generously, so the rule should too.

```js
const stomp = player.vy > 0 && player.y + player.h < enemy.y + enemy.h / 2
```

Getting hurt, or falling into a pit, costs a **life** and restarts the level. Remember the blueprint idea from the
coins step? Restarting is now trivial: throw the live objects away and **build them again from the level text**. That
is `loadLevel()`. `newGame()` does the same, plus refilling the lives. Because coins and enemies are rebuilt too, a
restart is a true fresh start.

Enemies that get stomped are marked `alive: false`: they stop moving, stop being drawn and stop colliding.

# --explanation-tr--

**Bu adımda:** düşmanların üstüne basıp onları ezeceğiz. Yandan çarparsan ya da çukura düşersen bir can gidecek ve
bölüm baştan başlayacak. Üç can bitince "Game Over" yazısı çıkacak; Boşluk ile yeni oyun başlayacak.

**Aynı dokunuş, iki sonuç.** Düşmana değmenin iki sonucu var ve farkı yalnızca **yön**:

- Yukarıdan kafasına iniyorsan: **ezme** (stomp). Düşman ezilir, oyuncu yukarı sıçrar.
- Başka her durumda (içine yürümek, yanına zıplamak): oyuncu yanar.

Kural basit ve hoşgörülü: oyuncu **düşüyorsa** (`vy > 0`) ve ayakları hâlâ düşmanın **üst yarısındaysa** ezmedir.
Oyuncular "üstüne indim" konusunda cömert düşünür; kural da öyle olmalı.

```js
const stomp = player.vy > 0 && player.y + player.h < enemy.y + enemy.h / 2
```

`stomp` doğruysa düşman `alive: false` (canlı değil) olur ve oyuncu `JUMP * 0.6` hızıyla (normal zıplamanın biraz
altında) yukarı sıçrar. Ölü düşmanlar hareket etmez, çizilmez ve kimseye çarpmaz.

**Can ve baştan başlamak.** Yanmak ya da çukura düşmek (`player.y > ROWS * TILE`, yani bölümün altına inmek) bir **can**
götürür (`lives -= 1`, "1 çıkar") ve bölümü yeniden başlatır. 7. adımdaki plan fikrini hatırla: bölüm yazısı plan,
nesneler canlı durum. Şimdi yeniden başlatmak çok kolay: canlı nesneleri atıp **bölüm yazısından yeniden kurarız**. Bu
iş `loadLevel()`'ın. Altınlar ve düşmanlar da yeniden kurulduğu için yeniden başlamak gerçekten sıfırdan başlamaktır.
`newGame()` aynısını yapar, ayrıca canları 3'e doldurur.

Bu yüzden `coins` ve `enemies` artık `const` değil `let`: her yeniden başlatmada **yeni** bir listeye bağlanırlar.
Diğer değişkenler de en üstte değersiz yazılır (`let camera`), değerlerini `loadLevel()` ve `newGame()` verir.

**Oyun durumu.** `state` ya `'playing'` (oynanıyor) ya `'over'` (bitti). `update()`'in ilk satırı
`if (state !== 'playing') return` → oyun bittiyse hiçbir şey hareket etmez (`return` fonksiyonu o anda bitirir, `!==`
"eşit değil" demektir). Oyun bitmişken zıplama tuşu yeni bir oyun başlatır.

**Uzun fonksiyonu bölmek.** `update()` uzadı, bu yüzden oyuncunun hareketini `updatePlayer()` adlı ayrı bir fonksiyona
taşıyoruz. `update()` artık sırayla: oyuncuyu hareket ettir, düşmanları hareket ettir, altınları topla, düşmanlara
çarpmayı kontrol et, çukuru kontrol et, kamerayı güncelle.

**Düşman döngüsünde `continue`.** `if (!enemy.alive || !overlaps(player, enemy)) continue` → "düşman ölüyse **ya da**
oyuncuyla çakışmıyorsa bu düşmanı atla". Oyuncu ölünce hemen `return` ile çıkarız, çünkü `die()` bölümü yeniden kurdu
ve bu karede yapacak başka iş kalmadı.

Fonksiyonların dosyadaki sırası önemli değildir: bilgisayar çalıştırmaya başlamadan önce bütün `function`
tanımlarını okur. Bu yüzden bir fonksiyon, dosyada kendisinden sonra yazılmış bir fonksiyonu çağırabilir.

# --task--

1. Turn the level scan into `function loadLevel()` that rebuilds `player`, `coins` and `enemies` (now `let`
   variables; enemies get `alive: true`) and resets `camera`, `collected`, `coyote` and `state = 'playing'`. Add
   `function newGame()` that sets `lives = 3` and calls `loadLevel()`. Call `newGame()` at startup.
2. Write `function die()`: lose a life; if none are left, `state = 'over'`, otherwise `loadLevel()`.
3. In `update()` (only while `'playing'`): skip dead enemies; for each live enemy the player overlaps, stomp it
   (`alive = false`, `player.vy = JUMP * 0.6`) if the stomp rule holds, otherwise `die()` and return. If the player
   falls below the level (`player.y > ROWS * TILE`), `die()`.
4. `jump()` should start a `newGame()` when the game is over. Don't draw dead enemies. Show
   `Coins: 3   Lives: 2` (three spaces between) in the corner, and when over, dim the screen and draw `Game Over` and
   `Press Space to play again`.

# --task-tr--

Bu adımda birkaç yer değişiyor; sırayla git.

1. En üstteki değişkenleri değiştir. `// The level text is the blueprint...` yorumundan başlayıp `let camera = 0 ...`
   satırına kadar olan her şeyi (bölümü tarayan `LEVEL.forEach` bloğu dahil) **sil** ve yerine şunu yaz.
   Altındaki `const keys = {}` satırı kalsın:

   ```js
   let player
   let coins
   let enemies
   let camera
   let collected
   let lives
   let coyote
   let state // 'playing' ya da 'over'
   ```

2. `jump()` fonksiyonunun **başına**, oyun bitmişse yeni oyun başlatan kısmı ekle:

   ```js
   function jump() {
     if (state !== 'playing') { // ← yeni
       newGame() // ← yeni
       return // ← yeni
     } // ← yeni
     if (coyote > 0) {
       player.vy = JUMP
       coyote = 0
     }
   }
   ```

3. `moveY` fonksiyonunun kapanış `}`'inin altına (`function updateEnemy`'den önce) bölümü kuran, yeni oyun başlatan ve
   can kaybettiren fonksiyonları yaz. Bölüm taraması artık `loadLevel`'ın içinde:

   ```js
   function loadLevel() {
     coins = []
     enemies = []
     LEVEL.forEach((line, row) => {
       for (let col = 0; col < COLS; col++) {
         const x = col * TILE
         const y = row * TILE
         if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
         if (line[col] === 'o') coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false })
         if (line[col] === 'e') enemies.push({ x: x + 2, y: y + 4, w: 28, h: 28, vx: 0, vy: 0, dir: -1, alive: true })
       }
     })
     camera = 0
     collected = 0
     coyote = 0
     state = 'playing'
   }

   function newGame() {
     lives = 3
     loadLevel()
   }

   function die() {
     lives -= 1
     if (lives === 0) state = 'over'
     else loadLevel()
   }
   ```

   Dikkat: düşmanlarda sonda yeni bir alan var: `alive: true`.

4. `update()` fonksiyonunun **tamamını** (`function update() {` satırından kapanış `}`'ine kadar) sil ve yerine şu iki
   fonksiyonu yaz. İlki eski `update()`'in oyuncu kısmıdır; ikincisi yeni `update()`:

   ```js
   function updatePlayer() {
     const input = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
     if (input !== 0) player.vx += input * ACCEL
     else player.vx *= FRICTION
     player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED)
     if (Math.abs(player.vx) < 0.05) player.vx = 0
     moveX(player)

     player.vy = Math.min(MAX_FALL, player.vy + GRAVITY)
     moveY(player)
     coyote = player.grounded ? COYOTE : Math.max(0, coyote - 1)
   }

   function update() {
     if (state !== 'playing') return
     updatePlayer()
     for (const enemy of enemies) if (enemy.alive) updateEnemy(enemy)

     for (const coin of coins) {
       if (!coin.taken && overlaps(player, coin)) {
         coin.taken = true
         collected += 1
       }
     }

     for (const enemy of enemies) {
       if (!enemy.alive || !overlaps(player, enemy)) continue
       // Ezme: düşüyorsun ve ayakların hâlâ düşmanın üst yarısında. Başka her şey çarpmadır.
       const stomp = player.vy > 0 && player.y + player.h < enemy.y + enemy.h / 2
       if (stomp) {
         enemy.alive = false
         player.vy = JUMP * 0.6
       } else {
         die()
         return
       }
     }

     if (player.y > ROWS * TILE) {
       die()
       return
     }

     camera = clamp(player.x + player.w / 2 - canvas.width / 2, 0, COLS * TILE - canvas.width)
   }
   ```

5. `draw()` fonksiyonunda düşmanları çizen `for` satırını, yalnızca canlıları çizecek şekilde değiştir:

   ```js
     ctx.fillStyle = '#7c2d12'
     for (const enemy of enemies) { // ← değişti
       if (enemy.alive) ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h) // ← değişti
     } // ← yeni
   ```

6. Yine `draw()`'da en sondaki `ctx.fillText('Coins: ' ...)` satırını değiştir ve altına Game Over ekranını ekle.
   `draw()` şöyle bitmeli:

   ```js
     ctx.fillStyle = 'white'
     ctx.font = 'bold 18px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Coins: ' + collected + '   Lives: ' + lives, 12, 26) // ← değişti

     ctx.textAlign = 'center' // ← yeni: buradan sona kadar
     if (state !== 'playing') {
       ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
       ctx.fillRect(0, 0, canvas.width, canvas.height)
       ctx.fillStyle = 'white'
       ctx.font = 'bold 36px sans-serif'
       ctx.fillText('Game Over', canvas.width / 2, 160)
       ctx.font = '18px sans-serif'
       ctx.fillText('Press Space to play again', canvas.width / 2, 200)
     }
   }
   ```

   `'   Lives: '` yazısının başında **üç boşluk** var. `'rgba(0, 0, 0, 0.5)'` yarı saydam siyahtır: ekranı karartır
   (son sayı saydamlık: 0 görünmez, 1 tam kapalı).

7. En alttaki `requestAnimationFrame(loop)` satırının **hemen üstüne** oyunu başlatan çağrıyı ekle:

   ```js
   newGame()
   requestAnimationFrame(loop)
   ```

8. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Bir düşmanın üstüne zıplayınca kaybolmalı ve sen sıçramalısın;
   yandan değince sol üstteki `Lives` bir azalmalı ve başa dönmelisin. Üç can bitince "Game Over" görünmeli, Boşluk
   yeniden başlatmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa en sık hata `newGame()` çağrısını
   unutmak ya da düşmanlara `alive: true` eklememektir.

# --tests--

Landing on an enemy should squash it and bounce the player up.
tr: Bir düşmanın üstüne inmek onu ezmeli ve oyuncuyu yukarı sıçratmalı.

```js
const enemy = enemies.find((e) => e.x === 26 * 32 + 2)
enemy.dir = 0
player.x = enemy.x
player.y = enemy.y - 34
player.vy = 6
update()
assert.isFalse(enemy.alive)
assert.isBelow(player.vy, 0)
assert.strictEqual(lives, 3)
```

Walking into an enemy should cost a life and restart the level.
tr: Bir düşmanın içine yürümek bir cana mal olmalı ve bölümü yeniden başlatmalı.

```js
const enemy = enemies.find((e) => e.x === 26 * 32 + 2)
coins[0].taken = true
collected = 1
player.x = enemy.x - 20
player.y = 258
update()
assert.strictEqual(lives, 2)
assert.strictEqual(player.x, 68, 'back at the start')
assert.strictEqual(collected, 0)
assert.isFalse(coins[0].taken, 'the level was rebuilt from the text')
```

Falling into a pit should cost a life.
tr: Bir çukura düşmek bir cana mal olmalı.

```js
player.x = 16 * 32 + 4
for (let i = 0; i < 60; i++) update()
assert.strictEqual(lives, 2)
assert.strictEqual(player.y, 258)
```

Losing the last life should end the game; Space should start a new one.
tr: Son canı kaybetmek oyunu bitirmeli; Boşluk yenisini başlatmalı.

```js
lives = 1
die()
assert.strictEqual(state, 'over')
draw()
assert.includeMembers($.texts(), ['Game Over', 'Press Space to play again'])
$.press(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(lives, 3)
```

Dead enemies should not be drawn or hurt, and the corner should show coins and lives.
tr: Ölü düşmanlar çizilmemeli ve incitmemeli; köşede altınlar ve canlar görünmeli.

```js
for (const e of enemies) e.alive = false
player.x = enemies[0].x
player.y = enemies[0].y
update()
assert.strictEqual(lives, 3)
draw()
assert.lengthOf($.rects('#7c2d12'), 0)
assert.include($.texts(), 'Coins: 0 Lives: 3')
```

# --solution--

```js
// Platformer, step by step.
// The page already has <canvas id="game" width="640" height="352"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 32
const EPS = 0.01 // a hair: the right and bottom edges are just inside the box
// The level as text: '#' ground, 'B' brick, 'o' coin, 'e' enemy, 'P' player start, 'F' flag.
const LEVEL = [
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '....................................oooo........................',
  '.........oooo........................e..........................',
  '.........BBBB.................ooo...BBBB....##..................',
  '....ooo...............#....................###.......oooo.......',
  '..P...................#...e...............####.....e.....e...F..',
  '################..############...#############..################',
  '################..############...#############..################',
]
const ROWS = LEVEL.length
const COLS = LEVEL[0].length
const COLORS = { '#': '#78350f', B: '#c2410c' }

const GRAVITY = 0.5
const MAX_FALL = 12 // must stay below TILE, or a fast fall could skip over a whole tile
const ACCEL = 0.5
const MAX_SPEED = 4
const FRICTION = 0.8
const JUMP = -11.5
const CUT = -4 // letting go early caps the upward speed at this
const COYOTE = 6 // frames you can still jump after running off a ledge

let player
let coins
let enemies
let camera
let collected
let lives
let coyote
let state // 'playing' or 'over'
const keys = {}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function solidAt(x, y) {
  const col = Math.floor(x / TILE)
  const row = Math.floor(y / TILE)
  if (col < 0 || col >= COLS) return true // invisible walls at both ends of the level
  if (row < 0 || row >= ROWS) return false // open sky above, bottomless pits below
  const tile = LEVEL[row][col]
  return tile === '#' || tile === 'B'
}

// Bodies are never bigger than a tile, so checking their four corners is enough.
function overlapsSolid(body) {
  const right = body.x + body.w - EPS
  const bottom = body.y + body.h - EPS
  return solidAt(body.x, body.y) || solidAt(right, body.y) || solidAt(body.x, bottom) || solidAt(right, bottom)
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

// Move along one axis at a time; if that ends inside a wall, snap back to the wall's edge.
function moveX(body) {
  body.x += body.vx
  if (!overlapsSolid(body)) return false
  if (body.vx > 0) body.x = Math.floor((body.x + body.w - EPS) / TILE) * TILE - body.w
  else body.x = Math.floor(body.x / TILE) * TILE + TILE
  body.vx = 0
  return true
}

function moveY(body) {
  body.grounded = false
  body.y += body.vy
  if (!overlapsSolid(body)) return
  if (body.vy > 0) {
    body.y = Math.floor((body.y + body.h - EPS) / TILE) * TILE - body.h
    body.grounded = true
  } else {
    body.y = Math.floor(body.y / TILE) * TILE + TILE
  }
  body.vy = 0
}

function loadLevel() {
  coins = []
  enemies = []
  LEVEL.forEach((line, row) => {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE
      const y = row * TILE
      if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
      if (line[col] === 'o') coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false })
      if (line[col] === 'e') enemies.push({ x: x + 2, y: y + 4, w: 28, h: 28, vx: 0, vy: 0, dir: -1, alive: true })
    }
  })
  camera = 0
  collected = 0
  coyote = 0
  state = 'playing'
}

function newGame() {
  lives = 3
  loadLevel()
}

function jump() {
  if (state !== 'playing') {
    newGame()
    return
  }
  if (coyote > 0) {
    player.vy = JUMP
    coyote = 0
  }
}

function endJump() {
  if (player.vy < CUT) player.vy = CUT
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
  if (event.key === ' ' || event.key === 'ArrowUp') endJump()
})

function die() {
  lives -= 1
  if (lives === 0) state = 'over'
  else loadLevel()
}

function updatePlayer() {
  const input = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  if (input !== 0) player.vx += input * ACCEL
  else player.vx *= FRICTION
  player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED)
  if (Math.abs(player.vx) < 0.05) player.vx = 0
  moveX(player)

  player.vy = Math.min(MAX_FALL, player.vy + GRAVITY)
  moveY(player)
  coyote = player.grounded ? COYOTE : Math.max(0, coyote - 1)
}

function updateEnemy(enemy) {
  enemy.vx = enemy.dir
  if (moveX(enemy)) enemy.dir = -enemy.dir
  enemy.vy = Math.min(MAX_FALL, enemy.vy + GRAVITY)
  moveY(enemy)
  // Turn around at ledges: is there ground just ahead of the front foot?
  if (enemy.grounded) {
    const aheadX = enemy.dir > 0 ? enemy.x + enemy.w : enemy.x - 1
    if (!solidAt(aheadX, enemy.y + enemy.h)) enemy.dir = -enemy.dir
  }
}

function update() {
  if (state !== 'playing') return
  updatePlayer()
  for (const enemy of enemies) if (enemy.alive) updateEnemy(enemy)

  for (const coin of coins) {
    if (!coin.taken && overlaps(player, coin)) {
      coin.taken = true
      collected += 1
    }
  }

  for (const enemy of enemies) {
    if (!enemy.alive || !overlaps(player, enemy)) continue
    // A stomp: falling, with the feet still in the top half of the enemy. Anything else is a hit.
    const stomp = player.vy > 0 && player.y + player.h < enemy.y + enemy.h / 2
    if (stomp) {
      enemy.alive = false
      player.vy = JUMP * 0.6
    } else {
      die()
      return
    }
  }

  if (player.y > ROWS * TILE) {
    die()
    return
  }

  camera = clamp(player.x + player.w / 2 - canvas.width / 2, 0, COLS * TILE - canvas.width)
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(-Math.round(camera), 0)

  // Only draw the columns that are on screen.
  const first = Math.floor(camera / TILE)
  const last = Math.min(COLS - 1, first + Math.ceil(canvas.width / TILE))
  for (let row = 0; row < ROWS; row++) {
    for (let col = first; col <= last; col++) {
      const tile = LEVEL[row][col]
      if (tile === '#' || tile === 'B') {
        ctx.fillStyle = COLORS[tile]
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE)
      }
    }
  }

  ctx.fillStyle = '#facc15'
  for (const coin of coins) {
    if (coin.taken) continue
    ctx.beginPath()
    ctx.arc(coin.x + coin.w / 2, coin.y + coin.h / 2, 8, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#7c2d12'
  for (const enemy of enemies) {
    if (enemy.alive) ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h)
  }

  ctx.fillStyle = '#dc2626'
  ctx.fillRect(player.x, player.y, player.w, player.h)
  ctx.restore()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Coins: ' + collected + '   Lives: ' + lives, 12, 26)

  ctx.textAlign = 'center'
  if (state !== 'playing') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, 160)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, 200)
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
