---
title: The first grid line
title_tr: İlk ızgara çizgisi
skills: [game.canvas]
---

# --goal--

The board is 3×3 cells of 100 pixels. We name the cell size `CELL` and draw the first grid line: a thin gray
rectangle standing on the border between the first and second column.

# --goal-tr--

Tahta 3×3 hücreden (kutudan) oluşur: 300 piksel ÷ 3 = her hücre **100 piksel**. Bu sayıya bir ad veriyoruz: `CELL`.

Sonra ilk çizgiyi çiziyoruz. Çizgi çizmenin en kolay yolu **ince bir dikdörtgen**: 4 piksel eninde, tahta boyunda.
Bu çizgi birinci ve ikinci sütunun arasında, yani `x = 100`'de duracak.

# --code--

```js
const CELL = 100

ctx.fillStyle = '#585b70'
ctx.fillRect(CELL - 2, 0, 4, canvas.height)
```

# --meaning--

- `const CELL = 100` names the cell size once, so we never repeat the number 100.
- `CELL - 2` is 98: a 4 pixel line that starts 2 pixels early is centered on `x = 100`.
- `4, canvas.height` make it 4 pixels wide and as tall as the board.

# --meaning-tr--

- `const CELL = 100` → hücre boyuna **CELL** adını verir. Sayılar tırnaksız yazılır. Artık `CELL` yazdığın her
  yerde bilgisayar `100` anlar; bir gün tahtayı büyütmek istersen tek satırı değiştirmen yeter.
- `ctx.fillStyle = '#585b70'` → rengi griye çevirir.
- `CELL - 2` → `-` çıkarma demek: 100 − 2 = **98**. Çizgi 4 piksel kalın; 2 piksel erken başlarsa tam `x = 100`'ün
  **ortasına** oturur (98'den 102'ye).
- `0` → yukarıdan başlar. `4, canvas.height` → 4 piksel en, tahta boyunda (300) yükseklik.
- Bu satırlar arka planın **altına** yazılır: canvas'ta sonra çizilen, öncekinin **üstüne** gelir.

# --task--

1. Under `const ctx = ...` leave an empty line and write `const CELL = 100`.
2. At the very end, leave an empty line and write the two gray lines. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırakıp `const CELL = 100` yaz.
2. Dosyanın **en sonuna**, bir boş satırdan sonra iki gri satırı yaz.
3. **Çalıştır**: koyu tahtanın ortasına yakın, soldan üçte birlik yerde dikey gri bir çizgi görmelisin.

# --hint--

If you see no line, check that the gray lines come **after** the background lines.

# --hint-tr--

Çizgi görünmüyorsa gri satırların arka plan satırlarının **altında** olduğundan emin ol: sonra çizilen önce çizileni örter.

# --try--

Change `4` to `20` and run: a thick bar. Put `4` back.

# --try-tr--

`4` yerine `20` yaz ve çalıştır: kalın bir sütun olur. Sonra `4`'e geri al.

# --tests--

`CELL` should be `100`.
tr: `CELL` 100 olmalı.

```js
assert.strictEqual(CELL, 100)
```

One gray vertical line should stand on `x = 100`.
tr: `x = 100` üzerinde dikey tek bir gri çizgi olmalı.

```js
assert.deepEqual($.rects('#585b70'), [{ x: 98, y: 0, w: 4, h: 300, color: '#585b70' }])
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100

ctx.fillStyle = '#1e1e2e'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#585b70'
ctx.fillRect(CELL - 2, 0, 4, canvas.height)
```
