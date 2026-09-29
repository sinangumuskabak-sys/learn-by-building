---
title: Play again
title_tr: Tekrar oyna
skills: [game.input, game.state]
---

# --goal--

After a win, a click starts a new game instead of turning a card. `newGame` reshuffles, so the layout is never the same
twice.

# --goal-tr--

Ekran `Click to play again` diyor; sözünü tutalım. Kazandıktan sonra bir tıklama kart çevirmek yerine **yeni oyun**
başlatsın. `newGame` kartları yeniden karıştırdığı için her oyunun dizilişi farklı olur.

# --code--

```js
canvas.addEventListener('click', (event) => {
  if (won()) {
    newGame()
    return
  }
```

# --meaning--

- If the game is won, `newGame()` deals a fresh board and `return` stops the click from also turning a card.

# --meaning-tr--

- `if (won()) {` → oyun bittiyse...
  - `newGame()` → yeni, karışık kartlar; hamleler sıfır.
  - `return` → dinleyiciden hemen çık. `return` olmasaydı aynı tıklama yeni oyunda bir kart da açardı.

# --task--

At the top of the click listener, write the `if (won())` block.

# --task-tr--

Tıklama dinleyicisinin içinde en üste, yorum satırının **üstüne** `if (won()) { ... }` bloğunu yaz. **Çalıştır**, bir oyunu bitir ve tıkla: kartlar karışık ve kapalı olarak yeniden gelmeli.

# --predict--

You win and click on a card. Will that card be turned over in the new game?
- [ ] Yes
- [x] No: `return` leaves the listener right after `newGame()`
- [ ] Only if it is a pair

# --predict-tr--

Kazandın ve bir karta tıkladın. Bu kart yeni oyunda açılır mı?
- [ ] Evet
- [x] Hayır: `return`, `newGame()`'den hemen sonra dinleyiciden çıkar
- [ ] Yalnız eşiyse

# --tests--

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
