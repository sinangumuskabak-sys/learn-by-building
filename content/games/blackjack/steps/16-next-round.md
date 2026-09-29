---
title: The next round
title_tr: Sonraki el
skills: [game.state]
---

# --goal--

When a round is over, N or Space deals the next one. A deck running low (under 15 cards) is replaced by a fresh
shuffled one. If you can't pay the bet any more, the round says so, and the next deal starts you over with 100 chips.

# --goal-tr--

El bitince **N** ya da **Boşluk** sıradaki eli dağıtsın. Deste azalınca (15 kartın altı) yerine yeni karışık bir deste
gelsin. Bahsi ödeyemeyecek kadar fişin kalırsa el bunu söylesin; sonraki dağıtım seni 100 fişle **baştan** başlatsın.

# --code--

```js
if (bank < BET) bank = START // out of chips: start over
if (deck.length < 15) newDeck()

if (bank < BET) message += ' - out of chips!'

else if (button === 'Deal' && phase === 'done') deal()
```

# --meaning--

- Deal works only when the round is done, so you can't throw away a bad hand.
- `message += ...` adds to the end of the message.

# --meaning-tr--

- Deal yalnız el **bitince** çalışır; kötü bir eli atıp yeniden dağıtamazsın.
- `deck.length < 15` → bir el en fazla birkaç kart yer; 15'in altında yeni deste güvenli.
- `message += ' - out of chips!'` → mesajın **sonuna** ekler: `'Bust! - out of chips!'`.

# --task--

1. At the top of `deal`, start over when out of chips and replace a low deck.
2. At the end of `finish`, add the out-of-chips note.
3. In `press`, deal when the round is done.

# --task-tr--

1. `deal`'ın en üstüne iki satırı yaz.
2. `finish`'in sonuna fiş bitti satırını yaz.
3. `press`'e Deal satırını ekle. **Çalıştır**, bir eli bitir ve Boşluk'a bas.

# --tests--

After a round, Space should deal the next one; not before.
tr: El bitince Boşluk sıradakini dağıtmalı; öncesinde değil.

```js
$.tap(' ')
assert.strictEqual(bank, 90)
player = [card('K', '♠'), card('Q', '♥'), card('5', '♣')]
finish()
$.tap(' ')
assert.deepEqual([phase, message, bank], ['player', '', 80])
assert.lengthOf(player, 2)
```

Out of chips, the next deal should start over; a low deck should be replaced.
tr: Fiş bitince sonraki dağıtım baştan başlamalı; azalan deste yenilenmeli.

```js
bank = 0
player = [card('K', '♠'), card('Q', '♥'), card('5', '♣')]
finish()
assert.strictEqual(message, 'Bust! - out of chips!')
deck = deck.slice(0, 10)
$.tap('n')
assert.strictEqual(bank, 90)
assert.lengthOf(deck, 48)
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

function deal() {
  if (bank < BET) bank = START // out of chips: start over
  if (deck.length < 15) newDeck()
  bet = BET
  bank -= bet
  player = [nextCard(), nextCard()]
  dealer = [nextCard(), nextCard()]
  message = ''
  phase = 'player'
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
  if (p > 21) message = 'Bust!'
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
