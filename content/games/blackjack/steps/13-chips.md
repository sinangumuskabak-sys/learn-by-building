---
title: Chips
title_tr: Fişler
skills: [game.state]
---

# --goal--

You play for chips. You start with 100, and every deal puts a bet of 10 on the table. `reset` starts a whole new game:
full chips, a new deck, the first deal.

# --goal-tr--

Fişle oynuyorsun. **100 fişle** başlıyorsun; her dağıtımda masaya **10 fişlik bahis** konuyor. `reset` bütün oyunu
baştan başlatıyor: fişler dolu, yeni deste, ilk dağıtım. Kazanınca ne olacağını iki adım sonra yazacağız.

# --code--

```js
const START = 100 // chips at the start
const BET = 10
let bank
let bet

  bet = BET
  bank -= bet

function reset() {
  bank = START
  newDeck()
  deal()
}

  ctx.fillText('Chips ' + bank + '  Bet ' + bet, 20, 28)

reset()
```

# --meaning--

- `bank` is the chips you hold, `bet` the chips on the table this round.
- The bet leaves your chips when the cards are dealt.
- At the bottom, `reset()` replaces `newDeck()` and `deal()`: it calls both.

# --meaning-tr--

- `bank` → elindeki fişler; `bet` → bu elde masadaki bahis.
- `bank -= bet` → kartlar dağıtılınca bahis fişlerinden düşer: 100 → 90.
- `reset` → oyunu sıfırla; en alttaki `newDeck()` ve `deal()` yerine `reset()` çağrılıyor, o ikisini zaten çağırıyor.
- Sol üstte fişler ve bahis yazıyor.

# --task--

1. Under `PLAYER_Y`, write `START` and `BET`; under `phase`, write `bank` and `bet`.
2. At the top of `deal`, place the bet.
3. Above `press`, write `reset`; at the bottom, call it instead of `newDeck()` and `deal()`.
4. In `draw`, write the chips under your total.

# --task-tr--

1. `PLAYER_Y` satırının altına `START` ve `BET`, `let phase` satırının altına `bank` ve `bet` yaz.
2. `deal`'ın en üstüne bahis satırlarını yaz.
3. `press`'in üstüne `reset` yaz; en alttaki `newDeck()` ve `deal()` satırlarını `reset()` ile değiştir.
4. `draw`'da `'You '` satırının altına fiş satırını yaz. **Çalıştır**.

# --tests--

A deal should put 10 of your 100 chips on the table.
tr: Dağıtım 100 fişinin 10'unu masaya koymalı.

```js
assert.strictEqual(bank, 90)
assert.strictEqual(bet, 10)
$.tick()
assert.include($.texts(), 'Chips 90 Bet 10')
bank = 3
reset()
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

let deck
let player
let dealer
let phase // 'player' (your turn), 'dealer' (the dealer draws) or 'done' (the round is over)
let bank
let bet

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

function reset() {
  bank = START
  newDeck()
  deal()
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
