---
title: Wandering enemies
title_tr: Dolaşan düşmanlar
skills: [game.state, game.collision]
---

# --explanation--

Three enemies start in the other corners. They move exactly like the player (from tile to tile, with a target and
`moveTo`), only slower, and they choose their own way.

A purely random choice at every tile looks silly: the enemy shakes back and forth on the spot. The classic fix is: at each
tile, list the ways it can go, **leave out going back**, and pick one of the rest at random. It only turns round at a dead
end, when going back is the only option. That makes enemies stroll along corridors like they have somewhere to be.

Because `walkable` says no to bombs, enemies walk around bombs too, and a bomb can trap one in a corridor. That is a real
tactic in the game.

Enemies die in flames, and touching one costs a life. "Touching" is measured between the true positions, not the tiles: less
than 0.6 of a tile apart. When the last enemy is gone, you win.

# --explanation-tr--

**Bu adımda:** öbür üç köşeye kırmızı düşmanlar gelecek. Koridorlarda kendi başlarına dolaşacaklar; alevde ölecekler,
sana değerlerse bir can gidecek. Hepsini yok edince ortada `All enemies gone!` (bütün düşmanlar gitti) yazacak.

**Oyuncu gibi yürüyen düşman.** Düşmanlar tam oyuncu gibi hareket eder: kareden kareye, bir hedef ve 2. adımdaki
`moveTo` ile; yalnızca daha yavaştır (`ENEMY_SPEED = 0.05`) ve yollarını kendileri seçer. Her biri bir nesnedir:
`{ x, y, target: null, dir: [0, 0] }`. `dir` son gittiği yöndür.

Başlangıç köşelerinden düşman listesi kurarken `map`'e gelen her köşeyi `([r, c])` ile açarız; `x` sütun, `y` satır
olduğu için `{ x: c, y: r, ... }` yazarız.

**Yol seçmek.** Her karede tamamen rastgele seçim aptalca görünür: düşman yerinde ileri geri titrer. Klasik çözüm: her
karede gidebileceği yolları listele, **geri dönmeyi dışarıda bırak** ve kalanlardan birini rastgele seç. Yalnızca çıkmaz
sokakta, geri dönmek tek seçenekken geri döner. Böylece düşmanlar gidecek bir yerleri varmış gibi koridor boyunca yürür.

```js
const options = Object.values(DIRS).filter(([dr, dc]) => walkable(e.y + dr, e.x + dc))
```

Dört yönden yürünebilir olanlar (3. adımdaki `Object.values(DIRS)`). Hiç yoksa (`options.length === 0`) düşman durur.

```js
const forward = options.filter(([dr, dc]) => dr !== -e.dir[0] || dc !== -e.dir[1])
```

Bir yönün **tersi**, iki sayısının eksilisidir: sağın `[0, 1]` tersi sol `[0, -1]`. `-e.dir[0]` "son yönün satır
farkının eksilisi" demektir. Bu satır "son yönün tersi olmayan yönler"i tutar (iki sayıdan biri farklıysa ters değildir;
`||` "veya").

```js
const pick = forward.length ? forward : options
```

`if` ya da `? :` içinde bir sayı doğru/yanlış gibi okunur: `0` yanlış, diğerleri doğru. Yani "ileri yol varsa onlardan,
yoksa (çıkmaz sokak) hepsinden seç". Sonra `Math.floor(Math.random() * pick.length)` ile rastgele bir sıra numarası
alırız (`Math.random()` 0 ile 1 arası rastgele sayı, `Math.floor` aşağı yuvarlar).

**Bombalar tuzaktır.** `walkable` bombalara hayır dediği için düşmanlar bombaların da etrafından dolaşır ve bir bomba
birini koridorda kapana kıstırabilir. Bu oyunda gerçek bir taktiktir.

**Ölmek ve dokunmak.** Düşmanlar alevde ölür: `enemies.filter((e) => !inFlames(e))` alevde olmayanları tutar. Birine
dokunmak can kaybettirir. "Dokunmak" kareler arasında değil, gerçek konumlar arasında ölçülür: `Math.hypot(dx, dy)` iki
nokta arasındaki dümdüz uzaklıktır (Pisagor); 0.6 kareden yakınsa dokunmuşsundur. Son düşman gidince kazanırsın:
`state = 'won'`.

# --task--

1. Add `ENEMY_SPEED = 0.05` and `enemies`: one `{ x, y, target: null, dir: [0, 0] }` for each of `ENEMY_STARTS` in `reset()`.
2. Write `updateEnemy(e)`: with no target, list the walkable directions; if there are none, stop. Otherwise pick at random
   among those that are not the reverse of `e.dir` (or among all of them if that leaves none), store it in `e.dir` and make
   the next tile the target. Then `moveTo(e, ENEMY_SPEED)`.
3. In `update()`: update every enemy, remove the enemies in flames, hurt the player if it touches one (distance below `0.6`)
   as well as in flames, and set `state = 'won'` when no enemies are left.
4. Draw each enemy as a `'#e11d48'` circle of radius 12. The end message says `All enemies gone!` when won.

# --task-tr--

1. `const SPEED = 0.1 ...` satırının altına ekle:

   ```js
   const ENEMY_SPEED = 0.05
   ```

2. `let player ...` satırının altına `let enemies` ekle ve `state` satırının yorumunu güncelle:

   ```js
   let enemies
   ```

   ```js
   let state // 'playing', 'won' or 'lost'
   ```

3. `reset()` içinde `player = { x: 1, y: 1, target: null }` satırının altına ekle:

   ```js
     enemies = ENEMY_STARTS.map(([r, c]) => ({ x: c, y: r, target: null, dir: [0, 0] }))
   ```

4. `inFlames`'in altına, `hurt()`'ün üstüne düşmanın yürüyüşünü ekle:

   ```js
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
   ```

5. `update()`'i şöyle yap:

   ```js
   function update() {
     if (state !== 'playing') return
     updatePlayer()
     for (const e of enemies) updateEnemy(e) // ← yeni
     for (const b of bombs) b.fuse -= 1
     for (const bomb of bombs.filter((b) => b.fuse <= 0)) explode(bomb)
     for (const f of flames) f.time -= 1
     flames = flames.filter((f) => f.time > 0)
     enemies = enemies.filter((e) => !inFlames(e)) // ← yeni
     if (safe > 0) safe -= 1
     else if (inFlames(player) || enemies.some((e) => Math.hypot(e.x - player.x, e.y - player.y) < 0.6)) hurt() // ← değişti
     if (state === 'playing' && enemies.length === 0) state = 'won' // ← yeni
   }
   ```

6. `draw()` içinde oyuncuyu çizen satırın **üstüne** düşmanları çiz:

   ```js
     for (const e of enemies) drawCircle(e, '#e11d48', 12)
   ```

7. Aynı fonksiyonda `Game over` yazan satırı değiştir:

   ```js
       ctx.fillText(state === 'won' ? 'All enemies gone!' : 'Game over', canvas.width / 2, 190) // ← değişti
   ```

8. **Çalıştır**'a bas. Öbür üç köşede kırmızı toplar belirip koridorlarda dolaşmalı. Oynamak için önce oyuna tıkla. Bir
   düşmanı alevle yakınca kaybolmalı; birine değersen bir kalp gitmeli. Hepsi gidince `All enemies gone!` çıkmalı.
   Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

Enemies should start in the corners and wander without walking into walls or crates.
tr: Düşmanlar köşelerde başlamalı ve duvarlara ya da sandıklara girmeden dolaşmalı.

```js
assert.lengthOf(enemies, 3)
assert.sameDeepMembers(enemies.map((e) => [e.y, e.x]), ENEMY_STARTS)
const seen = new Set()
for (let i = 0; i < 600; i++) {
  $.tick(1)
  for (const e of enemies) {
    const t = tileOf(e)
    assert.notStrictEqual(grid[t.r][t.c], '#', 'enemies never go into walls')
    assert.notStrictEqual(grid[t.r][t.c], '+', 'or crates')
    seen.add(t.r + ',' + t.c)
  }
  safe = 10
}
assert.isAbove(seen.size, 6, 'enemies wander')
```

Flames should kill enemies, and touching an enemy should hurt.
tr: Alevler düşmanları öldürmeli ve bir düşmana dokunmak zarar vermeli.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
enemies = [{ x: 5, y: 1, target: null, dir: [0, 0] }, { x: 9, y: 9, target: null, dir: [0, 0] }]
flames.push({ r: 1, c: 5, time: 30 })
$.tick(1)
assert.lengthOf(enemies, 1, 'flames kill enemies')
enemies[0].x = 1.3
enemies[0].y = 1
enemies[0].target = null
$.tick(1)
assert.strictEqual(lives, 2, 'touching an enemy hurts')
```

The last enemy gone should win the game.
tr: Son düşmanın gitmesi oyunu kazandırmalı.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
enemies = [{ x: 5, y: 1, target: null, dir: [0, 0] }]
flames.push({ r: 1, c: 5, time: 30 })
$.tick(1)
assert.strictEqual(state, 'won')
$.tick(1)
assert.include($.texts(), 'All enemies gone!')
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

const near = (r, c, spots) => spots.some(([sr, sc]) => Math.abs(sr - r) + Math.abs(sc - c) <= 1)

// Walls all round, a pillar on every even row and column, and crates on about half of the rest,
// but never next to where the player and the enemies start.
function makeGrid() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
      else if (near(r, c, [[1, 1], ...ENEMY_STARTS]) || Math.random() > 0.55) grid[r].push(' ')
      else grid[r].push('+')
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
  ctx.fillText('♥'.repeat(lives), 8, 22)
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
