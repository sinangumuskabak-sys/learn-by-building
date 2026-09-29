---
title: A floor of tiles
title_tr: Karelerden bir zemin
skills: [game.canvas, prog.loops]
---

# --goal--

Two loops, one inside the other, visit every tile: for each row, every column. Each tile is painted as a green
32-pixel square, so the floor fills the arena.

# --goal-tr--

Arenayı karelere bölüp her kareyi tek tek boyayacağız. 11 × 13 = 143 kare var; hepsini elle yazamayız. **İç içe iki
döngü** bunu yapar: her **satır** için, o satırdaki her **sütun**. Bir kitabı satır satır, her satırı harf harf okumak
gibi.

Şimdilik her kare yeşil zemin olacak.

# --code--

```js
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const x = c * TILE
    const y = TOP + r * TILE
    ctx.fillStyle = '#3f6212'
    ctx.fillRect(x, y, TILE, TILE)
  }
}
```

# --meaning--

- `for (let r = 0; r < ROWS; r++)` counts `r` from 0 to 10; the inner loop counts `c` from 0 to 12 for each `r`.
- The tile in row `r`, column `c` starts at `x = c * TILE` and `y = TOP + r * TILE` pixels.

# --meaning-tr--

- `for (let r = 0; r < ROWS; r++) {` → **sayma döngüsü**: `r` 0'dan başlar, `ROWS`'tan (11) küçük olduğu sürece
  devam eder, her turda 1 artar (`r++`). Yani `r` = 0, 1, ... 10: satır numarası.
- İçindeki `for (let c = 0; c < COLS; c++) {` → her satır için `c` = 0, 1, ... 12: sütun numarası. İç döngü her
  satırda baştan başlar.
- `const x = c * TILE` → karenin soldan uzaklığı (piksel): 3. sütun 96'dan başlar.
- `const y = TOP + r * TILE` → yukarıdan uzaklığı: üstteki şerit kadar aşağıdan başlar.
- `ctx.fillRect(x, y, TILE, TILE)` → 32 × 32'lik kare.
- Sayma 0'dan başlar: ilk satır 0. satır, ilk sütun 0. sütun.

# --task--

At the end of the code, after an empty line, write the two loops.

# --task-tr--

1. Kodun **en altına**, bir boş satır bırakıp iki döngüyü yaz.
2. **Çalıştır**: üstte koyu bir şerit, altında yeşil bir alan görmelisin.

# --predict--

How many squares will be painted?
- [ ] 13
- [ ] 24
- [x] 143
  The inner loop runs 13 times for each of the 11 rows: 11 × 13.

# --predict-tr--

Kaç kare boyanacak?
- [ ] 13
- [ ] 24
- [x] 143
  İç döngü, 11 satırın her biri için 13 kez çalışır: 11 × 13.

# --try--

In `ctx.fillRect(x, y, TILE, TILE)` write `TILE - 2, TILE - 2` instead of `TILE, TILE`: thin lines show the grid. Put it back.

# --try-tr--

`ctx.fillRect(x, y, TILE, TILE)` satırında `TILE, TILE` yerine `TILE - 2, TILE - 2` yaz: karelerin arasında ince çizgiler, yani ızgara görünür. Sonra geri al.

# --tests--

Every tile should be a green 32-pixel square under the top strip.
tr: Her kare, üst şeridin altında yeşil bir 32 piksellik kare olmalı.

```js
const tiles = $.rects('#3f6212')
assert.lengthOf(tiles, 143)
assert.deepInclude(tiles, { x: 0, y: 32, w: 32, h: 32, color: '#3f6212' }, 'row 0, column 0')
assert.deepInclude(tiles, { x: 96, y: 96, w: 32, h: 32, color: '#3f6212' }, 'row 2, column 3')
assert.deepInclude(tiles, { x: 384, y: 352, w: 32, h: 32, color: '#3f6212' }, 'the last tile')
```

# --solution--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 13
const ROWS = 11
const TILE = 32
const TOP = 32 // room for the lives and the time

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const x = c * TILE
    const y = TOP + r * TILE
    ctx.fillStyle = '#3f6212'
    ctx.fillRect(x, y, TILE, TILE)
  }
}
```
