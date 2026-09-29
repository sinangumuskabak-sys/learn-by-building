---
title: A function that draws
title_tr: Çizen bir fonksiyon
skills: [prog.functions]
---

# --goal--

The world will change many times a second, and each time the whole picture must be drawn again. We pack the drawing
lines into a function named `draw`, so one word repaints everything.

# --goal-tr--

Dünyamız saniyede birçok kez değişecek ve her seferinde **bütün resim yeniden çizilecek**. Bütün çizim satırlarını
her seferinde tekrar yazamayız. Bu yüzden onları bir **fonksiyon**un içine koyup ona `draw` (çiz) adını veriyoruz.

Fonksiyon bir **yemek tarifi** gibidir: tarifi bir kez yazarsın, istediğin kadar pişirirsin. Ekran yine aynı
görünecek.

# --code--

```js
function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)

  ctx.fillStyle = '#4ade80'
  ctx.fillRect(3 * CELL, TOP + 2 * CELL, CELL - 1, CELL - 1)
}

draw()
```

# --meaning--

- `function draw() { ... }` defines the recipe; it does not run yet.
- The lines between `{` and `}` are its body, indented by two spaces.
- `draw()` with parentheses runs it. Each run paints the background first, which wipes the old picture.

# --meaning-tr--

- `function draw() {` → **fonksiyon tanımlar**: "draw deyince şunları yap". Bu satır tek başına bir şey çizmez,
  sadece tarifi yazar.
- `{` ile `}` arasındaki satırlar fonksiyonun **gövdesi**. Okunaklı olsun diye iki boşluk içeriden yazılır.
- Gövde önce arka planı boyar: bu, **eski resmi siler**. Sonra ızgarayı ve hücreyi çizer.
- `draw()` → fonksiyonu **çağırır**: tarifi şimdi uygula. Sondaki `()` "çalıştır" demektir.

# --task--

Wrap all the drawing lines in `function draw() { ... }` (indented by two spaces) and call `draw()` after it.

# --task-tr--

1. İlk çizim satırının (`ctx.fillStyle = '#0f172a'`) **üstüne** `function draw() {` yaz.
2. Altındaki bütün çizim satırlarını iki boşluk içeri al (satır başında `Tab` da olur).
3. En sona kapanan `}` yaz.
4. Bir boş satırdan sonra `draw()` yaz. **Çalıştır**: ekran aynı görünmeli.

# --hint--

If the screen stays empty you probably forgot the `draw()` call at the very end.

# --hint-tr--

Ekran boş kalıyorsa büyük ihtimalle en alttaki `draw()` çağrısını unuttun.

# --tests--

`draw` should be a function.
tr: `draw` bir fonksiyon olmalı.

```js
assert.isFunction(draw)
```

Calling `draw()` again should repaint the whole picture, with still only one green square.
tr: `draw()` yeniden çağrılınca bütün resmi baştan çizmeli; yine tek bir yeşil kare olmalı.

```js
draw()
draw()
assert.lengthOf($.rects('#4ade80'), 1)
assert.lengthOf($.rects('#1e293b'), 1)
```

# --solution--

```js
// Game of Life, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 8
const COLS = 60
const ROWS = 48
const TOP = 36

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)

  ctx.fillStyle = '#4ade80'
  ctx.fillRect(3 * CELL, TOP + 2 * CELL, CELL - 1, CELL - 1)
}

draw()
```
