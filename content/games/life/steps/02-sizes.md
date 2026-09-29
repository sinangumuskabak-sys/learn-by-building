---
title: Measure the grid
title_tr: Izgarayı ölç
skills: [game.canvas]
---

# --goal--

The world is a grid of small cells: 60 columns and 48 rows of 8-pixel cells. We name these numbers once and paint
the grid's area a little lighter, leaving a strip at the top for text.

# --goal-tr--

Dünyamız küçük karelerden oluşan bir **ızgara**: her hücre 8 piksel, yan yana **60 sütun**, alt alta **48 satır**.
Üstte yazılar için 36 piksellik bir şerit bırakacağız.

Bu sayıları kodun her yerine tek tek yazmak yerine **bir kez ad veriyoruz**. Sonra ızgaranın kapladığı alanı biraz
daha açık bir renkle boyuyoruz; hücreler bu alanda yaşayacak.

# --code--

```js
const CELL = 8
const COLS = 60
const ROWS = 48
const TOP = 36

ctx.fillStyle = '#1e293b'
ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
```

# --meaning--

- `CELL` is the size of a cell in pixels, `COLS` and `ROWS` count the columns and rows, `TOP` is the strip above
  the grid.
- The grid area starts at `x = 0, y = TOP` and is `COLS * CELL` (480) wide and `ROWS * CELL` (384) tall. `*` means
  multiply.

# --meaning-tr--

- `const CELL = 8` → bir hücrenin boyu: 8 piksel.
- `const COLS = 60` → sütun sayısı (columns). `const ROWS = 48` → satır sayısı (rows).
- `const TOP = 36` → ızgaranın üstündeki boşluk. Oraya nesil sayısını yazacağız.
- Adlar büyük harfle yazıldı: bu, "oyun boyunca hiç değişmeyen ayar" demenin alışılmış yolu.
- `ctx.fillStyle = '#1e293b'` → biraz daha açık bir lacivert.
- `ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)` → ızgara alanı: sol kenardan (`0`), üstten `TOP` kadar aşağıdan
  başlar. `*` **çarpma** demek: genişlik 60 × 8 = **480**, yükseklik 48 × 8 = **384** piksel.
- Bu satırlar arka planın **altına** yazılır: canvas'ta sonra çizilen, öncekinin **üstüne** gelir.

# --task--

1. Under `const ctx = ...` leave an empty line and write the four constants.
2. At the very end, under the background lines, write the two `#1e293b` lines. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırının altında bir boş satır bırak ve dört sabiti (`CELL`, `COLS`, `ROWS`, `TOP`) yaz.
2. Dosyanın **en sonuna**, arka planı boyayan iki satırın hemen altına `#1e293b` ile başlayan iki satırı yaz.
3. **Çalıştır**: üstte ince koyu bir şerit, altında biraz daha açık renkli büyük bir alan görmelisin.

# --try--

Set `TOP` to `100` and run: the grid area slides down. Put `36` back.

# --try-tr--

`TOP`'u `100` yap ve çalıştır: ızgara alanı aşağı kayar. Sonra `36`'ya geri al.

# --tests--

The constants should be `CELL` 8, `COLS` 60, `ROWS` 48 and `TOP` 36.
tr: Sabitler `CELL` 8, `COLS` 60, `ROWS` 48 ve `TOP` 36 olmalı.

```js
assert.deepEqual([CELL, COLS, ROWS, TOP], [8, 60, 48, 36])
```

The grid area should be painted `#1e293b`, 480 by 384 pixels, starting 36 pixels from the top.
tr: Izgara alanı `#1e293b` ile boyanmalı: üstten 36 piksel aşağıdan başlayan 480×384'lük bir alan.

```js
assert.deepEqual($.rects('#1e293b'), [{ x: 0, y: 36, w: 480, h: 384, color: '#1e293b' }])
```

# --solution--

```js
// Game of Life, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 8
const COLS = 60
const ROWS = 48
const TOP = 36

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#1e293b'
ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
```
