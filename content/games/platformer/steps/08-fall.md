---
title: Gravity
title_tr: Yerçekimi
skills: [game.physics, game.loop]
---

# --goal--

The player gets a speed: `vx` sideways, `vy` up and down. Gravity adds a little to `vy` every frame, so falling gets faster
and faster, up to `MAX_FALL`. `update` changes the game before each `draw`.

# --goal-tr--

Oyuncuya bir **hız** veriyoruz: `vx` yatay, `vy` dikey hız (piksel/kare). **Yerçekimi** her karede `vy`'ye biraz ekler;
böylece düşüş gittikçe **hızlanır**. Ama sınırsız değil: en fazla `MAX_FALL`.

Döngüye bir iş daha ekliyoruz: her turda önce **güncelle** (`update`), sonra **çiz**. Oyuncunun güncellemesini ayrı bir
fonksiyona, `updatePlayer`'a koyuyoruz; ileride düşmanlar da kendi fonksiyonlarını alacak.

# --code--

```js
const GRAVITY = 0.5
const MAX_FALL = 12 // must stay below TILE, or a fast fall could skip over a whole tile

      if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }

function updatePlayer() {
  player.vy = Math.min(MAX_FALL, player.vy + GRAVITY)
  player.y += player.vy
}

function update() {
  updatePlayer()
}

  update()
```

# --meaning--

- `vx`, `vy` are the speeds; `grounded` will say whether the player stands on something.
- `Math.min(MAX_FALL, vy + GRAVITY)` adds gravity but never lets the speed pass 12.
- `y += vy` moves the player down by its speed.
- `loop` now calls `update()` before `draw()`.

# --meaning-tr--

- `GRAVITY = 0.5` → her karede düşme hızına eklenen miktar.
- `MAX_FALL = 12` → en büyük düşme hızı. Yorum nedenini söylüyor: bir karede bir döşemeden (32) fazla ilerleyen cisim
  ince bir zeminin **içinden geçip** gidebilir; bunu önlemek için hız 32'nin altında kalmalı.
- `vx: 0, vy: 0, grounded: false` → oyuncunun yatay ve dikey hızı ve "yerde mi?" bilgisi.
- `player.vy = Math.min(MAX_FALL, player.vy + GRAVITY)` → hıza yerçekimini ekle. `Math.min` iki sayıdan **küçüğünü**
  seçer: sonuç 12'yi hiç geçemez.
- `player.y += player.vy` → oyuncuyu hızı kadar aşağı taşı.
- `function update() { updatePlayer() }` → oyunun bütün güncellemesi; şimdilik yalnız oyuncu.
- `loop` içinde `update()` → her karede önce güncelle, sonra çiz.

# --task--

1. Under `COLORS`, leave an empty line and write `GRAVITY` and `MAX_FALL`.
2. In `loadLevel`, add `vx: 0, vy: 0, grounded: false` to the player.
3. Above `function draw() {` write `updatePlayer` and `update`.
4. In `loop`, call `update()` before `draw()`. Press **Run** and watch.

# --task-tr--

1. `COLORS` satırının altına bir boş satır bırak; `GRAVITY` ve `MAX_FALL` satırlarını yaz.
2. `loadLevel` içindeki oyuncu nesnesine `vx: 0, vy: 0, grounded: false` ekle (`h: 30`'dan sonra).
3. `function draw() {` satırının **üstüne** `updatePlayer` ve `update` fonksiyonlarını yaz.
4. `loop` içinde `draw()`'un **üstüne** `update()` yaz.
5. **Çalıştır** ve kırmızı kutuyu izle.

# --predict--

What will the red box do?
- [ ] Stay on the ground
- [x] Fall straight through the ground and out of the screen
  Nothing checks for tiles yet: gravity just keeps adding to `y`.
- [ ] Float up

# --predict-tr--

Kırmızı kutu ne yapacak?
- [ ] Zeminde duracak
- [x] Zeminin içinden geçip ekrandan düşecek
  Henüz döşemelere bakan yok; yerçekimi `y`'ye eklemeye devam ediyor.
- [ ] Yukarı süzülecek

# --tests--

Gravity should add 0.5 to the falling speed every frame.
tr: Yerçekimi her karede düşme hızına 0.5 eklemeli.

```js
assert.deepEqual([player.vx, player.vy, player.grounded], [0, 0, false])
$.tick(1)
assert.strictEqual(player.vy, 0.5)
$.tick(3)
assert.strictEqual(player.vy, 2)
assert.strictEqual(player.y, 258 + 0.5 + 1 + 1.5 + 2)
```

Falling should never be faster than `MAX_FALL`.
tr: Düşüş hiçbir zaman `MAX_FALL`'dan hızlı olmamalı.

```js
for (let i = 0; i < 60; i++) update()
assert.strictEqual(player.vy, 12)
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
      if (line[col] === 'P') player = { x: x + 4, y: y + 2, w: 24, h: 30, vx: 0, vy: 0, grounded: false }
    }
  })
}

function updatePlayer() {
  player.vy = Math.min(MAX_FALL, player.vy + GRAVITY)
  player.y += player.vy
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
