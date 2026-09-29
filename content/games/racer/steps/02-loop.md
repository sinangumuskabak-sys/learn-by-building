---
title: Draw again and again
title_tr: Tekrar tekrar çiz
skills: [game.loop, prog.functions]
---

# --goal--

Soon the road will move. Motion means painting the whole picture again about 60 times a second, like the frames of a
cartoon. So the drawing goes into a function, `draw`, and a game loop calls it every frame.

# --goal-tr--

Yol birazdan hareket edecek. Hareket demek, resmi **saniyede yaklaşık 60 kez** baştan çizmek demek; bir çizgi filmin
kareleri gibi. Her karede resim biraz değişir, göz bunu hareket olarak görür.

Bunun için boyama satırlarını bir **fonksiyon**un içine koyacağız ve onu bir **oyun döngüsü**nden çağıracağız.
Ekranda bir şey değişmeyecek; ama resim artık her karede yeniden çiziliyor.

# --code--

```js
function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(0, H / 2, W, H / 2)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `function draw() { ... }` names the drawing recipe; it runs only when called as `draw()`.
- `loop` draws one frame and asks the browser, with `requestAnimationFrame(loop)`, to run it again before the next
  screen refresh.
- The last line starts the loop.

# --meaning-tr--

- `function draw() { ... }` → çizim **tarifini** bir ada bağlar. Tanımlamak tek başına bir şey çizmez; `draw()` diye
  **çağrılınca** çalışır. Süslü parantezlerin içi fonksiyonun gövdesidir, iki boşluk içeriden yazılır.
- `function loop()` → döngünün **bir turu**: önce çiz, sonra devamını iste.
- `requestAnimationFrame(loop)` → tarayıcıya "ekranı bir dahaki yenilemenden hemen önce `loop`'u yine çalıştır" der.
  `loop` her seferinde kendi devamını istediği için döngü hiç durmaz.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**.

# --task--

Wrap the four painting lines in `function draw() { ... }`, then write `loop` and start it with
`requestAnimationFrame(loop)`.

# --task-tr--

1. Dört boyama satırının **üstüne** `function draw() {` yaz.
2. Dört satırı iki boşluk içeri al; altlarına kapanan `}` koy.
3. Bir boş satırdan sonra `loop` fonksiyonunu, en alta da bir boş satırdan sonra `requestAnimationFrame(loop)`
   satırını yaz.
4. **Çalıştır**: ekran aynı görünmeli, kontroller yeşil olmalı.

# --hint--

If the screen is empty, check the last line: `requestAnimationFrame(loop)` starts everything.

# --hint-tr--

Ekran boşsa en alttaki satıra bak: her şeyi `requestAnimationFrame(loop)` başlatır.

# --tests--

`draw` should be a function.
tr: `draw` bir fonksiyon olmalı.

```js
assert.isFunction(draw)
```

The loop should draw every frame and keep asking for the next one.
tr: Döngü her karede çizmeli ve bir sonrakini istemeye devam etmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
assert.lengthOf($.rects('#7dd3fc'), 1)
```

# --solution--

```js
// Pseudo-3D racer, step by step.
// The page already has <canvas id="game" width="480" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(0, H / 2, W, H / 2)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
