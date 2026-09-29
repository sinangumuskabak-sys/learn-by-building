---
title: A function that draws
title_tr: Çizen bir fonksiyon
skills: [prog.functions]
---

# --goal--

The picture will change after every guess, so it will be drawn again and again. We put the drawing lines in a
function named `draw`; one call, `draw()`, repaints everything.

# --goal-tr--

Her tahminden sonra resim değişecek: yeni harfler, yeni çöp adam parçaları. Yani resmi **tekrar tekrar** çizeceğiz.
Bunun için çizim satırlarını bir **fonksiyon**un içine koyup ona `draw` (çiz) adını veriyoruz. Sonra tek kelimeyle,
`draw()`, bütün resmi yeniden çizeriz.

Fonksiyon bir **yemek tarifi** gibidir: tarifi bir kez yazarsın, istediğin kadar pişirirsin. Ekran aynı kalacak.

# --code--

```js
function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```

# --meaning--

- `function draw() { ... }` defines the recipe; it does not run yet.
- The lines between `{` and `}` are its body, indented by two spaces.
- `draw()` with parentheses runs it.

# --meaning-tr--

- `function draw() {` → **fonksiyon tanımlar**: "draw deyince şunları yap". Bu satır tek başına bir şey çizmez,
  sadece tarifi yazar.
- `{` ile `}` arasındaki satırlar fonksiyonun **gövdesi**. Okunaklı olsun diye iki boşluk içeriden yazılır.
- `draw()` → fonksiyonu **çağırır**: tarifi şimdi uygula. Sondaki `()` "çalıştır" demek.

# --task--

Wrap the two drawing lines in `function draw() { ... }` (indented by two spaces) and call `draw()` after it.

# --task-tr--

1. İki çizim satırının **üstüne** `function draw() {` yaz.
2. İki satırı iki boşluk içeri al.
3. Altlarına kapanan `}` yaz.
4. Bir boş satırdan sonra `draw()` yaz. **Çalıştır**: ekran aynı görünmeli.

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

Calling `draw()` should paint the whole canvas.
tr: `draw()` çağrılınca bütün tuval boyanmalı.

```js
draw()
assert.deepEqual($.rects(), [{ x: 0, y: 0, w: 480, h: 480, color: '#fefce8' }])
```

# --solution--

```js
// Hangman, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const WORDS = [
  'APPLE', 'BANANA', 'CASTLE', 'DRAGON', 'ELEPHANT', 'FOREST', 'GARDEN', 'HAMMER', 'ISLAND', 'JACKET',
  'KITCHEN', 'LEMON', 'MONKEY', 'NOTEBOOK', 'ORANGE', 'PENGUIN', 'QUEEN', 'ROCKET', 'SPIDER', 'TIGER',
  'UMBRELLA', 'VIOLIN', 'WINDOW', 'YELLOW', 'ZEBRA', 'BRIDGE', 'CANDLE', 'DOLPHIN', 'ENGINE', 'FLOWER',
  'GUITAR', 'HONEY', 'IGLOO', 'JUNGLE', 'KANGAROO', 'LADDER', 'MARKET', 'NEEDLE', 'OCEAN', 'PIRATE',
  'RABBIT', 'SILVER', 'TURTLE', 'VALLEY', 'WIZARD', 'PLANET', 'COOKIE', 'PUZZLE', 'KEYBOARD', 'CAMERA',
]

function draw() {
  ctx.fillStyle = '#fefce8'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

draw()
```
