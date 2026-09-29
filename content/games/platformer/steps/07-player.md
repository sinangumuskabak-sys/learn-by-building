---
title: Draw the player
title_tr: Oyuncuyu çiz
skills: [game.canvas]
---

# --goal--

The player is drawn as a red box, after the tiles, so it is on top of them.

# --goal-tr--

Oyuncuyu kırmızı bir kutu olarak çiziyoruz. Döşemelerden **sonra** çizilir ki onların önünde görünsün.

# --code--

```js
ctx.fillStyle = '#dc2626'
ctx.fillRect(player.x, player.y, player.w, player.h)
```

# --meaning--

- The box is drawn exactly where `player` says: whatever changes `player` will move the picture.

# --meaning-tr--

- `ctx.fillStyle = '#dc2626'` → kırmızı.
- `ctx.fillRect(player.x, player.y, player.w, player.h)` → kutuyu **tam `player`'ın söylediği yerde** çiz. Artık
  `player`'ı değiştiren her şey resmi de değiştirecek: animasyonun bütün sırrı bu.

# --task--

In `draw`, after the tile loops, leave an empty line and write the two lines. Press **Run**.

# --task-tr--

`draw` içinde döşeme döngülerinin kapanan `}`'lerinden sonra bir boş satır bırak ve iki satırı yaz. **Çalıştır**: solda,
zeminin üstünde kırmızı bir kutu görmelisin.

# --try--

Move the `P` in `LEVEL` a few characters to the right (swap it with a `.`) and run. Then put it back.

# --try-tr--

`LEVEL`'daki `P`'yi birkaç harf sağa taşı (bir `.` ile yer değiştir) ve çalıştır. Sonra geri al.

# --tests--

The player should be drawn as a red box at the start.
tr: Oyuncu başlangıçta kırmızı bir kutu olarak çizilmeli.

```js
$.tick(1)
assert.deepEqual($.rects('#dc2626'), [{ x: 68, y: 258, w: 24, h: 30, color: '#dc2626' }])
```

The box should follow `player`.
tr: Kutu `player`'ı izlemeli.

```js
player.x = 200
$.tick(1)
assert.strictEqual($.rects('#dc2626')[0].x, 200)
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

let player

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

function loadLevel() {
  LEVEL.forEach((line, row) => {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE
      const y = row * TILE
      if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30 }
    }
  })
}

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = LEVEL[row][col]
      if (tile === '#' || tile === 'B') {
        ctx.fillStyle = COLORS[tile]
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE)
      }
    }
  }

  ctx.fillStyle = '#dc2626'
  ctx.fillRect(player.x, player.y, player.w, player.h)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

loadLevel()
requestAnimationFrame(loop)
```
