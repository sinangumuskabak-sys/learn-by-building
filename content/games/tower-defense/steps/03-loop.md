---
title: Draw it every frame
title_tr: Her karede çiz
skills: [game.loop, prog.functions]
---

# --goal--

A game repaints its picture about 60 times a second. We put the drawing in `draw` and call it from a loop that asks
the browser for the next frame each time.

# --goal-tr--

Bir oyun, ekranı saniyede yaklaşık **60 kez** yeniden çizer; yürüyen düşmanlar ve uçan mermiler böyle canlı görünür.
Çizim satırlarını `draw` (çiz) adlı bir **fonksiyon**a koyuyoruz ve onu bir **oyun döngüsünden** çağırıyoruz. Ekran
aynı kalacak; ama artık sürekli yeniden çiziliyor.

# --code--

```js
function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
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

`draw` should be a function that paints the map.
tr: `draw` haritayı boyayan bir fonksiyon olmalı.

```js
assert.isFunction(draw)
draw()
assert.lengthOf($.rects('#3f6212'), 108)
```

The loop should keep running.
tr: Döngü sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop)')
```

# --solution--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const ROWS = 9
const TOP = 40 // room for gold, lives and the tower buttons

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      ctx.fillStyle = '#3f6212'
      ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
