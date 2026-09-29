---
title: A function that draws
title_tr: Çizen bir fonksiyon
skills: [prog.functions]
---

# --goal--

The notes will move, so the picture must be drawn again many times a second. We pack the drawing into a function
named `draw`, so one word repaints everything.

# --goal-tr--

Notalar hareket edecek, yani resim saniyede birçok kez **yeniden çizilecek**. Bütün çizim satırlarını her seferinde
tekrar yazamayız. Onları bir **fonksiyon**un içine koyup ona `draw` (çiz) adını veriyoruz.

Fonksiyon bir **yemek tarifi** gibidir: tarifi bir kez yazarsın, istediğin kadar pişirirsin. Ekran yine aynı
görünecek.

# --code--

```js
function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let lane = 0; lane < LANES; lane++) {
    const x = LEFT + lane * LANE_W
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(x + 2, 0, LANE_W - 4, canvas.height)
    ctx.fillStyle = COLORS[lane]
    ctx.fillRect(x + 6, HIT_Y - 4, LANE_W - 12, 8)
  }
}

draw()
```

# --meaning--

- `function draw() { ... }` defines the recipe; it does not run yet. Its body is indented by two more spaces.
- `draw()` with parentheses runs it. Each run paints the background first, which wipes the old picture.

# --meaning-tr--

- `function draw() {` → **fonksiyon tanımlar**: "draw deyince şunları yap". Bu satır tek başına bir şey çizmez,
  sadece tarifi yazar.
- `{` ile `}` arasındaki satırlar fonksiyonun **gövdesi**; iki boşluk daha içeriden yazılır. Döngü aynen kalır,
  sadece iki boşluk içeri kayar.
- Gövde önce arka planı boyar: bu, **eski resmi siler**.
- `draw()` → fonksiyonu **çağırır**: tarifi şimdi uygula. Sondaki `()` "çalıştır" demektir.

# --task--

Wrap the background lines and the loop in `function draw() { ... }` (two more spaces of indent) and call `draw()`
after it.

# --task-tr--

1. `ctx.fillStyle = '#0f172a'` satırının **üstüne** `function draw() {` yaz.
2. Altındaki bütün satırları (arka plan ve döngü) iki boşluk içeri al.
3. En sona kapanan `}` yaz; bir boş satırdan sonra `draw()` yaz.
4. **Çalıştır**: ekran aynı görünmeli.

# --hint--

If the screen stays empty you probably forgot the `draw()` call at the very end.

# --hint-tr--

Ekran boş kalıyorsa büyük ihtimalle en alttaki `draw()` çağrısını unuttun.

# --tests--

`draw` should be a function that repaints the whole picture.
tr: `draw`, bütün resmi yeniden çizen bir fonksiyon olmalı.

```js
assert.isFunction(draw)
draw()
draw()
assert.lengthOf($.rects('#1e293b'), 4)
assert.lengthOf($.rects(COLORS[0]), 1)
```

# --solution--

```js
// Rhythm game, step by step.
// The page already has <canvas id="game" width="400" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LANES = 4
const LANE_W = 70
const LEFT = (canvas.width - LANES * LANE_W) / 2
const HIT_Y = 480 // where a note should be when you press
const COLORS = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6']

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let lane = 0; lane < LANES; lane++) {
    const x = LEFT + lane * LANE_W
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(x + 2, 0, LANE_W - 4, canvas.height)
    ctx.fillStyle = COLORS[lane]
    ctx.fillRect(x + 6, HIT_Y - 4, LANE_W - 12, 8)
  }
}

draw()
```
