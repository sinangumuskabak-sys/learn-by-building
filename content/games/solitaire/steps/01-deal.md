---
title: The green table
title_tr: Yeşil masa
skills: [game.canvas, game.loop]
---

# --goal--

Every card game needs a table. We find the canvas, take its 2D context (the pen), and start a loop that paints the
whole canvas green about 60 times a second.

# --goal-tr--

Her kâğıt oyununun bir **masası** olur. Bu adımda sayfadaki canvas'ı bulacağız, çizim kalemini alacağız ve
canvas'ın tamamını **yeşile** boyayan bir döngü başlatacağız.

Döngü şimdilik hep aynı yeşil resmi çiziyor; ama kartlar gelince her karede masanın son hâlini gösterecek.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `getElementById('game')` finds the 480×560 canvas; `getContext('2d')` gives the pen, `ctx`.
- `draw` fills a rectangle as big as the canvas with dark green, starting at the top-left corner `(0, 0)`.
- `loop` draws and books itself for the next screen refresh with `requestAnimationFrame`; the last line starts it.

# --meaning-tr--

- `document.getElementById('game')` → sayfadaki `game` kimlikli canvas'ı (480×560 piksel) bulur.
- `canvas.getContext('2d')` → canvas'ın **2D çizim kalemini** verir. Adı `ctx`; bütün çizimler `ctx.` ile başlar.
- `draw` → masayı çizen fonksiyon:
  - `ctx.fillStyle = '#166534'` → dolgu rengi koyu yeşil.
  - `ctx.fillRect(0, 0, canvas.width, canvas.height)` → sol üst köşeden `(0, 0)` başlayıp canvas'ın tamamını
    kaplayan dolu bir dikdörtgen. Canvas'ta `x` sağa, `y` **aşağı** doğru büyür.
- `loop` → döngünün bir turu: çiz, sonra `requestAnimationFrame(loop)` ile "ekran bir sonraki yenilenmeden önce
  beni yine çağır" de. Böylece saniyede ~60 kez çalışır.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının (`//` ile başlayanlar) **altına** yaz ve **Çalıştır**'a bas. Sağdaki alan
koyu yeşil olmalı.

# --hint--

If the canvas stays empty, check the last line: `requestAnimationFrame(loop)` starts everything.

# --hint-tr--

Canvas boş kalıyorsa en alt satıra bak: her şeyi `requestAnimationFrame(loop)` başlatır.

# --tests--

The whole 480×560 canvas should be painted `#166534`.
tr: 480×560'lık canvas'ın tamamı `#166534` ile boyanmalı.

```js
$.tick(1)
assert.deepInclude($.rects('#166534'), { x: 0, y: 0, w: 480, h: 560, color: '#166534' })
```

The loop should keep asking for the next frame.
tr: Döngü bir sonraki kareyi istemeye devam etmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop)')
```

# --seed--

```js
// Solitaire, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
```

# --solution--

```js
// Solitaire, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
