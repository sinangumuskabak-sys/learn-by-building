---
title: Draw what the board holds
title_tr: Tahtada ne varsa çiz
skills: [prog.arrays, prog.loops]
---

# --goal--

Now the drawing reads the board array: for every cell, if it holds a mark, write that mark in its center. The board
is empty, so the X disappears, and that is correct.

# --goal-tr--

X'i elle koymak yerine artık **tahtaya bakarak** çizeceğiz: dizideki her kutu için, kutu doluysa içindeki işareti
kutunun ortasına yaz.

Bu, oyun yazmanın en önemli fikri: **durum** (tahtada ne var) ayrı, **çizim** (onu göstermek) ayrı. Çizim sadece
durumu okur.

# --code--

```js
board.forEach((mark, index) => {
  if (mark === '') return
  const x = (index % 3) * CELL + CELL / 2
  const y = Math.floor(index / 3) * CELL + CELL / 2
  ctx.fillText(mark, x, y)
})
```

# --meaning--

- `board.forEach(...)` runs the small function once for every cell, giving it the cell's content (`mark`) and its
  number (`index`).
- `(mark, index) => { ... }` is a short way to write a function.
- `if (mark === '') return` skips empty cells: `===` asks "is it equal?", `return` leaves the function at once.
- `x` and `y` are the same formulas as before; `fillText(mark, ...)` writes whatever the cell holds.

# --meaning-tr--

- `board.forEach(...)` → "dizinin **her elemanı için** şunu yap". 9 kutu = 9 tur.
- `(mark, index) => { ... }` → her turda çalışan küçük bir **fonksiyon**. `=>` (ok) fonksiyon yazmanın kısa yolu.
  Parantezdeki adlara **parametre** denir: `mark` kutunun içeriği (`'X'`, `'O'` ya da `''`), `index` kutunun numarası.
  Önceki adımdaki `const index = 7`'ye artık gerek yok; numarayı `forEach` veriyor.
- `if (mark === '') return` → `if` "**eğer**" demek. `===` "tam olarak eşit mi?" diye sorar. "Kutu boşsa `return`:
  bu kutu için fonksiyondan hemen çık, sıradakine geç."
- `const x`, `const y` → önceki adımın formülleri, şimdi her kutu için.
- `ctx.fillText(mark, x, y)` → `'X'` değil, kutuda **ne varsa** onu yaz.
- Sondaki `})` → `}` küçük fonksiyonu, `)` ise `forEach(` parantezini kapatır.

# --task--

In `draw`, replace the four lines (from `const index = 7` to `ctx.fillText('X', x, y)`) with the `forEach` block.
Keep the `fillStyle` line above it. Press **Run**.

# --task-tr--

1. `draw` içinde `const index = 7` satırından `ctx.fillText('X', x, y)` satırına kadar dört satırı sil.
2. Yerine `forEach` bloğunu yaz. İçindeki satırlar dört boşluk içeride.
3. `ctx.fillStyle = '#f38ba8'` satırı yerinde kalsın.
4. **Çalıştır**.

# --predict--

The board array is still all `''`. What will you see after Run?
- [x] An empty grid: the X is gone
  Every cell is empty, so every turn of the loop returns before writing anything.
- [ ] An X in every cell
- [ ] The X from before, in cell 7

# --predict-tr--

`board` dizisinde hâlâ hep `''` var. Çalıştır'a basınca ne göreceksin?
- [x] Boş bir ızgara: X kayboldu
  Bütün kutular boş; döngünün her turu bir şey yazmadan `return` ile çıkıyor.
- [ ] Her kutuda bir X
- [ ] Önceki X, 7 numaralı kutuda

# --hint--

Watch the ending `})`: `}` closes the small function, `)` closes `forEach(`.

# --hint-tr--

Sondaki `})`'ye dikkat: `}` küçük fonksiyonu, `)` ise `forEach(` parantezini kapatır.

# --try--

Change the first `''` in `board` to `'X'` and the fifth to `'O'`, then run. Put them back to `''`.

# --try-tr--

`board` dizisindeki ilk `''`'yi `'X'`, beşinciyi `'O'` yapıp çalıştır. Sonra ikisini de `''`'ye geri al, yoksa kontroller kırmızı kalır.

# --tests--

`draw()` should write each mark in the middle of its cell.
tr: `draw()` her işareti kendi kutusunun ortasına yazmalı.

```js
board = ['X', '', '', '', 'O', '', '', '', 'X']
draw()
const marks = $.screen().filter((c) => c.op === 'fillText').map((c) => c.args.slice(0, 3))
assert.sameDeepMembers(marks, [['X', 50, 50], ['O', 150, 150], ['X', 250, 250]])
```

Empty cells should draw nothing.
tr: Boş kutular için hiçbir şey çizilmemeli.

```js
board = ['', '', '', '', '', '', '', '', '']
draw()
assert.deepEqual($.texts(), [])
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
  board.forEach((mark, index) => {
    if (mark === '') return
    const x = (index % 3) * CELL + CELL / 2
    const y = Math.floor(index / 3) * CELL + CELL / 2
    ctx.fillText(mark, x, y)
  })
}

draw()
```
