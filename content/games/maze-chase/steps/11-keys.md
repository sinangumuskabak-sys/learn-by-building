---
title: Turns you can press early
title_tr: Önceden basılan dönüşler
skills: [game.input]
---

# --goal--

An arrow key does not change `dir` directly: it sets `want`. At the next tile center, `choosePlayer` turns to `want`
if that way is open, otherwise keeps going (or stops at a wall). So a turn pressed a little before a corner happens
exactly at the corner: input buffering, a big part of why maze games feel good.

# --goal-tr--

Oyuncuyu ok tuşlarıyla yönetelim. Ama dikkat: tuş `dir`'i **doğrudan değiştirmeyecek**, `want`'ı (istenen yön)
değiştirecek. Neden?

Yön yalnız döşeme ortasında değişebiliyor ve yan koridora ancak tam **köşede** girilebiliyor. İnsan tam o anı
yakalayamaz. Bu yüzden isteği **hatırlarız**: köşeden biraz önce "yukarı"ya basarsın, oyuncu köşeye gelince yukarı
açıksa döner. Açık değilse düz gitmeye devam eder. Labirent oyunlarının "tuşa hemen cevap veriyor" hissinin sırrı bu.

# --code--

```js
// Checked in this order, so ties go to up, then left, then down.
const DIRECTIONS = { ArrowUp: [0, -1], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowRight: [1, 0] }

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
```

# --meaning--

- `DIRECTIONS` maps each arrow key's name to its `[dx, dy]`; `DIRECTIONS[event.key]` is `undefined` for other keys.
- `choosePlayer`: turn to `want` if one is wanted and it is open; `else if` the current way is blocked, stop.
- `steer` records the wish. `preventDefault()` stops the arrow keys from also scrolling the page.

# --meaning-tr--

- `const DIRECTIONS = { ArrowUp: [0, -1], ... }` → her ok tuşunun adına yönünü eşleyen bir **nesne**. Sıra önemli
  (yukarı, sol, aşağı, sağ); hayaletler eşitlikte bu sırayı kullanacak, yorum bunu söylüyor.
- `if (!same(p.want, STOP) && canGo(p, p.want)) p.dir = p.want` → bir istek var **ve** o yön açıksa: dön.
- `else if (!canGo(p, p.dir)) p.dir = STOP` → **değilse eğer** gittiği yön kapalıysa: dur. İkisi de değilse düz
  devam.
- `function steer(dir)` → yönlendirme: şimdilik yalnız isteği kaydeder. (Dokunmatik ekran da onu kullanacak.)
- `document.addEventListener('keydown', (event) => { ... })` → bir tuşa basılınca çalışır. `event.key` tuşun adı:
  `'ArrowUp'` gibi.
- `DIRECTIONS[event.key]` → ok tuşuysa yönü, değilse `undefined` (yok).
- `event.preventDefault()` → tarayıcının o tuşla **kendi işini** (sayfayı kaydırmayı) yapmasını engeller.

# --task--

1. Above `STOP`, write the comment and `DIRECTIONS`.
2. Replace the body of `choosePlayer`, and under it write `steer` and the key listener.

# --task-tr--

1. `const STOP = ...` satırının **üstüne** yorumu ve `DIRECTIONS` satırını yaz.
2. `choosePlayer` fonksiyonunun içini koddaki iki satırla (ve yorumla) değiştir.
3. `choosePlayer`'ın altına bir boş satır bırakıp `steer` fonksiyonunu ve tuş dinleyicisini yaz.
4. **Çalıştır**, oyuna tıkla ve ok tuşlarıyla dolaş. Bir köşeye varmadan az önce dönüş tuşuna bas: köşede dönmeli.

# --predict--

You are walking left along row 15 and press Up while the wall is still above you. What happens?
- [ ] Nothing: the key press is lost
- [x] You keep going left and turn up at the first opening
  `want` stays up until a tile center where up is open.
- [ ] You stop

# --predict-tr--

15. sırada sola yürüyorsun ve üstün hâlâ duvarken Yukarı'ya basıyorsun. Ne olur?
- [ ] Hiçbir şey: tuş boşa gider
- [x] Sola devam edersin ve ilk açıklıkta yukarı dönersin
  `want` yukarı olarak kalır; yukarının açık olduğu ilk döşeme ortasında dönülür.
- [ ] Durursun

# --tests--

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

The player should stop at a wall, and pressing into the wall should do nothing.
tr: Oyuncu duvarda durmalı; duvara doğru basmak bir şey yapmamalı.

```js
$.press('ArrowRight')
$.tick(80)
assert.deepEqual([player.col, player.row], [14, 15])
assert.deepEqual(player.dir, [0, 0])
$.press('ArrowRight')
$.tick(8)
assert.deepEqual([player.col, player.row], [14, 15])
```

Other keys should not steer.
tr: Başka tuşlar yönlendirmemeli.

```js
$.press('a')
$.press(' ')
assert.deepEqual(player.want, [0, 0])
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

  ctx.fillStyle = '#facc15'
  ctx.beginPath()
  ctx.arc(player.col * TILE + TILE / 2, TOP + player.row * TILE + TILE / 2, 10, 0, Math.PI * 2)
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
