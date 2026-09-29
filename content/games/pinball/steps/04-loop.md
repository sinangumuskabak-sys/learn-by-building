---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop, prog.functions]
---

# --goal--

A game redraws its picture about 60 times a second. We put the drawing in a function `draw`, and a `loop` calls it
before every screen refresh.

# --goal-tr--

Bir oyun ekranı **saniyede yaklaşık 60 kez** yeniden çizer; top hareket ettikçe resim her seferinde biraz değişir.
Bir çizgi filmin kareleri gibi.

Bunun için çizim satırlarını bir **fonksiyona** koyuyoruz: `draw` (çiz). Sonra bir **oyun döngüsü** (`loop`)
kuruyoruz: her turda `draw()`'u çağırır ve tarayıcıdan bir sonraki turu ister. Ekranda bir şey değişmeyecek; ama
masa artık her karede yeniden çiziliyor.

# --code--

```js
function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#a8a29e'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (const [x1, y1, x2, y2] of WALLS) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```

# --meaning--

- `function draw() { ... }` holds every drawing line; it paints the background first, which wipes the old picture.
- `requestAnimationFrame(loop)` asks the browser to run `loop` just before the next screen refresh.
- `loop` draws, then asks for itself again, so it runs about 60 times a second. The last line starts it.

# --meaning-tr--

- `function draw() {` → bütün çizim satırlarını içine alan fonksiyon. İlk iş arka planı boyamak: bu, **eski resmi
  siler**. Top hareket edince eski yerinde iz kalmamasının sebebi bu.
- `requestAnimationFrame(loop)` → tarayıcıya "ekranı bir sonraki yenilemeden hemen önce `loop`'u çalıştır" der.
- `function loop() {` → döngünün **bir turu**: çiz, sonra bir sonraki turu iste. Fonksiyon kendi devamını istediği
  için döngü hiç durmaz; saniyede yaklaşık 60 tur.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**.

# --task--

1. Wrap all the drawing lines (from `ctx.fillStyle = '#0c0a09'` to the end of the `for` loop) in `function draw() { ... }`, indented by two spaces.
2. Under it write `loop` and the line that starts it.

# --task-tr--

1. `ctx.fillStyle = '#0c0a09'` satırının **üstüne** `function draw() {` yaz.
2. Altındaki bütün çizim satırlarını (for döngüsünün kapanan `}` işaretine kadar) iki boşluk içeri al ve en alta
   kapanan `}` yaz.
3. Bir boş satırdan sonra `loop` fonksiyonunu, bir boş satır daha bırakıp da `requestAnimationFrame(loop)` satırını
   yaz.
4. **Çalıştır**: masa aynı görünmeli.

# --predict--

What changes on the screen after this step?
- [x] Nothing: the same table, only now drawn again and again
  The picture is the same each time, so you cannot see the redraws yet.
- [ ] The table blinks
- [ ] The walls disappear

# --predict-tr--

Bu adımdan sonra ekranda ne değişir?
- [x] Hiçbir şey: aynı masa, sadece artık tekrar tekrar çiziliyor
  Her seferinde aynı resim çizildiği için yeniden çizimleri henüz göremezsin.
- [ ] Masa yanıp söner
- [ ] Duvarlar kaybolur

# --hint--

If the screen is empty, check the last line: `requestAnimationFrame(loop)` must be outside every function, at the very bottom.

# --hint-tr--

Ekran boşsa son satıra bak: `requestAnimationFrame(loop)` bütün fonksiyonların dışında, en altta olmalı.

# --tests--

`draw` should be a function that paints the table and the walls.
tr: `draw` masayı ve duvarları çizen bir fonksiyon olmalı.

```js
assert.isFunction(draw)
draw()
assert.lengthOf($.rects('#0c0a09'), 1)
assert.lengthOf($.screen().filter((c) => c.op === 'stroke'), WALLS.length)
```

The loop should draw every frame and keep asking for the next one.
tr: Döngü her karede çizmeli ve bir sonrakini istemeye devam etmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
const fills = $.calls.filter((c) => c.op === 'fillRect' && c.fill === '#0c0a09')
assert.isAtLeast(fills.length, 3, 'the table is painted again every frame')
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#a8a29e'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (const [x1, y1, x2, y2] of WALLS) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
