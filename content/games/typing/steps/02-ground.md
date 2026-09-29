---
title: The ground
title_tr: Zemin
skills: [game.canvas]
---

# --goal--

Words fall until they reach the ground, a thin red line 330 pixels from the top. Below it there will be room for an
on-screen keyboard.

# --goal-tr--

Kelimeler bir **zemine** kadar düşecek: yukarıdan 330 piksel aşağıda ince, koyu kırmızı bir çizgi. Çizginin altında
kalan yere ileride ekran klavyesi gelecek.

Zeminin yüksekliğine bir **ad** veriyoruz: `GROUND`. Bu sayıyı hem çizimde hem de "kelime yere değdi mi?" sorusunda
kullanacağız; iki yerde aynı sayıyı tek tek yazmak yerine tek bir ad.

# --code--

```js
const GROUND = 330 // words that fall past this line are gone

ctx.fillStyle = '#7f1d1d'
ctx.fillRect(0, GROUND + 4, canvas.width, 3)
```

# --meaning--

- `GROUND` names the height of the ground. The text after `//` is a comment.
- The line is 3 pixels tall and as wide as the canvas, just under `GROUND`.

# --meaning-tr--

- `const GROUND = 330` → zeminin yüksekliği. Satırın sonundaki `//` ile başlayan kısım bir **yorum**: kendimize not.
  Adı büyük harfle yazmak "oyun boyunca değişmeyen bir ayar" demenin alışılmış yolu.
- `ctx.fillStyle = '#7f1d1d'` → koyu kırmızı.
- `ctx.fillRect(0, GROUND + 4, canvas.width, 3)` → soldan başlayan, canvas'ın eni kadar uzun, **3 piksel** kalın bir
  şerit: bir çizgi. `GROUND + 4` → 334; kelimelerin harfleri çizginin hemen üstünde bitsin diye biraz aşağıda.

# --task--

1. Under `const ctx = ...` leave an empty line and write `GROUND`.
2. At the very end, write the two red lines.

# --task-tr--

1. `const ctx = ...` satırının altında bir boş satır bırak ve `GROUND` satırını yaz.
2. Dosyanın **en sonuna**, arka plan satırlarının altına kırmızı çizginin iki satırını yaz.
3. **Çalıştır**: ekranın üçte ikisi kadar aşağıda ince kırmızı bir çizgi görmelisin.

# --tests--

`GROUND` should be 330.
tr: `GROUND` 330 olmalı.

```js
assert.strictEqual(GROUND, 330)
```

A 3-pixel `#7f1d1d` line should cross the canvas at `GROUND + 4`.
tr: `GROUND + 4` yüksekliğinde canvas'ı boydan boya geçen 3 piksellik `#7f1d1d` bir çizgi olmalı.

```js
assert.deepEqual($.rects('#7f1d1d'), [{ x: 0, y: 334, w: 480, h: 3, color: '#7f1d1d' }])
```

# --solution--

```js
// Typing game, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 330 // words that fall past this line are gone

ctx.fillStyle = '#020617'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#7f1d1d'
ctx.fillRect(0, GROUND + 4, canvas.width, 3)
```
