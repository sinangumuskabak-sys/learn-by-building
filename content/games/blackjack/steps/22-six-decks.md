---
title: "Build it yourself: six decks"
title_tr: "Kendin yap: altı deste"
skills: [prog.loops]
---

# --goal--

Now it's your turn, without code to copy: like a casino, play with six decks shuffled together (312 cards), and show
how many cards are left in the top right.

# --goal-tr--

Şimdi sıra sende, kopyalanacak kod yok: bir kumarhane gibi **altı deste** birlikte karıştırılsın (312 kart) ve sağ
üstte destede **kaç kart kaldığı** görünsün.

# --task--

Change `newDeck` to build six decks, and write the number of cards left, for example `Cards 296`.

# --task-tr--

`newDeck`'i altı deste kuracak şekilde değiştir; kalan kart sayısını yaz, örneğin `Cards 296`.

# --hint--

One more loop around the two loops in `newDeck` repeats them six times. The count is `deck.length`.

# --hint-tr--

`newDeck`'teki iki döngünün dışına bir döngü daha koyarsan onları altı kez tekrarlar. Kalan sayı `deck.length`.

# --tests--

A new deck should hold six of every card, shuffled.
tr: Yeni deste her karttan altı tane, karışık olmalı.

```js
newDeck()
assert.lengthOf(deck, 312)
assert.lengthOf(deck.filter((c) => c.rank === 'A' && c.suit === '♠'), 6)
```

The number of cards left should be shown.
tr: Kalan kart sayısı görünmeli.

```js
$.tick()
assert.isTrue($.texts().some((t) => t.includes(String(deck.length))), 'the count ' + deck.length + ' on screen')
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
const BAR_Y = 404
const BUTTONS = ['Hit', 'Stand', 'Double', 'Deal']
const BUTTON_W = canvas.width / BUTTONS.length

let deck
let player
let dealer
let phase // 'player' (your turn), 'dealer' (the dealer draws) or 'done' (the round is over)
let message
let bank
let bet
let timer
let best = Number(localStorage.getItem('blackjack-best')) || START

const card = (rank, suit) => ({ rank, suit })

// A new shuffled deck of 52 cards (Fisher–Yates).
function newDeck() {
  deck = []
  for (let d = 0; d < 6; d++) for (const suit of SUITS) for (const rank of RANKS) deck.push(card(rank, suit))
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

// Double the bet, take exactly one more card, and stand.
function double() {
  if (phase !== 'player' || player.length !== 2 || bank < bet) return
  bank -= bet
  bet *= 2
  player.push(nextCard())
  if (handValue(player) > 21) finish()
  else stand()
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
  if (bank > best) {
    best = bank
    localStorage.setItem('blackjack-best', best)
  }
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
  else if (button === 'Double') double()
  else if (button === 'Deal' && phase === 'done') deal()
}

document.addEventListener('keydown', (event) => {
  const keys = { h: 'Hit', s: 'Stand', d: 'Double', n: 'Deal', ' ': 'Deal' }
  const button = keys[event.key.toLowerCase()]
  if (!button) return
  event.preventDefault()
  press(button)
})

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (y >= BAR_Y) press(BUTTONS[Math.floor(x / BUTTON_W)])
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

// Cards overlap a little so a long hand still fits.
function drawHand(hand, y, hideSecond) {
  const step = Math.min(CARD_W + 8, (canvas.width - 40 - CARD_W) / Math.max(1, hand.length - 1))
  hand.forEach((c, i) => drawCard(c, 20 + i * step, y, hideSecond && i === 1))
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
  ctx.textAlign = 'right'
  ctx.fillText('Best ' + best, canvas.width - 20, 28)
  ctx.fillText('Cards ' + deck.length, canvas.width - 20, 50)

  if (message) {
    ctx.fillStyle = '#fde047'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(message, canvas.width / 2, 212)
  }

  BUTTONS.forEach((label, i) => {
    const active = label === 'Deal' ? phase === 'done' : phase === 'player' && (label !== 'Double' || player.length === 2)
    ctx.fillStyle = active ? '#f8fafc' : '#4b7a5a'
    ctx.fillRect(i * BUTTON_W + 6, BAR_Y, BUTTON_W - 12, 44)
    ctx.fillStyle = '#14532d'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, i * BUTTON_W + BUTTON_W / 2, BAR_Y + 29)
  })
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
