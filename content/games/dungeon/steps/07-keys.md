---
title: A key and a locked door
title_tr: Bir anahtar ve kilitli bir kapı
skills: [game.state]
---

# --explanation--

The door in the second room is locked, and the key is in the room below the first. This turns four rooms into a small
**puzzle of order**: you cannot go straight to the exit, you have to explore.

Picking up the key works like picking up a heart: it goes into `keysHeld`, the tile becomes floor, and `taken` remembers it.

Opening the door needs a key and happens when you walk **into** it. The door is a wall, so you can never stand on it; instead,
look at the tile just in front of you (60% of a tile ahead in the direction you face). If it is a door and you have a key, the
key is used, the door becomes floor, and `taken` remembers that too, so it stays open when you come back.

# --explanation-tr--

**Bu adımda:** sarı bir anahtar toplayıp kilitli kahverengi kapıyı açacaksın. Üst şeritte kalplerin yanında
`Keys 0` yazacak; anahtarı alınca `Keys 1` olacak.

**Küçük bir sıra bulmacası.** İkinci odanın (sağ üst) altındaki kapı kilitli; anahtar ise ilk odanın altındaki odada
(sol alt). Böylece dört oda küçük bir bulmacaya dönüşür: doğrudan çıkışa gidemezsin, önce keşfetmen gerekir.

**Anahtarı almak, kalbi almak gibidir.** 6. adımda kalp için yaptığımızın aynısı: oyuncunun ortasının altındaki karo
`k` ise anahtar sayın (`keysHeld`) 1 artar, karo zemin olur ve `taken` torbası bunu hatırlar. İkisini tek `if`'te
birleştiriyoruz: "`k` **ya da** `h` ise: `k` ise anahtar ekle, **değilse** kalp ekle; sonra ikisinde de karoyu zemin yap
ve hatırla."

**Kapıyı açmak biraz farklı.** Kapı bir duvardır (`solidTile` onu duvar sayıyor), yani asla üstünde duramazsın. Onun
yerine **hemen önündeki** karoya bakarız: oyuncunun ortasından, baktığın yönde bir karonun %60'ı kadar ileri
(`T * 0.6`, yaklaşık 19 piksel). Oradaki karo `D` ise ve anahtarın varsa: anahtar harcanır, kapı zemin olur ve `taken`
onu da hatırlar; geri geldiğinde açık kalır. Yani kapıya doğru yürüdüğün an açılır.

```js
const fc = Math.floor((cx + dx * T * 0.6) / T)   // öndeki karonun sütunu
const fr = Math.floor((cy + dy * T * 0.6) / T)   // öndeki karonun satırı
```

`tiles[fr] && tiles[fr][fc] === 'D'` → önce "o satır var mı?" diye sorarız. Odanın kenarındaysan öndeki satır odanın
dışında olabilir; `tiles[fr]` yoksa `&&` ikinci soruya hiç geçmez ve hata olmaz.

`'Keys ' + keysHeld` yazı ile sayıyı yan yana koyar: `'Keys 1'`.

# --task--

1. Add `keysHeld` (`0` in `reset()`). A `k` under the middle of the player adds a key, becomes floor and is taken.
2. Every frame, find the tile 0.6 of a tile in front of the middle of the player. If it is a `D` and you hold a key, use the key,
   make the door floor and add it to `taken`.
3. Draw a `k` as a `'#eab308'` 12 by 16 rectangle at `(x + 10, y + 8)` in its tile, and `Keys 1` at `(100, 30)` in white,
   `'bold 16px sans-serif'`.

# --task-tr--

1. `let tiles ...` satırının yorumunu güncelle, `let hearts` satırının altına anahtar sayısını ekle:

   ```js
   let tiles // the current room, as arrays of characters we can change (doors open, keys are picked up)
   ```

   ```js
   let hearts
   let keysHeld // ← yeni
   ```

2. `reset()` içinde `hearts = 3` satırının altına ekle:

   ```js
     keysHeld = 0
   ```

3. `update()` içinde kalp toplayan `if (here === 'h') { ... }` bloğunu sil ve yerine şunu yaz (anahtar ve kalp birlikte,
   ardından kapı):

   ```js
     if (here === 'k' || here === 'h') {
       if (here === 'k') keysHeld += 1
       else hearts = Math.min(3, hearts + 1)
       tiles[row][col] = '.'
       taken.add(id)
     }
     // A locked door right in front of you opens with a key.
     const [dx, dy] = player.dir
     const fc = Math.floor((cx + dx * T * 0.6) / T)
     const fr = Math.floor((cy + dy * T * 0.6) / T)
     if (tiles[fr] && tiles[fr][fc] === 'D' && keysHeld > 0) {
       keysHeld -= 1
       tiles[fr][fc] = '.'
       taken.add(room.rx + ',' + room.ry + ',' + fc + ',' + fr)
     }
   ```

   Bunların hepsi `if (swing > 0) swing -= 1` satırının üstünde kalmalı.

4. `draw()` içindeki karo döngüsünde, kapıyı çizen `if (ch === 'D') { ... }` bloğu ile kalbi çizen `if (ch === 'h')`
   bloğunun **arasına** anahtarı ekle:

   ```js
         if (ch === 'k') {
           ctx.fillStyle = '#eab308'
           ctx.fillRect(x + 10, y + 8, 12, 16)
         }
   ```

5. `draw()`'da kalpleri çizen `for (let i = 0; i < 3; i++) { ... }` döngüsünün kapanış `}`'sinden hemen sonra anahtar
   yazısını ekle:

   ```js
     ctx.fillStyle = 'white'
     ctx.font = 'bold 16px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Keys ' + keysHeld, 100, 30)
   ```

6. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. İlk odanın alt boşluğundan in, sarı anahtarı al (`Keys 1`
   olmalı), sonra yukarı çıkıp sağdaki odaya geç ve alttaki kahverengi kapıya yürü: kapı açılmalı. Alttaki
   kontrollerin hepsi yeşil olmalı. Kapı açılmıyorsa `fc`/`fr` satırlarında `0.6` ve parantezleri kontrol et.

# --tests--

The key should be picked up once.
tr: Anahtar bir kez alınmalı.

```js
enter(0, 1)
enemies = []
player.x = 6 * T + 5
player.y = 5 * T + 5
$.tick(1)
assert.strictEqual(keysHeld, 1)
assert.strictEqual(tiles[5][6], '.')
$.tick(1)
assert.strictEqual(keysHeld, 1)
assert.include($.texts(), 'Keys 1')
```

Walking into the door with a key should open it for good.
tr: Anahtarla kapıya yürümek onu kalıcı olarak açmalı.

```js
enter(1, 0)
enemies = []
player.x = 7 * T + 5
player.y = 9 * T + 5
player.dir = [0, 1]
$.tick(1)
assert.strictEqual(tiles[10][7], 'D', 'no key: still locked')
keysHeld = 1
$.tick(1)
assert.strictEqual(tiles[10][7], '.')
assert.strictEqual(keysHeld, 0)
enter(0, 0)
enter(1, 0)
assert.strictEqual(tiles[10][7], '.')
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

let tiles // the current room, as arrays of characters we can change (doors open, keys are picked up)
let taken // what has been picked up or opened in each room, so it stays that way
let room // { rx, ry }: which room we are in
let player
let enemies
let swing // frames left of the sword swing
let hearts
let keysHeld
let hurt // frames the player cannot be hurt again
let state // 'playing' or 'over'
const held = {}

function reset() {
  taken = new Set()
  hearts = 3
  keysHeld = 0
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
  if (here === 'k' || here === 'h') {
    if (here === 'k') keysHeld += 1
    else hearts = Math.min(3, hearts + 1)
    tiles[row][col] = '.'
    taken.add(id)
  }
  // A locked door right in front of you opens with a key.
  const [dx, dy] = player.dir
  const fc = Math.floor((cx + dx * T * 0.6) / T)
  const fr = Math.floor((cy + dy * T * 0.6) / T)
  if (tiles[fr] && tiles[fr][fc] === 'D' && keysHeld > 0) {
    keysHeld -= 1
    tiles[fr][fc] = '.'
    taken.add(room.rx + ',' + room.ry + ',' + fc + ',' + fr)
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
      if (ch === 'k') {
        ctx.fillStyle = '#eab308'
        ctx.fillRect(x + 10, y + 8, 12, 16)
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
  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Keys ' + keysHeld, 100, 30)

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
