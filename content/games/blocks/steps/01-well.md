---
title: The well
title_tr: Kuyu
skills: [game.canvas]
---

# --goal--

The pieces fall into a well 10 cells wide and 20 tall, each cell 24 pixels. We paint the page dark and the well a
little lighter; the space on the right is for the score later.

# --goal-tr--

Düşen blok oyununda (Tetris benzeri) parçalar bir **kuyuya** düşer: 10 hücre eninde, 20 hücre boyunda. Her hücre 24
piksel. Bu adımda sayfayı koyu renge, kuyuyu biraz daha açık renge boyayacağız. Sağda kalan boşluk ileride skor ve
sıradaki parça için.

Oyunu sayfadaki **canvas** (tuval) üstüne çiziyoruz: 360 piksel eninde, 480 piksel boyunda. Önce onu ve çizim
kalemini alıyoruz.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 10
const ROWS = 20
const CELL = 24

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#1e293b'
ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)
```

# --meaning--

- `canvas` is the page's canvas; `ctx` is its 2D drawing context.
- `COLS`, `ROWS` and `CELL` describe the well: 10 × 20 cells of 24 pixels.
- `fillStyle` picks a color and `fillRect(x, y, width, height)` fills a rectangle; `(0, 0)` is the top-left corner.
  The well is `COLS * CELL` = 240 pixels wide and `ROWS * CELL` = 480 tall.

# --meaning-tr--

- `document.getElementById('game')` → sayfada kimliği `game` olan canvas'ı bulur; `canvas.getContext('2d')` onun
  **2D çizim kalemini** verir. Adı `ctx`; her çizim satırı `ctx.` ile başlar.
- `const COLS = 10`, `ROWS = 20`, `CELL = 24` → kuyunun ölçüleri: 10 sütun, 20 satır, her hücre 24 piksel. Sayıları
  bir kez adlandırıp her yerde bu adları kullanacağız.
- `ctx.fillStyle = '#0f172a'` → dolgu rengi (çok koyu lacivert). `ctx.fillRect(x, y, en, boy)` → o renkle içi dolu
  bir dikdörtgen.
  - Canvas'ta `(0, 0)` **sol üst köşedir**; `x` sağa, `y` **aşağı** doğru büyür.
  - İlk dikdörtgen bütün canvas (`canvas.width` × `canvas.height`).
- İkinci dikdörtgen kuyu: `COLS * CELL` = 10 × 24 = **240** piksel eninde, `ROWS * CELL` = 20 × 24 = **480** piksel
  boyunda. `*` çarpma demek. Canvas 360 olduğu için sağda 120 piksellik bir **yan panel** kalır.

# --task--

Write the lines under the three comment lines, then press **Run**.

# --task-tr--

1. Editördeki üç yorum satırının **altına** kodu yaz; boş satırları da koddaki gibi bırak.
2. **Çalıştır**: solda uzun, biraz açık renkli bir kuyu, sağda koyu bir panel görmelisin.

# --hint--

The order matters: first the whole page, then the well on top of it.

# --hint-tr--

Sıra önemli: önce bütün sayfa, sonra onun üstüne kuyu.

# --tests--

The well should be 10 × 20 cells of 24 pixels.
tr: Kuyu 24 piksellik 10 × 20 hücre olmalı.

```js
assert.deepEqual([COLS, ROWS, CELL], [10, 20, 24])
```

The page and the well should be painted.
tr: Sayfa ve kuyu boyanmalı.

```js
assert.deepEqual($.rects('#0f172a'), [{ x: 0, y: 0, w: 360, h: 480, color: '#0f172a' }])
assert.deepEqual($.rects('#1e293b'), [{ x: 0, y: 0, w: 240, h: 480, color: '#1e293b' }])
```

# --seed--

```js
// Falling blocks, step by step.
// The page already has <canvas id="game" width="360" height="480"></canvas>.
// Write your code below.
```

# --solution--

```js
// Falling blocks, step by step.
// The page already has <canvas id="game" width="360" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 10
const ROWS = 20
const CELL = 24

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#1e293b'
ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)
```
