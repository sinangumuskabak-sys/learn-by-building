---
title: The hidden card
title_tr: Kapalı kart
skills: [game.canvas, game.state]
---

# --goal--

In real Blackjack the dealer's second card lies face down during your turn, so you must guess. It is drawn as a blue
back, and the dealer's total counts only the first card. When your turn ends it turns over.

# --goal-tr--

Gerçek Blackjack'te krupiyenin ikinci kartı senin sıran boyunca **kapalı** durur; tahmin etmen gerekir. Mavi bir sırt
olarak çiziliyor; krupiyenin toplamı yalnız ilk kartı sayıyor. Sıran bitince kart açılıyor.

# --code--

```js
function drawCard(c, x, y, hidden) {
  ctx.fillStyle = hidden ? '#1d4ed8' : '#ffffff'

  if (hidden) {
    ctx.strokeStyle = '#93c5fd'
    ctx.strokeRect(x + 6, y + 6, CARD_W - 12, CARD_H - 12)
    return
  }

function drawHand(hand, y, hideSecond) {
  hand.forEach((c, i) => drawCard(c, 20 + i * (CARD_W + 8), y, hideSecond && i === 1))

  const hide = phase === 'player'
  drawHand(dealer, DEALER_Y, hide)
  drawHand(player, PLAYER_Y, false)

  ctx.fillText('Dealer ' + (hide ? handValue([dealer[0]]) : handValue(dealer)), 20, DEALER_Y - 10)
```

# --meaning--

- A hidden card is blue with a light inner frame, and `return` skips its face.
- `hideSecond && i === 1` is true only for the second card of a hand we want to hide.
- `handValue([dealer[0]])` is the value of a hand holding only the first card.

# --meaning-tr--

- `drawCard`'a `hidden` eklendi: kapalıysa mavi, içte açık renkli bir çerçeve ve `return` → yüzü **yazılmaz**.
- `drawHand`'e `hideSecond` eklendi: `hideSecond && i === 1` → yalnız gizlenecek elin **ikinci** kartında doğru.
- `const hide = phase === 'player'` → sıra sendeyse krupiyenin kartı kapalı. Senin elin hiç gizlenmez: `false`.
- `handValue([dealer[0]])` → yalnız ilk karttan oluşan bir elin değeri.

# --task--

1. Give `drawCard` a `hidden` parameter: a blue back, and stop before the face.
2. Give `drawHand` a `hideSecond` parameter and pass it on for the second card.
3. In `draw`, hide the dealer's second card on your turn, and show only the first card's value.

# --task-tr--

1. `drawCard`'a `hidden` parametresini ekle; ilk `fillStyle` satırını değiştir ve `strokeRect`'in altına kapalı kart
   bloğunu yaz.
2. `drawHand`'e `hideSecond` parametresini ekle ve `drawCard`'a dördüncü değer olarak ver.
3. `draw`'da iki `drawHand` satırını üç satırla değiştir; `'Dealer '` satırını değiştir. **Çalıştır**.

# --tests--

On your turn the dealer's second card should be hidden.
tr: Sıra sendeyken krupiyenin ikinci kartı kapalı olmalı.

```js
$.tick()
assert.deepEqual($.rects('#1d4ed8').map((r) => [r.x, r.y]), [[92, 70]])
assert.include($.texts(), 'Dealer ' + handValue([dealer[0]]))
```

After you stand it should turn over.
tr: Durunca açılmalı.

```js
$.tap('s')
$.tick()
assert.lengthOf($.rects('#1d4ed8'), 0)
assert.include($.texts(), 'Dealer ' + handValue(dealer))
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newDeck()
deal()
requestAnimationFrame(loop)
```
