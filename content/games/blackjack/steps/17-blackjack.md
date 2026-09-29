---
title: Blackjack!
title_tr: Blackjack!
skills: [game.state]
---

# --goal--

An ace and a ten-card as your first two cards is a "blackjack", the best hand. It ends the round at once and pays two
and a half times the bet. If the dealer has one instead, you lose at once; if both do, it's a push.

# --goal-tr--

İlk iki kartın bir **as** ve 10 değerinde bir kartsa bu **"blackjack"**, en iyi el. Eli **hemen** bitirir ve bahsin
**iki buçuk katını** öder. Krupiyede varsa hemen kaybedersin; ikinizde de varsa berabere.

# --code--

```js
const isBlackjack = (hand) => hand.length === 2 && handValue(hand) === 21

  if (isBlackjack(player) || isBlackjack(dealer)) finish()

  if (isBlackjack(player) && isBlackjack(dealer)) [message, paid] = ['Both blackjack: push', bet]
  else if (isBlackjack(player)) [message, paid] = ['Blackjack!', bet * 2.5]
  else if (isBlackjack(dealer)) message = 'Dealer blackjack'
  else if (p > 21) message = 'Bust!'
```

# --meaning--

- Only two cards count: 21 made with three cards is good, but not a blackjack.
- The deal checks both hands right away, before anyone plays.
- The blackjack checks come first in `finish`, so they beat an ordinary 21.

# --meaning-tr--

- `hand.length === 2 && handValue(hand) === 21` → **iki** kartla 21. Üç kartla 21 iyidir ama blackjack değildir.
- `deal` iki eli **hemen** kontrol eder; kimse oynamadan el bitebilir.
- `finish`'te blackjack kontrolleri **en başta**: sıradan bir 21'i yenerler. Eski ilk satır `if` yerine `else if` oldu.
- `bet * 2.5` → 10 fişlik bahiste 25 fiş döner.

# --task--

1. Above `deal`, write `isBlackjack`.
2. At the end of `deal`, finish at once on a blackjack.
3. In `finish`, put the three blackjack checks first, and turn the bust `if` into `else if`.

# --task-tr--

1. `deal`'ın üstüne `isBlackjack` yaz.
2. `deal`'ın sonuna blackjack satırını yaz.
3. `finish`'te `if (p > 21)` satırının üstüne üç blackjack satırını yaz ve o satırı `else if` yap. **Çalıştır**.

# --tests--

A blackjack should pay two and a half times the bet.
tr: Blackjack bahsin iki buçuk katını ödemeli.

```js
assert.isTrue(isBlackjack([card('A', '♠'), card('K', '♥')]))
assert.isFalse(isBlackjack([card('A', '♠'), card('5', '♥'), card('5', '♣')]))
bank = 90
player = [card('A', '♠'), card('K', '♥')]
dealer = [card('K', '♣'), card('7', '♦')]
finish()
assert.deepEqual([message, bank], ['Blackjack!', 115])
dealer = [card('A', '♣'), card('Q', '♦')]
finish()
assert.deepEqual([message, bank], ['Both blackjack: push', 125])
player = [card('K', '♠'), card('9', '♥')]
finish()
assert.strictEqual(message, 'Dealer blackjack')
```

A blackjack in the deal should end the round at once.
tr: Dağıtımdaki blackjack eli hemen bitirmeli.

```js
newDeck()
deck.push(card('7', '♠'), card('9', '♠'), card('K', '♥'), card('A', '♥'))
deal()
assert.strictEqual(phase, 'done')
assert.strictEqual(message, 'Blackjack!')
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
const START = 100 // chips at the start
const BET = 10
const DELAY = 30 // frames between the dealer's cards

let deck
let player
let dealer
let phase // 'player' (your turn), 'dealer' (the dealer draws) or 'done' (the round is over)
let message
let bank
let bet
let timer

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

const isBlackjack = (hand) => hand.length === 2 && handValue(hand) === 21

function deal() {
  if (bank < BET) bank = START // out of chips: start over
  if (deck.length < 15) newDeck()
  bet = BET
  bank -= bet
  player = [nextCard(), nextCard()]
  dealer = [nextCard(), nextCard()]
  message = ''
  phase = 'player'
  if (isBlackjack(player) || isBlackjack(dealer)) finish()
}

function hit() {
  if (phase !== 'player') return
  player.push(nextCard())
  if (handValue(player) > 21) finish()
  else if (handValue(player) === 21) stand()
}

function stand() {
  if (phase !== 'player') return
  phase = 'dealer'
  timer = DELAY
}

// Compare the hands and pay: a win returns the bet twice, blackjack two and a half times, a push gives it back.
function finish() {
  phase = 'done'
  const p = handValue(player)
  const d = handValue(dealer)
  let paid = 0
  if (isBlackjack(player) && isBlackjack(dealer)) [message, paid] = ['Both blackjack: push', bet]
  else if (isBlackjack(player)) [message, paid] = ['Blackjack!', bet * 2.5]
  else if (isBlackjack(dealer)) message = 'Dealer blackjack'
  else if (p > 21) message = 'Bust!'
  else if (d > 21) [message, paid] = ['Dealer busts, you win', bet * 2]
  else if (p > d) [message, paid] = ['You win', bet * 2]
  else if (p < d) message = 'Dealer wins'
  else [message, paid] = ['Push', bet]
  bank += paid
  if (bank < BET) message += ' - out of chips!'
}

function reset() {
  bank = START
  newDeck()
  deal()
}

function update() {
  if (phase !== 'dealer') return
  timer -= 1
  if (timer > 0) return
  // The dealer has no choice: draw below 17, stand on 17 or more.
  if (handValue(dealer) < 17) {
    dealer.push(nextCard())
    timer = DELAY
  } else finish()
}

function press(button) {
  if (button === 'Hit') hit()
  else if (button === 'Stand') stand()
  else if (button === 'Deal' && phase === 'done') deal()
}

document.addEventListener('keydown', (event) => {
  const keys = { h: 'Hit', s: 'Stand', d: 'Double', n: 'Deal', ' ': 'Deal' }
  const button = keys[event.key.toLowerCase()]
  if (!button) return
  event.preventDefault()
  press(button)
})

function drawCard(c, x, y, hidden) {
  ctx.fillStyle = hidden ? '#1d4ed8' : '#ffffff'
  ctx.fillRect(x, y, CARD_W, CARD_H)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CARD_W, CARD_H)
  if (hidden) {
    ctx.strokeStyle = '#93c5fd'
    ctx.strokeRect(x + 6, y + 6, CARD_W - 12, CARD_H - 12)
    return
  }
  ctx.fillStyle = c.suit === '♥' || c.suit === '♦' ? '#dc2626' : '#0f172a'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(c.rank, x + 6, y + 22)
  ctx.font = '34px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(c.suit, x + CARD_W / 2, y + 64)
}

function drawHand(hand, y, hideSecond) {
  hand.forEach((c, i) => drawCard(c, 20 + i * (CARD_W + 8), y, hideSecond && i === 1))
}

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const hide = phase === 'player'
  drawHand(dealer, DEALER_Y, hide)
  drawHand(player, PLAYER_Y, false)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Dealer ' + (hide ? handValue([dealer[0]]) : handValue(dealer)), 20, DEALER_Y - 10)
  ctx.fillText('You ' + handValue(player), 20, PLAYER_Y - 10)
  ctx.fillText('Chips ' + bank + '  Bet ' + bet, 20, 28)

  if (message) {
    ctx.fillStyle = '#fde047'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(message, canvas.width / 2, 212)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
