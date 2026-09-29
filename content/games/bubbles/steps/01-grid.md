---
title: The night sky
title_tr: Gece göğü
skills: [game.canvas, game.loop]
---

# --goal--

We start with the usual frame: find the canvas, take its 2D context, and a loop that paints a deep blue background about 60
times a second.

# --goal-tr--

Her canvas oyununun başladığı yerden başlıyoruz: canvas'ı bul, çizim kalemini al ve saniyede ~60 kez koyu mavi bir arka
plan boyayan bir döngü kur. Renkli balonlar bu gece göğünde parlayacak.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `canvas` is the 400×520 canvas, `ctx` its pen.
- `draw` fills the whole canvas deep blue.
- `loop` draws and asks the browser to call it again before the next screen refresh; the last line starts it.

# --meaning-tr--

- `document.getElementById('game')` → sayfadaki 400×520'lik canvas; `getContext('2d')` → onun **çizim kalemi**, `ctx`.
- `draw` → `fillStyle` ile rengi seçer, `fillRect(0, 0, canvas.width, canvas.height)` ile canvas'ın tamamını boyar.
  Canvas'ta (0, 0) **sol üst köşe**; x sağa, y **aşağı** doğru büyür.
- `loop` → döngünün bir turu: çiz, sonra `requestAnimationFrame(loop)` ile "ekran bir sonraki yenilenmeden önce beni
  yine çağır" de. Saniyede ~60 tur.
- En alttaki `requestAnimationFrame(loop)` → döngüyü başlatır.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu üç yorum satırının **altına** yaz ve **Çalıştır**'a bas. Sağdaki alan koyu mavi olmalı.

# --tests--

The whole canvas should be painted `#1e1b4b`.
tr: Canvas'ın tamamı `#1e1b4b` ile boyanmalı.

```js
$.tick(1)
assert.deepInclude($.rects('#1e1b4b'), { x: 0, y: 0, w: 400, h: 520, color: '#1e1b4b' })
```

The loop should keep asking for the next frame.
tr: Döngü bir sonraki kareyi istemeye devam etmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop)')
```

# --seed--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
```

# --solution--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
