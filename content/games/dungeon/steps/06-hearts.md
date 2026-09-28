---
title: Hearts
title_tr: Kalpler
skills: [game.state]
---

# --explanation--

Now enemies fight back. Touching an enemy costs one of your three **hearts**. Two details make this fair instead of
frustrating:

- After a hit you cannot be hurt again for 60 frames (**invulnerability**), and you blink to show it. Without it, an enemy
  touching you would take all your hearts in three frames.
- You and the enemy **bounce apart**: you are pushed 24 pixels away (through `move()`, so never into a wall) and it is knocked
  back. Otherwise an enemy could stay stuck on top of you.

Hearts can also be found on the floor. Picked-up hearts must **stay** picked up, even after you leave the room and come back,
because `enter()` reloads a room from its text. So the game remembers every tile that was taken, by room and position, in a
`Set` of keys like `'0,0,11,7'`, and `enter()` turns those tiles into floor. Remembering changes to a level on top of the level
data is how games keep a world consistent.

With no hearts left, the game is over.

# --explanation-tr--

**Bu adımda:** düşmanlar da sana zarar verecek. Sol üstte üç kırmızı kalp olacak; bir düşmana değince biri griye
dönecek, sen geri savrulacak ve bir süre yanıp söneceksin. Yerde kırmızı kalpler bulup can toplayabileceksin. Kalbin
bitince `Game over` yazacak.

**Adil olması için iki ayrıntı:**

- Vurulduktan sonra 60 kare (1 saniye) boyunca tekrar yaralanamazsın (**dokunulmazlık**) ve bunu göstermek için yanıp
  sönersin. Bu olmasa, sana değen bir düşman üç karede bütün kalplerini alırdı. Bunu `hurt` sayacıyla tutarız: 4. adımdaki
  `swing` gibi, her karede 1 azalır.
- Sen ve düşman **birbirinizden sekersiniz**: sen 24 piksel geri itilirsin (`move` ile, 4'er piksellik 6 adımda; böylece
  asla duvarın içine girmezsin), düşman da geri itilir. Yoksa bir düşman üstünde yapışıp kalabilirdi.

**Sayaçlı döngü.** Bir işi belirli sayıda tekrarlamak için:

```js
for (let i = 0; i < 6; i++) { ... }
```

"`i` 0'dan başlasın; 6'dan küçük olduğu sürece `{ }` içini yap; her turdan sonra `i`'yi 1 artır (`i++`)." Yani 6 kez.
Kalpleri çizerken de aynısını 3 kez yaparız; `i` 0, 1, 2 olur ve her kalp `12 + i * 26` ile bir öncekinin 26 piksel sağına düşer.

**Alınan kalp alınmış kalmalı.** Sorun şu: `enter()` odayı her seferinde haritanın **yazısından** yeniden kurar. Kalbi alıp
odadan çıkıp geri dönersen kalp yeniden belirirdi. Çözüm: alınan her karoyu hatırlarız. Bunun için bir **Set** (küme)
kullanırız: aynı şeyi iki kez tutmayan bir torba.

```js
taken = new Set()          // boş torba
taken.add('0,0,11,7')      // içine koy
taken.has('0,0,11,7')      // içinde var mı? → true
```

Anahtar, oda ve karo numaralarının virgülle birleştirilmiş hâlidir: `oda-sütun, oda-satır, sütun, satır`. Yazılar ve
sayılar `+` ile yan yana konur: `0 + ',' + 0` → `'0,0'`. `enter()` karoları kurarken torbada olanları zemine çevirir.
Seviye verisinin üstüne "değişiklikleri" ayrıca kaydetmek, oyunların dünyayı tutarlı tutma yoludur.

**Durum (state):** oyunun hâlini bir yazıyla tutarız: `'playing'` (oynanıyor) ya da `'over'` (bitti). Bitince `update` hiçbir
şey yapmaz: `if (state !== 'playing') return` (`!==` "eşit değil mi?"; `return` "burada dur"). Boşluk ya da dokunuş `reset()` ile baştan başlatır.

**Yeni küçük şeyler:**

- `%` bölümden kalandır: `7 % 2` → `1`. `Math.floor(hurt / 5) % 2 === 0` her 5 karede bir doğru/yanlış arasında gidip
  gelir; oyuncuyu sadece doğruyken çizince yanıp söner.
- `Math.sign(player.x - e.x) || 1` → işaret 0 çıkarsa (tam üst üsteyse) 1 kullan. `||` burada "o değilse şu".
- `Math.min(3, hearts + 1)` → kalp 3'ü geçmesin.
- **Yazı çizmek:** `ctx.font = 'bold 28px sans-serif'` yazı tipi, `ctx.textAlign = 'center'` ortalama,
  `ctx.fillText('Game over', x, y)` yazıyı boyar. `'rgba(12, 10, 9, 0.75)'` dörtte üç koyulukta yarı saydam bir renktir;
  oyunun üstüne serilince arkası hafifçe görünür.

# --task--

1. Add `hearts` (3), `hurt` (0), `state` (`'playing'`) and `taken` (a new `Set`) to `reset()`. `update()` only runs while playing
   and counts `hurt` down.
2. An enemy that overlaps the player while `hurt` is 0: one heart less, `hurt = 60`, `'over'` at 0 hearts. Push the player 24
   pixels away from the enemy along the longer axis (6 moves of 4), and knock the enemy back 10 frames at 3 pixels the other way.
3. The tile under the middle of the player: an `h` gives a heart (at most 3), becomes floor and is added to `taken` as
   `'rx,ry,col,row'`. `enter()` turns taken tiles into floor.
4. Draw an `h` as a `'#e11d48'` 14 by 14 square in its tile. The player is not drawn when `hurt > 0` and `Math.floor(hurt / 5)` is
   odd. Draw three 20 by 20 hearts at the top left (`x = 12 + i * 26`, `y = 14`), `'#e11d48'` or `'#44403c'` when lost. When over,
   cover the screen with `'rgba(12, 10, 9, 0.75)'` and show `Game over` and `Press Space to play again`; Space or a tap restarts.

# --task-tr--

1. `let tiles ...` satırının yorumunu güncelle ve altına `taken`'ı ekle; `let swing ...` satırının altına da üç değişken ekle:

   ```js
   let tiles // the current room, as arrays of characters we can change (hearts are picked up)
   let taken // what has been picked up or opened in each room, so it stays that way
   ```

   ```js
   let swing // frames left of the sword swing
   let hearts
   let hurt // frames the player cannot be hurt again
   let state // 'playing' or 'over'
   ```

2. `reset()`'in başını şöyle yap:

   ```js
   function reset() {
     taken = new Set() // ← yeni
     hearts = 3 // ← yeni
     hurt = 0 // ← yeni
     swing = 0
     state = 'playing' // ← yeni
     const start = findIn(ROOMS[0][0], 'P')
   ```

3. `enter()` içinde yorumu ve `tiles = ...` satırını değiştir:

   ```js
   // Load a room: its tiles (minus what was already taken), and fresh enemies on its e tiles.
   function enter(rx, ry) {
     room = { rx, ry }
     tiles = ROOMS[ry][rx].map((line, row) =>
       [...line].map((ch, col) => (taken.has(rx + ',' + ry + ',' + col + ',' + row) ? '.' : ch === 'P' || ch === 'e' ? '.' : ch)),
     )
   ```

   Bir karo torbadaysa zemin, değilse eskisi gibi (`P` ve `e` zemin, geri kalanı kendisi) olur. Altındaki düşman kısmı aynen kalır.

4. `keydown` olayındaki savurma satırını değiştir:

   ```js
     if (event.key === ' ' && !event.repeat) { // ← değişti
       if (state !== 'playing') reset()
       else if (swing === 0) swing = 12
     }
   ```

5. `pointerdown` olayında `const y = ...` satırının altına, `const dx = x - PAD.x` satırının **üstüne** ekle:

   ```js
     if (state !== 'playing') {
       reset()
       return
     }
   ```

6. `update()`'in en başına iki satır ekle:

   ```js
   function update() {
     if (state !== 'playing') return // ← yeni
     if (hurt > 0) hurt -= 1 // ← yeni

     let dir = padDir
   ```

7. `update()`'te odadan çıkma bloğunun kapanış `}`'sinden sonra, `if (swing > 0) swing -= 1` satırının **üstüne** kalp toplamayı ekle:

   ```js
     // Things on the tile under the middle of the player.
     const col = Math.floor(cx / T)
     const row = Math.floor(cy / T)
     const here = tiles[row][col]
     const id = room.rx + ',' + room.ry + ',' + col + ',' + row
     if (here === 'h') {
       hearts = Math.min(3, hearts + 1)
       tiles[row][col] = '.'
       taken.add(id)
     }
   ```

8. `update()`'teki düşman döngüsünde, kılıç vuruşunu yapan `if (sword && ...) { ... }` bloğunun kapanış `}`'sinden sonra
   (döngünün `}`'sinden önce) düşmanın sana değmesini ekle:

   ```js
       if (sword && e.knock === 0 && overlap(sword, box(e))) {
         e.hp -= 1
         e.knock = 10
         e.kx = player.dir[0] * 4
         e.ky = player.dir[1] * 4
       }
       if (e.hp > 0 && hurt === 0 && overlap(box(e), box(player))) { // ← yeni (buradan)
         hearts -= 1
         hurt = 60
         if (hearts === 0) state = 'over'
         // Both bounce apart, so an enemy cannot stay stuck on top of you.
         const ax = Math.sign(player.x - e.x) || 1
         const ay = Math.sign(player.y - e.y)
         const horizontal = Math.abs(player.x - e.x) >= Math.abs(player.y - e.y)
         for (let i = 0; i < 6; i++) move(player, horizontal ? ax * 4 : 0, horizontal ? 0 : ay * 4)
         e.knock = 10
         e.kx = horizontal ? -ax * 3 : 0
         e.ky = horizontal ? 0 : -ay * 3
       } // ← (buraya kadar)
     }
     enemies = enemies.filter((e) => e.hp > 0)
   ```

9. `draw()` içinde üç yer değişiyor. Önce karo döngüsünde, kapıyı çizen `if (ch === 'D') { ... }` bloğunun altına kalbi ekle:

   ```js
         if (ch === 'h') {
           ctx.fillStyle = '#e11d48'
           ctx.fillRect(x + 9, y + 9, 14, 14)
         }
   ```

   Sonra oyuncuyu çizen iki satırı yanıp sönen hâliyle değiştir:

   ```js
     // The player blinks while it cannot be hurt.
     if (hurt === 0 || Math.floor(hurt / 5) % 2 === 0) {
       ctx.fillStyle = '#16a34a'
       ctx.fillRect(player.x, player.y, SIZE, SIZE)
     }
   ```

   Son olarak `ctx.restore()` satırının hemen altına kalp göstergesini, `ctx.stroke()` satırının altına (yani `draw`'un
   son `}`'sinden önce) oyun bitti ekranını ekle:

   ```js
     ctx.restore()

     for (let i = 0; i < 3; i++) {
       ctx.fillStyle = i < hearts ? '#e11d48' : '#44403c'
       ctx.fillRect(12 + i * 26, 14, 20, 20)
     }
   ```

   ```js
     ctx.stroke()

     if (state !== 'playing') {
       ctx.fillStyle = 'rgba(12, 10, 9, 0.75)'
       ctx.fillRect(0, 0, canvas.width, canvas.height)
       ctx.fillStyle = 'white'
       ctx.textAlign = 'center'
       ctx.font = 'bold 28px sans-serif'
       ctx.fillText('Game over', canvas.width / 2, 190)
       ctx.font = '16px sans-serif'
       ctx.fillText('Press Space to play again', canvas.width / 2, 222)
     }
   }
   ```

10. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Sol üstte üç kalp görmelisin; düşmana değince biri griye dönmeli
    ve yanıp sönmelisin. İlk odanın sağ altındaki kırmızı kareye yürüyüp can topla. Alttaki kontrollerin hepsi yeşil
    olmalı. "Alınan kalp" kontrolü kırmızıysa anahtar yazısında virgüllerin ve sıranın (`rx, ry, col, row`) aynı olduğuna bak.

# --tests--

Touching an enemy should cost a heart, push you back and protect you for a while.
tr: Bir düşmana dokunmak bir kalbe mal olmalı, seni geri itmeli ve bir süre korumalı.

```js
const e = enemies[0]
player.x = e.x - 10
player.y = e.y
e.turnIn = 999
$.tick(1)
assert.strictEqual(hearts, 2)
assert.strictEqual(hurt, 60)
assert.isBelow(player.x, e.x - 30, 'pushed away')
assert.strictEqual(e.knock, 10)
player.x = e.x
player.y = e.y
$.tick(1)
assert.strictEqual(hearts, 2, 'no second hit while blinking')
```

The player should blink while it cannot be hurt.
tr: Oyuncu yaralanamazken yanıp sönmeli.

```js
enemies = []
hurt = 6
$.tick(1)
assert.lengthOf($.rects('#16a34a'), 0)
$.tick(1)
assert.lengthOf($.rects('#16a34a'), 1)
assert.deepEqual($.rects('#e11d48').filter((r) => r.w === 20).map((r) => r.x), [12, 38, 64])
```

A picked-up heart should stay picked up.
tr: Alınan bir kalp alınmış kalmalı.

```js
enemies = []
hearts = 1
player.x = 11 * T + 5
player.y = 7 * T + 5
$.tick(1)
assert.strictEqual(hearts, 2)
assert.strictEqual(tiles[7][11], '.')
assert.isTrue(taken.has('0,0,11,7'))
enter(1, 0)
enter(0, 0)
assert.strictEqual(tiles[7][11], '.')
```

With no hearts left the game should end, and Space should start again.
tr: Kalp kalmayınca oyun bitmeli ve Boşluk yeniden başlatmalı.

```js
hearts = 1
const e = enemies[0]
player.x = e.x
player.y = e.y
$.tick(1)
assert.strictEqual(state, 'over')
assert.include($.texts(), 'Game over')
$.press(' ')
assert.deepEqual([state, hearts, room.rx, room.ry], ['playing', 3, 0, 0])
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
const SIZE = 22 // the player's and the enemies' bodies
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

let tiles // the current room, as arrays of characters we can change (hearts are picked up)
let taken // what has been picked up or opened in each room, so it stays that way
let room // { rx, ry }: which room we are in
let player
let enemies
let swing // frames left of the sword swing
let hearts
let hurt // frames the player cannot be hurt again
let state // 'playing' or 'over'
const held = {}

function reset() {
  taken = new Set()
  hearts = 3
  hurt = 0
  swing = 0
  state = 'playing'
  const start = findIn(ROOMS[0][0], 'P')
  player = { x: start.col * T + (T - SIZE) / 2, y: start.row * T + (T - SIZE) / 2, dir: [0, 1] }
  enter(0, 0)
}

function findIn(lines, ch) {
  const row = lines.findIndex((line) => line.includes(ch))
  return { row, col: lines[row].indexOf(ch) }
}

// Load a room: its tiles (minus what was already taken), and fresh enemies on its e tiles.
function enter(rx, ry) {
  room = { rx, ry }
  tiles = ROOMS[ry][rx].map((line, row) =>
    [...line].map((ch, col) => (taken.has(rx + ',' + ry + ',' + col + ',' + row) ? '.' : ch === 'P' || ch === 'e' ? '.' : ch)),
  )
  enemies = []
  ROOMS[ry][rx].forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch !== 'e') return
      const x = col * T + (T - SIZE) / 2
      enemies.push({ x, y: row * T + (T - SIZE) / 2, dir: [1, 0], turnIn: 0, hp: 1, knock: 0, kx: 0, ky: 0 })
    })
  })
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

// Move a body, one axis at a time, stopping at walls. Returns true if it was stopped.
function move(body, dx, dy) {
  let stopped = false
  if (blocked(body.x + dx, body.y)) stopped = true
  else body.x += dx
  if (blocked(body.x, body.y + dy)) stopped = true
  else body.y += dy
  return stopped
}

document.addEventListener('keydown', (event) => {
  held[event.key] = true
  if (DIRS[event.key] || event.key === ' ') event.preventDefault()
  if (event.key === ' ' && !event.repeat) {
    if (state !== 'playing') reset()
    else if (swing === 0) swing = 12
  }
})
document.addEventListener('keyup', (event) => {
  held[event.key] = false
})

// Touch: the pad in the corner moves, a tap anywhere else swings the sword.
const PAD = { x: 70, y: 330, r: 60 }
let padDir = null
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (state !== 'playing') {
    reset()
    return
  }
  const dx = x - PAD.x
  const dy = y - PAD.y
  if (Math.hypot(dx, dy) < PAD.r) padDir = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]
  else if (swing === 0) swing = 12
})
canvas.addEventListener('pointerup', () => {
  padDir = null
})

// The sword: a box from the middle of the player out to 30 pixels in front, so it also hits an enemy right on top of you.
function swordBox() {
  const [dx, dy] = player.dir
  const cx = player.x + SIZE / 2 + dx * 15
  const cy = player.y + SIZE / 2 + dy * 15
  const w = dx ? 30 : 8
  const h = dy ? 30 : 8
  return { x: cx - w / 2, y: cy - h / 2, w, h }
}

const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
const box = (body) => ({ x: body.x, y: body.y, w: SIZE, h: SIZE })

function update() {
  if (state !== 'playing') return
  if (hurt > 0) hurt -= 1

  let dir = padDir
  for (const key in DIRS) if (held[key]) dir = DIRS[key]
  if (dir && swing === 0) {
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

  // Things on the tile under the middle of the player.
  const col = Math.floor(cx / T)
  const row = Math.floor(cy / T)
  const here = tiles[row][col]
  const id = room.rx + ',' + room.ry + ',' + col + ',' + row
  if (here === 'h') {
    hearts = Math.min(3, hearts + 1)
    tiles[row][col] = '.'
    taken.add(id)
  }

  if (swing > 0) swing -= 1
  const sword = swing > 0 ? swordBox() : null

  for (const e of enemies) {
    if (e.knock > 0) {
      // Knocked back: slide away from the sword for a few frames.
      e.knock -= 1
      move(e, e.kx, e.ky)
    } else {
      const ex = e.x + SIZE / 2 - cx
      const ey = e.y + SIZE / 2 - cy
      if (Math.hypot(ex, ey) < 4 * T) {
        // Close: chase the player along the longer axis.
        e.dir = Math.abs(ex) > Math.abs(ey) ? [-Math.sign(ex), 0] : [0, -Math.sign(ey)]
        move(e, e.dir[0] * 1.1, e.dir[1] * 1.1)
      } else {
        // Far: wander, turning at random now and then or when a wall is in the way.
        e.turnIn -= 1
        const stuck = move(e, e.dir[0], e.dir[1])
        if (stuck || e.turnIn <= 0) {
          e.dir = Object.values(DIRS)[Math.floor(Math.random() * 4)]
          e.turnIn = 40 + Math.floor(Math.random() * 60)
        }
      }
    }
    if (sword && e.knock === 0 && overlap(sword, box(e))) {
      e.hp -= 1
      e.knock = 10
      e.kx = player.dir[0] * 4
      e.ky = player.dir[1] * 4
    }
    if (e.hp > 0 && hurt === 0 && overlap(box(e), box(player))) {
      hearts -= 1
      hurt = 60
      if (hearts === 0) state = 'over'
      // Both bounce apart, so an enemy cannot stay stuck on top of you.
      const ax = Math.sign(player.x - e.x) || 1
      const ay = Math.sign(player.y - e.y)
      const horizontal = Math.abs(player.x - e.x) >= Math.abs(player.y - e.y)
      for (let i = 0; i < 6; i++) move(player, horizontal ? ax * 4 : 0, horizontal ? 0 : ay * 4)
      e.knock = 10
      e.kx = horizontal ? -ax * 3 : 0
      e.ky = horizontal ? 0 : -ay * 3
    }
  }
  enemies = enemies.filter((e) => e.hp > 0)
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
      if (ch === 'h') {
        ctx.fillStyle = '#e11d48'
        ctx.fillRect(x + 9, y + 9, 14, 14)
      }
    })
  })

  for (const e of enemies) {
    ctx.fillStyle = e.knock > 0 ? '#fca5a5' : '#7c3aed'
    ctx.fillRect(e.x, e.y, SIZE, SIZE)
  }
  // The player blinks while it cannot be hurt.
  if (hurt === 0 || Math.floor(hurt / 5) % 2 === 0) {
    ctx.fillStyle = '#16a34a'
    ctx.fillRect(player.x, player.y, SIZE, SIZE)
  }
  if (swing > 0) {
    const s = swordBox()
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(s.x, s.y, s.w, s.h)
  }
  ctx.restore()

  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < hearts ? '#e11d48' : '#44403c'
    ctx.fillRect(12 + i * 26, 14, 20, 20)
  }

  // The touch pad, faint, in the corner.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(PAD.x, PAD.y, PAD.r, 0, Math.PI * 2)
  ctx.stroke()

  if (state !== 'playing') {
    ctx.fillStyle = 'rgba(12, 10, 9, 0.75)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('Game over', canvas.width / 2, 190)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, 222)
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
