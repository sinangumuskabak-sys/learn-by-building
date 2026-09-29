---
title: A map of tiles
title_tr: Karelerden bir harita
skills: [game.canvas, prog.loops]
---

# --goal--

Two loops, one inside the other, visit every tile: for each row, every column. Each tile is painted green, so the
whole map becomes grass.

# --goal-tr--

Haritayı karelere bölüp her kareyi tek tek boyayacağız: 9 × 12 = 108 kare. **İç içe iki döngü** bunu yapar: her
**satır** için, o satırdaki her **sütun**. Şimdilik hepsi yeşil çimen.

# --code--

```js
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    ctx.fillStyle = '#3f6212'
    ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
  }
}
```

# --meaning--

- The outer loop counts `row` from 0 to 8, the inner one `col` from 0 to 11 for each row.
- The tile in row `row`, column `col` starts at `col * TILE` across and `TOP + row * TILE` down.

# --meaning-tr--

- `for (let row = 0; row < ROWS; row++) {` → **sayma döngüsü**: `row` 0'dan başlar, `ROWS`'tan (9) küçükken sürer, her
  turda 1 artar (`row++`). Satır numaraları: 0, 1, ... 8.
- İçindeki `for (let col = 0; col < COLS; col++) {` → her satır için sütunlar: 0, 1, ... 11.
- `ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)` → o karenin 40 × 40'lık dikdörtgeni. Soldan `col * 40`,
  yukarıdan üst şerit kadar aşağıdan başlayarak `row * 40`.

# --task--

At the end of the code, after an empty line, write the two loops.

# --task-tr--

1. Kodun **en altına**, bir boş satır bırakıp iki döngüyü yaz.
2. **Çalıştır**: üstte ve altta koyu şeritler, ortada yeşil bir harita görmelisin.

# --tests--

Every tile should be a green 40-pixel square.
tr: Her kare yeşil bir 40 piksellik kare olmalı.

```js
const tiles = $.rects('#3f6212')
assert.lengthOf(tiles, 108)
assert.deepInclude(tiles, { x: 0, y: 40, w: 40, h: 40, color: '#3f6212' }, 'row 0, column 0')
assert.deepInclude(tiles, { x: 440, y: 360, w: 40, h: 40, color: '#3f6212' }, 'the last tile')
```

# --solution--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const ROWS = 9
const TOP = 40 // room for gold, lives and the tower buttons

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    ctx.fillStyle = '#3f6212'
    ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
  }
}
```
