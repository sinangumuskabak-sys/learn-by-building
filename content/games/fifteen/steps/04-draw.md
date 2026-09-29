---
title: A function that draws
title_tr: Çizen bir fonksiyon
skills: [prog.functions]
---

# --goal--

The picture will change after every slide, so it will be drawn again and again. We put the drawing lines in a
function named `draw`, and call it after `reset()`.

# --goal-tr--

Her kaydırmadan sonra resim değişecek; yani resmi **tekrar tekrar** çizeceğiz. Çizim satırlarını bir fonksiyonun
içine koyup ona `draw` (çiz) adını veriyoruz. Sonra tek kelimeyle, `draw()`, bütün resmi yeniden çizeriz.

Fonksiyon bir **yemek tarifi** gibidir: bir kez yazarsın, istediğin kadar pişirirsin. Ekran aynı kalacak.

# --code--

```js
function draw() {
  ctx.fillStyle = '#292524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

reset()
draw()
```

# --meaning--

- `function draw() { ... }` defines the recipe; it does not run yet.
- `draw()` under `reset()` runs it once the board is ready.

# --meaning-tr--

- `function draw() {` → **fonksiyon tanımlar**; tek başına bir şey çizmez, sadece tarifi yazar.
- `{` ile `}` arasındaki satırlar fonksiyonun **gövdesi**; iki boşluk içeriden yazılır.
- `draw()` → fonksiyonu **çağırır**. `reset()`'in altında: önce tahta hazırlanır, sonra çizilir.

# --task--

Wrap the two drawing lines in `function draw() { ... }` and write `draw()` under the `reset()` call at the bottom.

# --task-tr--

1. İki çizim satırının üstüne `function draw() {`, altına kapanan `}` yaz; iki satırı iki boşluk içeri al.
2. En alttaki `reset()` satırının **altına** `draw()` yaz.
3. **Çalıştır**: ekran aynı görünmeli.

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

Calling `draw()` should paint the table.
tr: `draw()` çağrılınca masa boyanmalı.

```js
draw()
assert.deepEqual($.rects(), [{ x: 0, y: 0, w: 400, h: 460, color: '#292524' }])
```

# --solution--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

function reset() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
}

function draw() {
  ctx.fillStyle = '#292524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

reset()
draw()
```
