---
title: The board
title_tr: Tahta
skills: [game.canvas]
---

# --goal--

2048 is played on a 4×4 board: slide the tiles, merge equal ones, reach 2048. First the measurements and an empty
board: a cream page with a square, brown board under a strip for the score.

# --goal-tr--

**2048**'i yapıyoruz: 4×4'lük bir tahtada numaralı karoları kaydırırsın, iki eşit karo çarpışınca birleşip iki katına
çıkar (2 + 2 → 4, 4 + 4 → 8...). Hedef **2048** karosunu yapmak.

İlk adımda ölçüleri koyup boş tahtayı çiziyoruz: krem renkli bir sayfa, üstte skor için bir şerit, altında kare,
kahverengi bir tahta.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4
const GAP = 12
const CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE // 85
const TOP = 60 // room for the score above the board

function draw() {
  ctx.fillStyle = '#faf8ef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#bbada0'
  ctx.fillRect(0, TOP, canvas.width, canvas.width)
}

draw()
```

# --meaning--

- `canvas` is the page's 400×460 canvas; `ctx` is its 2D drawing context (the "pen").
- `SIZE` cells per side, `GAP` pixels between cells. Across the 400-pixel width there are 5 gaps and 4 cells, so a
  cell is `(400 - 12 * 5) / 4 = 85` pixels.
- `fillStyle` picks a color and `fillRect(x, y, w, h)` fills a rectangle. The board is a square as wide as the canvas,
  starting `TOP` pixels down.

# --meaning-tr--

- `document.getElementById('game')` → sayfadaki canvas'ı bulur. `canvas.getContext('2d')` → onun **2D çizim
  bağlamını** (kalemini) verir; bütün çizim `ctx.` ile yapılır.
- `SIZE = 4` → tahtanın bir kenarındaki hücre sayısı. `GAP = 12` → hücreler arası boşluk.
- `CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE` → bir hücrenin boyu. 400 piksellik genişlikte **5 boşluk** (iki
  kenar ve üç ara) ve **4 hücre** var: (400 − 12 × 5) / 4 = **85**. Sayıyı elle yazmak yerine hesaplatıyoruz; `SIZE`
  değişirse hücre boyu kendiliğinden uyar.
- `TOP = 60` → tahtanın üstünde skor için bırakılan şerit.
- `ctx.fillStyle = ...` rengi seçer, `ctx.fillRect(x, y, en, boy)` dikdörtgeni boyar. `(0, 0)` sol üst köşedir;
  `y` aşağı doğru büyür.
- İlk dikdörtgen bütün sayfayı kremle boyar; ikincisi `y = TOP`'tan başlayan, canvas'ın **eni kadar** (400×400) kare
  tahta.
- `draw()` → çizimi yapan fonksiyonu çağırır. Bu oyunda sürekli dönen bir döngü olmayacak; ekran yalnız bir şey
  değişince yeniden çizilecek.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının **altına** yaz ve **Çalıştır**'a bas. Krem bir sayfa ve üstte boş bir şeridin
altında kahverengi, kare bir tahta görmelisin.

# --hint--

Mind the parentheses in `CELL`: `GAP * (SIZE + 1)` is 60, and the whole difference is divided by `SIZE`.

# --hint-tr--

`CELL`'deki parantezlere dikkat: `GAP * (SIZE + 1)` 60 eder ve farkın **tamamı** `SIZE`'a bölünür.

# --tests--

The measurements should be `SIZE` 4, `GAP` 12, `CELL` 85 and `TOP` 60.
tr: Ölçüler `SIZE` 4, `GAP` 12, `CELL` 85 ve `TOP` 60 olmalı.

```js
assert.deepEqual([SIZE, GAP, CELL, TOP], [4, 12, 85, 60])
```

The page should be cream and the board a 400×400 square below the strip.
tr: Sayfa krem, tahta da şeridin altında 400×400'lük bir kare olmalı.

```js
assert.deepInclude($.rects(), { x: 0, y: 0, w: 400, h: 460, color: '#faf8ef' })
assert.deepInclude($.rects(), { x: 0, y: 60, w: 400, h: 400, color: '#bbada0' })
```

# --seed--

```js
// 2048, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
```

# --solution--

```js
// 2048, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4
const GAP = 12
const CELL = (canvas.width - GAP * (SIZE + 1)) / SIZE // 85
const TOP = 60 // room for the score above the board

function draw() {
  ctx.fillStyle = '#faf8ef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#bbada0'
  ctx.fillRect(0, TOP, canvas.width, canvas.width)
}

draw()
```
