---
title: Enemies that patrol
title_tr: Devriye gezen düşmanlar
skills: [game.state, game.collision, prog.functions]
---

# --explanation--

Enemies are made from `e` in the level, just like coins. And here the work you did on `moveX` and `moveY` pays off:
they take **any** body, not just the player. An enemy falls with gravity, stands on tiles and bumps into walls using
exactly the same functions. Write the physics once, reuse it for everything that moves.

The classic walker has two rules:

1. Walk in its direction (`dir` is `1` or `-1`). If `moveX` reports a wall (`true`), turn around.
2. Don't walk off ledges. After moving, look at the ground **just ahead of the front foot**:

```js
const aheadX = enemy.dir > 0 ? enemy.x + enemy.w : enemy.x - 1   // one step past the front edge
if (!solidAt(aheadX, enemy.y + enemy.h)) enemy.dir = -enemy.dir  // nothing to stand on? turn
```

`enemy.y + enemy.h` is the first pixel **below** the feet, where the floor should be. This one probe gives walkers
their feel: they patrol platforms instead of marching into every pit.

This is the simplest possible **AI**: two rules and no planning. It is still enough to make a level interesting,
because the player's challenge is *timing*, not outsmarting it.

# --explanation-tr--

Düşmanlar, altınlar gibi bölümdeki `e`'lerden yapılır. Ve burada `moveX` ile `moveY` üzerinde yaptığın iş karşılığını
verir: onlar yalnızca oyuncuyu değil **herhangi** bir gövdeyi alır. Bir düşman tam olarak aynı fonksiyonlarla
yerçekimiyle düşer, döşemelerin üstünde durur ve duvarlara çarpar. Fiziği bir kez yaz, hareket eden her şey için
yeniden kullan.

Klasik yürüyen düşmanın iki kuralı var:

1. Kendi yönünde yürü (`dir` `1` ya da `-1`). `moveX` bir duvar bildirirse (`true`), geri dön.
2. Kenarlardan düşme. Hareketten sonra **ön ayağının hemen önündeki** zemine bak:

```js
const aheadX = enemy.dir > 0 ? enemy.x + enemy.w : enemy.x - 1   // ön kenarın bir adım ötesi
if (!solidAt(aheadX, enemy.y + enemy.h)) enemy.dir = -enemy.dir  // üstünde duracak bir şey yok mu? dön
```

`enemy.y + enemy.h` ayakların hemen **altındaki** ilk pikseldir; zeminin olması gereken yer. Bu tek yoklama yürüyenlere
karakterlerini verir: her çukura yürümek yerine platformlarda devriye gezerler.

Bu, olabilecek en basit **yapay zekâ**: iki kural ve hiç plan yok. Yine de bir bölümü ilginç kılmaya yeter, çünkü
oyuncunun işi onu alt etmek değil, *zamanlamak*.

# --task--

1. In the level scan, push an enemy `{ x: col * TILE + 2, y: row * TILE + 4, w: 28, h: 28, vx: 0, vy: 0, dir: -1 }`
   into `const enemies = []` for every `'e'`.
2. Write `function updateEnemy(enemy)`: set `vx` to `dir` and `moveX`, turning around if it hit a wall; apply gravity
   (capped at `MAX_FALL`) and `moveY`; then, if grounded, turn around when there is no solid tile just ahead of the front
   foot (see above). Call it for every enemy in `update()`, after the player.
3. Draw enemies as `'#7c2d12'` rectangles in the world.

(The player can walk through them for now. Stomping comes next.)

# --task-tr--

1. Bölüm taramasında her `'e'` için `const enemies = []`'a
   `{ x: col * TILE + 2, y: row * TILE + 4, w: 28, h: 28, vx: 0, vy: 0, dir: -1 }` düşmanını ekle.
2. `function updateEnemy(enemy)` yaz: `vx`'i `dir` yap ve `moveX` çağır, duvara çarptıysa geri dön; yerçekimi uygula
   (`MAX_FALL` ile sınırlı) ve `moveY` çağır; sonra yerdeyse ön ayağın hemen önünde katı döşeme yoksa geri dön
   (yukarıya bak). `update()` içinde oyuncudan sonra her düşman için çağır.
3. Düşmanları dünyada `'#7c2d12'` dikdörtgenler olarak çiz.

(Oyuncu şimdilik içlerinden geçebiliyor. Ezmek sırada.)

# --tests--

Every `e` in the level should become an enemy standing on the ground.
tr: Bölümdeki her `e` zeminde duran bir düşmana dönüşmeli.

```js
const count = LEVEL.join('').split('e').length - 1
assert.lengthOf(enemies, count)
assert.deepInclude(enemies, { x: 26 * 32 + 2, y: 8 * 32 + 4, w: 28, h: 28, vx: 0, vy: 0, dir: -1 })
```

Enemies should walk one pixel per frame and stay on the ground.
tr: Düşmanlar karede bir piksel yürümeli ve zeminde kalmalı.

```js
const enemy = enemies.find((e) => e.x === 26 * 32 + 2)
$.tick(10)
assert.strictEqual(enemy.x, 26 * 32 + 2 - 10)
assert.strictEqual(enemy.y + enemy.h, 9 * 32)
```

An enemy should turn around at a wall.
tr: Bir düşman duvarda geri dönmeli.

```js
const enemy = enemies.find((e) => e.x === 26 * 32 + 2)
enemy.x = 23 * 32 + 3
$.tick(5)
assert.strictEqual(enemy.dir, 1, 'it walked into the pillar and turned')
assert.isAtLeast(enemy.x, 23 * 32)
```

An enemy should turn around at a ledge instead of falling.
tr: Bir düşman düşmek yerine kenarda geri dönmeli.

```js
const enemy = enemies.find((e) => e.x === 26 * 32 + 2)
enemy.dir = 1
enemy.x = 30 * 32 - 30
for (let i = 0; i < 20; i++) update()
assert.strictEqual(enemy.dir, -1)
assert.strictEqual(enemy.y + enemy.h, 9 * 32, 'still on the ground')
assert.isAtMost(enemy.x + enemy.w, 30 * 32)
```

The enemy on the brick platform should patrol it without falling off.
tr: Tuğla platformdaki düşman düşmeden onun üstünde devriye gezmeli.

```js
const enemy = enemies.find((e) => e.y === 5 * 32 + 4)
for (let i = 0; i < 400; i++) update()
assert.strictEqual(enemy.y + enemy.h, 6 * 32)
assert.isAtLeast(enemy.x, 36 * 32)
assert.isAtMost(enemy.x + enemy.w, 40 * 32)
$.tick()
assert.isAtLeast($.rects('#7c2d12').length, 1)
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

// The level text is the blueprint; these objects are the live state built from it.
let player
const coins = []
const enemies = []
LEVEL.forEach((line, row) => {
  for (let col = 0; col < COLS; col++) {
    const x = col * TILE
    const y = row * TILE
    if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
    if (line[col] === 'o') coins.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false })
    if (line[col] === 'e') enemies.push({ x: x + 2, y: y + 4, w: 28, h: 28, vx: 0, vy: 0, dir: -1 })
  }
})
let collected = 0
let coyote = 0
let camera = 0 // world x of the screen's left edge
const keys = {}

function jump() {
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

// Move along one axis at a time; if that ends inside a tile, snap back to the tile's edge.
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
  const input = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  if (input !== 0) player.vx += input * ACCEL
  else player.vx *= FRICTION
  player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED)
  if (Math.abs(player.vx) < 0.05) player.vx = 0
  moveX(player)

  player.vy = Math.min(MAX_FALL, player.vy + GRAVITY)
  moveY(player)
  coyote = player.grounded ? COYOTE : Math.max(0, coyote - 1)

  for (const enemy of enemies) updateEnemy(enemy)

  for (const coin of coins) {
    if (!coin.taken && overlaps(player, coin)) {
      coin.taken = true
      collected += 1
    }
  }

  // Keep the player in the middle of the screen, without showing past either end of the level.
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
  for (const enemy of enemies) ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h)

  ctx.fillStyle = '#dc2626'
  ctx.fillRect(player.x, player.y, player.w, player.h)
  ctx.restore()

  // The interface is drawn in screen coordinates, after the restore, so it does not scroll.
  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Coins: ' + collected, 12, 26)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
