---
title: A grid of cell objects
title_tr: Hücre nesnelerinden bir ızgara
skills: [prog.arrays]
---

# --goal--

Minesweeper: a 9 by 9 field hides 10 mines; open every safe cell, using the numbers as clues. A cell has to remember
several things (a mine? opened? flagged?), so each cell is an **object**, and the board is a 2D array of objects built
with `Array.from`.

# --goal-tr--

**Mayın Tarlası**: 9×9'luk bir tarlada 10 mayın gizli. Mayına basmadan bütün güvenli hücreleri açarsın; açılan
hücrelerdeki sayılar çevrede kaç mayın olduğunu söyler.

Bir hücre birçok şeyi aynı anda hatırlamalı: altında mayın var mı, açıldı mı, bayrak var mı... Bu yüzden her hücre bir
**nesne** olacak, tahta da **nesnelerden oluşan iki boyutlu bir dizi**: 9 satır, her satırda 9 hücre. Önce sadece
yerini bilen hücreler kuruyoruz; ekranda henüz bir şey yok.

# --code--

```js
const SIZE = 9

let grid

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col })),
  )
}

newGame()
```

# --meaning--

- `Array.from({ length: 9 }, fn)` makes an array of 9 items, each made by `fn`, which gets the item's index as its
  second argument. `_` is a common name for an argument you do not use.
- The outer `Array.from` makes 9 rows; the inner one makes 9 cells per row, each `{ row, col }`.
- The object is wrapped in `( )` so its `{ }` is not read as a function body.
- `newGame()` builds a fresh board; we call it once at the start.

# --meaning-tr--

- `const SIZE = 9` → bir kenardaki hücre sayısı. `let grid` → tahta; her yeni oyunda yeniden kurulacağı için `let`.
- `Array.from({ length: SIZE }, (_, row) => ...)` → **9 elemanlı bir dizi** yapar; her elemanı virgülden sonraki
  fonksiyon üretir. `Array.from` bu fonksiyona her eleman için sırayla sıra numarasını (0, 1, ... 8) **ikinci girdi**
  olarak verir; biz ona `row` diyoruz.
- `_` → kullanmadığımız ilk girdiye verilen yaygın bir ad (boş yerin değeri; işimize yaramıyor).
- İçteki `Array.from` aynısını sütunlar için yapar ve her hücre için `({ row, col })` üretir: `{ row: row, col: col }`
  nesnesinin kısa yazılışı. Nesnenin etrafındaki **normal parantez** şart: yoksa `{ }` fonksiyon gövdesi sanılır.
- Sonuç: `grid[3][7]` → 3. satırın 7. hücresi: `{ row: 3, col: 7 }`. Her hücre **nerede olduğunu kendisi bilir**;
  fonksiyonlara bir hücre verdiğimizde yerini ayrıca söylememiz gerekmeyecek.
- En alttaki `newGame()` → tahtayı kur.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının **altına** yaz. `Array.from` satırlarındaki parantezlere ve sondaki `),`'e dikkat.
**Çalıştır**'a bas: ekran değişmez, kontroller yeşil olmalı.

# --tests--

The grid should be 9×9 cells that know their position.
tr: Izgara, yerlerini bilen 9×9 hücre olmalı.

```js
assert.lengthOf(grid, 9)
assert.isTrue(grid.every((row) => row.length === 9))
assert.deepInclude(grid[3][7], { row: 3, col: 7 })
assert.deepInclude(grid[8][0], { row: 8, col: 0 })
assert.notStrictEqual(grid[0], grid[1], 'every row is its own array')
```

# --seed--

```js
// Minesweeper, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Minesweeper, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const SIZE = 9

let grid

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col })),
  )
}

newGame()
```
