---
title: The maze as text
title_tr: Metin olarak labirent
skills: [prog.arrays, game.canvas]
---

# --goal--

A maze game lives on a grid of tiles. The easiest way to design one is to **draw it as text**: one string per row, one
character per tile. We take the canvas and its 2D context, name the tile size, and write the maze.

# --goal-tr--

Labirent oyunu bir **döşeme ızgarası** üstünde oynanır: her döşeme 24 × 24 piksellik bir kare. Labirenti tasarlamanın
en kolay yolu onu **metin olarak çizmek**: her sıra bir metin, her harf bir döşeme.

- `#` duvar, `-` hayaletlerin evi, `.` yem, `o` güç yemi, `P` oyuncunun başlangıç yeri, boşluk boş yol.
- 9. sıranın iki ucu açık: bir **tünel**. Soldan çıkan sağdan girecek.

Bu adımda ekranda bir şey değişmeyecek; oyunun **haritasını** yazıyoruz.

# --code--

```js
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
```

# --meaning--

- `canvas` is the drawing area on the page, `ctx` its 2D drawing tools.
- `TILE` is the size of one tile; `TOP` leaves room above the maze for the score.
- `MAZE` is an array of 21 strings of 19 characters: `MAZE[row][col]` is one tile.
- `ROWS` and `COLS` are read from the maze itself, so a different maze would just work.

# --meaning-tr--

- `document.getElementById('game')` → sayfadaki canvas'ı bulur. `canvas.getContext('2d')` → onun **2D çizim
  kalemini** verir; bütün çizim komutları `ctx.` ile başlayacak.
- `const TILE = 24` → bir döşemenin piksel boyu. `TOP = 40` → labirentin üstünde skor için boşluk.
- `const MAZE = [ ... ]` → köşeli parantez bir **dizi** (sıralı liste) açar; içinde 21 metin var, her biri 19 harf.
- `MAZE[row][col]` → önce sıra, sonra o sıranın harfi: `MAZE[15][9]` → `'P'`. Sayma **0'dan** başlar.
- `MAZE.length` → dizinin eleman sayısı: 21 sıra. `MAZE[0].length` → ilk metnin harf sayısı: 19 sütun. Sayıları
  elle yazmak yerine haritadan okuyoruz; labirenti değiştirirsen bunlar kendiliğinden doğru kalır.

# --task--

Write the code under the three comment lines. You may copy the `MAZE` rows; check every row has 19 characters.

# --task-tr--

1. Kodu üç yorum satırının **altına** yaz.
2. `MAZE` satırlarını buradan kopyalayabilirsin (harita bir veri; onu elle yazmanın öğreteceği bir şey yok). Her sıra
   tam **19 karakter** olmalı, boşluklar dahil.
3. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --hint--

Count the characters of the row the check names; spaces count too.

# --hint-tr--

Kontrolün gösterdiği sırayı say: 19 karakter olmalı, **boşluklar da sayılır**. Her sıra tırnak içinde ve sonunda
virgül olmalı.

# --tests--

The maze should be 21 rows of 19 tiles.
tr: Labirent 19 döşemelik 21 sıra olmalı.

```js
assert.strictEqual(ROWS, 21)
assert.strictEqual(COLS, 19)
for (const line of MAZE) assert.lengthOf(line, 19, JSON.stringify(line))
```

The player start and the tunnel should be where they belong.
tr: Oyuncunun başlangıcı ve tünel yerinde olmalı.

```js
assert.strictEqual(MAZE[15][9], 'P')
assert.strictEqual(MAZE[9][0], ' ', 'the tunnel is open on the left')
assert.strictEqual(MAZE[9][18], ' ', 'and on the right')
assert.strictEqual(TILE, 24)
assert.strictEqual(TOP, 40)
```

# --seed--

```js
// Maze chase, step by step.
// The page already has <canvas id="game" width="456" height="544"></canvas>.
// Write your code below.
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
```
