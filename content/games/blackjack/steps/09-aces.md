---
title: "Aces: 11 or 1"
title_tr: "As: 11 ya da 1"
skills: [prog.loops]
---

# --goal--

Going over 21 is a bust, so an ace that would cause it counts 1 instead of 11. As long as the total is over 21 and an
ace still counts 11, we take 10 off.

# --goal-tr--

21'i geçmek **patlamak** demek; o yüzden patlatacak bir as 11 yerine **1** sayılır. Toplam 21'i geçtiği ve 11 sayılan
bir as kaldığı sürece 10 düşüyoruz. İki as varsa ikisi de gerekirse 1'e iner.

# --code--

```js
// Aces count 11, unless that would bust the hand: then they count 1.
  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }
```

# --meaning--

- Taking 10 off turns one ace from 11 into 1.
- `aces` counts the aces still worth 11, so we never take off more than we may.

# --meaning-tr--

- `total -= 10` → bir ası 11'den 1'e indirir (fark 10).
- `aces -= 1` → 11 sayılan as bir azaldı; böylece asların hakkından fazlası düşülmez.
- `while` → tek as yetmezse ikinciye geç: A + A + 9 = 31 → 21.

# --task--

1. Above `handValue`, write the comment.
2. Before `return total`, write the `while` loop.

# --task-tr--

1. `handValue`'nun üstüne yorum satırını yaz.
2. `return total` satırının üstüne `while` döngüsünü yaz. **Çalıştır**.

# --tests--

Aces should drop to 1 only when needed.
tr: Aslar yalnız gerektiğinde 1'e inmeli.

```js
assert.strictEqual(handValue([card('A', '♠'), card('A', '♥')]), 12)
assert.strictEqual(handValue([card('A', '♠'), card('9', '♥'), card('5', '♣')]), 15)
assert.strictEqual(handValue([card('A', '♠'), card('K', '♥')]), 21)
assert.strictEqual(handValue([card('A', '♠'), card('A', '♥'), card('9', '♣')]), 21)
assert.strictEqual(handValue([card('K', '♠'), card('Q', '♥'), card('5', '♣')]), 25)
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

// Aces count 11, unless that would bust the hand: then they count 1.
function handValue(hand) {
  let total = 0
  let aces = 0
  for (const { rank } of hand) {
    if (rank === 'A') {
      total += 11
      aces += 1
    } else total += ['J', 'Q', 'K'].includes(rank) ? 10 : Number(rank)
  }
  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
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
