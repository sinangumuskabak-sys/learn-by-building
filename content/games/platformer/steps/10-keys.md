---
title: Which keys are held?
title_tr: Hangi tuşlar basılı?
skills: [game.input]
---

# --goal--

Running needs to know which keys are **held down right now**, every frame. `keys` remembers it: a key goes `true` when
pressed and `false` when released.

# --goal-tr--

Koşmak için her karede şunu bilmeliyiz: **şu an** hangi tuşlar basılı? Tuşa basıldığında ve bırakıldığında tarayıcı
bize haber verir; biz de bunu bir nesnede not ederiz: `keys`. Basılınca `true`, bırakılınca `false`.

Bu adımda ekranda bir şey değişmeyecek; klavyeyi dinlemeye başlıyoruz.

# --code--

```js
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})
```

# --meaning--

- `keys` starts empty; `keys[event.key] = true` adds or sets a key named after the pressed key, e.g. `keys.ArrowRight`.
- `keydown` fires when a key goes down, `keyup` when it comes back up.

# --meaning-tr--

- `const keys = {}` → boş bir nesne; tuşların durumunu tutacak.
- `document.addEventListener('keydown', (event) => { ... })` → bir tuşa **basıldığında** çalışır; `event.key` tuşun adı
  (`'ArrowRight'`, `' '`...).
- `keys[event.key] = true` → köşeli parantezle, adı tuşun adı olan bir anahtar yazar: sağ oka basınca
  `keys.ArrowRight` → `true`.
- `keyup` → tuş **bırakıldığında**; aynı anahtar `false` olur.

# --task--

1. Under `let player` write `const keys = {}`.
2. Above `function updatePlayer() {` write the two listeners, with an empty line after them.

# --task-tr--

1. `let player` satırının altına `const keys = {}` yaz.
2. `function updatePlayer() {` satırının **üstüne** iki dinleyiciyi yaz; altlarında bir boş satır kalsın.
3. **Çalıştır**: ekran aynı, kontroller yeşil.

# --tests--

A key should be `true` while held and `false` after release.
tr: Bir tuş basılıyken `true`, bırakılınca `false` olmalı.

```js
$.press('ArrowRight')
assert.isTrue(keys.ArrowRight)
$.press('ArrowLeft')
assert.isTrue(keys.ArrowLeft)
$.release('ArrowRight')
assert.isFalse(keys.ArrowRight)
assert.isTrue(keys.ArrowLeft)
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

let player
const keys = {}

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

function moveY(body) {
  body.grounded = false
  body.y += body.vy
  if (!overlapsSolid(body)) return
  if (body.vy > 0) {
    body.y = Math.floor((body.y + body.h - EPS) / TILE) * TILE - body.h
    body.grounded = true
  }
  body.vy = 0
}

function loadLevel() {
  LEVEL.forEach((line, row) => {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE
      const y = row * TILE
      if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
    }
  })
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function updatePlayer() {
  player.vy = Math.min(MAX_FALL, player.vy + GRAVITY)
  moveY(player)
}

function update() {
  updatePlayer()
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
  update()
  draw()
  requestAnimationFrame(loop)
}

loadLevel()
requestAnimationFrame(loop)
```
