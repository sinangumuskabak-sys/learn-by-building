---
title: Count the moves
title_tr: Hamleleri say
skills: [game.state]
---

# --goal--

A move is two cards turned over. We count moves in `moves`: zero in a new game, one more each time the second card of
a turn is opened.

# --goal-tr--

Oyunu ne kadar iyi oynadığını ölçmek için **hamle** sayacağız. Bir hamle, iki kart açmak demek. Az hamlede bitiren daha
iyi hafızaya sahip!

`moves` yeni oyunda 0'dan başlar ve bir turun ikinci kartı her açıldığında bir artar.

# --code--

```js
let moves

  moves = 0

  if (opened.length < 2) return

  moves += 1
```

# --meaning--

- `moves` starts at 0 in `newGame`.
- `moves += 1` sits right after the "wait for the second card" line, so it counts once per pair of cards.

# --meaning-tr--

- `let moves` → hamle sayısı; `newGame` içinde `moves = 0`.
- `moves += 1` → `+=` "üstüne ekle": 1 artır. Bu satır `if (opened.length < 2) return` satırının **altında**; yani yalnız
  ikinci kart açılınca çalışır: her iki kartta bir hamle.

# --task--

1. Under `let opened`, write `let moves`.
2. In `newGame`, under `opened = []`, write `moves = 0`.
3. In `flip`, under the empty line after `if (opened.length < 2) return`, write `moves += 1`.

# --task-tr--

1. `let opened ...` satırının altına `let moves` yaz.
2. `newGame` içinde `opened = []` satırının altına `moves = 0` yaz.
3. `flip` içinde `if (opened.length < 2) return` satırından sonraki boş satırın altına, `const [a, b] = opened`
   satırının **üstüne** `moves += 1` yaz.
4. **Çalıştır**. Sayı henüz ekranda görünmüyor; kontroller sayacı deneyecek.

# --tests--

A new game should start with 0 moves.
tr: Yeni oyun 0 hamleyle başlamalı.

```js
assert.strictEqual(moves, 0)
```

Every two cards should count as one move, pair or not.
tr: Her iki kart, eş olsun olmasın, bir hamle sayılmalı.

```js
const [a, b] = cards.filter((c) => c.symbol === cards[0].symbol)
flip(a)
assert.strictEqual(moves, 0)
flip(b)
assert.strictEqual(moves, 1)
const c = cards.find((card) => !card.matched)
const d = cards.find((card) => !card.matched && card.symbol !== c.symbol)
flip(c)
flip(d)
assert.strictEqual(moves, 2)
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
