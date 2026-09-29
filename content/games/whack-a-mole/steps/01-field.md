---
title: A green field
title_tr: Yeşil bir çayır
skills: [game.canvas]
---

# --goal--

We are building Whack-a-Mole: moles pop out of holes and you click them before they hide. First the field: get the
canvas, get its drawing pen, paint it green.

# --goal-tr--

**Köstebek Vurmaca** yapıyoruz: köstebekler deliklerden çıkıyor, saklanmadan önce onlara tıklıyorsun. Sonunda nasıl
olacağını **Bitmiş hâlini gör** ile görebilirsin.

İlk iş **çayır**: sayfadaki canvas'ı (tuvali) bul, çizim kalemini al ve her yeri yeşile boya.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#65a30d'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```

# --meaning--

- `getElementById('game')` finds the canvas; `getContext('2d')` gives the object with the drawing commands.
- `fillStyle` picks a color, `fillRect` fills a rectangle: here the whole canvas.

# --meaning-tr--

- `document.getElementById('game')` → sayfada kimliği `game` olan öğeyi (canvas'ı) bul; `const canvas` ona ad verir.
- `canvas.getContext('2d')` → canvas'ın **çizim kalemi**: bütün çizim komutları `ctx.` ile başlayacak.
- `ctx.fillStyle = '#65a30d'` → dolgu rengi: çimen yeşili.
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → sol üst köşeden (0, 0) başlayıp canvas'ın tam boyu kadar içi
  dolu bir dikdörtgen: bütün tuval.

# --task--

Write the lines under the comments, then press **Run**.

# --task-tr--

Satırları yorum satırlarının altına yaz ve **Çalıştır**'a bas: sağda yeşil bir alan görmelisin.

# --tests--

The whole canvas should be painted `#65a30d`.
tr: Canvas'ın tamamı `#65a30d` ile boyanmalı.

```js
assert.strictEqual(canvas, $.canvas)
assert.isTrue($.rects('#65a30d').some((r) => r.x === 0 && r.y === 0 && r.w === 360 && r.h === 400))
```

# --seed--

```js
// Whack-a-mole, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Whack-a-mole, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#65a30d'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
