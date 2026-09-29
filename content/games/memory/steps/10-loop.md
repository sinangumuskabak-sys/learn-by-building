---
title: Draw again and again
title_tr: Durmadan çiz
skills: [game.loop]
---

# --goal--

Cards will turn over, so the picture must follow every change. A loop redraws the board before every screen refresh
(`requestAnimationFrame`, about 60 times a second). Then any change to a card shows up by itself.

# --goal-tr--

Kartlar açılıp kapanacak. Her değişiklikten sonra `draw()` demeyi hatırlamak yerine tahtayı **sürekli** yeniden
çizeceğiz: saniyede yaklaşık **60 kez**. Çizgi film kareleri gibi.

`requestAnimationFrame` tarayıcıya "ekranı bir sonraki yenilemeden önce bu fonksiyonu çalıştır" der. Döngü kendini her
seferinde yeniden istediği için hiç durmaz. Böylece bir kartın bilgisi değişince ekran **kendiliğinden** değişir.

# --code--

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```

# --meaning--

- `loop` draws, then books the next turn with `requestAnimationFrame(loop)`.
- The last line starts the loop. It replaces the single `draw()` call.
- `loop` has no parentheses there: we hand over the function, the browser calls it later.

# --meaning-tr--

- `function loop() {` → döngünün **bir turu**: çiz, sonra bir sonraki turu iste.
- `requestAnimationFrame(loop)` → "ekran bir sonraki yenilenmeden önce **loop'u yine** çalıştır".
- Dikkat: burada `loop` **parantezsiz**. `loop()` "şimdi çalıştır" olurdu; `loop` ise "bu tarifi al, sırası gelince sen
  çalıştır" demek.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**; eski tek seferlik `draw()` çağrısının yerini alır.

# --task--

Write `loop` above `newGame()` at the bottom, and replace the last `draw()` with `requestAnimationFrame(loop)`.

# --task-tr--

1. En alttaki `newGame()` satırının **üstüne** `loop` fonksiyonunu ve bir boş satır yaz.
2. En alttaki `draw()` satırını sil; yerine `requestAnimationFrame(loop)` yaz.
3. **Çalıştır**: ekran aynı görünür; kontroller döngünün döndüğüne bakacak.

# --hint--

Did you delete the old `draw()` line at the bottom and start the loop with `requestAnimationFrame(loop)`?

# --hint-tr--

En alttaki eski `draw()` satırını silip yerine `requestAnimationFrame(loop)` yazdın mı?

# --tests--

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1)
```

A change to the cards should show on the next frame.
tr: Kartlardaki bir değişiklik bir sonraki karede görünmeli.

```js
cards = cards.slice(0, 5)
$.tick(1)
assert.lengthOf($.rects('#6366f1'), 5)
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

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
