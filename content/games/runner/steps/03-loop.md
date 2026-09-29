---
title: Draw again and again
title_tr: Tekrar tekrar çiz
skills: [game.loop, prog.functions]
---

# --goal--

A game redraws its picture about 60 times a second. The drawing goes into `draw`, and `loop` calls it and asks the
browser to call `loop` again before the next screen refresh.

# --goal-tr--

Oyun ekranı saniyede ~**60 kez** yeniden çizer; bir şey hareket edince yeni hâli hemen görünür. Çizim satırlarını
`draw` (çiz) fonksiyonuna alıyoruz; `loop` (döngü) onu çağırıp tarayıcıdan "bir sonraki ekran yenilemesinde beni yine
çağır" diye ister.

# --code--

```js
function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `draw` paints the whole picture, background first, so the old picture is wiped each time.
- `requestAnimationFrame(loop)` inside `loop` books the next turn; the last line starts the loop.

# --meaning-tr--

- `function draw() { ... }` → bütün resmi çizen tarif. Önce arka plan: eski resmi **siler**.
- `function loop() { ... }` → döngünün bir turu: çiz, sonra `requestAnimationFrame(loop)` ile bir sonraki turu iste.
  Kendini yeniden istediği için döngü hiç durmaz.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**.

# --task--

Wrap the six drawing lines in `function draw() { ... }`, then write `loop` and the line that starts it.

# --task-tr--

1. Altı çizim satırının üstüne `function draw() {` yaz, satırları iki boşluk içeri al, altlarına `}` yaz.
2. Bir boş satırdan sonra `loop` fonksiyonunu ve en alta `requestAnimationFrame(loop)` satırını yaz.
3. **Çalıştır**: ekran aynı görünür ama artık saniyede 60 kez çiziliyor.

# --tests--

`draw` should be a function, and the loop should keep running.
tr: `draw` bir fonksiyon olmalı ve döngü sürmeli.

```js
assert.isFunction(draw)
$.tick(3)
assert.strictEqual($.pendingFrames, 1)
```

Each frame should draw the runner where `runner` says.
tr: Her kare koşucuyu `runner`'ın söylediği yere çizmeli.

```js
runner.x = 100
$.tick()
assert.deepEqual($.rects('#334155'), [{ x: 100, y: 136, w: 40, h: 44, color: '#334155' }])
```

# --solution--

```js
// Endless runner, step by step.
// The page already has <canvas id="game" width="600" height="220"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 180 // y of the ground line
const STAND_H = 44

let runner = { x: 50, y: GROUND - STAND_H, w: 40, h: STAND_H }

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
