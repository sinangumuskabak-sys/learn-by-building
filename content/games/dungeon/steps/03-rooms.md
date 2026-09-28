---
title: From room to room
title_tr: Odadan odaya
skills: [game.state]
---

# --explanation--

The gaps in the outer walls lead to the neighbouring rooms. Walking out of a room works like this:

1. Outside the room is no longer a wall, so the player can walk out through a gap.
2. As soon as the middle of the player leaves the room, find the neighbour in that direction (one room left, right, up or
   down in `ROOMS`) and **enter** it.
3. Move the player to the opposite side, so walking out on the right puts you at the left edge of the next room, in the gap
   that matches.

```js
if (cx > COLS * T) {       // left through the right side...
  player.x -= COLS * T - 4 // ...so appear at the left side of the next room
  enter(room.rx + 1, room.ry)
}
```

`enter(rx, ry)` loads that room's tiles. The gaps of neighbouring rooms line up (the right gap of the first room is in the
same row as the left gap of the second), which is what makes the rooms feel like one building. Designing levels as data makes
this kind of rule easy to check: you can see it in the text.

# --explanation-tr--

**Bu adımda:** duvarlardaki boşluklardan geçip öteki odalara gidebileceksin. Sağdaki boşluktan çıkınca yan odanın
sol kenarında, alttaki boşluktan çıkınca alt odanın üst kenarında belireceksin.

**Odadan çıkmak üç adımdır:**

1. Odanın dışı artık duvar sayılmaz; oyuncu boşluktan dışarı yürüyebilir.
2. Oyuncunun **ortası** odanın dışına çıktığı an, o yöndeki komşu odayı buluruz (`ROOMS`'ta bir sola, sağa, yukarı ya
   da aşağı) ve oraya **gireriz**.
3. Oyuncuyu karşı tarafa taşırız: sağdan çıkan, yeni odanın sol kenarında, aynı hizadaki boşlukta belirir.

```js
if (cx > COLS * T) {        // sağ taraftan çıktı...
  player.x -= COLS * T - 4  // ...öyleyse yeni odanın sol tarafında belirsin
}
```

`COLS * T` odanın piksel olarak enidir (15 × 32 = 480). Oyuncuyu bu kadar (4 piksel eksiğiyle) geri çekersek karşı
kenara geçer. Dikeyde aynısını `ROWS * T` ile yaparız.

**Hangi odadayız?** Bunu `room = { rx, ry }` nesnesinde tutarız: `rx` sütun (0 sol, 1 sağ), `ry` satır (0 üst, 1 alt).
1. adımda gördüğün gibi oda `ROOMS[ry][rx]` ile bulunur. `enter(rx, ry)` fonksiyonu hem odayı hatırlar hem de o odanın
karolarını yükler. Yüklerken `P` ve `e` harflerini zemine çeviririz (düşmanlar ileride ayrıca eklenecek).

**Harita veri olunca kontrol kolay.** Komşu odaların boşlukları aynı hizadadır: ilk odanın sağ boşluğu, ikinci odanın
sol boşluğuyla aynı satırda. Odaları tek bir bina gibi hissettiren budur ve haritalar yazı olduğu için bunu gözle görebilirsin.

**Yeni küçük şeyler:**

- `&&` "ve" demektir. `row >= 0 && row < ROWS && ...` → "satır odanın içinde **ve** sütun odanın içinde **ve** karo duvar".
  2. adımda "dışarısı da duvar" diyordu (`||` ile); şimdi "sadece içerideki duvarlar" diyor.
- `cx < 0 ? -1 : cx > COLS * T ? 1 : 0` → iki soru arka arkaya: "solda mı? öyleyse -1; değilse sağda mı? öyleyse 1;
  hiçbiri değilse 0". Bu sayıyı odanın numarasına ekleyince komşu oda bulunur.
- `return` `update`'i orada bitirir: yeni odaya girdiğimiz karede başka iş yapmayız.

# --task--

1. Add `room` and write `enter(rx, ry)`: remember the room and load its tiles (`P` and `e` become floor). `reset()` enters room
   `(0, 0)`.
2. In `blocked()`, tiles outside the room no longer count as walls.
3. After moving, if the middle of the player (`x + SIZE / 2`, `y + SIZE / 2`) is outside the room, work out the neighbouring
   room in that direction, move the player by `COLS * T - 4` (or `ROWS * T - 4`) to the other side, and enter the new room.

# --task-tr--

1. `let tiles ...` satırının altına oda bilgisini ekle:

   ```js
   let room // { rx, ry }: which room we are in
   ```

2. `reset()` içindeki `tiles = ROOMS[0][0].map(...)` satırını sil ve yerine şunu yaz:

   ```js
   function reset() {
     const start = findIn(ROOMS[0][0], 'P')
     player = { x: start.col * T + (T - SIZE) / 2, y: start.row * T + (T - SIZE) / 2, dir: [0, 1] }
     enter(0, 0) // ← değişti
   }
   ```

3. `findIn` fonksiyonunun kapanış `}`'sinden sonra, `const solidTile = ...` satırının **üstüne** `enter` fonksiyonunu yaz:

   ```js
   // Load a room: its tiles.
   function enter(rx, ry) {
     room = { rx, ry }
     tiles = ROOMS[ry][rx].map((line) => [...line].map((ch) => (ch === 'P' || ch === 'e' ? '.' : ch)))
   }
   ```

4. `blocked()` içinde yorumu ve `if` satırını değiştir:

   ```js
   // Does a box at (x, y) overlap a wall? Outside the room counts as open, so the player can walk out of a gap. // ← değişti
   function blocked(x, y) {
     for (const [cx, cy] of [[x, y], [x + SIZE - 1, y], [x, y + SIZE - 1], [x + SIZE - 1, y + SIZE - 1]]) {
       const row = Math.floor(cy / T)
       const col = Math.floor(cx / T)
       if (row >= 0 && row < ROWS && col >= 0 && col < COLS && solidTile(tiles[row][col])) return true // ← değişti
     }
     return false
   }
   ```

5. `update()` fonksiyonunda, `if (dir) { ... }` bloğunun kapanış `}`'sinden sonra, fonksiyonun son `}`'sinden **önce**
   odadan çıkma kısmını ekle:

   ```js
   function update() {
     let dir = padDir
     for (const key in DIRS) if (held[key]) dir = DIRS[key]
     if (dir) {
       player.dir = dir
       move(player, dir[0] * SPEED, dir[1] * SPEED)
     }

     // Walking out through a gap in the wall: into the next room, on the opposite side. // ← yeni (buradan)
     const cx = player.x + SIZE / 2
     const cy = player.y + SIZE / 2
     if (cx < 0 || cx > COLS * T || cy < 0 || cy > ROWS * T) {
       const rx = room.rx + (cx < 0 ? -1 : cx > COLS * T ? 1 : 0)
       const ry = room.ry + (cy < 0 ? -1 : cy > ROWS * T ? 1 : 0)
       if (cx < 0) player.x += COLS * T - 4
       if (cx > COLS * T) player.x -= COLS * T - 4
       if (cy < 0) player.y += ROWS * T - 4
       if (cy > ROWS * T) player.y -= ROWS * T - 4
       enter(rx, ry)
       return
     } // ← (buraya kadar)
   }
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. İlk odanın sağ duvarındaki boşluktan çık: yan odaya geçmelisin.
   Geri dön, sonra alt duvardaki boşluktan aşağı in. Alttaki kontrollerin hepsi yeşil olmalı. Boşluktan çıkamıyorsan
   `blocked`'daki `if` satırında `&&` ve `>=`/`<` işaretlerini kontrol et.

# --tests--

Walking out through the right gap should lead into the next room, on its left side.
tr: Sağ boşluktan çıkmak sonraki odaya, sol tarafına çıkarmalı.

```js
player.x = 14 * T + 5
player.y = 5 * T + 5
$.press('ArrowRight')
$.tick(7)
assert.deepEqual(room, { rx: 1, ry: 0 })
assert.isBelow(player.x, 0)
assert.deepEqual(tiles[10].join(''), '#######D#######', 'the tiles of the second room')
$.release('ArrowRight')
$.press('ArrowLeft')
$.tick(4)
assert.deepEqual(room, { rx: 0, ry: 0 }, 'and back')
```

Walking down through the bottom gap should lead into the room below.
tr: Alt boşluktan aşağı yürümek alttaki odaya götürmeli.

```js
player.x = 7 * T + 5
player.y = 10 * T + 5
$.press('ArrowDown')
$.tick(8)
assert.deepEqual(room, { rx: 0, ry: 1 })
assert.isBelow(player.y, 10)
assert.strictEqual(tiles[5][6], 'k')
```

# --solution--

```js
// Dungeon adventure, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const T = 32 // one tile
const TOP = 48 // room for hearts, keys and the timer
const SIZE = 22 // the player's body
const SPEED = 2.5
// Four rooms, in a 2 by 2 grid. # wall, D locked door, k key, h heart, e enemy, E the stairs out, P the start.
// A gap in the wall at the edge of a room leads to the room next to it.
const ROOMS = [
  [
    [
      '###############',
      '#.............#',
      '#..P..........#',
      '#....###......#',
      '#....#.....e..#',
      '#....#.........',
      '#.............#',
      '#..........h..#',
      '#.............#',
      '#.............#',
      '#######.#######',
    ],
    [
      '###############',
      '#.............#',
      '#..e......e...#',
      '#....#####....#',
      '#.............#',
      '..............#',
      '#.............#',
      '#...##...##...#',
      '#.......e.....#',
      '#.............#',
      '#######D#######',
    ],
  ],
  [
    [
      '#######.#######',
      '#.............#',
      '#..e..........#',
      '#...#######...#',
      '#.............#',
      '#.....k.......#',
      '#.............#',
      '#...#######...#',
      '#..........e..#',
      '#.............#',
      '###############',
    ],
    [
      '#######.#######',
      '#.............#',
      '#.e.........e.#',
      '#.............#',
      '#....#####....#',
      '#....#.E.#....#',
      '#....#...#....#',
      '#.............#',
      '#......e......#',
      '#.............#',
      '###############',
    ],
  ],
]
const COLS = 15
const ROWS = 11
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }

let tiles // the current room
let room // { rx, ry }: which room we are in
let player
const held = {}

function reset() {
  const start = findIn(ROOMS[0][0], 'P')
  player = { x: start.col * T + (T - SIZE) / 2, y: start.row * T + (T - SIZE) / 2, dir: [0, 1] }
  enter(0, 0)
}

function findIn(lines, ch) {
  const row = lines.findIndex((line) => line.includes(ch))
  return { row, col: lines[row].indexOf(ch) }
}

// Load a room: its tiles.
function enter(rx, ry) {
  room = { rx, ry }
  tiles = ROOMS[ry][rx].map((line) => [...line].map((ch) => (ch === 'P' || ch === 'e' ? '.' : ch)))
}

const solidTile = (ch) => ch === '#' || ch === 'D'

// Does a box at (x, y) overlap a wall? Outside the room counts as open, so the player can walk out of a gap.
function blocked(x, y) {
  for (const [cx, cy] of [[x, y], [x + SIZE - 1, y], [x, y + SIZE - 1], [x + SIZE - 1, y + SIZE - 1]]) {
    const row = Math.floor(cy / T)
    const col = Math.floor(cx / T)
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS && solidTile(tiles[row][col])) return true
  }
  return false
}

// Move a body, one axis at a time, stopping at walls.
function move(body, dx, dy) {
  if (!blocked(body.x + dx, body.y)) body.x += dx
  if (!blocked(body.x, body.y + dy)) body.y += dy
}

document.addEventListener('keydown', (event) => {
  held[event.key] = true
  if (DIRS[event.key]) event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  held[event.key] = false
})

// Touch: the pad in the corner moves.
const PAD = { x: 70, y: 330, r: 60 }
let padDir = null
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const dx = x - PAD.x
  const dy = y - PAD.y
  if (Math.hypot(dx, dy) < PAD.r) padDir = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]
})
canvas.addEventListener('pointerup', () => {
  padDir = null
})

function update() {
  let dir = padDir
  for (const key in DIRS) if (held[key]) dir = DIRS[key]
  if (dir) {
    player.dir = dir
    move(player, dir[0] * SPEED, dir[1] * SPEED)
  }

  // Walking out through a gap in the wall: into the next room, on the opposite side.
  const cx = player.x + SIZE / 2
  const cy = player.y + SIZE / 2
  if (cx < 0 || cx > COLS * T || cy < 0 || cy > ROWS * T) {
    const rx = room.rx + (cx < 0 ? -1 : cx > COLS * T ? 1 : 0)
    const ry = room.ry + (cy < 0 ? -1 : cy > ROWS * T ? 1 : 0)
    if (cx < 0) player.x += COLS * T - 4
    if (cx > COLS * T) player.x -= COLS * T - 4
    if (cy < 0) player.y += ROWS * T - 4
    if (cy > ROWS * T) player.y -= ROWS * T - 4
    enter(rx, ry)
    return
  }
}

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(0, TOP)
  tiles.forEach((line, row) => {
    line.forEach((ch, col) => {
      const x = col * T
      const y = row * T
      ctx.fillStyle = ch === '#' ? '#57534e' : '#d6c7a1'
      ctx.fillRect(x, y, T, T)
      if (ch === 'D') {
        ctx.fillStyle = '#92400e'
        ctx.fillRect(x + 2, y + 2, T - 4, T - 4)
      }
    })
  })

  ctx.fillStyle = '#16a34a'
  ctx.fillRect(player.x, player.y, SIZE, SIZE)
  ctx.restore()

  // The touch pad, faint, in the corner.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(PAD.x, PAD.y, PAD.r, 0, Math.PI * 2)
  ctx.stroke()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
