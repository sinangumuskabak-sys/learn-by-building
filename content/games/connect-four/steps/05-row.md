---
title: A whole row
title_tr: Bütün bir satır
skills: [prog.loops]
---

# --goal--

Seven holes in a row: instead of writing seven calls, a `for` loop repeats one call for each column, 0 to 6.

# --goal-tr--

Bir satırda 7 delik var. Yedi ayrı `disc(...)` satırı yazmak yerine bilgisayara "her sütun için tekrarla" diyeceğiz. Bunun
aracı **döngü** (`for`).

# --code--

```js
for (let col = 0; col < COLS; col++) {
  const x = col * CELL + CELL / 2
  const y = TOP + CELL / 2
  disc(x, y, '#0f172a')
}
```

# --meaning--

- `for (let col = 0; col < COLS; col++)`: start with `col` at 0, repeat while it is below 7, add 1 after each turn.
- `x` moves one cell to the right each time: 32, 96, 160, ...

# --meaning-tr--

- `for (let col = 0; col < COLS; col++) { ... }` → üç parçası var:
  - `let col = 0` → sayaç `col` (sütun) 0'dan başlasın. `let`, çünkü değeri değişecek.
  - `col < COLS` → 7'den küçük olduğu **sürece** süslü parantezin içini yap (`<` "küçüktür").
  - `col++` → her turdan sonra `col`'u 1 artır.
  Yani içerisi `col` 0, 1, 2, 3, 4, 5, 6 için yedi kez çalışır.
- `const x = col * CELL + CELL / 2` → o sütunun ortası: 32, 96, 160... her turda 64 sağa.
- `const y = TOP + CELL / 2` → hepsi aynı satırda: 128.

# --task--

Replace the single `disc(...)` call with the loop.

# --task-tr--

`draw` içindeki tek `disc(...)` satırını sil; yerine `for` döngüsünü yaz. **Çalıştır**: tahtanın üst satırında yan yana
yedi delik görmelisin.

# --predict--

How many times does the inside of the loop run?
- [ ] 6
- [x] 7
  `col` takes the values 0, 1, 2, 3, 4, 5 and 6; at 7 the condition `col < COLS` is false and the loop stops.
- [ ] 8

# --predict-tr--

Döngünün içi kaç kez çalışır?
- [ ] 6
- [x] 7
  `col` 0, 1, 2, 3, 4, 5 ve 6 olur; 7 olunca `col < COLS` yanlış olur ve döngü durur.
- [ ] 8

# --tests--

The top row should have 7 holes, one in the middle of each column.
tr: Üst satırda her sütunun ortasında birer tane, 7 delik olmalı.

```js
draw()
assert.deepEqual($.arcs().map((a) => [a.x, a.y]), [[32, 128], [96, 128], [160, 128], [224, 128], [288, 128], [352, 128], [416, 128]])
```

# --solution--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 7
const ROWS = 6
const CELL = 64
const TOP = 96 // room above the board for the messages and the next disc

function disc(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let col = 0; col < COLS; col++) {
    const x = col * CELL + CELL / 2
    const y = TOP + CELL / 2
    disc(x, y, '#0f172a')
  }
}

draw()
```
