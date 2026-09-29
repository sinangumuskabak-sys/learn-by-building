---
title: The sky
title_tr: Gökyüzü
skills: [game.canvas, game.loop]
---

# --goal--

We start with the usual frame: find the canvas, take its 2D context, and run a loop that paints the sky about 60 times a
second.

# --goal-tr--

Her canvas oyununun başladığı yerden başlıyoruz: canvas'ı bul, çizim kalemini al ve saniyede ~60 kez **gökyüzünü**
boyayan bir döngü kur. Bölüm, oyuncu ve düşmanlar bu gökyüzünün önünde koşacak.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `canvas` is the 640×352 canvas, `ctx` its pen.
- `draw` fills the whole canvas light blue.
- `loop` draws, then asks the browser to call it again before the next screen refresh; the last line starts it.

# --meaning-tr--

- `document.getElementById('game')` → sayfadaki 640×352'lik canvas; `getContext('2d')` → onun **çizim kalemi**, `ctx`.
- `draw` → `fillStyle` ile rengi açık mavi seçer, `fillRect(0, 0, canvas.width, canvas.height)` ile canvas'ın tamamını
  boyar. Canvas'ta (0, 0) **sol üst köşe**; x sağa, y **aşağı** doğru büyür.
- `loop` → döngünün bir turu: çiz, sonra `requestAnimationFrame(loop)` ile "ekran bir sonraki yenilenmeden önce beni
  yine çağır" de. Saniyede ~60 tur.
- En alttaki `requestAnimationFrame(loop)` → döngüyü başlatır.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu üç yorum satırının **altına** yaz ve **Çalıştır**'a bas. Sağdaki alan açık mavi olmalı.

# --tests--

The whole canvas should be painted sky blue `#7dd3fc`.
tr: Canvas'ın tamamı gök mavisi `#7dd3fc` ile boyanmalı.

```js
$.tick(1)
assert.deepInclude($.rects('#7dd3fc'), { x: 0, y: 0, w: 640, h: 352, color: '#7dd3fc' })
```

The loop should keep asking for the next frame.
tr: Döngü bir sonraki kareyi istemeye devam etmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop)')
```

# --seed--

```js
// Platformer, step by step.
// The page already has <canvas id="game" width="640" height="352"></canvas>.
// Write your code below.
```

# --solution--

```js
// Platformer, step by step.
// The page already has <canvas id="game" width="640" height="352"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
