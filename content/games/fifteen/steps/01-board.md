---
title: A board in one list
title_tr: Tek listede bir tahta
skills: [prog.arrays]
---

# --goal--

The 15 puzzle: fifteen numbered tiles and one gap on a 4 by 4 board; slide tiles into the gap until they are in order.
The board is kept in one flat array of 16 numbers, read row by row, with `0` for the gap.

# --goal-tr--

**15 bulmacası**: 4×4'lük bir tahtada 1'den 15'e numaralı taşlar ve bir **boşluk**. Boşluğun yanındaki taşları
kaydırarak sayıları yeniden sıraya dizersin.

Tahta 4×4 ama onu **tek sıralı bir listede** tutacağız: 16 sayı, satır satır okunur; boşluk `0`. Bir apartmanın
dairelerini kat kat numaralamak gibi: 0-3 üst kat, 4-7 bir alt kat...

```
konum:   0  1  2  3        taşlar:  1  2  3  4
         4  5  6  7                 5  6  7  8
         8  9 10 11                 9 10 11 12
        12 13 14 15                13 14 15  _
```

Ekranda henüz bir şey değişmeyecek; önce tahtanın bilgisi.

# --code--

```js
let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

function reset() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
}

reset()
```

# --meaning--

- `let tiles` makes a variable; the comment says what it holds.
- `[1, 2, ..., 15, 0]` is an array: an ordered list. `tiles[0]` is the first item (1), `tiles[15]` the last (0, the gap).
- `reset()` puts the board in order. Later it will also shuffle it. The last line calls it.

# --meaning-tr--

- `let tiles` → bir **değişken**: değeri sonradan değişebilen bir ad. Satır sonundaki `//` bir **yorum**: bilgisayar
  atlar, bize ne tuttuğunu anlatır.
- `[1, 2, 3, ..., 15, 0]` → bir **dizi** (array): köşeli parantez içinde, virgülle ayrılmış **sıralı bir liste**.
  `tiles[0]` ilk eleman (1); sayma **0'dan** başlar, `tiles[15]` sonuncusu (0, yani boşluk).
- `function reset() { ... }` → bir **fonksiyon**: "reset deyince süslü parantez içini yap". Tahtayı sıraya dizer;
  ileride karıştırmayı da o yapacak.
- En alttaki `reset()` → fonksiyonu **çağırır**: şimdi çalıştır.

# --task--

Write the lines under the three comment lines, then press **Run**.

# --task-tr--

Satırları editördeki üç yorum satırının (`//` ile başlayanlar) **altına** yaz; aralardaki boş satırlarla birlikte.
**Çalıştır**'a bas. Ekran değişmez, alttaki kontrol yeşil olmalı.

# --tests--

`tiles` should hold 1 to 15 in order, then the gap (0).
tr: `tiles` sırayla 1'den 15'e, sonra boşluğu (0) tutmalı.

```js
assert.deepEqual(tiles, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])
```

# --seed--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
```

# --solution--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

function reset() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
}

reset()
```
