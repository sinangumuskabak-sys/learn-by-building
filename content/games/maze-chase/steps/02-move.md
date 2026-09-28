---
title: Gliding from tile to tile
title_tr: Döşemeden döşemeye kaymak
skills: [game.input, game.state]
---

# --explanation--

The player moves on the grid, but it should **glide**, not jump. So besides its tile (`col`, `row`) and direction
`dir`, it has a `progress`: how many frames of the current step have passed. Crossing a tile takes `PLAYER_FRAMES = 8`
frames, and the player is drawn part of the way there:

```js
x = col + dir[0] * progress / frames
```

When `progress` reaches `frames`, the player **arrives**: `col`/`row` move one tile and `progress` starts again at `0`.

Directions are only decided at the **center of a tile** (`progress === 0`). That is what keeps everything lined up with
the corridors. The arrow key does not change the direction directly; it sets `want`, the direction the player would
like. At the next tile center: if `want` is open, turn; otherwise keep going if possible, or stop at the wall. Because
`want` is remembered, you can press "up" a little **before** a corner and the turn happens exactly at the corner. This
is called input buffering, and it is a big part of why maze games feel responsive.

Row 9 has open ends: a **tunnel**. Wrapping the column with `(col + COLS) % COLS` makes the left end lead to the right
end.

# --explanation-tr--

**Bu adımda:** oyuncuyu oklarla yürüteceğiz. Oyuncu kareden kareye zıplamayacak, **kayarak** gidecek; köşeden biraz
önce bastığın dönüş tam köşede olacak, duvara gelince duracak. Ortadaki satırın iki ucu açık bir **tünel**: soldan
çıkarsan sağdan girersin.

**Yön nasıl tutulur?** Bir yönü iki sayılık küçük bir diziyle tutarız: `[dx, dy]`. `[1, 0]` sağa (sütun +1), `[-1, 0]`
sola, `[0, -1]` yukarı (satır −1, çünkü `y` aşağı doğru büyür), `[0, 1]` aşağı. `STOP = [0, 0]` durmak demek.
`dir[0]` birinci sayı, `dir[1]` ikinci sayıdır. Hangi ok tuşunun hangi yön olduğunu bir **nesnede** tutarız:

```js
const DIRECTIONS = { ArrowUp: [0, -1], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowRight: [1, 0] }
DIRECTIONS['ArrowUp']   // [0, -1]
```

Köşeli parantezle, adı bir değişkende olan bilgiye ulaşırız: `DIRECTIONS[event.key]`. Ok tuşu değilse sonuç
`undefined` (yok) olur ve `if (dir)` tutmaz.

**Kayarak yürümek.** Oyuncunun karesi (`col`, `row`) ve yönü (`dir`) yanında bir de `progress`'i var: şu anki adımın
kaçıncı karesindeyiz (kare = ekranın bir kez çizilmesi). Bir kareyi geçmek `PLAYER_FRAMES = 8` kare sürer; oyuncu yolun
o kadarında çizilir:

```js
x = col + dir[0] * progress / frames
```

Örnek: `col` 9, sola gidiyor (`dir[0]` = −1), `progress` 4 → `x = 9 - 4/8 = 8.5`, iki karenin tam ortası. `progress`
8'e ulaşınca oyuncu **varır**: `col`/`row` bir kare ilerler, `progress` yeniden 0 olur.

**Yön yalnız karenin ortasında seçilir** (`progress === 0`). Her şeyin koridorlarla hizalı kalmasını bu sağlar. Ok
tuşu yönü doğrudan değiştirmez; `want`'ı (oyuncunun **istediği** yönü) ayarlar. Bir sonraki kare ortasında: istenen
yön açıksa dönülür; değilse mümkünse düz devam edilir, duvar varsa durulur. `want` hatırlandığı için "yukarı"ya köşeden
biraz **önce** basabilirsin; dönüş tam köşede olur. Buna girdi tamponlama (input buffering) denir ve labirent oyunlarını
akıcı hissettiren şeylerin büyük kısmıdır.

**Tünel.** 9. satırın uçları açık. `(col + COLS) % COLS` sütunu sarar: `%` bölümden kalanı verir. `-1` → `(−1 + 19) %
19` = 18 (en sağ), `19` → `38 % 19` = 0 (en sol). Önce `COLS` eklememizin sebebi, JavaScript'te eksi sayının kalanının
eksi çıkmasıdır.

**Yeni araçlar:**

- `return ch === '#' || ch === '-'` → `||` "veya": duvar **ya da** hayalet evi ise `true`. `return` sonucu geri verir.
- `!isWall(...)` → `!` "değil": duvar değilse.
- `a[0] === b[0] && a[1] === b[1]` → `&&` "ve": iki sayı da eşitse aynı yön. Dizileri doğrudan `===` ile
  karşılaştıramayız, bu yüzden `same` fonksiyonunu yazarız.
- `advance(e, choose)` → ikinci parametre bir **fonksiyon**: "kare ortasında yönü şununla seç". Böylece aynı `advance`
  sonra hayaletler için de kullanılabilir. `e` "hareket eden şey" (oyuncu ya da hayalet).
- `document.addEventListener('keydown', (event) => { ... })` → "bir tuşa basılınca şu işi yap"; `event.key` tuşun adı.
  `event.preventDefault()` tarayıcının oklarla sayfayı kaydırmasını engeller.
- `else if` → "değilse, şu mu?".

# --task--

1. Add `DIRECTIONS` (arrow key to `[dx, dy]`, in the order up, left, down, right), `STOP = [0, 0]` and
   `PLAYER_FRAMES = 8`. The player gets `dir: STOP`, `want: STOP`, `progress: 0` and `frames: PLAYER_FRAMES`.
2. Write `wrap(col)`, `isWall(col, row)` (a `#` or `-`, using the wrapped column), `canGo(e, dir)` and `same(a, b)` for
   comparing directions.
3. Write `position(e)` (see above) and `advance(e, choose)`: at `progress === 0` call `choose(e)`; if the direction is not
   `STOP`, add 1 to `progress`, and when it reaches `e.frames`, set it to `0` and move `col` (wrapped) and `row` one step.
4. Write `choosePlayer(p)`: turn to `want` if it is not `STOP` and open; otherwise stop if the current direction is
   blocked. On an arrow key, `preventDefault()` and set `player.want`. Every frame, `advance(player, choosePlayer)` and draw
   the player at its `position`.

# --task-tr--

1. `const COLS = MAZE[0].length` satırının altındaki `// Checked in this order...` yorumunun hemen altına yön
   ayarlarını ekle:

   ```js
   const DIRECTIONS = { ArrowUp: [0, -1], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowRight: [1, 0] }
   const STOP = [0, 0]
   const PLAYER_FRAMES = 8 // frames the player needs to cross one tile
   ```

2. `const key = ...` satırının hemen altına dört yardımcı ekle:

   ```js
   const wrap = (col) => (col + COLS) % COLS

   function isWall(col, row) {
     const ch = MAZE[row][wrap(col)]
     return ch === '#' || ch === '-'
   }

   function canGo(e, dir) {
     return !isWall(e.col + dir[0], e.row + dir[1])
   }

   const same = (a, b) => a[0] === b[0] && a[1] === b[1]
   ```

   `canGo` → "bu yönde bir sonraki kare duvar değil mi?".

3. `placeActors` içindeki `player = ...` satırına yeni bilgileri ekle:

   ```js
     player = { col: MAZE[row].indexOf('P'), row, dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES } // ← değişti
   ```

4. `reset` fonksiyonunun kapanış `}`'inden sonra, `function draw()`'dan önce hareket kodunu yaz:

   ```js
   // Where an actor is drawn: its tile plus how far it has come towards the next one.
   function position(e) {
     return { x: e.col + (e.dir[0] * e.progress) / e.frames, y: e.row + (e.dir[1] * e.progress) / e.frames }
   }

   // One frame of movement. Directions are only chosen at the center of a tile, by `choose`.
   function advance(e, choose) {
     if (e.progress === 0) choose(e)
     if (same(e.dir, STOP)) return
     e.progress += 1
     if (e.progress < e.frames) return
     e.progress = 0
     e.col = wrap(e.col + e.dir[0])
     e.row += e.dir[1]
   }

   function choosePlayer(p) {
     // The wanted direction is remembered, so a turn pressed early happens at the next corner.
     if (!same(p.want, STOP) && canGo(p, p.want)) p.dir = p.want
     else if (!canGo(p, p.dir)) p.dir = STOP
   }

   function steer(dir) {
     player.want = dir
   }

   document.addEventListener('keydown', (event) => {
     const dir = DIRECTIONS[event.key]
     if (dir) {
       event.preventDefault()
       steer(dir)
     }
   })

   function update() {
     advance(player, choosePlayer)
   }
   ```

   `+=` "üstüne ekle" demektir. `advance`'te `progress` henüz `frames`'e ulaşmadıysa `return` ile çıkılır; ulaştıysa
   oyuncu bir kare ilerler.

5. `draw()`'un sonunda oyuncuyu çizen satırları, oyuncuyu `position`'daki (kayan) yerine çizecek şekilde değiştir:

   ```js
     const p = position(player)                                           // ← yeni
     ctx.fillStyle = '#facc15'
     ctx.beginPath()
     ctx.arc(p.x * TILE + TILE / 2, TOP + p.y * TILE + TILE / 2, 10, 0, Math.PI * 2) // ← değişti
     ctx.fill()
   }
   ```

6. `loop` fonksiyonunda `draw()`'dan önce `update()` çağır:

   ```js
   function loop() {
     update() // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

7. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla ve oklarla oyuncuyu yürüt: kayarak ilerlemeli, köşeden önce
   bastığın dönüş köşede olmalı, duvarda durmalı; 9. satırdaki tünelden geçince öbür yandan çıkmalı (yemler henüz
   yenmez). Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `DIRECTIONS` içindeki eksi işaretlerine ve
   `position`'daki parantezlere bak.

# --tests--

The player should glide one tile in eight frames.
tr: Oyuncu sekiz karede bir döşeme kaymalı.

```js
$.press('ArrowLeft')
$.tick(4)
assert.strictEqual(player.col, 9)
assert.deepEqual(position(player), { x: 8.5, y: 15 })
const me = $.arcs().filter((a) => a.color === '#facc15')[0]
assert.deepEqual([me.x, me.y], [216, 412])
$.tick(4)
assert.strictEqual(player.col, 8)
assert.strictEqual(player.progress, 0)
```

A turn pressed before a corner should happen at the corner.
tr: Köşeden önce basılan dönüş köşede olmalı.

```js
$.press('ArrowLeft')
$.tick(4)
$.press('ArrowUp') // there is a wall above (9, 15), but not above (8, 15)
$.tick(4)
assert.deepEqual([player.col, player.row], [8, 15])
$.tick(8)
assert.deepEqual([player.col, player.row], [8, 14])
assert.deepEqual(player.dir, [0, -1])
```

The player should stop at a wall.
tr: Oyuncu bir duvarda durmalı.

```js
$.press('ArrowRight')
$.tick(80)
assert.deepEqual([player.col, player.row], [14, 15])
assert.deepEqual(player.dir, [0, 0])
$.press('ArrowRight') // still a wall: nothing happens
$.tick(8)
assert.deepEqual([player.col, player.row], [14, 15])
```

The tunnel should lead from one side to the other.
tr: Tünel bir taraftan öbür tarafa çıkarmalı.

```js
assert.isFalse(isWall(-1, 9))
assert.isTrue(isWall(0, 0))
assert.isTrue(isWall(9, 8), 'the ghost house is a wall for the player')
player = { col: 1, row: 9, dir: [-1, 0], want: [-1, 0], progress: 0, frames: 8 }
$.tick(16)
assert.deepEqual([player.col, player.row], [18, 9])
```

# --solution--

```js
// Maze chase, step by step.
// The page already has <canvas id="game" width="456" height="544"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 24
const TOP = 40 // room for the score and the lives
// # wall, - the ghost house, . pellet, o power pellet, P player start. Row 9 is a tunnel: its ends are open.
const MAZE = [
  '###################',
  '#........#........#',
  '#o##.###.#.###.##o#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.### # ###.####',
  '   #.#       #.#   ',
  '####.# #---# #.####',
  '    .  #---#  .    ',
  '####.# ##### #.####',
  '   #.#       #.#   ',
  '####.# ##### #.####',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#o.#.....P.....#.o#',
  '##.#.#.#####.#.#.##',
  '#....#...#...#....#',
  '#.######.#.######.#',
  '#.................#',
  '###################',
]
const ROWS = MAZE.length
const COLS = MAZE[0].length
// Checked in this order, so ties go to up, then left, then down.
const DIRECTIONS = { ArrowUp: [0, -1], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowRight: [1, 0] }
const STOP = [0, 0]
const PLAYER_FRAMES = 8 // frames the player needs to cross one tile

let pellets // keys of the tiles that still have a pellet
let powers // keys of the tiles that still have a power pellet
let player

const key = (col, row) => col + ',' + row
const wrap = (col) => (col + COLS) % COLS

function isWall(col, row) {
  const ch = MAZE[row][wrap(col)]
  return ch === '#' || ch === '-'
}

function canGo(e, dir) {
  return !isWall(e.col + dir[0], e.row + dir[1])
}

const same = (a, b) => a[0] === b[0] && a[1] === b[1]

function fillPellets() {
  pellets = new Set()
  powers = new Set()
  MAZE.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch === '.') pellets.add(key(col, row))
      if (ch === 'o') powers.add(key(col, row))
    })
  })
}

function placeActors() {
  const row = MAZE.findIndex((line) => line.includes('P'))
  player = { col: MAZE[row].indexOf('P'), row, dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES }
}

function reset() {
  fillPellets()
  placeActors()
}

// Where an actor is drawn: its tile plus how far it has come towards the next one.
function position(e) {
  return { x: e.col + (e.dir[0] * e.progress) / e.frames, y: e.row + (e.dir[1] * e.progress) / e.frames }
}

// One frame of movement. Directions are only chosen at the center of a tile, by `choose`.
function advance(e, choose) {
  if (e.progress === 0) choose(e)
  if (same(e.dir, STOP)) return
  e.progress += 1
  if (e.progress < e.frames) return
  e.progress = 0
  e.col = wrap(e.col + e.dir[0])
  e.row += e.dir[1]
}

function choosePlayer(p) {
  // The wanted direction is remembered, so a turn pressed early happens at the next corner.
  if (!same(p.want, STOP) && canGo(p, p.want)) p.dir = p.want
  else if (!canGo(p, p.dir)) p.dir = STOP
}

function steer(dir) {
  player.want = dir
}

document.addEventListener('keydown', (event) => {
  const dir = DIRECTIONS[event.key]
  if (dir) {
    event.preventDefault()
    steer(dir)
  }
})

function update() {
  advance(player, choosePlayer)
}

function draw() {
  ctx.fillStyle = '#0b1020'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  MAZE.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch === '#') {
        ctx.fillStyle = '#1d4ed8'
        ctx.fillRect(col * TILE + 2, TOP + row * TILE + 2, TILE - 4, TILE - 4)
      }
      if (ch === '-') {
        ctx.fillStyle = '#312e81'
        ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
      }
    })
  })

  ctx.fillStyle = '#fde68a'
  for (const k of pellets) {
    const [col, row] = k.split(',').map(Number)
    ctx.fillRect(col * TILE + 10, TOP + row * TILE + 10, 4, 4)
  }
  for (const k of powers) {
    const [col, row] = k.split(',').map(Number)
    ctx.beginPath()
    ctx.arc(col * TILE + TILE / 2, TOP + row * TILE + TILE / 2, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  const p = position(player)
  ctx.fillStyle = '#facc15'
  ctx.beginPath()
  ctx.arc(p.x * TILE + TILE / 2, TOP + p.y * TILE + TILE / 2, 10, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
