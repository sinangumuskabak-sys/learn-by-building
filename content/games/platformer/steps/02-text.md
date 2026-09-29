---
title: A level made of text
title_tr: Metinden bir bölüm
skills: [prog.arrays]
---

# --goal--

Platform games are built from **tiles**: a grid of small squares, each empty or solid. Instead of placing hundreds of
rectangles by hand, we write the level as **text**: each string is one row, each character one 32×32 tile.

# --goal-tr--

Platform oyunları **döşemelerden** (tile) kurulur: küçük karelerden oluşan bir ızgara; her kare ya boş ya da katı.
Yüzlerce dikdörtgeni tek tek yerleştirmek yerine bölümü **yazı** olarak yazacağız: her yazı bir **satır**, içindeki her
harf 32×32 piksellik bir **döşeme**.

`#` zemin, `B` tuğla, `.` hava. `P` oyuncunun başlangıç yeri, `o` altın, `e` düşman, `F` bayrak. Bölümü kodun içinde
**görebilir**, saniyeler içinde değiştirebilirsin. Gerçek oyunlar da bölümlerini böyle, **veri** olarak saklar.

Bu adımda ekran değişmeyecek; yalnız bölümü tanımlıyoruz.

# --code--

```js
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
```

# --meaning--

- `TILE` is the size of one tile in pixels.
- `LEVEL` is an array of 11 strings, each 64 characters: 11 rows and 64 columns of tiles.
- `LEVEL[row][col]` reads one tile: first the row (a string), then the character in it. `LEVEL[8][2]` is `'P'`.
- `ROWS` and `COLS` count them: `LEVEL.length` is 11, `LEVEL[0].length` is 64.

# --meaning-tr--

- `const TILE = 32` → bir döşemenin piksel boyu.
- `const LEVEL = [ ... ]` → 11 yazıdan oluşan bir **dizi**; her yazı 64 harf. Yani 11 satır, 64 sütun döşeme.
- `LEVEL[row][col]` → tek bir döşemeyi okur: önce satırı (bir yazı), sonra o yazının içindeki harfi. Yazılar da diziler
  gibi 0'dan sayılır: `LEVEL[8][2]` → `'P'`.
- `const ROWS = LEVEL.length` → satır sayısı (11). `const COLS = LEVEL[0].length` → ilk satırın harf sayısı (64).
- Bölüm 64 × 32 = **2048 piksel** genişliğinde; canvas ise 640. Şimdilik taşan kısım görünmeyecek; kamerayı ileride
  ekleyeceğiz.

# --task--

Under `const ctx = ...`, leave an empty line and write `TILE`, the comment, `LEVEL`, `ROWS` and `COLS`. You may copy the
level: each row must be exactly 64 characters.

# --task-tr--

`const ctx = ...` satırının altına bir boş satır bırak; `TILE`'ı, yorum satırını, `LEVEL`'ı, `ROWS` ve `COLS`'u yaz.
Bölümün yazılarını buradan **kopyalayabilirsin**; her satır tam 64 harf olmalı. **Çalıştır**: ekran değişmez, kontroller
yeşil olmalı.

# --hint--

If `COLS` is wrong or a row check fails, one of the rows has a character too many or too few.

# --hint-tr--

`COLS` yanlışsa ya da satır kontrolü kırmızıysa, satırlardan birinde bir harf fazla ya da eksik.

# --tests--

The level should be 64 tiles wide and 11 tall.
tr: Bölüm 64 döşeme genişliğinde ve 11 yüksekliğinde olmalı.

```js
assert.strictEqual(TILE, 32)
assert.strictEqual(ROWS, 11)
assert.strictEqual(COLS, 64)
assert.isTrue(LEVEL.every((line) => line.length === COLS), 'every row 64 characters')
assert.strictEqual(LEVEL[8][2], 'P')
assert.strictEqual(LEVEL[8][61], 'F')
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

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
