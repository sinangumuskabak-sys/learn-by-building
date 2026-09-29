---
title: A function that draws
title_tr: Çizen bir fonksiyon
skills: [prog.functions]
---

# --goal--

The picture will change with every letter you type, so it will be drawn again and again. We put the drawing lines in
a function named `draw`; one call, `draw()`, repaints everything.

# --goal-tr--

Yazdığın her harfle resim değişecek; yani resmi **tekrar tekrar** çizeceğiz. Çizim satırlarını bir **fonksiyon**un
içine koyup ona `draw` (çiz) adını veriyoruz. Sonra tek kelimeyle, `draw()`, bütün resmi yeniden çizeriz.

Fonksiyon bir **yemek tarifi** gibidir: bir kez yazarsın, istediğin kadar pişirirsin. Ekran aynı kalacak.

# --code--

```js
function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```

# --meaning--

- `function draw() { ... }` defines the recipe; it does not run yet.
- The lines between `{` and `}` are its body, indented by two spaces.
- `draw()` with parentheses runs it.

# --meaning-tr--

- `function draw() {` → **fonksiyon tanımlar**: "draw deyince şunları yap". Tek başına bir şey çizmez.
- `{` ile `}` arasındaki satırlar fonksiyonun **gövdesi**; okunaklı olsun diye iki boşluk içeriden yazılır.
- `draw()` → fonksiyonu **çağırır**: tarifi şimdi uygula. Sondaki `()` "çalıştır" demek.

# --task--

Wrap the two drawing lines in `function draw() { ... }` (indented by two spaces) and call `draw()` after it.

# --task-tr--

1. İki çizim satırının **üstüne** `function draw() {` yaz.
2. İki satırı iki boşluk içeri al; altlarına kapanan `}` yaz.
3. Bir boş satırdan sonra `draw()` yaz. **Çalıştır**: ekran aynı görünmeli.

# --hint--

If the canvas stays blank you probably forgot the `draw()` call at the very end.

# --hint-tr--

Tuval boş kalıyorsa büyük ihtimalle en alttaki `draw()` çağrısını unuttun.

# --tests--

`draw` should be a function.
tr: `draw` bir fonksiyon olmalı.

```js
assert.isFunction(draw)
```

Calling `draw()` should paint the background.
tr: `draw()` çağrılınca arka plan boyanmalı.

```js
draw()
assert.deepEqual($.rects(), [{ x: 0, y: 0, w: 360, h: 560, color: '#18181b' }])
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```
