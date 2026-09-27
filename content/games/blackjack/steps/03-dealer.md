---
title: The dealer's turn
title_tr: Krupiyenin sırası
skills: [game.state, prog.loops]
---

# --explanation--

When you are happy with your hand you **stand** (S). Then it is the dealer's turn, and the dealer has **no choices at all**.
Casino rules fix them: draw while below 17, stand on 17 or more. That is one `while` loop:

```js
while (handValue(dealer) < 17) dealer.push(nextCard())
```

This rule is also where the house gets its edge. You play first, so if you bust you lose, **even if the dealer would have
busted too**.

Until you stand, the dealer's second card is **face down**. Otherwise you would know exactly what you are playing against. So
while `phase === 'player'`, that card is drawn hidden and the dealer's total only counts the card you can see.

Then the hands are compared: you bust, the dealer busts, the higher total wins, and equal totals are a **push** (a draw).

One small kindness: when you hit to exactly 21, nothing can get better, so the game stands for you.

# --explanation-tr--

Elinden memnun olduğunda **durursun** (S). Sonra sıra krupiyededir ve krupiyenin **hiç seçeneği yoktur**. Kumarhane kuralları
onları sabitler: 17'nin altındayken çek, 17 ya da üstünde dur. Bu tek bir `while` döngüsüdür:

```js
while (handValue(dealer) < 17) dealer.push(nextCard())
```

Kasa avantajı da bu kuraldan gelir. Önce sen oynarsın; yani batarsan, **krupiye de batacak olsa bile** kaybedersin.

Sen durana kadar krupiyenin ikinci kartı **kapalıdır**. Yoksa tam olarak neye karşı oynadığını bilirdin. Bu yüzden
`phase === 'player'` iken o kart gizli çizilir ve krupiyenin toplamı yalnızca görebildiğin kartı sayar.

Sonra eller karşılaştırılır: sen batarsın, krupiye batar, yüksek toplam kazanır ve eşit toplamlar **berabere**dir (push).

Küçük bir incelik: tam 21'e çektiğinde hiçbir şey daha iyi olamaz, bu yüzden oyun senin yerine durur.

# --task--

1. Write `stand()`: only in `'player'`; the dealer draws while below 17, then `finish()`.
2. `finish()` compares the hands and sets `message`: `'Bust!'` (you are over 21), `'Dealer busts, you win'`, `'You win'`,
   `'Dealer wins'` or `'Push'`.
3. `hit()` stands by itself when your total is exactly 21. The S key presses `'Stand'`.
4. While `phase === 'player'`, draw the dealer's second card hidden and show `Dealer` with the value of the first card only.

# --task-tr--

1. `stand()` yaz: yalnızca `'player'`'da; krupiye 17'nin altındayken çeker, sonra `finish()`.
2. `finish()` elleri karşılaştırır ve `message`'ı ayarlar: `'Bust!'` (21'in üstündesin), `'Dealer busts, you win'`,
   `'You win'`, `'Dealer wins'` ya da `'Push'`.
3. Toplamın tam 21 olduğunda `hit()` kendiliğinden durur. S tuşu `'Stand'`'e basar.
4. `phase === 'player'` iken krupiyenin ikinci kartını gizli çiz ve `Dealer`'ı yalnızca ilk kartın değeriyle göster.

# --tests--

The dealer's second card should stay hidden until you stand; then the dealer should draw up to 17.
tr: Krupiyenin ikinci kartı sen durana kadar gizli kalmalı; sonra krupiye 17'ye kadar çekmeli.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
rig('K', '8', '10', '6', '3', '5')
deal()
$.tick(1)
assert.lengthOf($.rects('#1d4ed8'), 1, 'the dealer\'s second card is face down')
assert.include($.texts(), 'Dealer 10')
$.press('s')
assert.strictEqual(phase, 'done')
assert.lengthOf(dealer, 3, 'the dealer draws below 17 and stops on 19')
assert.strictEqual(message, 'Dealer wins')
$.tick(1)
assert.lengthOf($.rects('#1d4ed8'), 0, 'the card is turned over')
assert.include($.texts(), 'Dealer 19')
```

The hands should be compared: dealer bust, push, and a win; the dealer stands on 17.
tr: Eller karşılaştırılmalı: krupiye batar, berabere ve kazanç; krupiye 17'de durur.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
rig('K', '9', '10', '6', 'Q')
deal()
stand()
assert.strictEqual(message, 'Dealer busts, you win')
rig('K', '8', '10', '8')
deal()
stand()
assert.strictEqual(message, 'Push')
rig('K', '8', '10', '7')
deal()
stand()
assert.strictEqual(message, 'You win')
assert.lengthOf(dealer, 2, 'the dealer stands on 17')
```

Reaching 21 should stand by itself.
tr: 21'e ulaşmak kendiliğinden durmalı.

```js
const rig = (...ranks) => {
  deck = Array.from({ length: 20 }, () => card('2', '♣')).concat(ranks.reverse().map((rank) => card(rank, '♠')))
}
rig('5', '6', '10', '7', 'K')
deal()
$.press('h')
assert.strictEqual(handValue(player), 21)
assert.strictEqual(phase, 'done', 'reaching 21 stands by itself')
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

let deck
let player
let dealer
let phase // 'player' (your turn) or 'done' (the round is over)
let message

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
  if (deck.length < 15) newDeck()
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
  // The dealer has no choice: draw below 17, stand on 17 or more.
  while (handValue(dealer) < 17) dealer.push(nextCard())
  finish()
}

// Compare the hands.
function finish() {
  phase = 'done'
  const p = handValue(player)
  const d = handValue(dealer)
  if (p > 21) message = 'Bust!'
  else if (d > 21) message = 'Dealer busts, you win'
  else if (p > d) message = 'You win'
  else if (p < d) message = 'Dealer wins'
  else message = 'Push'
}

function reset() {
  newDeck()
  deal()
}

function press(button) {
  if (button === 'Hit') hit()
  else if (button === 'Stand') stand()
  else if (button === 'Deal' && phase === 'done') deal()
}

document.addEventListener('keydown', (event) => {
  const keys = { h: 'Hit', s: 'Stand', n: 'Deal', ' ': 'Deal' }
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
