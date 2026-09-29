---
title: A function that draws
title_tr: Çizen bir fonksiyon
skills: [prog.functions]
---

# --goal--

A game redraws its picture many times a second. We put the drawing lines in a function named `draw`, so one word
repaints everything.

# --goal-tr--

Bir oyun, ekranı **saniyede onlarca kez** yeniden çizer. Her seferinde dört satırı tekrar yazamayız. Bu yüzden
çizim satırlarını bir **fonksiyon**un içine koyup ona `draw` (çiz) adını vereceğiz. Sonra tek kelimeyle:
`draw()`, bütün resmi yeniden çizeriz.

Fonksiyon bir **yemek tarifi** gibidir: tarifi bir kez yazarsın, istediğin kadar pişirirsin. Ekran yine aynı
görünecek.

# --code--

```js
function draw() {
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'lime'
  ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL)
}

draw()
```

# --meaning--

- `function draw() { ... }` defines the recipe; it does not run yet.
- The lines between `{` and `}` are the body, indented by two spaces.
- `draw()` with parentheses runs it. Each run paints the background first, which wipes the old picture.

# --meaning-tr--

- `function draw() {` → **fonksiyon tanımlar**: "draw deyince şunları yap". Bu satır tek başına bir şey
  çizmez, sadece tarifi yazar.
- `{` ile `}` arasındaki satırlar fonksiyonun **gövdesi**. Okunaklı olsun diye iki boşluk içeriden yazılır.
- Gövdenin ilk iki satırı arka planı boyar: bu, **eski resmi siler**. Kare hareket edince eski yerinde iz
  kalmamasının sebebi bu.
- `draw()` → fonksiyonu **çağırır**: tarifi şimdi uygula. Sondaki `()` "çalıştır" demektir.

# --task--

Wrap the four drawing lines in `function draw() { ... }` (indent them by two spaces) and call `draw()` after it.

# --task-tr--

1. Dört çizim satırının (arka plan + yeşil kare) **üstüne** `function draw() {` yaz.
2. Dört satırı iki boşluk içeri al (satır başında `Tab` da olur).
3. Altlarına kapanan `}` yaz.
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

`draw()` should paint the square wherever `head` is.
tr: `draw()` kareyi `head` neredeyse oraya çizmeli.

```js
head = { x: 2, y: 7 }
draw()
assert.deepEqual($.rects('lime'), [{ x: 40, y: 140, w: 20, h: 20, color: 'lime' }])
```

`draw()` should repaint the background first, so old squares disappear.
tr: `draw()` önce arka planı boyamalı ki eski kareler silinsin.

```js
head = { x: 9, y: 9 }
draw()
assert.lengthOf($.rects('lime'), 1)
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 20
let head = { x: 5, y: 5 }

function draw() {
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'lime'
  ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL)
}

draw()
```
