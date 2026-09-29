---
title: A function that draws
title_tr: Çizen bir fonksiyon
skills: [prog.functions]
---

# --goal--

A game redraws its picture many times a second. We put the drawing lines in a function named `draw`, so one word
repaints everything.

# --goal-tr--

Bir oyun, ekranı **saniyede onlarca kez** yeniden çizer. Her seferinde bu satırları tekrar yazamayız. Bu yüzden
çizim satırlarını bir **fonksiyon**un içine koyup ona `draw` (çiz) adını veriyoruz. Sonra tek kelimeyle, `draw()`,
bütün resmi yeniden çizeriz.

Fonksiyon bir **yemek tarifi** gibidir: tarifi bir kez yazarsın, istediğin kadar pişirirsin. Ekran yine aynı
görünecek.

# --code--

```js
function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()
}

draw()
```

# --meaning--

- `function draw() { ... }` defines the recipe; it does not run yet.
- The body is indented by two spaces.
- `draw()` with parentheses runs it. It paints the sky first, which wipes the old picture.

# --meaning-tr--

- `function draw() {` → **fonksiyon tanımlar**: "draw deyince şunları yap". Bu satır tek başına bir şey çizmez,
  sadece tarifi yazar.
- `{` ile `}` arasındaki satırlar fonksiyonun **gövdesi**. Okunaklı olsun diye iki boşluk içeriden yazılır.
- Gövdenin ilk iki satırı gökyüzünü boyar: bu, **eski resmi siler**. Kuş hareket edince eski yerinde iz kalmamasının
  sebebi bu.
- `draw()` → fonksiyonu **çağırır**: tarifi şimdi uygula. Sondaki `()` "çalıştır" demektir.

# --task--

Wrap the six drawing lines in `function draw() { ... }` (indent them by two spaces) and call `draw()` after it.

# --task-tr--

1. Gökyüzünü boyayan `ctx.fillStyle = '#70c5ce'` satırının **üstüne** `function draw() {` yaz.
2. Altındaki bütün çizim satırlarını iki boşluk içeri al (satırları seçip `Tab`'a basmak da olur).
3. En alta kapanan `}` yaz.
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

`draw()` should draw the bird wherever it is, on a fresh sky.
tr: `draw()` kuşu nerede olursa orada, temiz bir gökyüzüne çizmeli.

```js
bird.y = 120
draw()
assert.deepEqual($.arcs(), [{ x: 100, y: 120, r: 14, color: 'gold' }])
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let bird = { x: 100, y: 300, r: 14 }

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()
}

draw()
```
