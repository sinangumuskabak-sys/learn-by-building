---
title: The room
title_tr: Oda
skills: [game.canvas, game.loop]
---

# --goal--

We start with the usual frame: find the canvas, take its 2D context, and a loop that paints a dark background about 60
times a second. The table goes on top of it next.

# --goal-tr--

Her canvas oyununun başladığı yerden başlıyoruz: canvas'ı bul, çizim kalemini al ve saniyede ~60 kez koyu bir arka plan
boyayan bir döngü kur. Bilardo masası bir sonraki adımda bu karanlık odanın ortasına gelecek.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `canvas` is the 480×340 canvas, `ctx` its pen.
- `draw` fills the whole canvas dark blue.
- `loop` draws and asks the browser to call it again before the next screen refresh; the last line starts it.

# --meaning-tr--

- `document.getElementById('game')` → sayfadaki 480×340'lık canvas; `getContext('2d')` → onun **çizim kalemi**, `ctx`.
- `draw` → `fillStyle` ile rengi seçer, `fillRect(0, 0, canvas.width, canvas.height)` ile canvas'ın tamamını boyar.
  Canvas'ta (0, 0) **sol üst köşe**; x sağa, y **aşağı** doğru büyür.
- `loop` → döngünün bir turu: çiz, sonra `requestAnimationFrame(loop)` ile "ekran bir sonraki yenilenmeden önce beni
  yine çağır" de. Saniyede ~60 tur.
- En alttaki `requestAnimationFrame(loop)` → döngüyü başlatır.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu üç yorum satırının **altına** yaz ve **Çalıştır**'a bas. Sağdaki alan koyu lacivert olmalı.

# --tests--

The whole canvas should be painted `#0f172a`.
tr: Canvas'ın tamamı `#0f172a` ile boyanmalı.

```js
$.tick(1)
assert.deepInclude($.rects('#0f172a'), { x: 0, y: 0, w: 480, h: 340, color: '#0f172a' })
```

The loop should keep asking for the next frame.
tr: Döngü bir sonraki kareyi istemeye devam etmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop)')
```

# --seed--

```js
// Pool, step by step.
// The page already has <canvas id="game" width="480" height="340"></canvas>.
// Write your code below.
```

# --solution--

```js
// Pool, step by step.
// The page already has <canvas id="game" width="480" height="340"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
