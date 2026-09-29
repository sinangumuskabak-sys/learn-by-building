---
title: A function that draws
title_tr: Çizen bir fonksiyon
skills: [prog.functions]
---

# --goal--

The words will fall, so the picture must be drawn again many times a second. We pack all the drawing lines into a
function named `draw`, so one word repaints everything.

# --goal-tr--

Kelimeler düşecek, yani resim saniyede birçok kez **yeniden çizilecek**. Bütün çizim satırlarını her seferinde tekrar
yazamayız. Onları bir **fonksiyon**un içine koyup ona `draw` (çiz) adını veriyoruz.

Fonksiyon bir **yemek tarifi** gibidir: tarifi bir kez yazarsın, istediğin kadar pişirirsin. Ekran yine aynı
görünecek.

# --code--

```js
function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#7f1d1d'
  ctx.fillRect(0, GROUND + 4, canvas.width, 3)

  ctx.font = FONT
  ctx.textAlign = 'left'
  ctx.fillStyle = '#cbd5e1'
  ctx.fillText('rocket', 40, 120)
}

draw()
```

# --meaning--

- `function draw() { ... }` defines the recipe; it does not run yet. Its body is indented by two spaces.
- `draw()` with parentheses runs it. Each run paints the sky first, which wipes the old picture.

# --meaning-tr--

- `function draw() {` → **fonksiyon tanımlar**: "draw deyince şunları yap". Bu satır tek başına bir şey çizmez,
  sadece tarifi yazar.
- `{` ile `}` arasındaki satırlar fonksiyonun **gövdesi**; okunaklı olsun diye iki boşluk içeriden yazılır.
- Gövde önce gökyüzünü boyar: bu, **eski resmi siler**.
- `draw()` → fonksiyonu **çağırır**: tarifi şimdi uygula. Sondaki `()` "çalıştır" demektir.

# --task--

Wrap all the drawing lines in `function draw() { ... }` (indented by two spaces) and call `draw()` after it.

# --task-tr--

1. İlk çizim satırının (`ctx.fillStyle = '#020617'`) **üstüne** `function draw() {` yaz.
2. Altındaki bütün çizim satırlarını iki boşluk içeri al (aradaki boş satır kalsın).
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
assert.deepEqual($.texts(), ['rocket'])
```

# --solution--

```js
// Typing game, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 330 // words that fall past this line are gone
const FONT = 'bold 20px monospace'

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#7f1d1d'
  ctx.fillRect(0, GROUND + 4, canvas.width, 3)

  ctx.font = FONT
  ctx.textAlign = 'left'
  ctx.fillStyle = '#cbd5e1'
  ctx.fillText('rocket', 40, 120)
}

draw()
```
