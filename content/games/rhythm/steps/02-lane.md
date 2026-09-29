---
title: The first lane
title_tr: İlk şerit
skills: [game.canvas]
---

# --goal--

There are 4 lanes, 70 pixels wide, centred on the canvas. We name these numbers and draw the first lane as a tall
strip.

# --goal-tr--

Notalar **dört şeritte** kayacak; her şerit 70 piksel geniş. Dört şerit 4 × 70 = 280 piksel eder, canvas ise 400
piksel. Şeritleri ortalamak için soldan ve sağdan eşit boşluk bırakacağız: (400 − 280) ÷ 2 = **60** piksel.

Bu sayılara birer **ad** verip ilk şeridi yukarıdan aşağı uzanan bir şerit olarak çiziyoruz.

# --code--

```js
const LANES = 4
const LANE_W = 70
const LEFT = (canvas.width - LANES * LANE_W) / 2

ctx.fillStyle = '#1e293b'
ctx.fillRect(LEFT + 2, 0, LANE_W - 4, canvas.height)
```

# --meaning--

- `LANES` is the number of lanes, `LANE_W` their width, `LEFT` the empty space on the left: `(400 - 280) / 2 = 60`.
- The lane is drawn 2 pixels in from each side (`+ 2`, `- 4`), so neighbouring lanes have a thin gap.

# --meaning-tr--

- `const LANES = 4` → şerit sayısı. `const LANE_W = 70` → bir şeridin eni (width).
- Adlar büyük harfle yazıldı: bu, "oyun boyunca hiç değişmeyen ayar" demenin alışılmış yolu.
- `const LEFT = (canvas.width - LANES * LANE_W) / 2` → soldaki boşluk. **Parantez içi önce** hesaplanır:
  400 − 4 × 70 = 120; `/` **bölme**: 120 ÷ 2 = **60**. (`*` çarpma, çarpma da çıkarmadan önce yapılır.)
- `ctx.fillRect(LEFT + 2, 0, LANE_W - 4, canvas.height)` → şerit, `x = 62`'den başlar ve 66 piksel geniştir; yukarıdan
  (`0`) aşağıya kadar (`canvas.height`) uzanır. Her yandan 2 piksel içeri çekiyoruz ki yan yana şeritlerin arasında
  ince bir boşluk kalsın.

# --task--

1. Under `const ctx = ...` leave an empty line and write the three constants.
2. At the very end, under the background lines, write the two lane lines. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırının altında bir boş satır bırak ve üç sabiti (`LANES`, `LANE_W`, `LEFT`) yaz.
2. Dosyanın **en sonuna**, arka planı boyayan iki satırın altına şeridi çizen iki satırı yaz.
3. **Çalıştır**: solda, yukarıdan aşağı uzanan biraz daha açık renkli bir şerit görmelisin.

# --hint--

Mind the parentheses in `LEFT`: without them only `LANES * LANE_W` would be halved.

# --hint-tr--

`LEFT`'teki parantezlere dikkat: parantez olmazsa yalnız `LANES * LANE_W` ikiye bölünür.

# --tests--

`LANES` should be 4, `LANE_W` 70 and `LEFT` 60.
tr: `LANES` 4, `LANE_W` 70 ve `LEFT` 60 olmalı.

```js
assert.deepEqual([LANES, LANE_W, LEFT], [4, 70, 60])
```

The first lane should be a `#1e293b` strip from top to bottom, 2 pixels in from its sides.
tr: İlk şerit, yanlarından 2 piksel içeride, yukarıdan aşağı uzanan `#1e293b` bir şerit olmalı.

```js
assert.deepEqual($.rects('#1e293b'), [{ x: 62, y: 0, w: 66, h: 560, color: '#1e293b' }])
```

# --solution--

```js
// Rhythm game, step by step.
// The page already has <canvas id="game" width="400" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LANES = 4
const LANE_W = 70
const LEFT = (canvas.width - LANES * LANE_W) / 2

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#1e293b'
ctx.fillRect(LEFT + 2, 0, LANE_W - 4, canvas.height)
```
