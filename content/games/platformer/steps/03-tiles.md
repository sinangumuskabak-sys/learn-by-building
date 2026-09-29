---
title: Draw the tiles
title_tr: Döşemeleri çiz
skills: [game.canvas, prog.loops]
---

# --goal--

Two nested loops visit every tile. Ground and brick tiles are drawn as `TILE` × `TILE` squares, at their column and row
times `TILE`, in the color `COLORS` gives them.

# --goal-tr--

Şimdi yazıyı resme çeviriyoruz. İç içe iki döngüyle **her döşemeyi** gezeceğiz; zemin (`#`) ve tuğla (`B`) ise o yere
32×32'lik bir kare çizeceğiz. Hangi harfin hangi renk olduğunu bir nesne söyleyecek: `COLORS`.

# --code--

```js
const COLORS = { '#': '#78350f', B: '#c2410c' }

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = LEVEL[row][col]
      if (tile === '#' || tile === 'B') {
        ctx.fillStyle = COLORS[tile]
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE)
      }
    }
  }
```

# --meaning--

- `COLORS` maps a tile character to a color. `'#'` needs quotes as a key; `B` does not.
- The outer loop goes over the rows, the inner one over the columns: every tile once.
- A tile's pixel position is its column and row times `TILE`: column 9, row 6 is at (288, 192).

# --meaning-tr--

- `const COLORS = { '#': '#78350f', B: '#c2410c' }` → harften renge bir **sözlük**: zemin kahverengi, tuğla turuncu.
  `#` özel bir işaret olduğu için anahtar olarak tırnak ister; `B` istemez.
- `for (let row = 0; row < ROWS; row++)` → her satır için; içindeki `for` → o satırın her sütunu için. İç içe iki döngü:
  11 × 64 döşemenin hepsi bir kez.
- `const tile = LEVEL[row][col]` → o yerdeki harf.
- `if (tile === '#' || tile === 'B')` → zemin **veya** tuğla ise çiz; hava (`.`) ve diğerleri çizilmez.
- `ctx.fillStyle = COLORS[tile]` → köşeli parantezle sözlükten okuma: `COLORS['#']` → `'#78350f'`.
- `ctx.fillRect(col * TILE, row * TILE, TILE, TILE)` → döşemenin piksel yeri = sütun ve satır × 32. 9. sütun, 6. satır →
  (288, 192).

# --task--

1. Under `COLS` write `COLORS`.
2. In `draw`, after the sky, leave an empty line and write the two loops. Press **Run**.

# --task-tr--

1. `const COLS = ...` satırının altına `COLORS` satırını yaz.
2. `draw` içinde gökyüzünü boyayan `fillRect` satırının altına bir boş satır bırak ve iki döngüyü yaz.
3. **Çalıştır**: altta kahverengi zemin, ortada turuncu tuğlalar görmelisin. Bölümün sağ tarafı şimdilik canvas'ın
   dışında kalıyor.

# --try--

Change a `.` in a row of `LEVEL` to `#` and run: a new block appears. Put the `.` back.

# --try-tr--

`LEVEL`'ın bir satırındaki bir `.`'yı `#` yap ve çalıştır: yeni bir blok belirir. Sonra `.`'ya geri al.

# --tests--

Every ground and brick tile should be drawn at its grid position.
tr: Her zemin ve tuğla döşemesi ızgaradaki konumunda çizilmeli.

```js
$.tick(1)
const count = (ch) => LEVEL.join('').split(ch).length - 1
assert.lengthOf($.rects('#78350f'), count('#'))
assert.lengthOf($.rects('#c2410c'), count('B'))
assert.deepInclude($.rects('#78350f'), { x: 0, y: 288, w: 32, h: 32, color: '#78350f' })
assert.deepInclude($.rects('#c2410c'), { x: 288, y: 192, w: 32, h: 32, color: '#c2410c' })
```

# --solution--

```js
// Platformer, step by step.
// The page already has <canvas id="game" width="640" height="352"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 32
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
