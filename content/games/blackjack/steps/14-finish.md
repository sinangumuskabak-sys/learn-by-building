---
title: Who wins?
title_tr: Kim kazandı?
skills: [game.state]
---

# --goal--

`finish` ends the round: it compares the hands, writes a message and pays you. Over 21 is a bust and loses at once.
Otherwise the higher total wins; equal totals are a "push" and you get your bet back. A win pays the bet twice (your
bet back plus as much again). A hit that makes 21 stands for you, since nothing can beat it.

# --goal-tr--

`finish` eli bitiriyor: elleri karşılaştırıyor, bir mesaj yazıyor ve **ödüyor**. 21'i geçen **patlar** ve hemen
kaybeder. Yoksa toplamı büyük olan kazanır; eşitse **"push"** (berabere) olur ve bahsin geri gelir. Kazanmak bahsin
**iki katını** öder (bahsin geri + bir o kadar). Kartla 21'e ulaşırsan otomatik durursun; 21'i geçemezsin zaten.

# --code--

```js
let message

  if (handValue(player) > 21) finish()
  else if (handValue(player) === 21) stand()

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

  message = ''

  if (message) {
    ctx.fillStyle = '#fde047'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(message, canvas.width / 2, 212)
  }
```

# --meaning--

- The checks go in order: your bust first, then the dealer's, then the higher total.
- `[message, paid] = ['You win', bet * 2]` sets two variables in one line.
- A new deal clears the message; an empty message is not drawn.

# --meaning-tr--

- Kontroller **sırayla**: önce senin patlaman (krupiye patlasa da kaybedersin), sonra krupiyenin, sonra büyük toplam.
- `[message, paid] = ['You win', bet * 2]` → iki değişkene tek satırda değer verir.
- `paid` → masadan sana dönen fiş; kaybedince 0.
- Yeni dağıtım mesajı siler (`message = ''`); boş mesaj çizilmez (`if (message)`).
- Krupiyenin kart çekmesini sonraki adımda yazacağız; şimdilik S'ye basınca el bitmez.

# --task--

1. Under `phase`, write `message`; in `deal`, clear it before `phase`.
2. In `hit`, finish on a bust and stand on 21.
3. Above `reset`, write `finish` with its comment.
4. In `draw`, show the message under the chips.

# --task-tr--

1. `let phase` satırının altına `let message` yaz; `deal`'da `phase = 'player'` satırının üstüne `message = ''` yaz.
2. `hit`'in sonuna patlama ve 21 satırlarını yaz.
3. `reset`'in üstüne yorumuyla `finish` fonksiyonunu yaz.
4. `draw`'da fiş satırının altına, bir boş satırdan sonra mesaj bloğunu yaz. **Çalıştır** ve patlayana kadar H'ye bas.

# --tests--

Going over 21 should bust at once and pay nothing.
tr: 21'i geçmek hemen patlatmalı ve hiçbir şey ödememeli.

```js
player = [card('K', '♠'), card('Q', '♥')]
deck.push(card('5', '♣'))
$.tap('h')
assert.strictEqual(phase, 'done')
assert.strictEqual(message, 'Bust!')
assert.strictEqual(bank, 90)
$.tick()
assert.include($.texts(), 'Bust!')
```

finish should compare the totals and pay.
tr: finish toplamları karşılaştırıp ödemeli.

```js
player = [card('K', '♠'), card('9', '♥')]
dealer = [card('K', '♣'), card('7', '♦')]
finish()
assert.deepEqual([message, bank], ['You win', 110])
dealer = [card('K', '♣'), card('Q', '♦')]
finish()
assert.deepEqual([message, bank], ['Dealer wins', 110])
dealer = [card('K', '♣'), card('9', '♦')]
finish()
assert.deepEqual([message, bank], ['Push', 120])
```

A hit that makes 21 should stand.
tr: 21 yapan kart durdurmalı.

```js
player = [card('K', '♠'), card('5', '♥')]
deck.push(card('6', '♣'))
$.tap('h')
assert.strictEqual(phase, 'dealer')
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
let message
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
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
