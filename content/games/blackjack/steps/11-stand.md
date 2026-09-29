---
title: Stand
title_tr: Dur
skills: [game.input, game.state]
---

# --goal--

When you are happy with your hand you "stand": your turn ends and it is the dealer's turn. S is Stand.

# --goal-tr--

Elinden memnunsan **"stand"** (dur) dersin: sıran biter, sıra krupiyeye geçer. S → Stand. Artık H de işe yaramaz.

# --code--

```js
function stand() {
  if (phase !== 'player') return
  phase = 'dealer'
}

  else if (button === 'Stand') stand()
```

# --meaning--

- `stand` hands the turn to the dealer; like `hit`, only on your turn.
- `else if` checks the next button only if the first did not match.

# --meaning-tr--

- `stand` → sırayı krupiyeye verir (`phase = 'dealer'`); `hit` gibi yalnız sıra sendeyken.
- `else if` → ilk koşul tutmadıysa sıradakine bak. `press` her düğme için bir satır büyüyecek.

# --task--

1. Under `hit`, write `stand`.
2. In `press`, handle Stand.

# --task-tr--

1. `hit`'in altına `stand` fonksiyonunu yaz.
2. `press`'e Stand satırını ekle. **Çalıştır** ve S'ye bas.

# --tests--

S should end your turn; after that H does nothing.
tr: S sıranı bitirmeli; ondan sonra H bir şey yapmamalı.

```js
$.tap('s')
assert.strictEqual(phase, 'dealer')
$.tap('h')
assert.lengthOf(player, 2)
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
let phase // 'player' (your turn), 'dealer' (the dealer draws) or 'done' (the round is over)

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
  phase = 'player'
}

function hit() {
  if (phase !== 'player') return
  player.push(nextCard())
}

function stand() {
  if (phase !== 'player') return
  phase = 'dealer'
}

function press(button) {
  if (button === 'Hit') hit()
  else if (button === 'Stand') stand()
}

document.addEventListener('keydown', (event) => {
  const keys = { h: 'Hit', s: 'Stand', d: 'Double', n: 'Deal', ' ': 'Deal' }
  const button = keys[event.key.toLowerCase()]
  if (!button) return
  event.preventDefault()
  press(button)
})

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
