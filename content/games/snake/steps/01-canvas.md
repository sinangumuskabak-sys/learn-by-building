---
title: Get a canvas to draw on
title_tr: Çizim yapacağın canvas'ı al
skills: [game.canvas]
---

# --explanation--

Almost every 2D browser game draws on a `<canvas>`: a rectangle of pixels that you paint with JavaScript. The page
already contains one:

```html
<canvas id="game" width="400" height="400"></canvas>
```

To draw on it you need two things:

1. **The element**, found by its id: `document.getElementById('game')`.
2. **Its 2D drawing context**, `canvas.getContext('2d')`. The context is your paintbrush: it has methods like
   `fillRect`, `fillText` and `arc`, and settings like `fillStyle` (the current color).

Drawing is two moves: pick a color, then paint a shape.

```js
ctx.fillStyle = 'orange'      // pick a color
ctx.fillRect(10, 20, 50, 30)  // x, y, width, height
```

Coordinates start at the **top-left** corner: `x` grows to the right, `y` grows **downwards**.

# --explanation-tr--

Tarayıcıdaki 2D oyunların neredeyse hepsi bir `<canvas>` üzerine çizilir: JavaScript ile boyadığın piksellerden
oluşan bir dikdörtgen. Sayfada zaten bir tane var:

```html
<canvas id="game" width="400" height="400"></canvas>
```

Üzerine çizmek için iki şey gerekir:

1. **Elemanın kendisi**, id'siyle bulunur: `document.getElementById('game')`.
2. **2D çizim bağlamı** (context), `canvas.getContext('2d')`. Bağlam senin fırçandır: `fillRect`, `fillText`, `arc`
   gibi metotları ve `fillStyle` (o anki renk) gibi ayarları vardır.

Çizim iki hamledir: önce rengi seç, sonra şekli boya.

```js
ctx.fillStyle = 'orange'      // rengi seç
ctx.fillRect(10, 20, 50, 30)  // x, y, genişlik, yükseklik
```

Koordinatlar **sol üst** köşeden başlar: `x` sağa doğru, `y` ise **aşağı doğru** büyür.

# --task--

1. Store the canvas element in a constant named `canvas`.
2. Store its 2D context in a constant named `ctx`.
3. Paint the whole board dark: set `ctx.fillStyle` to `'#111'` and fill a rectangle from `(0, 0)` that is
   `canvas.width` wide and `canvas.height` tall.

Press **Run** to see the result on the right.

# --task-tr--

1. Canvas elemanını `canvas` adlı bir sabitte tut.
2. 2D bağlamını `ctx` adlı bir sabitte tut.
3. Tahtanın tamamını koyu renge boya: `ctx.fillStyle` değerini `'#111'` yap ve `(0, 0)` noktasından başlayan,
   `canvas.width` genişliğinde ve `canvas.height` yüksekliğinde bir dikdörtgen doldur.

Sonucu sağda görmek için **Çalıştır**'a bas.

# --tests--

`canvas` should be the `#game` canvas element.
tr: `canvas`, `#game` canvas elemanı olmalı.

```js
assert.strictEqual(canvas, $.canvas)
```

`ctx` should be the canvas's 2D context.
tr: `ctx`, canvas'ın 2D bağlamı olmalı.

```js
assert.strictEqual(ctx, $.canvas.getContext('2d'))
```

The whole 400×400 board should be filled with `#111`.
tr: 400×400 tahtanın tamamı `#111` ile doldurulmalı.

```js
const full = $.rects('#111').filter((r) => r.x === 0 && r.y === 0 && r.w === 400 && r.h === 400)
assert.lengthOf(full, 1, 'fillRect(0, 0, canvas.width, canvas.height) with fillStyle #111')
```

# --seed--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#111'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
