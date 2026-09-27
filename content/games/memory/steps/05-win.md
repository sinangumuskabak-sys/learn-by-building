---
title: All pairs found
title_tr: Bütün eşler bulundu
skills: [game.state]
---

# --explanation--

The game is won when every card is matched: `cards.every((card) => card.matched)`. There is no need for a separate
`won` variable that could fall out of sync. The answer can be **derived** from the cards whenever you need it.

That is a rule worth keeping: **store as little state as possible, derive the rest**. Every extra variable is one more
thing that has to be updated in every right place, and one more way to create a bug where two variables disagree. A
small function like `won()` computes the answer fresh each time, so it can never be stale.

When the game is won, show the result over the board and let a click start a new game, which reshuffles the cards so
it is never the same layout twice.

# --explanation-tr--

Her kart eşleştiğinde oyun kazanılır: `cards.every((card) => card.matched)`. Senkronu bozulabilecek ayrı bir `won`
değişkenine gerek yok. Cevap, ne zaman gerekirse kartlardan **türetilebilir**.

Bu akılda tutmaya değer bir kural: **olabildiğince az durum sakla, gerisini türet**. Her fazladan değişken, her doğru
yerde güncellenmesi gereken bir şey daha ve iki değişkenin birbiriyle çeliştiği bir hata yaratmanın bir yolu daha
demektir. `won()` gibi küçük bir fonksiyon cevabı her seferinde yeniden hesaplar; böylece asla bayat kalamaz.

Oyun kazanılınca sonucu tahtanın üstünde göster ve bir tıklamanın yeni bir oyun başlatmasına izin ver; kartlar yeniden
karışır, böylece aynı dizilim hiç iki kez gelmez.

# --task--

1. Write `function won()` that returns whether every card is matched.
2. In the click handler, if the game is won, start a `newGame()` instead of flipping.
3. When won, draw over the board: a `'rgba(0, 0, 0, 0.6)'` rectangle covering the canvas, then in white and centered:
   `You found them all!`, `in 12 moves` (the real number), and `Click to play again`.

# --task-tr--

1. Her kart eşleşmiş mi, onu döndüren `function won()` yaz.
2. Tıklama işleyicisinde oyun kazanıldıysa kart çevirmek yerine `newGame()` başlat.
3. Kazanılınca tahtanın üstüne çiz: canvas'ı kaplayan `'rgba(0, 0, 0, 0.6)'` bir dikdörtgen, sonra beyaz ve ortalı:
   `You found them all!`, `in 12 moves` (gerçek sayı) ve `Click to play again`.

# --tests--

`won()` should be true only when every card is matched.
tr: `won()` yalnızca her kart eşleştiğinde doğru olmalı.

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
assert.isTrue(won())
assert.includeMembers($.texts(), ['You found them all!', 'in 12 moves', 'Click to play again'])
```

Clicking after winning should start a fresh, reshuffled game.
tr: Kazandıktan sonra tıklamak yeni ve yeniden karıştırılmış bir oyun başlatmalı.

```js
const before = cards.map((c) => c.symbol).join()
cards.forEach((c) => (c.matched = c.faceUp = true))
moves = 20
$.click(200, 200)
assert.isFalse(won())
assert.strictEqual(moves, 0)
assert.isTrue(cards.every((c) => !c.faceUp), 'the click only starts the new game; it does not flip a card')
assert.notStrictEqual(cards.map((c) => c.symbol).join(), before)
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
      draw()
    }, 800)
  }
}

canvas.addEventListener('click', (event) => {
  if (won()) {
    newGame()
  } else {
    // The canvas may be displayed at a different size than its own pixels, so scale the click.
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (canvas.height / rect.height)
    flip(cardAt(x, y))
  }
  draw()
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

newGame()
draw()
```
