---
title: Paint the table
title_tr: Masayı boya
skills: [game.canvas]
---

# --goal--

Pinball is drawn on a `<canvas>`, 400 pixels wide and 600 tall. We take hold of it, get its 2D drawing context and
paint the whole table dark.

# --goal-tr--

Pinball'u sayfadaki bir **canvas** (tuval) üstüne çizeceğiz: 400 piksel eninde, 600 piksel boyunda boş bir
dikdörtgen. Sağdaki uzun, koyu alan o.

İlk iş tuvali bulmak, sonra onun **çizim kalemini** almak ve bütün masayı koyu renge boyamak. Bir resme
başlamadan önce kâğıdı masaya koyup fırçayı eline almak gibi.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#0c0a09'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `document.getElementById('game')` finds the canvas whose id is `game`.
- `canvas.getContext('2d')` gives the 2D drawing tools; we call them `ctx`.
- `fillStyle` picks a color, `fillRect(x, y, width, height)` fills a rectangle. `(0, 0)` is the top-left corner,
  and `canvas.width` / `canvas.height` make it cover the whole canvas.

# --meaning-tr--

- `document.getElementById('game')` → sayfada kimliği (id) `game` olan öğeyi, yani canvas'ı bulur.
- `const canvas =` → bulunana **canvas** adını verir.
- `canvas.getContext('2d')` → canvas'ın **2D çizim kalemini** (context) ister. Adı `ctx`; bundan sonra her çizim
  satırı `ctx.` ile başlayacak.
- `ctx.fillStyle = '#0c0a09'` → dolgu rengini seçer: siyaha çok yakın, sıcak bir koyu renk.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir dikdörtgen çizer. Dört sayı: sol üst köşenin
  `x`'i ve `y`'si, sonra en ve boy.
  - Canvas'ta `(0, 0)` **sol üst köşedir**; `x` sağa, `y` **aşağı** doğru büyür.
  - `canvas.width` (400) ve `canvas.height` (600) tuvalin kendi boyu: dikdörtgen her yeri kaplar.

# --task--

Write the four lines under the three comment lines, then press **Run**.

# --task-tr--

1. Editördeki üç yorum satırının (`//` ile başlayanlar) **altına** ilk iki satırı yaz.
2. Bir boş satır bırak ve boyama satırlarını yaz.
3. **Çalıştır**'a bas: masa koyu renk olmalı, alttaki kontrol yeşile dönmeli.

# --hint--

Check the spelling: `getElementById` has a capital `E`, `B` and `I`; `getContext('2d')` needs the quotes.

# --hint-tr--

Yazımı kontrol et: `getElementById` içinde büyük `E`, `B` ve `I` var; `getContext('2d')` tırnaklarıyla yazılır.

# --tests--

The whole 400×600 table should be painted `#0c0a09`.
tr: 400×600'lük masanın tamamı `#0c0a09` ile boyanmalı.

```js
const full = $.rects('#0c0a09').filter((r) => r.x === 0 && r.y === 0 && r.w === 400 && r.h === 600)
assert.lengthOf(full, 1, 'fillRect(0, 0, canvas.width, canvas.height) with fillStyle #0c0a09')
```

# --seed--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#0c0a09'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
