---
title: From cell number to position
title_tr: Kutu numarasından konuma
skills: [prog.arrays]
---

# --goal--

The board array numbers the cells 0 to 8. To draw a mark we need the cell's center in pixels. Two small formulas
turn a cell number into a column and a row.

# --goal-tr--

Dizide kutular 0'dan 8'e **numaralı**. Ama çizmek için kutunun ortasının **piksel** olarak yerini bilmemiz lazım.
Sinemada koltuk numarasından sıra ve koltuğu bulmak gibi: iki küçük formül numarayı **sütun** ve **satıra** çevirir.

```
0 1 2      sütun = numara % 3
3 4 5      satır = Math.floor(numara / 3)
6 7 8
```

Bu adımda 7 numaralı kutuya X yazacağız.

# --code--

```js
const index = 7
const x = (index % 3) * CELL + CELL / 2
const y = Math.floor(index / 3) * CELL + CELL / 2
ctx.fillText('X', x, y)
```

# --meaning--

- `%` is the remainder: `7 % 3` is `1`, so cell 7 is in column 1.
- `Math.floor(7 / 3)` rounds `2.33` down to `2`, so it is in row 2.
- `* CELL` turns the column or row into pixels, `+ CELL / 2` moves to the middle of the cell: (150, 250).

# --meaning-tr--

- `const index = 7` → hangi kutu: 7 numara.
- `index % 3` → `%` **bölümden kalan** demek: 7'nin içinde iki tane 3 var, **1 artar**. Yani 7 numara **1. sütunda**
  (sütunlar da 0'dan sayılır: 0, 1, 2).
- `Math.floor(index / 3)` → `/` bölme: 7 / 3 = 2.33... `Math.floor(...)` sonucu **aşağı yuvarlar** (küsuratı atar):
  **2**. Yani 7 numara **2. satırda** (en alt satır).
- `* CELL` → sütunu/satırı piksele çevirir: 1 × 100 = 100, 2 × 100 = 200. Bu, kutunun **sol üst köşesi**.
- `+ CELL / 2` → yarım kutu (50) ekleyip kutunun **ortasına** geçer: x = 150, y = 250. Parantez içi önce hesaplanır,
  sonra çarpma ve bölme, en son toplama; matematikteki gibi.
- `ctx.fillText('X', x, y)` → X'i o noktaya yazar.

# --task--

In `draw`, replace `ctx.fillText('X', 50, 50)` with the four new lines. Press **Run**.

# --task-tr--

1. `draw` içindeki `ctx.fillText('X', 50, 50)` satırını sil.
2. Yerine dört yeni satırı yaz (hepsi iki boşluk içeride).
3. **Çalıştır** ve X'in nereye gittiğine bak.

# --predict--

Where will the X appear?
- [ ] Top right
- [ ] Middle of the right column
- [x] Bottom row, middle
  7 % 3 is 1 (column 1, the middle one) and Math.floor(7 / 3) is 2 (row 2, the bottom one).

# --predict-tr--

X nerede belirecek?
- [ ] Sağ üstte
- [ ] Sağ sütunun ortasında
- [x] En alt satırın ortasında
  7 % 3 = 1 (1. sütun, yani ortadaki) ve Math.floor(7 / 3) = 2 (2. satır, yani en alttaki).

# --try--

Try `const index = 5`, then `0`, then `8`, and guess each time before you run. Put `7` back.

# --try-tr--

`const index = 5`, sonra `0`, sonra `8` dene; her seferinde çalıştırmadan önce tahmin et. Sonra `7`'ye geri al.

# --tests--

The X should be drawn in the middle of cell 7, at (150, 250).
tr: X, 7 numaralı kutunun ortasına, (150, 250)'ye çizilmeli.

```js
const texts = $.screen().filter((c) => c.op === 'fillText')
assert.lengthOf(texts, 1)
assert.deepEqual(texts[0].args.slice(0, 3), ['X', 150, 250])
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100

let board = ['', '', '', '', '', '', '', '', '']

function draw() {
  ctx.fillStyle = '#1e1e2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#585b70'
  for (let i = 1; i < 3; i++) {
    ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
    ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
  }

  ctx.font = 'bold 64px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#f38ba8'
  const index = 7
  const x = (index % 3) * CELL + CELL / 2
  const y = Math.floor(index / 3) * CELL + CELL / 2
  ctx.fillText('X', x, y)
}

draw()
```
