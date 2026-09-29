---
title: The dealer's turn
title_tr: Krupiyenin sırası
skills: [game.state, game.loop]
---

# --goal--

The dealer has no choices: below 17 they draw, at 17 or more they stand, and then the round is finished. To make it
feel like a real table, each of the dealer's moves waits half a second (30 frames).

# --goal-tr--

Krupiyenin seçimi yok: toplamı **17'nin altındaysa** kart çeker, **17 ya da üstündeyse** durur ve el biter. Gerçek bir
masa gibi hissettirsin diye krupiyenin her hamlesi **yarım saniye** (30 kare) bekler.

# --code--

```js
const DELAY = 30 // frames between the dealer's cards
let timer

  timer = DELAY

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

  update()
```

# --meaning--

- `timer` counts down frames; the dealer acts only when it reaches 0.
- After a card the timer starts again, so the cards come one by one.
- When the dealer stands, `finish` compares and pays.

# --meaning-tr--

- `stand` artık zamanlayıcıyı kuruyor: `timer = DELAY`.
- `update` → yalnız krupiyenin sırasında çalışır; her karede `timer` bir azalır, 0 olana kadar bekler.
- 17'nin altındaysa bir kart çek ve zamanlayıcıyı yeniden kur: kartlar **teker teker** gelir.
- 17 ya da üstündeyse `finish()`: karşılaştır ve öde.
- Döngü artık önce `update()`, sonra `draw()` çağırıyor.

# --task--

1. Under `BET`, write `DELAY`; under `bet`, write `timer`; in `stand`, set the timer.
2. Above `press`, write `update`.
3. In `loop`, call `update()` before `draw()`.

# --task-tr--

1. `BET` satırının altına `DELAY`, `let bet` satırının altına `let timer` yaz; `stand`'in sonuna `timer = DELAY` yaz.
2. `press`'in üstüne `update` fonksiyonunu yaz.
3. `loop` içinde `draw()`'ın üstüne `update()` yaz. **Çalıştır** ve S'ye bas.

# --tests--

The dealer should draw below 17 every 30 frames, then finish.
tr: Krupiye 17'nin altında her 30 karede kart çekmeli, sonra bitirmeli.

```js
player = [card('K', '♠'), card('9', '♥')]
dealer = [card('K', '♣'), card('5', '♦')]
deck.push(card('3', '♠'))
$.tap('s')
$.tick(29)
assert.lengthOf(dealer, 2)
$.tick(1)
assert.lengthOf(dealer, 3)
$.tick(30)
assert.strictEqual(phase, 'done')
assert.strictEqual(message, 'You win')
```

On 17 the dealer should stand.
tr: 17'de krupiye durmalı.

```js
player = [card('K', '♠'), card('8', '♥')]
dealer = [card('K', '♣'), card('7', '♦')]
$.tap('s')
$.tick(30)
assert.lengthOf(dealer, 2)
assert.strictEqual(message, 'You win')
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
