---
title: Row and column
title_tr: Satır ve sütun
skills: [prog.arrays, prog.functions]
---

# --goal--

To draw position `i` we need its row and column. With `N` = 4 squares per row, the row is `i / N` rounded down, and the
column is the remainder of that division.

# --goal-tr--

Liste düz ama tahta 4×4. `i`. konumdaki taşı çizmek için onun **satırını** ve **sütununu** bilmeliyiz. Apartman
örneğinde: 6 numaralı daire kaçıncı katta, katın kaçıncı dairesi?

Cevap bölmede saklı: her satırda `N` = 4 kare var. `6 / 4` = 1,5 → aşağı yuvarla: **1. satır**. Bölümden kalan
`6 % 4` = 2 → **2. sütun**.

# --code--

```js
const N = 4 // 4 by 4: tiles 1 to 15 and one gap

const rowOf = (i) => Math.floor(i / N)
const colOf = (i) => i % N
```

# --meaning--

- `N` is the board size, named once.
- `(i) => ...` is a short function (an arrow function): given `i`, it gives back what is after the arrow.
- `Math.floor` rounds down: `6 / 4` is 1.5, so position 6 is in row 1.
- `%` is the remainder: `6 % 4` is 2, so position 6 is in column 2.

# --meaning-tr--

- `const N = 4` → tahtanın boyu: satır başına 4 kare. Sayıyı bir kez adlandırırız; her yerde `N` yazarız.
- `(i) => Math.floor(i / N)` → **ok fonksiyonu** (arrow function): fonksiyonun kısa yazılışı. `i` verilir, oktan
  (`=>`) sonrası **sonuçtur**. `rowOf(6)` → 1.
- `Math.floor(...)` → **aşağı yuvarlar**: 1,5 → 1.
- `i % N` → `%` **bölümden kalan**: 6'yı 4'e bölünce 2 artar. `colOf(6)` → 2.
- Bir ızgarayı tek listede tutmak çok yaygın: resimler de piksel piksel, satır satır böyle saklanır.

# --task--

1. Above `let tiles`, write the `N` line and leave an empty line.
2. Under `let tiles`, leave an empty line and write `rowOf` and `colOf`. Press **Run**.

# --task-tr--

1. `let tiles` satırının **üstüne** `N` satırını yaz; arada bir boş satır kalsın.
2. `let tiles` satırının altına bir boş satır bırakıp `rowOf` ve `colOf` satırlarını yaz.
3. **Çalıştır**. Ekran değişmez; kontroller hesabı deniyor.

# --predict--

Which row and column is position 13?
- [ ] Row 1, column 3
- [x] Row 3, column 1
  `13 / 4` is 3.25, rounded down 3; `13 % 4` is 1.
- [ ] Row 3, column 3

# --predict-tr--

13 numaralı konum hangi satırda, hangi sütunda?
- [ ] 1. satır, 3. sütun
- [x] 3. satır, 1. sütun
  `13 / 4` = 3,25 → aşağı yuvarla: 3. `13 % 4` = 1.
- [ ] 3. satır, 3. sütun

# --tests--

`rowOf` and `colOf` should find the row and column of a position.
tr: `rowOf` ve `colOf` bir konumun satırını ve sütununu bulmalı.

```js
assert.strictEqual(N, 4)
assert.deepEqual([rowOf(6), colOf(6)], [1, 2])
assert.deepEqual([rowOf(0), colOf(0)], [0, 0])
assert.deepEqual([rowOf(15), colOf(15)], [3, 3])
assert.deepEqual([rowOf(3), colOf(3)], [0, 3])
```

# --solution--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 4 // 4 by 4: tiles 1 to 15 and one gap

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

const rowOf = (i) => Math.floor(i / N)
const colOf = (i) => i % N

function reset() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
}

function draw() {
  ctx.fillStyle = '#292524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

reset()
draw()
```
