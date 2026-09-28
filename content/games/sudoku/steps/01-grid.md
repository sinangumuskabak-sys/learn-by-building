---
title: A grid from a string
title_tr: Bir metinden ızgara
skills: [prog.arrays, game.canvas]
---

# --explanation--

Sudoku is a 9 by 9 grid split into nine 3 by 3 **boxes**. Every row, every column and every box must hold the digits 1 to 9
exactly once. Some digits are given; you fill in the rest.

A puzzle is easy to write down as **81 characters**, row after row, with `0` for an empty cell. That is how puzzles are
shared online, and it is easy to turn into a 2D array:

```js
grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
```

`PUZZLE.slice(r * 9, r * 9 + 9)` is row `r` as text, `[...text]` splits it into characters and `.map(Number)` turns `'5'` into
`5`.

We also remember which digits were **given**, in a second grid of `true`/`false`. The player will not be allowed to change
them, and they are drawn in bold so they look different from the player's own digits.

The thick lines are what make the boxes visible: every third line is thicker and darker. A line is just a thin `fillRect`,
centered on the border between two cells.

# --explanation-tr--

**Bu adımda:** bir Sudoku bulmacasını ekrana çizeceğiz. Sağda 9×9 beyaz karelerden bir ızgara, kalın çizgilerle
ayrılmış dokuz 3×3 kutu ve bulmacanın verdiği 30 koyu rakam göreceksin.

**Sudoku nedir?** 9×9'luk bir ızgara, dokuz tane 3×3 **kutuya** bölünmüş. Her satır, her sütun ve her kutu 1'den 9'a
kadar rakamları **birer kez** içermeli. Bazı rakamlar verilir, gerisini sen doldurursun.

**Kod nedir, nerede yazılır?** Soldaki kod panelindeki `game.js` dosyası, bilgisayara verdiğin talimatların
listesidir. Bilgisayar onları **yukarıdan aşağıya** okur ve yapar. `//` ile başlayan kısımlar **yorumdur**:
bilgisayar atlar, sadece insanlar için not.

**Canvas ve fırça.** Sayfada 460×560 piksellik bir resim alanı (`canvas`, kimliği `game`) var. Her şeyi onun
üstüne boyarız:

```js
const canvas = document.getElementById('game')  // kâğıdı bul
const ctx = canvas.getContext('2d')             // fırçayı (çizim bağlamı, context) al
```

`const ad = değer` bir şeye değişmeyen bir ad (**sabit**) verir; `let ad` içi sonradan değişebilen bir
**değişken** açar. Nokta (`.`) "bunun içindeki" demek; tırnak içindekiler **yazıdır**. Canvas'ta `(0, 0)` sol üst
köşedir; `x` sağa, `y` **aşağı** doğru büyür. `ctx.fillStyle = renk` fırçaya renk sürer, `ctx.fillRect(x, y, en,
boy)` dikdörtgen boyar, `ctx.fillText(yazı, x, y)` yazı yazar.

**Bulmaca bir yazı olarak.** Bulmacayı satır satır **81 karakterlik** bir yazı olarak yazarız; boş hücre `0`.
Bulmacalar internette de böyle paylaşılır. İlk 9 karakter ilk satır, sonraki 9 ikinci satır…

**Dizi (array) ve iki boyutlu ızgara.** Dizi köşeli parantez içinde bir listedir: `[5, 3, 0]`. Elemanlar **0'dan**
numaralanır. Izgara, satırlardan oluşan bir liste: `grid[0]` ilk satır, `grid[0][2]` ilk satırın üçüncü hücresi.
Kodda `r` satır (row), `c` sütun (column) numarasıdır.

```js
grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
```

Parça parça:

- `Array.from({ length: 9 }, ...)` 9 elemanlı bir liste yapar; her elemanı sağdaki fonksiyon üretir. O fonksiyon
  sırayı `r` (0, 1, … 8) olarak alır. `_` "bu parametreyi kullanmıyorum" demek.
- `(... ) => ...` kısa bir **fonksiyondur** (ok fonksiyonu): solundakileri al, sağındakini ver.
- `PUZZLE.slice(r * 9, r * 9 + 9)` yazının `r`. satırını keser (ör. `r = 1` → 9. ile 17. karakter arası).
- `[...yazı]` yazıyı tek tek karakterlere ayırıp listeye koyar: `'530'` → `['5', '3', '0']`.
- `.map(Number)` listedeki her elemanı `Number`'dan geçirir: `'5'` yazısı `5` sayısı olur.

**Verilen rakamları hatırlamak.** İkinci bir ızgara (`given`) her hücre için `true` (verildi) ya da `false` tutar.
Oyuncu verilenleri değiştiremeyecek ve onlar kalın yazılacak. `d !== 0` "`d` sıfır **değil** mi?" diye sorar.

**Döngüler.** `for (let r = 0; r < 9; r++) { ... }` sayan bir döngüdür: `r = 0`'dan başla, `r < 9` olduğu sürece
dön, her turdan sonra `r`'yi bir artır (`r++`). İç içe iki döngü 81 hücrenin hepsini gezer. `continue` o turun
geri kalanını atlayıp sonraki hücreye geçer (boş hücreye rakam yazmayız).

**Kısa `if`: `? :`.** `given[r][c] ? '#0f172a' : '#2563eb'` → "verildiyse koyu, değilse mavi".

**Kalın çizgiler.** Kutuları gösteren şey her üçüncü çizginin kalın ve koyu olmasıdır. `%` bölümden **kalanı**
verir: `6 % 3` → `0`, `7 % 3` → `1`. Yani `i % 3 === 0` "i, 3'e tam bölünüyor mu?" (0, 3, 6, 9). Çizgi ince bir
`fillRect`'tir; iki hücrenin sınırına ortalansın diye kalınlığının yarısı kadar geri kaydırılır.

# --task--

1. Add `SIZE = 48`, `LEFT = (canvas.width - 9 * SIZE) / 2`, `TOP = 56` and the puzzle:
   `PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'`.
2. In `reset()`, build `grid` from `PUZZLE`, and `given`: `true` where the digit is not `0`.
3. Each frame fill the canvas with `'#f8fafc'`, draw each cell as a white 48 by 48 square, and its digit (if not `0`) in the
   middle: `'bold 26px sans-serif'` in `'#0f172a'` for given digits, `'26px sans-serif'` in `'#2563eb'` for the others,
   centered at `y + SIZE / 2 + 9`.
4. Draw the 10 lines each way: width 3 in `'#0f172a'` when `i % 3 === 0`, otherwise width 1 in `'#94a3b8'`.

# --task-tr--

1. Kod panelinde en alttaki `// Write your code below.` satırının **altına** tıkla ve şunları yaz:

   ```js
   const canvas = document.getElementById('game')
   const ctx = canvas.getContext('2d')

   const SIZE = 48
   const LEFT = (canvas.width - 9 * SIZE) / 2
   const TOP = 56

   // The puzzle, row by row; 0 is an empty cell.
   const PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'

   let grid // grid[r][c]: 1 to 9, or 0 for an empty cell
   let given // given[r][c]: true for the puzzle's own digits, which cannot be changed
   ```

   `SIZE` bir hücrenin piksel boyu. `LEFT` ızgarayı yatayda ortalar: (460 − 9 × 48) / 2 = 14. `TOP` üstten boşluk.
   Bulmaca yazısını kopyalayıp yapıştırmak en güvenlisi.

2. Bir satır boşluk bırakıp bulmacayı ızgaraya çeviren fonksiyonu yaz:

   ```js
   function reset() {
     grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
     given = grid.map((row) => row.map((d) => d !== 0))
   }
   ```

   İkinci satır her satırın her rakamını `true`/`false`'a çevirir.

3. Altına çizim fonksiyonunu yaz:

   ```js
   function draw() {
     ctx.fillStyle = '#f8fafc'
     ctx.fillRect(0, 0, canvas.width, canvas.height)

     for (let r = 0; r < 9; r++) {
       for (let c = 0; c < 9; c++) {
         const x = LEFT + c * SIZE
         const y = TOP + r * SIZE
         ctx.fillStyle = '#ffffff'
         ctx.fillRect(x, y, SIZE, SIZE)
         if (grid[r][c] === 0) continue
         ctx.fillStyle = given[r][c] ? '#0f172a' : '#2563eb'
         ctx.font = (given[r][c] ? 'bold ' : '') + '26px sans-serif'
         ctx.textAlign = 'center'
         ctx.fillText(String(grid[r][c]), x + SIZE / 2, y + SIZE / 2 + 9)
       }
     }
     // Thin lines between cells, thick ones around each box.
     for (let i = 0; i <= 9; i++) {
       ctx.fillStyle = i % 3 === 0 ? '#0f172a' : '#94a3b8'
       const w = i % 3 === 0 ? 3 : 1
       ctx.fillRect(LEFT + i * SIZE - w / 2, TOP, w, 9 * SIZE)
       ctx.fillRect(LEFT, TOP + i * SIZE - w / 2, 9 * SIZE, w)
     }
   }
   ```

   Her hücre önce beyaz boyanır, boş değilse ortasına rakamı yazılır (`String(...)` sayıyı yazıya çevirir,
   `textAlign = 'center'` yazıyı `x`'e ortalar, `+ 9` rakamı dikeyde ortaya indirir). Sonra 10 dikey ve 10 yatay
   çizgi çizilir: 3'e bölünenler 3 piksel kalın ve koyu, diğerleri 1 piksel ve açık gri.

4. Altına oyun döngüsünü ve başlatan satırları yaz:

   ```js
   function loop() {
     draw()
     requestAnimationFrame(loop)
   }

   reset()
   requestAnimationFrame(loop)
   ```

   `requestAnimationFrame(loop)` tarayıcıdan "bir sonraki karede `loop`'u çalıştır" ister; `loop` her seferinde
   çizip kendini yeniden ister. Böylece ekran saniyede ~60 kez güncellenir.

5. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Sağda kalın çizgilerle dokuz kutuya bölünmüş bir ızgara ve ilk
   satırda 5, 3, 7 gibi koyu rakamlar görmelisin. Alttaki kontrollerin hepsi yeşil olmalı. Rakamlar yanlış yerdeyse
   `PUZZLE` yazısını karakter karakter karşılaştır.

# --tests--

The grid should be read from the puzzle string, and the given digits remembered.
tr: Izgara bulmaca metninden okunmalı ve verilen rakamlar hatırlanmalı.

```js
assert.lengthOf(grid, 9)
assert.deepEqual(grid[0], [5, 3, 0, 0, 7, 0, 0, 0, 0])
assert.deepEqual(grid[8], [0, 0, 0, 0, 8, 0, 0, 7, 9])
assert.isTrue(given[0][0])
assert.isFalse(given[0][2])
assert.isTrue(given[8][8])
```

The 30 given digits should be drawn, row by row.
tr: Verilen 30 rakam satır satır çizilmeli.

```js
$.tick(1)
const digits = $.texts()
assert.lengthOf(digits, 30, 'the 30 digits of the puzzle')
assert.deepEqual(digits.slice(0, 5), ['5', '3', '7', '6', '1'])
```

There should be 81 white cells, four thick lines and six thin lines each way.
tr: 81 beyaz hücre, her yönde dört kalın ve altı ince çizgi olmalı.

```js
$.tick(1)
const thick = $.rects('#0f172a').filter((r) => r.w === 3 || r.h === 3)
assert.lengthOf(thick, 8, 'four thick lines each way')
assert.lengthOf($.rects('#94a3b8'), 12, 'six thin lines each way')
assert.lengthOf($.rects('#ffffff').filter((r) => r.w === 48 && r.h === 48), 81)
```

# --seed--

```js
// Sudoku, step by step.
// The page already has <canvas id="game" width="460" height="560"></canvas>.
// Write your code below.
```

# --solution--

```js
// Sudoku, step by step.
// The page already has <canvas id="game" width="460" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 48
const LEFT = (canvas.width - 9 * SIZE) / 2
const TOP = 56

// The puzzle, row by row; 0 is an empty cell.
const PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'

let grid // grid[r][c]: 1 to 9, or 0 for an empty cell
let given // given[r][c]: true for the puzzle's own digits, which cannot be changed

function reset() {
  grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
  given = grid.map((row) => row.map((d) => d !== 0))
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x, y, SIZE, SIZE)
      if (grid[r][c] === 0) continue
      ctx.fillStyle = given[r][c] ? '#0f172a' : '#2563eb'
      ctx.font = (given[r][c] ? 'bold ' : '') + '26px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(grid[r][c]), x + SIZE / 2, y + SIZE / 2 + 9)
    }
  }
  // Thin lines between cells, thick ones around each box.
  for (let i = 0; i <= 9; i++) {
    ctx.fillStyle = i % 3 === 0 ? '#0f172a' : '#94a3b8'
    const w = i % 3 === 0 ? 3 : 1
    ctx.fillRect(LEFT + i * SIZE - w / 2, TOP, w, 9 * SIZE)
    ctx.fillRect(LEFT, TOP + i * SIZE - w / 2, 9 * SIZE, w)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
