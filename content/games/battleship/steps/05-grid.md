---
title: Grids and ships as lists
title_tr: Liste olarak ızgara ve gemi
skills: [prog.arrays, prog.functions]
---

# --goal--

Two small helpers. `grid(value)` makes a 10 by 10 table: a list of 10 rows, each a list of 10 squares. `shipCells` makes
the list of squares a ship covers.

# --goal-tr--

Oyunun bilgilerini tutmak için iki küçük yardımcı yazıyoruz:

- **Deniz = liste içinde liste.** 10×10'luk bir tablo, 10 satırlık bir listedir; her satır da 10 karelik bir liste.
  `tablo[2][5]` → 2. satırın 5. karesi (ikisi de 0'dan sayılır). Kareleri hep **(satır, sütun)**, yani `(r, c)` diye
  yazacağız. `grid(value)` böyle bir tablo yapar; her karesi `value` olur.
- **Gemi = kapladığı karelerin listesi.** Örneğin `[[2, 3], [2, 4], [2, 5]]`: 2. satırda yan yana üç kare.
  `shipCells` bu listeyi yapar.

Ekranda bir şey değişmeyecek.

# --code--

```js
const grid = (value) => Array.from({ length: N }, () => Array(N).fill(value))
const shipCells = (r, c, length, down) => Array.from({ length }, (_, i) => (down ? [r + i, c] : [r, c + i]))
```

# --meaning--

- These are arrow functions stored in constants; a one-line arrow function returns its result by itself.
- `Array(N).fill(value)` is one row; `Array.from({ length: N }, ...)` makes 10 separate rows.
- In `shipCells`, `i` counts 0, 1, 2...; a ship going down adds `i` to the row, otherwise to the column.

# --meaning-tr--

- `const grid = (value) => ...` → bir **ok fonksiyonu** (`=>` "şunu ver" diye okunur), bir sabite konmuş. Tek satırlık
  ok fonksiyonu sonucunu kendiliğinden geri verir; `return` yazmaya gerek yok.
- `Array(N).fill(value)` → N elemanlı, hepsi `value` olan **bir satır**.
- `Array.from({ length: N }, () => ...)` → oktaki fonksiyonu N kez çalıştırıp sonuçlardan liste yapar: 10 **ayrı**
  satır. (Tek bir satırı 10 kez koysaydık, birini değiştirmek hepsini değiştirirdi.)
- `shipCells(r, c, length, down)` → `(r, c)`'den başlayan, `length` uzunluğunda, aşağı (`down`) ya da sağa giden gemi.
- `{ length }` → `{ length: length }` kısaltması. `(_, i)` → `Array.from` fonksiyona sıra numarasını da verir: `i` 0,
  1, 2... Kullanmadığımız ilk değere `_` deriz.
- `down ? [r + i, c] : [r, c + i]` → aşağı gidiyorsa satır artar, değilse sütun.

# --task--

Write the two lines above `function drawSea(`, followed by an empty line.

# --task-tr--

İki satırı `function drawSea(` satırının **üstüne** yaz; altında bir boş satır kalsın. **Çalıştır**: ekran değişmez,
kontroller yeşil olmalı.

# --predict--

What does `shipCells(0, 0, 3, true)` give?
- [ ] `[[0, 0], [0, 1], [0, 2]]`
- [x] `[[0, 0], [1, 0], [2, 0]]`
  `true` means down, so the row grows: 0, 1, 2.
- [ ] `[[0, 3]]`

# --predict-tr--

`shipCells(0, 0, 3, true)` ne verir?
- [ ] `[[0, 0], [0, 1], [0, 2]]`
- [x] `[[0, 0], [1, 0], [2, 0]]`
  `true` aşağı demek; satır artar: 0, 1, 2.
- [ ] `[[0, 3]]`

# --tests--

`grid` should make an N by N table filled with a value.
tr: `grid` bir değerle dolu N×N bir tablo yapmalı.

```js
assert.lengthOf(grid(0), N)
assert.deepEqual(grid(7)[4], Array(N).fill(7))
const g = grid(0)
g[0][0] = 5
assert.strictEqual(g[1][0], 0, 'every row is a separate list')
```

`shipCells` should list the squares of a ship across or down.
tr: `shipCells` yatay ya da dikey bir geminin karelerini listelemeli.

```js
assert.deepEqual(shipCells(2, 3, 3, false), [[2, 3], [2, 4], [2, 5]])
assert.deepEqual(shipCells(2, 3, 2, true), [[2, 3], [3, 3]])
```

# --solution--

```js
// Battleship, step by step.
// The page already has <canvas id="game" width="420" height="620"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 10
const BIG = 36 // cell size of the enemy's sea, where you shoot
const SMALL = 20 // cell size of your own sea
const SEA = { x: 30, y: 50 }
const HOME = { x: 30, y: 440 }

const grid = (value) => Array.from({ length: N }, () => Array(N).fill(value))
const shipCells = (r, c, length, down) => Array.from({ length }, (_, i) => (down ? [r + i, c] : [r, c + i]))

function drawSea(origin, size) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = origin.x + c * size
      const y = origin.y + r * size
      ctx.fillStyle = '#1e3a8a'
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2)
    }
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawSea(SEA, BIG)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('Your fleet', HOME.x, HOME.y - 10)
  drawSea(HOME, SMALL)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
