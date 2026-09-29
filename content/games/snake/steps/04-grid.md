---
title: Think in cells
title_tr: Hücrelerle düşün
skills: [game.canvas]
---

# --goal--

Snake moves on a grid: the 400-pixel board is 20 cells of 20 pixels each way. We name the cell size `CELL` and
draw one green cell: the snake's future head.

# --goal-tr--

Yılan piksel piksel değil, **kare kare** ilerler. Tahtayı 20×20 piksellik küçük karelere (hücrelere) bölüyoruz:
400 piksel ÷ 20 = her yönde **20 hücre**. Bir satranç tahtası gibi.

Bu adımda hücre boyuna bir ad veriyoruz ve tahtaya **tek bir yeşil kare** çiziyoruz. Bu kare yılanın başı olacak.

# --code--

```js
const CELL = 20

ctx.fillStyle = 'lime'
ctx.fillRect(5 * CELL, 5 * CELL, CELL, CELL)
```

# --meaning--

- `const CELL = 20` names the cell size once, so we never repeat the number 20.
- `5 * CELL` is 100: column 5 starts 100 pixels from the left, row 5 starts 100 pixels from the top.
- The last two `CELL`s make the square exactly one cell wide and tall.
- It comes after the background, so it is painted on top of it.

# --meaning-tr--

- `const CELL = 20` → hücre boyuna **CELL** adını verir. 20 sayısını her yere tek tek yazmak yerine bu adı
  kullanırız; bir gün hücreyi büyütmek istersen tek satırı değiştirmen yeter.
- `ctx.fillStyle = 'lime'` → rengi açık yeşil yapar.
- `5 * CELL` → `*` çarpma demek: 5 × 20 = 100. Yani **5. sütun** soldan 100. pikselden, **5. satır** yukarıdan
  100. pikselden başlar. (Sayma 0'dan başlar: ilk sütun 0. sütundur.)
- Sondaki `CELL, CELL` → karenin eni ve boyu: tam bir hücre.
- Bu satırlar arka planın **altına** yazılır, çünkü canvas'ta sonra çizilen öncekinin **üstüne** gelir.

# --task--

1. Under `const ctx = ...` leave an empty line and write `const CELL = 20`.
2. At the very end, leave an empty line and write the two `lime` lines. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırakıp `const CELL = 20` yaz.
2. Dosyanın **en sonuna**, bir boş satırdan sonra iki `lime` satırını yaz.
3. **Çalıştır**: koyu tahtada yeşil bir kare görmelisin.

# --hint--

If nothing green shows up, check that the `lime` lines are **below** the background lines: whatever is drawn later
covers what was drawn before.

# --hint-tr--

Yeşil kare görünmüyorsa `lime` satırlarının arka plan satırlarının **altında** olduğundan emin ol: sonra çizilen,
önce çizileni örter.

# --try--

Change `5 * CELL, 5 * CELL` to `0, 0`: the square jumps to the top-left corner. Then put it back.

# --try-tr--

`5 * CELL, 5 * CELL` yerine `0, 0` yaz: kare sol üst köşeye zıplar. Sonra geri al.

# --tests--

`CELL` should be `20`.
tr: `CELL` 20 olmalı.

```js
assert.strictEqual(CELL, 20)
```

A single lime 20×20 square should be drawn at pixel (100, 100).
tr: (100, 100) pikseline tek bir 20×20 yeşil kare çizilmeli.

```js
assert.deepEqual($.rects('lime'), [{ x: 100, y: 100, w: 20, h: 20, color: 'lime' }])
```

The square should be drawn on top of the background, not under it.
tr: Kare arka planın altında değil, üstünde çizilmeli.

```js
const order = $.screen().filter((c) => c.op === 'fillRect').map((c) => c.fill)
assert.deepEqual(order, ['#111', 'lime'])
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 20

ctx.fillStyle = '#111'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = 'lime'
ctx.fillRect(5 * CELL, 5 * CELL, CELL, CELL)
```
