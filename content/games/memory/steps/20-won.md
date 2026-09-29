---
title: All pairs found
title_tr: Bütün eşler bulundu
skills: [game.state, game.canvas]
---

# --goal--

The game is won when every card is matched. A small function `won()` works the answer out from the cards each time,
and `draw` shows the result over a dimmed board.

# --goal-tr--

Oyunun bir **sonu** olmalı: bütün kartlar eşleşince kazanırsın. Tahta kararacak ve ortada `You found them all!` (hepsini
buldun!), kaç hamlede bitirdiğin ve `Click to play again` (tekrar oynamak için tıkla) yazacak.

Ayrı bir `won = true` değişkeni tutmak yerine cevabı kartlardan **her seferinde hesaplayan** küçük bir `won()`
fonksiyonu yazarız. Neden? Her fazladan değişken, doğru her yerde güncellenmesi gereken bir şey daha demek. İyi bir
kural: **olabildiğince az şey sakla, gerisini hesapla.**

# --code--

```js
function won() {
  return cards.every((card) => card.matched)
}

  if (won()) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText('You found them all!', canvas.width / 2, 190)
    ctx.font = '20px sans-serif'
    ctx.fillText('in ' + moves + ' moves', canvas.width / 2, 230)
    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 270)
  }
```

# --meaning--

- `cards.every(test)` is true only if the test is true for **every** card.
- `rgba(0, 0, 0, 0.6)` is black at 60% strength: a curtain over the board.
- The texts are centered at `canvas.width / 2`, because `textAlign` is still `'center'`.

# --meaning-tr--

- `cards.every((card) => card.matched)` → `every` ("her biri"): **hepsi** eşleştiyse `true`, bir tanesi bile
  eşleşmediyse `false`.
- `if (won()) { ... }` → `draw`'un sonunda: kazandıysak üstüne sonucu çiz.
- `'rgba(0, 0, 0, 0.6)'` → **yarı saydam renk**: ilk üç sayı kırmızı, yeşil, mavi (0–255), dördüncüsü saydamlık (0
  görünmez, 1 tam dolu). %60 siyah bir perde; kartlar arkadan hafifçe görünür.
- `'in ' + moves + ' moves'` → `'in 12 moves'`. Boşluklara dikkat.
- `canvas.width / 2` → yatayda orta (200). `textAlign` hâlâ `'center'`, bu yüzden yazılar ortalanır.

# --task--

1. Above `function flip`, write `won` and an empty line.
2. In `draw`, after the card loop's closing `}`, leave an empty line and write the `if (won())` block.

# --task-tr--

1. `function flip(card) {` satırının **üstüne** `won` fonksiyonunu ve bir boş satır yaz.
2. `draw` içinde kartları çizen döngünün kapanan `}` işaretinin altına bir boş satır bırak ve `if (won())` bloğunu
   fonksiyonun son `}` işaretinin **üstüne** yaz.
3. **Çalıştır** ve bütün eşleri bul: tahta kararmalı ve üç satır yazı çıkmalı.

# --hint--

Check the spaces in `'in '` and `' moves'`.

# --hint-tr--

`'in '` ve `' moves'` içindeki boşlukları kontrol et.

# --tests--

`won()` should be true only when every card is matched.
tr: `won()` yalnız her kart eşleştiğinde doğru olmalı.

```js
assert.isFalse(won())
cards.forEach((c) => (c.matched = c.faceUp = true))
assert.isTrue(won())
cards[3].matched = false
assert.isFalse(won())
```

Finding the last pair should show the result.
tr: Son çifti bulmak sonucu göstermeli.

```js
for (const card of cards) card.matched = card.faceUp = card.symbol !== cards[0].symbol
moves = 11
const [a, b] = cards.filter((c) => !c.matched)
$.click(cardX(a) + 40, cardY(a) + 40)
$.click(cardX(b) + 40, cardY(b) + 40)
$.tick(1)
assert.isTrue(won())
assert.includeMembers($.texts(), ['You found them all!', 'in 12 moves', 'Click to play again'])
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
let opened // the cards turned over this turn (0, 1 or 2)
let moves

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
  opened = []
  moves = 0
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

function won() {
  return cards.every((card) => card.matched)
}

function flip(card) {
  if (!card || card.faceUp || opened.length === 2) return
  card.faceUp = true
  opened.push(card)
  if (opened.length < 2) return

  moves += 1
  const [a, b] = opened
  if (a.symbol === b.symbol) {
    a.matched = true
    b.matched = true
    opened = []
  } else {
    // Give the player time to see the second card before hiding both again.
    setTimeout(() => {
      a.faceUp = false
      b.faceUp = false
      opened = []
    }, 800)
  }
}

canvas.addEventListener('click', (event) => {
  // The canvas may be displayed at a different size than its own pixels, so scale the click.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  flip(cardAt(x, y))
})

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Moves: ' + moves, GAP, 22)

  ctx.font = '44px sans-serif'
  ctx.textAlign = 'center'
  for (const card of cards) {
    const x = cardX(card)
    const y = cardY(card)
    if (card.faceUp) {
      ctx.fillStyle = card.matched ? '#bbf7d0' : '#f8fafc'
      ctx.fillRect(x, y, CARD, CARD)
      ctx.fillText(card.symbol, x + CARD / 2, y + CARD / 2)
    } else {
      ctx.fillStyle = '#6366f1'
      ctx.fillRect(x, y, CARD, CARD)
    }
  }

  if (won()) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText('You found them all!', canvas.width / 2, 190)
    ctx.font = '20px sans-serif'
    ctx.fillText('in ' + moves + ' moves', canvas.width / 2, 230)
    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 270)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
