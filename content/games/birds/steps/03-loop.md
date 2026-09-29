---
title: Draw it again and again
title_tr: Tekrar tekrar çiz
skills: [game.loop, prog.functions]
---

# --goal--

A game repaints its picture about 60 times a second, so that moving things look alive. We put the drawing in a
function `draw` and call it from a loop that asks the browser for the next frame each time.

# --goal-tr--

Bir oyun, ekranı saniyede yaklaşık **60 kez** yeniden çizer; hareket eden şeyler böyle canlı görünür (çizgi filmin
kareleri gibi). Bunun için çizim satırlarını bir **fonksiyon**un içine koyup ona `draw` (çiz) adını veriyoruz.

Sonra bir **oyun döngüsü** yazıyoruz: `loop` her turda çizer ve tarayıcıdan bir sonraki turu ister. Ekran aynı
görünecek; ama artık resim sürekli yeniden çiziliyor.

# --code--

```js
function draw() {
  ctx.fillStyle = '#bae6fd'
  ...
  ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `function draw() { ... }` wraps the drawing lines; they run each time `draw()` is called.
- `requestAnimationFrame(loop)` asks the browser to run `loop` before the next screen refresh. `loop` asks again
  each time, so it never stops. The last line starts it.

# --meaning-tr--

- `function draw() {` → bir **fonksiyon** (tarif) tanımlar: "draw deyince şu satırları yap". `{` ile `}`
  arası gövdesidir; okunaklı olsun diye iki boşluk içeriden yazılır.
- Gövdede ilk çizim bütün tuvali gökyüzüyle boyadığı için **eski resim her seferinde silinir**. İleride kuş hareket
  edince arkasında iz kalmamasının sebebi bu.
- `function loop() {` → döngünün **bir turu**: çiz, sonra devamını iste.
- `requestAnimationFrame(loop)` → tarayıcıya "ekranı bir sonraki yenilemeden önce `loop`'u çalıştır" der. `loop`
  kendi devamını istediği için döngü hiç durmaz.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**.

# --task--

Wrap all the drawing lines (from the sky to the post) in `function draw() { ... }`, then write `loop` and the line
that starts it at the end.

# --task-tr--

1. Gökyüzü satırının (`ctx.fillStyle = '#bae6fd'`) **üstüne** `function draw() {` yaz.
2. Gökyüzünden direğe kadar bütün satırları iki boşluk içeri al (satırları seçip `Tab`'a basabilirsin).
3. Direğin son satırının altına kapanan `}` yaz.
4. Bir boş satırdan sonra `loop` fonksiyonunu, bir boş satır daha bırakıp en alta `requestAnimationFrame(loop)` yaz.
5. **Çalıştır**: ekran aynı görünmeli, kontroller yeşil olmalı.

# --hint--

If the screen stays white, check that `requestAnimationFrame(loop)` is also written on its own at the very end.

# --hint-tr--

Ekran beyaz kalıyorsa en alta, fonksiyonların dışına `requestAnimationFrame(loop)` satırını yazdığından emin ol.

# --tests--

`draw` should be a function that paints the scene.
tr: `draw` sahneyi boyayan bir fonksiyon olmalı.

```js
assert.isFunction(draw)
draw()
assert.deepInclude($.rects('#78350f'), { x: 86, y: 220, w: 8, h: 70, color: '#78350f' })
```

The loop should keep running, one frame after another.
tr: Döngü kare kare sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop)')
assert.lengthOf($.rects('#65a30d'), 1)
```

# --solution--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 290
const SLING = { x: 90, y: 220 } // where the bird sits before it is launched

function draw() {
  ctx.fillStyle = '#bae6fd'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  // The sling and, while aiming, the pulled-back bird and the path it will take.
  ctx.fillStyle = '#78350f'
  ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
