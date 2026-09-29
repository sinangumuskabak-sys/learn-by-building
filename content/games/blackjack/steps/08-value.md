---
title: What is a hand worth?
title_tr: Bir el kaç eder?
skills: [prog.functions, prog.loops]
---

# --goal--

Number cards are worth their number, J, Q and K are worth 10, and an ace is worth 11 (for now). `handValue` adds up a
hand; the totals are shown above both hands. We also count the aces: the next step needs that.

# --goal-tr--

Sayı kartları kendi sayısı kadar, vale, kız ve papaz **10**, as (şimdilik) **11** eder. `handValue` bir elin toplamını
buluyor; iki elin üstünde de toplam yazıyor. Asları da sayıyoruz: sonraki adımda lazım olacak.

# --code--

```js
function handValue(hand) {
  let total = 0
  let aces = 0
  for (const { rank } of hand) {
    if (rank === 'A') {
      total += 11
      aces += 1
    } else total += ['J', 'Q', 'K'].includes(rank) ? 10 : Number(rank)
  }
  return total
}

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Dealer ' + handValue(dealer), 20, DEALER_Y - 10)
  ctx.fillText('You ' + handValue(player), 20, PLAYER_Y - 10)
```

# --meaning--

- `for (const { rank } of hand)` takes just the `rank` of each card.
- `['J', 'Q', 'K'].includes(rank)` asks whether the rank is a face card; `Number('7')` turns the text into 7.

# --meaning-tr--

- `for (const { rank } of hand)` → her kartın yalnız `rank` alanını al (nesneyi **açma**).
- `['J', 'Q', 'K'].includes(rank)` → resimli kart mı? Öyleyse 10.
- `Number(rank)` → `'7'` yazısını 7 sayısına çevirir; `'10'` → 10.
- `else total += ...` → as değilse; tek satırlık `else` süslü parantezsiz.

# --task--

1. Above `deal`, write `handValue`.
2. At the end of `draw`, write both totals.

# --task-tr--

1. `deal` fonksiyonunun üstüne `handValue` yaz.
2. `draw`'ın sonuna, bir boş satırdan sonra iki toplamı yazan satırları yaz. **Çalıştır**.

# --tests--

Number cards count their number, faces 10, an ace 11.
tr: Sayı kartları sayısı kadar, resimliler 10, as 11 saymalı.

```js
assert.strictEqual(handValue([card('K', '♠'), card('7', '♥')]), 17)
assert.strictEqual(handValue([card('10', '♠'), card('Q', '♥')]), 20)
assert.strictEqual(handValue([card('A', '♠'), card('9', '♥')]), 20)
```

Both totals should be shown.
tr: İki toplam da yazmalı.

```js
player = [card('K', '♠'), card('7', '♥')]
dealer = [card('5', '♠'), card('6', '♥')]
$.tick()
assert.include($.texts(), 'You 17')
assert.include($.texts(), 'Dealer 11')
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

function handValue(hand) {
  let total = 0
  let aces = 0
  for (const { rank } of hand) {
    if (rank === 'A') {
      total += 11
      aces += 1
    } else total += ['J', 'Q', 'K'].includes(rank) ? 10 : Number(rank)
  }
  return total
}

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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Dealer ' + handValue(dealer), 20, DEALER_Y - 10)
  ctx.fillText('You ' + handValue(player), 20, PLAYER_Y - 10)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newDeck()
deal()
requestAnimationFrame(loop)
```
