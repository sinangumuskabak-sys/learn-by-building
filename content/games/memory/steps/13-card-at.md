---
title: Which card is at a point?
title_tr: Bir noktada hangi kart var?
skills: [prog.arrays, game.input]
---

# --goal--

There are gaps between the cards, and a click in a gap should do nothing. So we ask each card: "is this point inside
you?" `cards.find` returns the first card that says yes, or `undefined`.

# --goal-tr--

Tıklayarak oynayacağız, ama önce şu soruyu cevaplamalıyız: **bir noktanın altında hangi kart var?** Kartların arasında
**boşluklar** var; boşluğa tıklamak hiçbir şey yapmamalı.

Bu yüzden her karta tek tek sorarız: "bu nokta **senin içinde mi**?" Buna **isabet testi** (hit testing) denir;
canvas'taki her tıklanabilir şey (düğmeler, menüler) böyle çalışır.

# --code--

```js
function cardAt(x, y) {
  return cards.find((card) => {
    const left = cardX(card)
    const top = cardY(card)
    return x >= left && x < left + CARD && y >= top && y < top + CARD
  })
}
```

# --meaning--

- A point is inside when it is past the left edge but before the right edge, **and** past the top but before the
  bottom. `&&` means "and".
- `cards.find(test)` returns the first card for which the test is true, or `undefined`.

# --meaning-tr--

- `cards.find((card) => { ... })` → kartları sırayla gezer; içteki fonksiyon `true` döndüren **ilk** kartı verir.
  Hiçbiri tutmazsa sonuç `undefined`: "hiçbir şey".
- `const left = cardX(card)`, `const top = cardY(card)` → kartın sol ve üst kenarı.
- `x >= left && x < left + CARD` → `>=` "büyük ya da eşit", `<` "küçük": nokta sol kenarda ya da sağında, ama sağ
  kenarın solunda.
- `&&` → "**ve**": dört koşulun hepsi doğru olmalı; biri bile yanlışsa `false`.
- Ok fonksiyonunun gövdesi birkaç satırsa `{ }` içine yazılır ve cevap `return` ile verilir.

# --task--

Under `cardY`, leave an empty line and write `cardAt`. Press **Run**.

# --task-tr--

`cardY` fonksiyonunun altına bir boş satır bırak ve `cardAt` fonksiyonunu yaz. **Çalıştır**.

# --hint--

Use `>=` for the left and top edges and `<` for the right and bottom ones.

# --hint-tr--

Sol ve üst kenar için `>=`, sağ ve alt kenar için `<` kullan.

# --tests--

`cardAt()` should find the card under a point, including its edges.
tr: `cardAt()` bir noktanın altındaki kartı, kenarları dahil bulmalı.

```js
assert.strictEqual(cardAt(50, 90), cards[0])
assert.strictEqual(cardAt(12, 52), cards[0], 'top-left corner of the first card')
assert.strictEqual(cardAt(96.9, 136.9), cards[0], 'just inside the bottom-right corner')
assert.strictEqual(cardAt(250, 190), cards[6])
assert.strictEqual(cardAt(350, 400), cards[15])
```

Points in the gaps or the top strip should not hit any card.
tr: Boşluklardaki ya da üst şeritteki noktalar hiçbir karta isabet etmemeli.

```js
assert.isUndefined(cardAt(100, 90), 'gap between the first two columns')
assert.isUndefined(cardAt(50, 140), 'gap between the first two rows')
assert.isUndefined(cardAt(200, 20), 'the top strip')
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

// Fisher–Yates: every order is equally likely.
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

function newGame() {
  const deck = shuffle([...SYMBOLS, ...SYMBOLS])
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

function cardAt(x, y) {
  return cards.find((card) => {
    const left = cardX(card)
    const top = cardY(card)
    return x >= left && x < left + CARD && y >= top && y < top + CARD
  })
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.textBaseline = 'middle'
  ctx.font = '44px sans-serif'
  ctx.textAlign = 'center'
  for (const card of cards) {
    const x = cardX(card)
    const y = cardY(card)
    if (card.faceUp) {
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(x, y, CARD, CARD)
      ctx.fillText(card.symbol, x + CARD / 2, y + CARD / 2)
    } else {
      ctx.fillStyle = '#6366f1'
      ctx.fillRect(x, y, CARD, CARD)
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
