---
title: Power-ups under crates
title_tr: Sandıkların altındaki güçlendirmeler
skills: [game.state, prog.arrays]
---

# --explanation--

Blowing up crates becomes more exciting when some of them hide a reward. About one crate in five hides a **power-up**:

- **B**: one more bomb at a time (`maxBombs`);
- **F**: longer flames (`power`).

Where do we keep them? A second grid would mostly be empty. A **`Map`** from a tile to its item is a better fit: only tiles
that have something take space. Map keys must be simple values to be found again, so a tile becomes a string, `'3,5'`.

An item is only visible (and can only be picked up) once its crate has burnt, which is exactly when the tile has become
floor. Walking onto it adds the power and removes it from the map.

Power-ups change the strategy: two bombs let you trap an enemy between them, and long flames reach round the corridors, but
they also reach **you**.

# --explanation-tr--

**Bu adımda:** bazı kasaların altına **güçlendirme** (power-up) saklayacağız. Kasa yanınca yerinde mavi bir **B** ya da
turuncu bir **F** karesi belirecek; üstüne yürüyünce alacaksın. Üst satırda `♥♥♥  Bombs 1  Fire 2` göreceksin.

**İki tür ödül.** Kasa patlatmak, bazıları bir ödül saklayınca daha heyecanlı olur. Kabaca her beş kasadan biri bir
güçlendirme saklar:

- **B**: aynı anda bir bomba fazla (`maxBombs`);
- **F**: daha uzun alevler (`power`).

Güçlendirmeler stratejiyi değiştirir: iki bombayla bir düşmanı arada kıstırabilirsin; uzun alevler koridorların
köşelerine kadar uzanır, ama **sana** da uzanır.

**Nerede tutalım? `Map`.** İkinci bir ızgara çoğunlukla boş kalırdı. Bir kareden eşyasına giden bir **`Map`** (eşleme
tablosu) daha uygundur: yalnızca bir şeyi olan kareler yer kaplar. Bir sözlük gibi düşün: her **anahtara** bir **değer**
karşılık gelir.

```js
items = new Map()                 // boş tablo
items.set('3,5', 'fire')          // '3,5' anahtarına 'fire' yaz
items.get('3,5')                  // okur: 'fire'  (yoksa undefined)
items.delete('3,5')               // siler
```

Anahtarların yeniden bulunabilmesi için basit değerler olması gerekir; bu yüzden bir kare bir yazıya dönüşür: `'3,5'`.
Bunu `key(r, c)` yapar: `r + ',' + c` sayıyla yazıyı `+` ile yan yana ekler.

**Şans.** 1. adımdaki kasa satırı artık iki iş yapar, bu yüzden `else`'ten sonra süslü parantez açarız. Kasa koyulur,
sonra `Math.random() < 0.2` (yüzde 20 ihtimal) ile bir ödül saklanır; hangisi olacağını ikinci bir yazı-tura seçer:
`Math.random() < 0.5 ? 'bomb' : 'fire'`.

**Görünmek ve almak.** Eşya yalnızca kasası yandıktan sonra görünür (ve alınabilir); bu tam olarak kare zemin olduğu
andır: `grid[r][c] === ' '`. Üstüne yürümek gücü ekler ve eşyayı tablodan siler. `pickUp()` bunu her karede,
`updatePlayer()`'dan hemen sonra kontrol eder:

```js
if (!item || grid[t.r][t.c] !== ' ') return
```

"Eşya yoksa **veya** kare henüz zemin değilse (kasa duruyorsa) hiçbir şey yapma."

Eşya çizilirken harfi karenin ortasına yazmak için `ctx.textAlign = 'center'` ve `x + TILE / 2` kullanılır.

# --task--

1. Add `key(r, c)` (returning `'r,c'`) and `items`, a `Map` made in `makeGrid()`: each crate has a `0.2` chance to hide
   `'bomb'` or `'fire'` (half and half).
2. Write `pickUp()`, called after `updatePlayer()`: if there is an item on the player's tile and the tile is floor, remove it
   and add 1 to `maxBombs` (bomb) or `power` (fire).
3. Draw an uncovered item as a square 6 pixels in, `'#2563eb'` for bomb and `'#ea580c'` for fire, with `B` or `F` in white
   (`'bold 14px sans-serif'`, centered, `y + 21`).
4. The top line becomes `♥♥♥  Bombs 1  Fire 2`.

# --task-tr--

1. `let grid ...` satırının altına ekle:

   ```js
   let items // 'r,c' -> 'bomb' or 'fire', hidden under crates until they burn
   ```

2. `const near = ...` satırının **üstüne** ekle:

   ```js
   const key = (r, c) => r + ',' + c
   ```

3. `makeGrid()`'i şöyle yap:

   ```js
   function makeGrid() {
     grid = []
     items = new Map() // ← yeni
     for (let r = 0; r < ROWS; r++) {
       grid.push([])
       for (let c = 0; c < COLS; c++) {
         if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
         else if (near(r, c, [[1, 1], ...ENEMY_STARTS]) || Math.random() > 0.55) grid[r].push(' ')
         else { // ← değişti
           grid[r].push('+')
           if (Math.random() < 0.2) items.set(key(r, c), Math.random() < 0.5 ? 'bomb' : 'fire') // ← yeni
         } // ← yeni
       }
     }
   }
   ```

4. `updatePlayer()`'ın kapanış `}`'inin altına ekle:

   ```js
   function pickUp() {
     const t = tileOf(player)
     const item = items.get(key(t.r, t.c))
     if (!item || grid[t.r][t.c] !== ' ') return
     items.delete(key(t.r, t.c))
     if (item === 'bomb') maxBombs += 1
     else power += 1
   }
   ```

5. `update()` içinde `updatePlayer()` satırının hemen altına ekle:

   ```js
     pickUp()
   ```

6. `draw()` içinde, kasanın şeridini çizen `if (tile === '+') { ... }` bloğunun kapanışının altına (hâlâ içteki `for`
   döngüsünün içinde) eşyayı çiz:

   ```js
         const item = items.get(key(r, c))
         if (item && tile === ' ') {
           ctx.fillStyle = item === 'bomb' ? '#2563eb' : '#ea580c'
           ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12)
           ctx.fillStyle = 'white'
           ctx.font = 'bold 14px sans-serif'
           ctx.textAlign = 'center'
           ctx.fillText(item === 'bomb' ? 'B' : 'F', x + TILE / 2, y + 21)
         }
   ```

7. `draw()`'da kalpleri yazan satırı değiştir:

   ```js
     ctx.fillText('♥'.repeat(lives) + '  Bombs ' + maxBombs + '  Fire ' + power, 8, 22) // ← değişti
   ```

8. **Çalıştır**'a bas. Üstte `♥♥♥  Bombs 1  Fire 2` yazmalı. Oynamak için önce oyuna tıkla ve kasaları patlat: bazılarının
   yerinde B ya da F çıkmalı; üstüne yürüyünce kaybolmalı ve üstteki sayı artmalı. Alttaki kontrollerin hepsi yeşil
   olmalı. Üst yazı kontrolü kırmızıysa `'  Bombs '` ve `'  Fire '` içindeki **iki** boşluğu kontrol et.

# --tests--

About one crate in five should hide a power-up, and only crates should.
tr: Beş sandıktan yaklaşık biri bir güçlendirme saklamalı ve yalnızca sandıklar saklamalı.

```js
let crates = 0
let hidden = 0
for (let i = 0; i < 20; i++) {
  makeGrid()
  for (const row of grid) for (const t of row) if (t === '+') crates++
  hidden += items.size
  for (const k of items.keys()) {
    const [r, c] = k.split(',').map(Number)
    assert.strictEqual(grid[r][c], '+', 'power-ups hide under crates')
  }
}
assert.isAbove(hidden / crates, 0.1)
assert.isBelow(hidden / crates, 0.3)
```

A power-up should appear when its crate burns and be picked up by walking onto it.
tr: Bir güçlendirme sandığı yanınca belirmeli ve üstüne yürüyünce alınmalı.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
grid[9][10] = grid[8][11] = '#'
enemies = [{ x: 11, y: 9, target: null, dir: [0, 0] }] // shut in a corner
grid[1][3] = '+'
items = new Map([['1,3', 'fire'], ['1,2', 'bomb']])
grid[1][2] = '+'
player.x = 1
$.press(' ')
$.tick(FUSE)
assert.strictEqual(grid[1][2], ' ')
$.tick(FLAME_TIME)
$.press('ArrowRight')
$.tick(20)
assert.strictEqual(maxBombs, 2, 'picked up a bomb')
assert.isFalse(items.has('1,2'))
assert.strictEqual(power, 2, 'the fire is still under its crate')
$.tick(20)
assert.strictEqual(player.x, 2)
```

Uncovered power-ups and the powers should be drawn.
tr: Açığa çıkmış güçlendirmeler ve güçler çizilmeli.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
items = new Map([['1,2', 'fire']])
$.tick(1)
assert.deepInclude($.rects('#ea580c'), { x: 70, y: 70, w: 20, h: 20, color: '#ea580c' })
assert.include($.texts(), 'F')
$.press('ArrowRight')
$.tick(10)
assert.strictEqual(power, 3)
$.tick(1)
assert.include($.texts(), '♥♥♥  Bombs 1  Fire 3')
```

# --solution--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 13
const ROWS = 11
const TILE = 32
const TOP = 32 // room for the lives and the time
const SPEED = 0.1 // tiles per frame
const ENEMY_SPEED = 0.05
const FUSE = 150 // frames until a bomb goes off
const FLAME_TIME = 30
const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor
let items // 'r,c' -> 'bomb' or 'fire', hidden under crates until they burn
let player // { x, y, target: null or { r, c } }
let enemies
let bombs // { r, c, fuse }
let flames // { r, c, time }
let held // arrow keys being held, the last one pressed at the end
let maxBombs
let power
let lives
let safe // frames of invincibility after losing a life
let state // 'playing', 'won' or 'lost'

const key = (r, c) => r + ',' + c
const near = (r, c, spots) => spots.some(([sr, sc]) => Math.abs(sr - r) + Math.abs(sc - c) <= 1)

// Walls all round, a pillar on every even row and column, and crates on about half of the rest,
// but never next to where the player and the enemies start.
function makeGrid() {
  grid = []
  items = new Map()
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
      else if (near(r, c, [[1, 1], ...ENEMY_STARTS]) || Math.random() > 0.55) grid[r].push(' ')
      else {
        grid[r].push('+')
        if (Math.random() < 0.2) items.set(key(r, c), Math.random() < 0.5 ? 'bomb' : 'fire')
      }
    }
  }
}

const bombAt = (r, c) => bombs.find((b) => b.r === r && b.c === c)
const walkable = (r, c) => grid[r][c] === ' ' && !bombAt(r, c)
const tileOf = (m) => ({ r: Math.round(m.y), c: Math.round(m.x) })

function reset() {
  makeGrid()
  player = { x: 1, y: 1, target: null }
  enemies = ENEMY_STARTS.map(([r, c]) => ({ x: c, y: r, target: null, dir: [0, 0] }))
  bombs = []
  flames = []
  held = []
  maxBombs = 1
  power = 2
  lives = 3
  safe = 0
  state = 'playing'
}

// Step a mover towards its target tile, and drop the target once it is there.
function moveTo(m, speed) {
  const dx = m.target.c - m.x
  const dy = m.target.r - m.y
  if (Math.abs(dx) <= speed && Math.abs(dy) <= speed) {
    m.x = m.target.c
    m.y = m.target.r
    m.target = null
    return
  }
  m.x += Math.sign(dx) * speed
  m.y += Math.sign(dy) * speed
}

// On a tile, the last arrow key held picks the next tile; then the player keeps sliding towards it.
function updatePlayer() {
  const dir = DIRS[held[held.length - 1]]
  if (!player.target && dir && walkable(player.y + dir[0], player.x + dir[1])) {
    player.target = { r: player.y + dir[0], c: player.x + dir[1] }
  }
  if (player.target) moveTo(player, SPEED)
}

function pickUp() {
  const t = tileOf(player)
  const item = items.get(key(t.r, t.c))
  if (!item || grid[t.r][t.c] !== ' ') return
  items.delete(key(t.r, t.c))
  if (item === 'bomb') maxBombs += 1
  else power += 1
}

function dropBomb() {
  if (state !== 'playing' || bombs.length >= maxBombs) return
  const t = tileOf(player)
  if (bombAt(t.r, t.c)) return
  bombs.push({ r: t.r, c: t.c, fuse: FUSE })
}

// A cross of flames, `power` tiles each way. Walls stop it; a crate burns and stops it; another bomb goes off too.
function explode(bomb) {
  bombs = bombs.filter((b) => b !== bomb)
  flames.push({ r: bomb.r, c: bomb.c, time: FLAME_TIME })
  for (const [dr, dc] of Object.values(DIRS)) {
    for (let i = 1; i <= power; i++) {
      const r = bomb.r + dr * i
      const c = bomb.c + dc * i
      if (grid[r][c] === '#') break
      flames.push({ r, c, time: FLAME_TIME })
      if (grid[r][c] === '+') {
        grid[r][c] = ' '
        break
      }
      const other = bombAt(r, c)
      if (other) {
        other.fuse = 1 // a chain reaction: it goes off next frame
        break
      }
    }
  }
}

const inFlames = (m) => {
  const t = tileOf(m)
  return flames.some((f) => f.r === t.r && f.c === t.c)
}

// Enemies wander: at each tile they pick a way they can go, and only turn back at a dead end.
function updateEnemy(e) {
  if (!e.target) {
    const options = Object.values(DIRS).filter(([dr, dc]) => walkable(e.y + dr, e.x + dc))
    if (options.length === 0) return
    const forward = options.filter(([dr, dc]) => dr !== -e.dir[0] || dc !== -e.dir[1])
    const pick = forward.length ? forward : options
    e.dir = pick[Math.floor(Math.random() * pick.length)]
    e.target = { r: e.y + e.dir[0], c: e.x + e.dir[1] }
  }
  moveTo(e, ENEMY_SPEED)
}

function hurt() {
  lives -= 1
  if (lives === 0) {
    state = 'lost'
    return
  }
  player = { x: 1, y: 1, target: null }
  safe = 120
}

function update() {
  if (state !== 'playing') return
  updatePlayer()
  pickUp()
  for (const e of enemies) updateEnemy(e)
  for (const b of bombs) b.fuse -= 1
  for (const bomb of bombs.filter((b) => b.fuse <= 0)) explode(bomb)
  for (const f of flames) f.time -= 1
  flames = flames.filter((f) => f.time > 0)
  enemies = enemies.filter((e) => !inFlames(e))
  if (safe > 0) safe -= 1
  else if (inFlames(player) || enemies.some((e) => Math.hypot(e.x - player.x, e.y - player.y) < 0.6)) hurt()
  if (state === 'playing' && enemies.length === 0) state = 'won'
}

document.addEventListener('keydown', (event) => {
  if (DIRS[event.key]) {
    event.preventDefault()
    if (!held.includes(event.key)) held.push(event.key)
  } else if (event.key === ' ') {
    event.preventDefault()
    dropBomb()
  } else if (event.key === 'Enter' && state !== 'playing') reset()
})

document.addEventListener('keyup', (event) => {
  held = held.filter((k) => k !== event.key)
})

function drawCircle(m, color, radius) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(m.x * TILE + TILE / 2, TOP + m.y * TILE + TILE / 2, radius, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE
      const y = TOP + r * TILE
      const tile = grid[r][c]
      ctx.fillStyle = tile === '#' ? '#475569' : tile === '+' ? '#b45309' : '#3f6212'
      ctx.fillRect(x, y, TILE, TILE)
      if (tile === '+') {
        ctx.fillStyle = '#92400e'
        ctx.fillRect(x + 4, y + 14, TILE - 8, 4)
      }
      const item = items.get(key(r, c))
      if (item && tile === ' ') {
        ctx.fillStyle = item === 'bomb' ? '#2563eb' : '#ea580c'
        ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12)
        ctx.fillStyle = 'white'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(item === 'bomb' ? 'B' : 'F', x + TILE / 2, y + 21)
      }
    }
  }
  for (const f of flames) {
    ctx.fillStyle = '#f97316'
    ctx.fillRect(f.c * TILE + 2, TOP + f.r * TILE + 2, TILE - 4, TILE - 4)
    ctx.fillStyle = '#fde047'
    ctx.fillRect(f.c * TILE + 9, TOP + f.r * TILE + 9, TILE - 18, TILE - 18)
  }
  // Bombs blink faster as the fuse runs out.
  for (const b of bombs) drawCircle({ x: b.c, y: b.r }, b.fuse < 45 && b.fuse % 10 < 5 ? '#dc2626' : '#020617', 12)
  for (const e of enemies) drawCircle(e, '#e11d48', 12)
  if (safe % 10 < 5) drawCircle(player, '#f8fafc', 12)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('♥'.repeat(lives) + '  Bombs ' + maxBombs + '  Fire ' + power, 8, 22)
  if (state !== 'playing') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.fillRect(40, 150, canvas.width - 80, 90)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText(state === 'won' ? 'All enemies gone!' : 'Game over', canvas.width / 2, 190)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Enter to play again', canvas.width / 2, 222)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
