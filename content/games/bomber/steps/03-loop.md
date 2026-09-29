---
title: Draw it every frame
title_tr: Her karede çiz
skills: [game.loop, prog.functions]
---

# --goal--

A game repaints its picture about 60 times a second. We put the drawing in `draw` and call it from a loop that asks
the browser for the next frame each time.

# --goal-tr--

Bir oyun, ekranı saniyede yaklaşık **60 kez** yeniden çizer; hareket eden şeyler böyle canlı görünür. Çizim
satırlarını `draw` (çiz) adlı bir **fonksiyon**a koyuyoruz ve onu bir **oyun döngüsünden** çağırıyoruz. Ekran aynı
kalacak; ama artık sürekli yeniden çiziliyor.

# --code--

```js
function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < ROWS; r++) {
    ...
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `draw` holds the drawing; each call paints the whole picture again, background first.
- `requestAnimationFrame(loop)` runs `loop` before the next screen refresh; `loop` asks again each time. The last
  line starts it.

# --meaning-tr--

- `function draw() { ... }` → çizim tarifi: `draw()` denince içindeki satırlar çalışır. İlk satırlar bütün tuvali
  boyadığı için **eski resim her seferinde silinir**.
- `function loop() {` → döngünün bir turu: çiz, sonra devamını iste.
- `requestAnimationFrame(loop)` → tarayıcıya "ekranı bir sonraki yenilemeden önce `loop`'u çalıştır" der. `loop`
  kendi devamını istediği için döngü hiç durmaz.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**.

# --task--

Wrap all the drawing (background and loops) in `function draw() { ... }`, then write `loop` and the line that starts
it.

# --task-tr--

1. `ctx.fillStyle = '#0f172a'` satırının **üstüne** `function draw() {` yaz.
2. Arka plan satırlarını ve iki döngüyü iki boşluk içeri al; altlarına kapanan `}` yaz.
3. Bir boş satırdan sonra `loop` fonksiyonunu, en alta da `requestAnimationFrame(loop)` yaz.
4. **Çalıştır**: ekran aynı görünmeli.

# --hint--

If the screen stays empty, check the `requestAnimationFrame(loop)` line at the very end.

# --hint-tr--

Ekran boş kalıyorsa en alttaki `requestAnimationFrame(loop)` satırını kontrol et.

# --tests--

`draw` should be a function that paints the arena.
tr: `draw` arenayı boyayan bir fonksiyon olmalı.

```js
assert.isFunction(draw)
draw()
assert.lengthOf($.rects('#3f6212'), 143)
```

The loop should keep running.
tr: Döngü sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop)')
```

# --solution--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 13
const ROWS = 11
const TILE = 32
const TOP = 32 // room for the lives and the time

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE
      const y = TOP + r * TILE
      ctx.fillStyle = '#3f6212'
      ctx.fillRect(x, y, TILE, TILE)
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
