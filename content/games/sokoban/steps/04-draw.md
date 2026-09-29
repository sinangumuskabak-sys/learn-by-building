---
title: A function that draws
title_tr: Çizen bir fonksiyon
skills: [prog.functions]
---

# --goal--

Sokoban is turn-based: after every key press the picture is drawn again. We put the drawing lines in a function
named `draw`, so one call, `draw()`, repaints everything.

# --goal-tr--

Sokoban'da zaman akmaz: sen bir tuşa basarsın, bir şey değişir, resim **yeniden çizilir**. Resmi tekrar tekrar
çizeceğimiz için çizim satırlarını bir **fonksiyon**un içine koyup ona `draw` (çiz) adını veriyoruz.

Fonksiyon bir **yemek tarifi** gibidir: bir kez yazarsın, istediğin kadar pişirirsin. Ekran aynı kalacak.

# --code--

```js
function draw() {
  ctx.fillStyle = '#1c1917'
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

Calling `draw()` should paint the floor.
tr: `draw()` çağrılınca zemin boyanmalı.

```js
draw()
assert.deepEqual($.rects(), [{ x: 0, y: 0, w: 480, h: 520, color: '#1c1917' }])
```

# --solution--

```js
// Sokoban, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// The classic Sokoban text format: # wall, . goal, $ box, * box on a goal, @ player, + player on a goal.
const LEVELS = [
  [
    '#####',
    '#@$.#',
    '#####',
  ],
]

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```
