---
title: Paint the sky
title_tr: Gökyüzünü boya
skills: [game.canvas]
---

# --explanation--

This game is tall: the page has a `<canvas id="game" width="400" height="600">`. As in every canvas game, you start by
grabbing the canvas and its 2D **context**, the object you draw with.

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

Then you paint the background: choose a color with `fillStyle`, then fill a rectangle as big as the canvas. Using
`canvas.width` and `canvas.height` instead of `400` and `600` keeps the code correct if the size ever changes.

Colors can be names (`'gold'`), or hex codes like `'#70c5ce'`: two hex digits each for red, green and blue.

# --explanation-tr--

Bu oyun uzun: sayfada `<canvas id="game" width="400" height="600">` var. Her canvas oyununda olduğu gibi canvas'ı ve
çizim yaptığın nesne olan 2D **bağlamını** (context) alarak başlarsın.

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
```

Sonra arka planı boyarsın: `fillStyle` ile rengi seç, sonra canvas kadar büyük bir dikdörtgen doldur. `400` ve `600`
yerine `canvas.width` ve `canvas.height` kullanmak, boyut bir gün değişirse kodun doğru kalmasını sağlar.

Renkler ad (`'gold'`) ya da `'#70c5ce'` gibi onaltılık kod olabilir: kırmızı, yeşil ve mavi için ikişer hane.

# --task--

1. Store the canvas in `canvas` and its 2D context in `ctx`.
2. Fill the whole canvas with the sky color `'#70c5ce'`.

# --task-tr--

1. Canvas'ı `canvas`'ta, 2D bağlamını `ctx`'te tut.
2. Canvas'ın tamamını gökyüzü rengi `'#70c5ce'` ile doldur.

# --tests--

`canvas` and `ctx` should be the game canvas and its 2D context.
tr: `canvas` ve `ctx`, oyun canvas'ı ve onun 2D bağlamı olmalı.

```js
assert.strictEqual(canvas, $.canvas)
assert.strictEqual(ctx, $.canvas.getContext('2d'))
```

The whole 400×600 canvas should be filled with `#70c5ce`.
tr: 400×600 canvas'ın tamamı `#70c5ce` ile doldurulmalı.

```js
const sky = $.rects('#70c5ce').filter((r) => r.x === 0 && r.y === 0 && r.w === 400 && r.h === 600)
assert.lengthOf(sky, 1)
```

# --seed--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#70c5ce'
ctx.fillRect(0, 0, canvas.width, canvas.height)
```
