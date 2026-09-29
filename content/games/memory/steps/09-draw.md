---
title: Draw the cards from the list
title_tr: Kartları listeden çiz
skills: [prog.functions, prog.loops]
---

# --goal--

Now the drawing reads the cards instead of loop counters: a function `draw` paints the table, then each card at its
own place. The nested loops are no longer needed.

# --goal-tr--

Kartlar artık kendi yerlerini biliyor. Çizim de onlara bakmalı: "listedeki **her kart** için, kartın kendi yerine bir
kare çiz". İç içe döngülere gerek kalmıyor.

Çizimi bir **fonksiyon**a (`draw`) koyuyoruz, çünkü kartlar açılıp kapandıkça tahtayı tekrar tekrar çizmemiz gerekecek.
Ekran aynı görünecek.

# --code--

```js
function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const card of cards) {
    const x = cardX(card)
    const y = cardY(card)
    ctx.fillStyle = '#6366f1'
    ctx.fillRect(x, y, CARD, CARD)
  }
}

newGame()
draw()
```

# --meaning--

- `for (const card of cards)` runs once for each card, calling it `card`.
- `x` and `y` come from `cardX` and `cardY`.
- At the bottom, `newGame()` builds the cards first, then `draw()` paints them.

# --meaning-tr--

- `function draw() { ... }` → çizim tarifi. Önce masayı boyar (eski resmi siler), sonra kartları çizer.
- `for (const card of cards) {` → "`cards` listesindeki **her kart** için, sırayla, bir kez yap". Her turda o anki
  karta `card` denir.
- `const x = cardX(card)`, `const y = cardY(card)` → önceki adımın fonksiyonları: kartın köşesi.
- En altta önce `newGame()` (kartlar hazır), sonra `draw()` (çiz). Sıra önemli: kart yokken çizemeyiz.

# --task--

Replace the loose drawing lines (background and loops) with the `draw` function, and call `draw()` after `newGame()`.

# --task-tr--

1. `newGame()` çağrısının üstündeki çizim satırlarını (arka plan, mor renk ve iç içe döngüler) sil.
2. Onların yerine `draw` fonksiyonunu yaz.
3. En alttaki `newGame()` satırının altına `draw()` yaz.
4. **Çalıştır**: ekran aynı görünmeli.

# --hint--

If the screen is empty, check the two calls at the bottom: `newGame()` first, then `draw()`.

# --hint-tr--

Ekran boşsa en alttaki iki çağrıyı kontrol et: önce `newGame()`, sonra `draw()`.

# --tests--

`draw` should be a function.
tr: `draw` bir fonksiyon olmalı.

```js
assert.isFunction(draw)
```

`draw()` should draw one card for each card in the list.
tr: `draw()` listedeki her kart için bir kart çizmeli.

```js
cards = cards.slice(0, 3)
draw()
assert.deepEqual($.rects('#6366f1').map((r) => [r.x, r.y]), [[12, 52], [109, 52], [206, 52]])
```

# --solution--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4 // cards per row and per column
const CARD = 85
const GAP = 12
const TOP = 40 // room for the move counter above the cards
const SYMBOLS = ['🍎', '🍌', '🍇', '🍒', '🥝', '🍋', '🍉', '🍑']

let cards

function newGame() {
  const deck = [...SYMBOLS, ...SYMBOLS]
  cards = deck.map((symbol, index) => ({
    symbol,
    col: index % SIZE,
    row: Math.floor(index / SIZE),
    faceUp: false,
    matched: false,
  }))
}

function cardX(card) {
  return GAP + card.col * (CARD + GAP)
}

function cardY(card) {
  return TOP + GAP + card.row * (CARD + GAP)
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const card of cards) {
    const x = cardX(card)
    const y = cardY(card)
    ctx.fillStyle = '#6366f1'
    ctx.fillRect(x, y, CARD, CARD)
  }
}

newGame()
draw()
```
