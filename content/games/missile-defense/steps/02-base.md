---
title: Your missile base
title_tr: Füze üssün
skills: [game.canvas]
---

# --goal--

In the middle stands your base: the place your interceptor missiles will fly from.

# --goal-tr--

Şehirlerin ortasında senin **füze üssün** duracak: önleyici füzelerini oradan fırlatacaksın. Yerini bir nesnede
tutuyoruz, çünkü ileride füzeler tam bu noktadan çıkacak.

# --code--

```js
const BASE = { x: 240, y: GROUND - 14 } // where your interceptors start

ctx.fillStyle = '#a3e635'
ctx.fillRect(BASE.x - 12, BASE.y, 24, 14)
```

# --meaning--

- `BASE` is an object: its `x` is the middle of the field, its `y` the top of the base (14 above the ground).
- The base is a 24×14 green block centered on `BASE.x`.

# --meaning-tr--

- `const BASE = { x: 240, y: GROUND - 14 }` → bir **nesne**: `x` alanın ortası (480 / 2), `y` üssün **üst**
  kenarı: zeminin 14 piksel üstü (356). Bir sabitin değerini hesaplarken başka bir sabiti (`GROUND`) kullanabiliriz.
- `//` sonrası bir **yorum**: bilgisayar okumaz, sana not.
- `ctx.fillRect(BASE.x - 12, BASE.y, 24, 14)` → 24 piksel eninde yeşil bir blok; `- 12` onu `BASE.x`'e ortalar.

# --task--

1. Under `const GROUND = 370` write the `BASE` line.
2. Under the city loop's closing `}`, write the two base lines.

# --task-tr--

1. `const GROUND = 370` satırının altına `BASE` satırını yaz.
2. Şehir döngüsünün kapanış `}`'inin hemen altına üssü çizen iki satırı yaz.
3. **Çalıştır**: ortada, iki şehir grubunun arasında yeşil bir blok görmelisin.

# --tests--

The base should be a 24×14 green block in the middle, standing on the ground.
tr: Üs, ortada zeminde duran 24×14 yeşil bir blok olmalı.

```js
assert.deepEqual(BASE, { x: 240, y: 356 })
assert.deepEqual($.rects('#a3e635').map((r) => [r.x, r.y, r.w, r.h]), [[228, 356, 24, 14]])
```

# --solution--

```js
// Missile defense, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 370
const BASE = { x: 240, y: GROUND - 14 } // where your interceptors start
const CITY_XS = [50, 110, 170, 310, 370, 430]

ctx.fillStyle = '#020617'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#854d0e'
ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

ctx.fillStyle = '#38bdf8'
for (const x of CITY_XS) {
  ctx.fillRect(x - 16, GROUND - 14, 32, 14)
}
ctx.fillStyle = '#a3e635'
ctx.fillRect(BASE.x - 12, BASE.y, 24, 14)
```
