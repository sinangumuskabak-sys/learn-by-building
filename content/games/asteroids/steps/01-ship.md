---
title: Black space
title_tr: Kapkara uzay
skills: [game.canvas]
---

# --goal--

We are building Asteroids: a ship that turns, thrusts and shoots through a field of breaking rocks. First the stage: a
black space, painted by a `draw` function.

# --goal-tr--

**Asteroids** yapacağız: her yöne dönen, iten ve ateş eden bir gemi, parçalanan kayalarla dolu bir uzayda. İlk iş
sahne: kapkara bir **uzay**.

Çizimi baştan bir `draw` (çiz) fonksiyonuna koyuyoruz; oyun ilerledikçe gemiyi, kayaları ve mermileri de o çizecek.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```

# --meaning--

- `canvas` is the drawing area on the page, `ctx` its 2D drawing tool.
- `draw` paints the whole canvas black: `fillStyle` picks the color, `fillRect(x, y, width, height)` paints.
- `draw()` at the bottom runs it once.

# --meaning-tr--

- `document.getElementById('game')` → sayfadaki `game` kimlikli **canvas**'ı (tuvali) bulur: 600 × 450 piksellik boş
  bir resim alanı.
- `canvas.getContext('2d')` → tuvalin **2B çizim aracını** verir; fırça gibi. Her çizimi `ctx` ile yapacağız.
- `function draw() { ... }` → çizim tarifini bir ada bağlar. Tanımlamak çalıştırmaz.
- `ctx.fillStyle = '#000000'` → fırçanın rengi siyah. `ctx.fillRect(0, 0, canvas.width, canvas.height)` → sol üst
  köşeden (`0, 0`) başlayıp bütün tuvali boyar.
- En alttaki `draw()` → tarifi bir kez **çalıştırır**.

# --task--

Write the code under the three comment lines and press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının **altına** yaz. **Çalıştır**'a bas: sağdaki alan kapkara olmalı.

# --tests--

The whole canvas should be painted black.
tr: Bütün canvas siyaha boyanmalı.

```js
assert.isFunction(draw)
assert.deepEqual($.rects('#000000').map((r) => [r.x, r.y, r.w, r.h]), [[0, 0, 600, 450]])
```

# --seed--

```js
// Asteroids, step by step.
// The page already has <canvas id="game" width="600" height="450"></canvas>.
// Write your code below.
```

# --solution--

```js
// Asteroids, step by step.
// The page already has <canvas id="game" width="600" height="450"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```
