---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop, game.canvas]
---

# --goal--

Everything will move, so the picture is drawn again before every screen refresh (about 60 times a second). `draw`
paints the dark background; `loop` draws and asks for the next frame with `requestAnimationFrame`.

# --goal-tr--

Bu oyunda her şey hareket edecek; o yüzden resmi baştan bir **oyun döngüsü** içinde çiziyoruz. Tarayıcı ekranı her
yenilemeden önce (saniyede yaklaşık **60 kez**) `loop`'u çalıştıracak, `loop` da `draw` ile resmi baştan çizecek.

Şimdilik `draw` yalnız arka planı gece mavisine boyuyor.

# --code--

```js
function draw() {
  ctx.fillStyle = '#0b1020'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `fillStyle` picks the color, `fillRect(x, y, w, h)` fills a rectangle; `(0, 0)` is the top-left corner.
- `requestAnimationFrame(loop)` asks the browser to run `loop` before the next screen refresh; `loop` asks again each
  time, so it never stops. The last line starts it.

# --meaning-tr--

- `function draw() { ... }` → çizim tarifi. `ctx.fillStyle = '#0b1020'` rengi seçer (çok koyu lacivert),
  `ctx.fillRect(0, 0, canvas.width, canvas.height)` sol üst köşeden (0, 0) başlayıp bütün canvas'ı boyar. Canvas'ta
  `x` sağa, `y` **aşağı** doğru büyür.
- `function loop() {` → döngünün **bir turu**: çiz, sonra bir sonrakini iste.
- `requestAnimationFrame(loop)` → "ekran bir sonraki yenilenmeden önce `loop`'u çalıştır". `loop` her seferinde
  kendi devamını istediği için döngü hiç durmaz.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**.

# --task--

Under `COLS`, leave an empty line and write `draw`, `loop` and the start line.

# --task-tr--

1. `const COLS = ...` satırının altına bir boş satır bırak; `draw`, `loop` ve başlatma satırını yaz (aralarında birer
   boş satır).
2. **Çalıştır**: oyun alanı koyu laciverte boyanmalı.

# --tests--

The whole canvas should be painted `#0b1020`.
tr: Canvas'ın tamamı `#0b1020` ile boyanmalı.

```js
$.tick(1)
const full = $.rects('#0b1020').filter((r) => r.x === 0 && r.y === 0 && r.w === 456 && r.h === 544)
assert.lengthOf(full, 1)
```

The loop should keep running.
tr: Döngü sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1)
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

function draw() {
  ctx.fillStyle = '#0b1020'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
