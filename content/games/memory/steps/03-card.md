---
title: One card
title_tr: Bir kart
skills: [game.canvas]
---

# --goal--

The board is 4×4 cards of 85 pixels with 12 pixel gaps, below a 40 pixel strip for the move counter. We name those
sizes and draw the first card, face down: a plain purple square.

# --goal-tr--

Tahta 4×4 = 16 karttan oluşacak. Her kart 85 piksel, aralarında ve kenarlarda 12 piksel boşluk olacak. En üstte hamle
sayacı için 40 piksellik bir şerit kalacak.

Bu sayılara **ad** veriyoruz ki kodda `85` yerine `CARD` yazalım: hem okunur olur, hem de değiştirmek istersen tek bir
yeri değiştirirsin. Sonra ilk kartı çiziyoruz: **kapalı** kart, düz mor bir kare.

# --code--

```js
const SIZE = 4 // cards per row and per column
const CARD = 85
const GAP = 12
const TOP = 40 // room for the move counter above the cards

ctx.fillStyle = '#6366f1'
ctx.fillRect(GAP, TOP + GAP, CARD, CARD)
```

# --meaning--

- `SIZE` cards per row and column, `CARD` the card size, `GAP` the space between cards, `TOP` the strip at the top.
- The numbers fit exactly: four 85 px cards and five 12 px gaps make 400, the canvas width.
- The first card starts one gap from the left (`GAP`) and one gap below the strip (`TOP + GAP`).

# --meaning-tr--

- `const SIZE = 4` → bir satırda (ve bir sütunda) 4 kart.
- `const CARD = 85` → kartın eni ve boyu. `const GAP = 12` → kartlar arasındaki boşluk.
- `const TOP = 40` → üstte hamle sayacına ayrılan şerit.
- Sayılar tam sığacak şekilde seçildi: dört 85'lik kart ve beş 12'lik boşluk `4 × 85 + 5 × 12 = 400` eder, yani
  canvas'ın eni.
- `ctx.fillStyle = '#6366f1'` → mor: kartların **arka yüzü**.
- `ctx.fillRect(GAP, TOP + GAP, CARD, CARD)` → soldan bir boşluk (12), şeridin bir boşluk altından (52) başlayan,
  85×85'lik kare.
- Kapalı kartların hepsi aynı düz kare olacak: oyunun bütün amacı da bu.

# --task--

1. Under `const ctx = ...`, leave an empty line and write the four constants.
2. At the very end, leave an empty line and write the two purple lines. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırak ve dört sabiti yaz.
2. Dosyanın **en sonuna**, bir boş satırdan sonra iki mor satırı yaz.
3. **Çalıştır**: sol üstte mor bir kare görmelisin.

# --hint--

The card lines must come after the background, otherwise the background covers them.

# --hint-tr--

Kart satırları arka plan satırlarının **altında** olmalı; yoksa arka plan kartı örter.

# --tests--

The sizes should be 4, 85, 12 and 40.
tr: Ölçüler 4, 85, 12 ve 40 olmalı.

```js
assert.deepEqual([SIZE, CARD, GAP, TOP], [4, 85, 12, 40])
```

One face-down card should be drawn at (12, 52).
tr: (12, 52)'ye tek bir kapalı kart çizilmeli.

```js
assert.deepEqual($.rects('#6366f1'), [{ x: 12, y: 52, w: 85, h: 85, color: '#6366f1' }])
```

# --solution--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4 // cards per row and per column
const CARD = 85
const GAP = 12
const TOP = 40 // room for the move counter above the cards

ctx.fillStyle = '#1e1b4b'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#6366f1'
ctx.fillRect(GAP, TOP + GAP, CARD, CARD)
```
