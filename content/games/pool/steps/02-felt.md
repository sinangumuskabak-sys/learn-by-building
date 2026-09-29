---
title: The table
title_tr: Masa
skills: [game.canvas]
---

# --goal--

A pool table is a green rectangle, the **felt**, inside a brown frame, the **rails**. Four numbers name the edges of the
felt; everything else is measured from them.

# --goal-tr--

Bilardo masası kahverengi bir çerçevenin (**bantlar**) içinde yeşil bir dikdörtgendir (**çuha**). Çuhanın dört kenarını
adlandırıyoruz: `LEFT`, `TOP`, `RIGHT`, `BOTTOM`. Toplar bu kenarların arasında yuvarlanacak ve bantlara çarpacak;
her şeyi bu dört sayıya göre ölçeceğiz.

# --code--

```js
const LEFT = 20
const TOP = 40
const RIGHT = 460
const BOTTOM = 280

  ctx.fillStyle = '#78350f'
  ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)
```

# --meaning--

- The felt goes from x 20 to 460 and y 40 to 280: 440 × 240 pixels.
- The rails are a brown rectangle 12 pixels bigger on every side, drawn first; the felt is drawn over it.

# --meaning-tr--

- `LEFT = 20`, `RIGHT = 460` → çuhanın sol ve sağ kenarının x'i; `TOP = 40`, `BOTTOM = 280` → üst ve alt kenarın y'si.
- `ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)` → bantlar: çuhadan her yönde 12 piksel büyük
  kahverengi bir dikdörtgen. Sol üst köşesi 12 piksel dışarıda, eni ve boyu 2 × 12 = 24 fazla.
- `ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)` → çuha: sol üst köşesi `(LEFT, TOP)`, eni `RIGHT - LEFT` = 440,
  boyu `BOTTOM - TOP` = 240. Bantlardan **sonra** çizildiği için onların üstüne gelir; kahverengiden geriye yalnız 12
  piksellik bir çerçeve kalır.

# --task--

1. Under `const ctx = ...`, leave an empty line and write the four edges.
2. In `draw`, under the background `fillRect`, write the four lines. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırak ve dört kenarı yaz.
2. `draw` içinde arka planı boyayan `fillRect` satırının altına dört satırı yaz.
3. **Çalıştır**: kahverengi çerçeveli yeşil bir masa görmelisin.

# --tests--

The felt should fill the table between the edges.
tr: Çuha kenarların arasındaki masayı doldurmalı.

```js
$.tick(1)
assert.deepEqual([LEFT, TOP, RIGHT, BOTTOM], [20, 40, 460, 280])
assert.deepInclude($.rects('#15803d'), { x: 20, y: 40, w: 440, h: 240, color: '#15803d' })
```

The rails should be 12 pixels around the felt, under it.
tr: Bantlar çuhanın 12 piksel çevresinde, altında olmalı.

```js
$.tick(1)
assert.deepInclude($.rects('#78350f'), { x: 8, y: 28, w: 464, h: 264, color: '#78350f' })
const order = $.rects().map((r) => r.color)
assert.isBelow(order.indexOf('#78350f'), order.indexOf('#15803d'), 'rails first, then the felt')
```

# --solution--

```js
// Pool, step by step.
// The page already has <canvas id="game" width="480" height="340"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LEFT = 20
const TOP = 40
const RIGHT = 460
const BOTTOM = 280

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#78350f'
  ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
