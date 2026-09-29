---
title: Swap sides halfway
title_tr: Yarı yolda yüz değiştir
skills: [game.state]
---

# --goal--

`draw` now looks at `flip` instead of `faceUp`: the face shows from `flip >= 0.5`, the back before. A card now shows
its face a few frames after the click.

# --goal-tr--

Çizim artık gerçeğe (`faceUp`) değil, **görünen** duruma (`flip`) baksın: `flip` yarıyı (0.5) geçince ön yüz, geçmeden
arka yüz. Kart, tıkladıktan birkaç kare sonra yüzünü gösterecek; tam dönüşün ortasında.

# --code--

```js
if (card.flip >= 0.5) {
```

# --meaning--

- `flip` reaches 0.5 after 5 frames, so the face appears a moment after the click, and the back returns a moment after
  a card is hidden.

# --meaning-tr--

- `if (card.flip >= 0.5) {` → `>=` "büyük ya da eşit": görünen dönüş yarıyı geçtiyse ön yüzü çiz.
- Kurallar yine `faceUp`'a bakıyor; yalnız **çizim** `flip`'e bakıyor. Gerçek ile görünen ayrı.

# --task--

In `draw`, change `if (card.faceUp)` to `if (card.flip >= 0.5)`.

# --task-tr--

`draw` içindeki `if (card.faceUp) {` satırını `if (card.flip >= 0.5) {` yap. **Çalıştır**: bir karta tıklayınca meyve çok kısa bir gecikmeyle çıkmalı.

# --tests--

The face should show only from halfway through the turn.
tr: Ön yüz ancak dönüşün yarısından sonra görünmeli.

```js
flip(cards[0])
$.tick(4)
assert.deepEqual($.texts().filter((t) => t === cards[0].symbol), [])
$.tick(1)
assert.include($.texts(), cards[0].symbol)
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
    flip: 0, // 0 = showing its back, 1 = showing its face; follows faceUp over a few frames
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
  if (won()) {
    newGame()
    return
  }
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
    if (card.flip >= 0.5) {
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
  for (const card of cards) {
    card.flip = card.faceUp ? Math.min(1, card.flip + 0.1) : Math.max(0, card.flip - 0.1)
  }
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
