---
title: Nine holes
title_tr: Dokuz delik
skills: [prog.loops, prog.arrays]
---

# --goal--

The field has 3 × 3 holes. We work out where each hole's middle is and keep them all in a list.

# --goal-tr--

Çayırda **3 × 3 = 9** delik var. Her deliğin **ortasının** nerede olduğunu hesaplayıp hepsini bir **listede**
tutacağız. Çizmek bir sonraki adımda.

Tahtayı 120 piksellik karelere bölüyoruz; her delik kendi karesinin ortasında. En üstte skor ve süre için 40 piksel
boş yer bırakıyoruz.

# --code--

```js
const SIZE = 3 // holes per row and per column
const CELL = 120
const TOP = 40 // room for the score and timer
const HOLE_R = 40

const holes = []
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2 })
  }
}
```

# --meaning--

- The constants name the numbers once: 3 holes a side, 120-pixel squares, a 40-pixel bar on top, holes of radius 40.
- Two nested loops visit every row and, inside it, every column: 9 turns in all.
- Each turn adds the middle of that square to `holes`.

# --meaning-tr--

- `const SIZE = 3` ... → sayıları bir kez adlandırıyoruz: kenar başına 3 delik, 120 piksellik kareler, üstte 40
  piksellik şerit, deliklerin yarıçapı 40.
- `const holes = []` → boş bir **dizi** (liste).
- `for (let row = 0; row < SIZE; row++)` → **döngü**: `row` 0'dan başlar, 3'ten küçük olduğu sürece her turda 1 artar
  (0, 1, 2).
- İçindeki ikinci döngü her satır için sütunları dolaşır: iç içe iki döngü = 3 × 3 = **9 tur**.
- `col * CELL + CELL / 2` → karenin sol kenarı artı yarım kare: ortası. 0. sütun 60, 1. sütun 180, 2. sütun 300.
- `TOP + row * CELL + CELL / 2` → aynısı yukarıdan, üst şerit kadar aşağıdan başlayarak.
- `holes.push({ x, y })` → deliğin ortasını listeye **ekle**.

# --task--

Write the constants and the loops under `const ctx = ...`, after an empty line.

# --task-tr--

`const ctx = ...` satırının altına bir boş satır bırakıp sabitleri ve döngüleri yaz. **Çalıştır** (ekran değişmez).

# --predict--

In which order do the holes go into the list?
- [x] Row by row: the whole top row first
  The outer loop is the row; the inner loop goes through the columns of that row.
- [ ] Column by column
- [ ] Randomly

# --predict-tr--

Delikler listeye hangi sırayla girer?
- [x] Satır satır: önce bütün üst satır
  Dıştaki döngü satır; içteki o satırın sütunlarını dolaşır.
- [ ] Sütun sütun
- [ ] Rastgele

# --tests--

There should be 9 holes, row by row.
tr: Satır satır 9 delik olmalı.

```js
assert.lengthOf(holes, 9)
assert.deepEqual(holes[0], { x: 60, y: 100 })
assert.deepEqual(holes[1], { x: 180, y: 100 })
assert.deepEqual(holes[8], { x: 300, y: 340 })
```

# --solution--

```js
// Whack-a-mole, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 3 // holes per row and per column
const CELL = 120
const TOP = 40 // room for the score and timer
const HOLE_R = 40

const holes = []
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2 })
  }
}

ctx.fillStyle = '#65a30d'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
