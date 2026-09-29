---
title: Card faces
title_tr: Kart yüzleri
skills: [game.canvas]
---

# --goal--

Now each card shows its rank in the top-left corner and a big suit symbol in the middle. Hearts and diamonds are red,
spades and clubs dark.

# --goal-tr--

Her kart değerini sol üst köşede, rengini ortada büyük bir sembolle göstersin. Kupa ve karo **kırmızı**, maça ve sinek
koyu.

# --code--

```js
ctx.fillStyle = c.suit === '♥' || c.suit === '♦' ? '#dc2626' : '#0f172a'
ctx.font = 'bold 18px sans-serif'
ctx.textAlign = 'left'
ctx.fillText(c.rank, x + 6, y + 22)
ctx.font = '34px sans-serif'
ctx.textAlign = 'center'
ctx.fillText(c.suit, x + CARD_W / 2, y + 64)
```

# --meaning--

- `||` means "or": red for hearts or diamonds.
- The rank is written from the left, 6 pixels in; the suit is centered on the card.

# --meaning-tr--

- `c.suit === '♥' || c.suit === '♦'` → kupa **veya** karo ise kırmızı, değilse koyu.
- Değer: sol üstten 6 piksel içeride, sola hizalı. Renk sembolü: `textAlign = 'center'` ile kartın ortasına.

# --task--

At the end of `drawCard`, write the face lines.

# --task-tr--

`drawCard`'ın sonuna yüz satırlarını yaz. **Çalıştır**: kartların değerini görmelisin.

# --tests--

Each card should show its rank and suit, hearts in red.
tr: Her kart değerini ve rengini göstermeli, kupa kırmızı.

```js
player = [card('Q', '♥'), card('7', '♣')]
draw()
const texts = $.texts()
for (const t of ['Q', '♥', '7', '♣']) assert.include(texts, t)
const heart = $.screen().find((c) => c.op === 'fillText' && c.args[0] === '♥')
assert.strictEqual(heart.fill, '#dc2626')
const club = $.screen().find((c) => c.op === 'fillText' && c.args[0] === '♣')
assert.strictEqual(club.fill, '#0f172a')
```

# --solution--

```js
// Blackjack, step by step.
// The page already has <canvas id="game" width="480" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const SUITS = ['♠', '♥', '♦', '♣']
const CARD_W = 64
const CARD_H = 90
const DEALER_Y = 70
const PLAYER_Y = 250

let deck
let player
let dealer

const card = (rank, suit) => ({ rank, suit })

// A new shuffled deck of 52 cards (Fisher–Yates).
function newDeck() {
  deck = []
  for (const suit of SUITS) for (const rank of RANKS) deck.push(card(rank, suit))
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
}

const nextCard = () => deck.pop()

function deal() {
  player = [nextCard(), nextCard()]
  dealer = [nextCard(), nextCard()]
}

function drawCard(c, x, y) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x, y, CARD_W, CARD_H)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CARD_W, CARD_H)
  ctx.fillStyle = c.suit === '♥' || c.suit === '♦' ? '#dc2626' : '#0f172a'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(c.rank, x + 6, y + 22)
  ctx.font = '34px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(c.suit, x + CARD_W / 2, y + 64)
}

function drawHand(hand, y) {
  hand.forEach((c, i) => drawCard(c, 20 + i * (CARD_W + 8), y))
}

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawHand(dealer, DEALER_Y)
  drawHand(player, PLAYER_Y)
}

newDeck()
deal()
draw()
```
