---
title: Walking from tile to tile
title_tr: Kareden kareye yürümek
skills: [game.input, game.state]
---

# --explanation--

In a grid game the player always stands **on a tile**, but should not jump from tile to tile. The trick is to separate the
decision from the movement:

1. When the player is exactly on a tile, look at the arrow key held and pick the **target**: the next tile that way, if it
   is floor.
2. Then slide towards the target by `SPEED` each frame. When it is closer than one step, snap exactly onto it and drop the
   target.

Positions are in **tiles**, not pixels (`x = 2.5` is halfway between columns 2 and 3), so the rules can talk about rows and
columns, and only drawing multiplies by `TILE`.

Which key wins when two are held? The one pressed **last**, as players expect. We keep the held keys in a list: `keydown`
adds a key at the end, `keyup` removes it, and the last item is the one in charge. Letting go of it gives control back to the
key still held.

Doing the decision and the first bit of movement **in the same frame** matters: if choosing the next tile took a frame of its
own, the player would stutter at every tile.

# --explanation-tr--

**Bu adımda:** arenaya beyaz, yuvarlak bir oyuncu koyacağız. Sol üst köşede duracak; ok tuşlarını basılı tutunca
kareden kareye **kayarak** yürüyecek, duvar ve kasalardan geçemeyecek.

**Nesne (object).** Birkaç bilgiyi adlarıyla tek pakette tutar: `player = { x: 1, y: 1, target: null }`. Süslü parantez
paketi açıp kapatır; `player.x` ile içindeki `x` okunur. `null` "hiçbir şey" demektir: oyuncunun henüz bir hedefi yok.

**Kareler, pikseller değil.** Konumlar **kare** biriminde tutulur (`x = 2.5` 2. ve 3. sütunun tam ortası demektir). `x`
sütun, `y` satırdır. Böylece kurallar satır ve sütunla konuşur; yalnızca çizim `TILE` (32) ile çarpar.

**Karar ve hareket ayrı.** Izgara oyununda oyuncu hep bir kareye **basar**, ama kareden kareye **zıplamamalı**. Hile
kararı hareketten ayırmaktır:

1. Oyuncu tam bir karenin üstündeyken basılı ok tuşuna bak ve **hedefi** seç: o yöndeki sonraki kare, zeminse.
2. Sonra her karede hedefe doğru `SPEED` (0.1 kare) kay. Hedef bir adımdan yakınsa tam üstüne otur ve hedefi bırak.

Kararı ve hareketin ilk parçasını **aynı karede** yapmak önemlidir: sonraki kareyi seçmek kendi başına bir kare sürseydi,
oyuncu her karede takılırdı.

**Yön tablosu.** Her ok tuşunun satıra ve sütuna ne eklediğini bir nesnede tutarız:
`DIRS = { ArrowUp: [-1, 0], ... }`. `DIRS['ArrowUp']` → `[-1, 0]` (bir satır yukarı). Köşeli parantezle, adı bir
değişkende duran alanı okuruz: `DIRS[event.key]`. Tuş ok değilse `undefined` ("yok") gelir.

**`moveTo`: hedefe doğru bir adım.** `Math.sign(dx)` sayının yalnızca **işaretini** verir: pozitifse 1, negatifse -1,
sıfırsa 0. Yani her eksende hedefe doğru tam `speed` kadar adım atılır. `Math.abs` sayının eksisiz hâlidir; iki uzaklık da
bir adımdan küçükse oyuncu hedefe oturtulur, `target = null` yapılır ve `return` ile fonksiyondan çıkılır. `+=` "şu kadar
artır" demektir.

**Hangi tuş kazanır?** İki tuş basılıyken **en son basılan**; oyuncular bunu bekler. Basılı tuşları bir listede
(`held`) tutarız:

- `keydown` (tuşa basıldı) tuşu, listede yoksa sona ekler. `held.includes(k)` "liste k'yi içeriyor mu?" demektir; `!` onu
  tersine çevirir. `event.preventDefault()` tarayıcının ok tuşlarıyla sayfayı kaydırmasını engeller.
- `keyup` (tuş bırakıldı) onu listeden çıkarır: `filter` kurala uyanları tutar, `k !== event.key` "bırakılan tuş olmayan
  herkes" demektir.
- Son eleman yönetir: `held[held.length - 1]`. (`.length` eleman sayısıdır; sayma 0'dan başladığı için son eleman
  `length - 1`'dedir.) Onu bırakınca kontrol hâlâ basılı olan tuşa geçer.

`document.addEventListener('keydown', (event) => { ... })` "bir tuşa basılınca şunu yap" demektir; `event.key` basılan
tuşun adıdır (`'ArrowRight'` gibi).

**Daire çizmek.** `drawCircle` yardımcı fonksiyonu bir daire boyar:

```js
ctx.beginPath()                          // yeni bir şekle başla
ctx.arc(x, y, yaricap, 0, Math.PI * 2)   // merkez, yarıçap, tam tur
ctx.fill()                               // içini boya
```

Merkezi karenin ortasına koymak için `TILE / 2` ekleriz. Döngü artık her karede önce `update()` (hesapla), sonra `draw()`
(boya) yapar.

# --task--

1. Add `SPEED = 0.1`, `DIRS` (each arrow key to `[dr, dc]`), `player` (`{ x: 1, y: 1, target: null }` in `reset()`) and
   `held` (`[]`).
2. Write `walkable(r, c)` (the tile is floor) and `moveTo(m, speed)`: move `m` towards `m.target` by `speed` on each axis
   (`Math.sign`), or, when both distances are within `speed`, put it exactly on the target and set `target = null`.
3. Write `updatePlayer()`: with no target, if the last held key leads to a walkable tile, make it the target; then, with a
   target, `moveTo(player, SPEED)`. Call it from `update()`, before `draw()`.
4. `keydown` of an arrow adds it to `held` if it is not there (`preventDefault()`); `keyup` removes it.
5. Draw the player as a `'#f8fafc'` circle of radius 12 in the middle of its position.

# --task-tr--

1. `const TOP = 32 ...` satırının altına iki ayar ekle:

   ```js
   const SPEED = 0.1 // tiles per frame
   const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
   ```

2. `let grid ...` satırının altına iki değişken ekle:

   ```js
   let player // { x, y, target: null or { r, c } }
   let held // arrow keys being held, the last one pressed at the end
   ```

3. `makeGrid()`'in kapanış `}`'inin altına, `reset`'in üstüne ekle:

   ```js
   const walkable = (r, c) => grid[r][c] === ' '
   ```

4. `reset()`'i şöyle yap:

   ```js
   function reset() {
     makeGrid()
     player = { x: 1, y: 1, target: null } // ← yeni
     held = [] // ← yeni
   }
   ```

5. `reset()`'in altına hareket, güncelleme ve tuş dinleme kodunu ekle:

   ```js
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

   function update() {
     updatePlayer()
   }

   document.addEventListener('keydown', (event) => {
     if (DIRS[event.key]) {
       event.preventDefault()
       if (!held.includes(event.key)) held.push(event.key)
     }
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
   ```

   `updatePlayer`'daki koşul: "hedef yoksa **ve** bir ok basılıysa **ve** o yöndeki kare yürünebilirse, orayı hedef
   yap". `dir[0]` satır farkı, `dir[1]` sütun farkıdır.

6. `draw()`'un sonuna, iki döngünün kapanışından sonra (`}` `}`'nin altına) oyuncuyu çiz:

   ```js
     drawCircle(player, '#f8fafc', 12)
   ```

7. `loop()` içinde `draw()`'dan önce `update()`'i çağır:

   ```js
   function loop() {
     update() // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

8. **Çalıştır**'a bas. Sol üstte beyaz bir top görmelisin. Oynamak için önce oyuna tıkla, sonra ok tuşlarını basılı tut:
   top kareden kareye kaymalı, duvar ve kasalarda durmalı, tuşu bırakınca bir karenin üstünde durmalı. Alttaki
   kontrollerin hepsi yeşil olmalı.

# --tests--

Holding a key should slide the player to the next tile, and it should stop on a tile when let go.
tr: Bir tuşu basılı tutmak oyuncuyu sonraki kareye kaydırmalı ve bırakılınca bir karede durmalı.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
$.press('ArrowRight')
$.tick(5)
assert.closeTo(player.x, 1.5, 1e-9, 'moving smoothly')
assert.strictEqual(player.y, 1)
$.tick(5)
assert.closeTo(player.x, 2, 1e-9)
$.release('ArrowRight')
$.tick(20)
assert.strictEqual(player.x, 2, 'it stops on a tile when the key is let go')
assert.isNull(player.target)
```

Walls should block, and the last key still held should take over.
tr: Duvarlar engellemeli ve hâlâ basılı olan son tuş kontrolü almalı.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
$.press('ArrowUp')
$.tick(20)
assert.deepEqual([player.x, player.y], [1, 1], 'walls block')
$.release('ArrowUp')
$.press('ArrowRight')
$.tick(10)
$.press('ArrowDown')
$.tick(10)
assert.deepEqual([player.x, player.y], [2, 1], 'the pillar below blocks')
$.release('ArrowDown')
$.tick(10)
assert.closeTo(player.x, 3, 1e-9, 'the right key is still held')
```

Crates should block too, and the player should be drawn where it is.
tr: Sandıklar da engellemeli ve oyuncu bulunduğu yerde çizilmeli.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
grid[1][2] = '+'
$.press('ArrowRight')
$.tick(20)
assert.strictEqual(player.x, 1, 'crates block')
$.release('ArrowRight')
player.x = 3
$.tick(1)
assert.deepInclude($.arcs(), { x: 3 * 32 + 16, y: 32 + 32 + 16, r: 12, color: '#f8fafc' })
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
const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor
let player // { x, y, target: null or { r, c } }
let held // arrow keys being held, the last one pressed at the end

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

const walkable = (r, c) => grid[r][c] === ' '

function reset() {
  makeGrid()
  player = { x: 1, y: 1, target: null }
  held = []
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

function update() {
  updatePlayer()
}

document.addEventListener('keydown', (event) => {
  if (DIRS[event.key]) {
    event.preventDefault()
    if (!held.includes(event.key)) held.push(event.key)
  }
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
  drawCircle(player, '#f8fafc', 12)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
