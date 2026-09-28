---
title: They shoot back
title_tr: Karşılık veriyorlar
skills: [game.collision, game.state]
---

# --explanation--

Now the invaders fire too. On some of their steps (35% of the time), one of them drops a **bomb**. But which one? If any
invader could fire, bombs would fly out of the middle of the formation, straight through the invaders below. So the
rule is: pick a random column, and only its **lowest** living invader fires.

```js
const shooter = living[Math.floor(Math.random() * living.length)]            // a random living invader
const lowest = living
  .filter((invader) => invader.x === shooter.x)                                // everyone in its column
  .reduce((a, b) => (b.y > a.y ? b : a))                                       // the one furthest down
```

`reduce` walks a list while carrying one value along, here "the lowest invader seen so far". It is the general tool
behind `Math.max`, sums, and many "find the best" searches.

A bomb that hits the cannon costs a **life**, and clears the other bombs so the player gets a fair moment to recover.
The game ends when the lives run out, **or** when the formation marches all the way down to the cannon's row.

# --explanation-tr--

**Bu adımda:** istilacılar da ateş edecek. Aşağı turuncu bombalar düşecek; bomba topa değerse bir can gidecek, canlar
bitince ekranda `GAME OVER` yazacak. Sağ üstte `LIVES 3` göreceksin.

**Rastgelelik.** `Math.random()` her çağrıldığında 0 ile 1 arasında (1 hariç) rastgele bir kesirli sayı verir: `0.42`,
`0.07` gibi. İki kullanım:

- **Şans:** `if (Math.random() < 0.35) dropBomb()` → sayı yüzde 35 ihtimalle 0.35'ten küçük çıkar; yani adımların
  kabaca üçte birinde bomba atılır.
- **Rastgele seçim:** `Math.random() * living.length` 0 ile canlı sayısı arasında bir kesir verir (örneğin `17.8`).
  `Math.floor` kesiri **aşağı yuvarlar** (`17`). Sonuç, listede geçerli bir sıra numarasıdır; `living[17]` de rastgele
  bir istilacıdır.

**Kim ateş eder?** Herhangi bir istilacı ateş etse, bombalar bloğun ortasından çıkıp alttaki istilacıların içinden
geçerdi. Kural şu: rastgele bir sütun seç, o sütunun yalnızca **en alttaki** canlısı ateş etsin.

```js
const shooter = living[Math.floor(Math.random() * living.length)]   // rastgele bir canlı
const lowest = living.filter((invader) => invader.x === shooter.x).reduce((a, b) => (b.y > a.y ? b : a))
```

Parça parça:

- `filter(... invader.x === shooter.x)` → seçilenle aynı `x`'teki, yani aynı sütundaki herkes.
- `koşul ? A : B` → "koşul doğruysa A, değilse B". Kısa bir `if`/`else`'tir.
- `reduce` listeyi dolaşırken yanında tek bir değer taşır; burada "şimdiye kadar gördüğüm en alttaki istilacı". `a`
  taşınan değer, `b` sıradaki eleman: `b` daha aşağıdaysa (`y`'si büyükse) artık o taşınır, değilse `a` kalır. Liste
  bitince elde en alttaki kalır. `Math.max`'ın, toplamaların ve pek çok "en iyisini bul" aramasının arkasındaki genel
  araç budur.

**Oyunun durumu (state).** Oyun ya sürüyor ya bitti. Bunu bir yazıyla tutarız: `state = 'playing'` ya da `'over'`.
`!==` "eşit değil" demektir: `if (state !== 'playing') return` → "oyun sürmüyorsa bu kare hiçbir şey yapma". Böylece
oyun bitince her şey donar. Ateş de yalnızca oyun sürerken olur: `event.key === ' ' && state === 'playing'`.

**Bir tanesi bile yeter: `some`.** `bombs.some((bomb) => overlaps(bomb, ship))` → "bombalardan **en az biri** topa
değiyor mu?" Cevap `true` ya da `false`'tur.

**Can kaybı.** Topa bomba değince bir can gider (`lives -= 1`) ve diğer bombalar da silinir; oyuncuya toparlanması için
adil bir an tanınır. `<=` "küçük ya da eşit" demektir: can 0'a inince `endGame()` oyunu bitirir. Oyun ayrıca istilacılar
topun sırasına (`SHIP_Y`) kadar indiğinde de biter.

**Yarı saydam renk.** `'rgba(0, 0, 0, 0.7)'` kırmızı, yeşil, mavi (0–255) ve **saydamlık** (0–1) ile verilen bir
renktir: yüzde 70 opak siyah. `GAME OVER` yazısının arkasına koyu bir şerit çizer, alttaki oyun hafifçe görünür.
`ctx.textAlign = 'right'` ise verilen noktayı yazının **sağ ucu** yapar; `LIVES 3` sağ kenara yaslanır.

# --task--

1. Add `BOMB_SPEED = 3`, `let bombs` (emptied in `spawnWave()`), `let lives` (3 in `newGame()`) and
   `let state` (`'playing'` in `newGame()`).
2. Write `dropBomb()` as above, pushing a 4×10 bomb at `x = lowest.x + INVADER_W / 2 - 2`,
   `y = lowest.y + INVADER_H`. Call it after a march step when `Math.random() < 0.35`.
3. In `update()` (only while `'playing'`): move bombs down by `BOMB_SPEED`, drop the ones below the screen, and if one
   overlaps the ship call `loseLife()`: lose a life, clear the bombs, and `endGame()` (`state = 'over'`) at 0 lives.
   Also end the game when a living invader's bottom reaches `SHIP_Y`. Only shoot while playing.
4. Draw bombs in `'#fb923c'`, `LIVES 3` right-aligned at the top, and `GAME OVER` over the screen when over.

# --task-tr--

1. `const BULLET_SPEED = 8` satırının altına bomba hızını ekle:

   ```js
   const BOMB_SPEED = 3
   ```

2. Tanımlara üç yeni değişken ekle: `let invaders` satırının altına `let bombs`, `let score` satırının altına
   `let lives` ve `let state`:

   ```js
   let invaders
   let bombs // ← yeni
   ```

   ```js
   let score
   let lives // ← yeni
   let state // 'playing' or 'over' ← yeni
   ```

3. `spawnWave()` içinde `bullets = []` satırının altına `bombs = []` ekle. `newGame()`'i şöyle yap:

   ```js
   function newGame() {
     ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }
     wave = 1
     score = 0
     lives = 3 // ← yeni
     lastShot = -COOLDOWN
     state = 'playing' // ← yeni
     spawnWave()
   }
   ```

4. `march()` fonksiyonunun kapanış `}`'inin altına, bir boş satır bırakıp üç fonksiyon ekle:

   ```js
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
   }
   ```

5. `keydown` bloğundaki ateş satırını değiştir:

   ```js
     if (event.key === ' ' && state === 'playing') shoot() // ← değişti
   ```

6. `update()` fonksiyonunu şu hâle getir (yeni satırlar işaretli):

   ```js
   function update() {
     if (state !== 'playing') return // ← yeni

     if (keys.ArrowLeft) ship.x -= SHIP_SPEED
     if (keys.ArrowRight) ship.x += SHIP_SPEED
     ship.x = Math.max(0, Math.min(canvas.width - SHIP_W, ship.x))

     for (const bullet of bullets) bullet.y -= BULLET_SPEED
     for (const bomb of bombs) bomb.y += BOMB_SPEED // ← yeni

     for (const bullet of bullets) {
       const hit = invaders.find((invader) => invader.alive && overlaps(bullet, invader))
       if (hit) {
         hit.alive = false
         bullet.y = -100 // used up; removed below
         score += ROW_POINTS[hit.row]
       }
     }
     bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0)
     bombs = bombs.filter((bomb) => bomb.y < canvas.height) // ← yeni

     if (bombs.some((bomb) => overlaps(bomb, ship))) loseLife() // ← yeni
     if (state !== 'playing') return // ← yeni

     if (alive().length === 0) {
       wave += 1
       spawnWave()
       return
     }

     if (now - lastStep >= stepInterval()) {
       lastStep = now
       march()
       if (Math.random() < 0.35) dropBomb() // ← yeni
     }
     if (alive().some((invader) => invader.y + invader.h >= SHIP_Y)) endGame() // ← yeni
   }
   ```

7. `draw()` içinde mermileri boyayan satırın hemen altına bombaları ekle:

   ```js
     ctx.fillStyle = '#fb923c'
     for (const bomb of bombs) ctx.fillRect(bomb.x, bomb.y, bomb.w, bomb.h)
   ```

8. `draw()`'un sonuna, `WAVE` yazısını yazan satırın altına canları ve oyun sonu ekranını ekle:

   ```js
     ctx.textAlign = 'right'
     ctx.fillText('LIVES ' + lives, canvas.width - 10, 24)

     if (state === 'over') {
       ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
       ctx.fillRect(0, 200, canvas.width, 120)
       ctx.fillStyle = 'white'
       ctx.textAlign = 'center'
       ctx.font = 'bold 32px monospace'
       ctx.fillText('GAME OVER', canvas.width / 2, 250)
     }
   ```

9. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. İstilacılar zaman zaman turuncu bombalar atmalı; bomba topa
   değince sağ üstteki `LIVES` bir azalmalı, 0 olunca `GAME OVER` çıkmalı. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

Bombs should come from the lowest invader of a column.
tr: Bombalar bir sütunun en alttaki istilacısından gelmeli.

```js
for (let i = 0; i < 30; i++) dropBomb()
for (const bomb of bombs) {
  const column = invaders.filter((inv) => inv.alive && inv.x + INVADER_W / 2 - 2 === bomb.x)
  const lowest = Math.max(...column.map((inv) => inv.y))
  assert.strictEqual(bomb.y, lowest + INVADER_H)
}
invaders[40].alive = false
bombs = []
for (let i = 0; i < 60; i++) dropBomb()
const fromThatColumn = bombs.filter((b) => b.x === invaders[40].x + INVADER_W / 2 - 2)
assert.isAbove(fromThatColumn.length, 0)
assert.isTrue(fromThatColumn.every((b) => b.y === invaders[31].y + INVADER_H), 'with the bottom one gone, the next one up fires')
```

A bomb hitting the cannon should cost a life and clear the bombs.
tr: Topa çarpan bir bomba bir cana mal olmalı ve bombaları temizlemeli.

```js
bombs = [{ x: ship.x + 10, y: ship.y - 5, w: 4, h: 10 }, { x: 10, y: 100, w: 4, h: 10 }]
update()
assert.strictEqual(lives, 2)
assert.lengthOf(bombs, 0)
```

Losing the last life should end the game.
tr: Son canı kaybetmek oyunu bitirmeli.

```js
lives = 1
bombs = [{ x: ship.x + 10, y: ship.y - 5, w: 4, h: 10 }]
update()
assert.strictEqual(state, 'over')
$.tap(' ')
assert.lengthOf(bullets, 0, 'no shooting after game over')
draw()
assert.include($.texts(), 'GAME OVER')
```

The game should end when the invaders reach the cannon.
tr: İstilacılar topa ulaşınca oyun bitmeli.

```js
for (const invader of invaders) invader.y += 400
update()
assert.strictEqual(state, 'over')
```

The invaders should actually fire during play.
tr: İstilacılar oyun sırasında gerçekten ateş etmeli.

```js
let seen = 0
for (let i = 0; i < 600 && state === 'playing'; i++) {
  lives = 3
  $.tick()
  seen = Math.max(seen, bombs.length)
}
assert.isAtLeast(seen, 1)
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
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ' && state === 'playing') shoot()
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
