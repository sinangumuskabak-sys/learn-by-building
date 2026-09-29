---
title: A function that draws
title_tr: Çizen bir fonksiyon
skills: [prog.functions]
---

# --goal--

Every time a mark is placed, the whole board must be drawn again. We put the drawing lines in a function named
`draw`, so one word repaints everything.

# --goal-tr--

Her X ya da O konduğunda tahtanın **baştan çizilmesi** gerekecek. Çizim satırlarını her seferinde tekrar yazamayız.
Bu yüzden onları bir **fonksiyon**un içine koyup ona `draw` (çiz) adını veriyoruz.

Fonksiyon bir **yemek tarifi** gibidir: tarifi bir kez yazarsın, istediğin kadar pişirirsin. Ekran yine aynı
görünecek.

# --code--

```js
function draw() {
  ctx.fillStyle = '#1e1e2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#585b70'
  for (let i = 1; i < 3; i++) {
    ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
    ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
  }
}

draw()
```

# --meaning--

- `function draw() { ... }` defines the recipe; it does not run yet.
- The body is indented by two spaces.
- `draw()` with parentheses runs it. It paints the background first, which wipes the old picture.

# --meaning-tr--

- `function draw() {` → **fonksiyon tanımlar**: "draw deyince şunları yap". Bu satır tek başına bir şey çizmez,
  sadece tarifi yazar.
- `{` ile `}` arasındaki satırlar fonksiyonun **gövdesi**. İki boşluk içeriden yazılır; döngünün içi ise dört
  boşluk içeride kalır.
- Gövdenin ilk iki satırı arka planı boyar: bu, **eski resmi siler**. Yeniden çizince eski çizimin izi kalmaz.
- `draw()` → fonksiyonu **çağırır**: tarifi şimdi uygula. Sondaki `()` "çalıştır" demektir.

# --task--

Wrap all the drawing lines in `function draw() { ... }` (indent them by two spaces) and call `draw()` after it.

# --task-tr--

1. Arka planı boyayan `ctx.fillStyle = '#1e1e2e'` satırının **üstüne** `function draw() {` yaz.
2. Ondan döngünün kapanan `}` işaretine kadar bütün satırları iki boşluk içeri al (satırları seçip `Tab`'a basmak da olur).
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

Calling `draw()` again should repaint the board from scratch.
tr: `draw()`'u yeniden çağırmak tahtayı baştan çizmeli.

```js
draw()
draw()
assert.lengthOf($.rects('#1e1e2e'), 1)
assert.lengthOf($.rects('#585b70'), 4)
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100

let board = ['', '', '', '', '', '', '', '', '']

function draw() {
  ctx.fillStyle = '#1e1e2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#585b70'
  for (let i = 1; i < 3; i++) {
    ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
    ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
  }
}

draw()
```
