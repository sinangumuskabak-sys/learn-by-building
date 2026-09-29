---
title: "Hit: one more card"
title_tr: "Kart: bir kart daha"
skills: [game.input, game.state]
---

# --goal--

On your turn you may ask for another card: that is a "hit". `phase` remembers whose turn it is. Every key goes through a
small table to a button name, and `press` does what the button says. H is Hit; the other buttons come in the next steps.

# --goal-tr--

Sıra sendeyken bir kart daha isteyebilirsin: buna **"hit"** (kart) denir. Kimin sırası olduğunu `phase` (evre)
hatırlıyor. Her tuş küçük bir tablodan bir **düğme adına** çevriliyor ve `press` düğmenin dediğini yapıyor. H → Hit.
Tablo öbür düğmeleri de biliyor; `press` onları sonraki adımlarda öğrenecek.

# --code--

```js
let phase // 'player' (your turn), 'dealer' (the dealer draws) or 'done' (the round is over)

  phase = 'player'
}

function hit() {
  if (phase !== 'player') return
  player.push(nextCard())
}

function press(button) {
  if (button === 'Hit') hit()
}

document.addEventListener('keydown', (event) => {
  const keys = { h: 'Hit', s: 'Stand', d: 'Double', n: 'Deal', ' ': 'Deal' }
  const button = keys[event.key.toLowerCase()]
  if (!button) return
  event.preventDefault()
  press(button)
})
```

# --meaning--

- A deal starts your turn: `phase = 'player'`.
- `hit` does nothing when it is not your turn.
- `toLowerCase` makes H and h the same; keys not in the table are ignored.
- Later the on-screen buttons will call the same `press`, so keys and buttons can't disagree.

# --meaning-tr--

- `deal` sıranı başlatır: `phase = 'player'`.
- `hit` → sıra sende değilse hiçbir şey yapma; sendeyse desteden bir kart çek.
- `keys[event.key.toLowerCase()]` → H ile h aynı olsun; tabloda olmayan tuşlarda `button` boş kalır ve `return`.
- `event.preventDefault()` → Boşluk sayfayı kaydırmasın.
- İleride ekrandaki düğmeler de aynı `press`'i çağıracak; tuşla düğme hiç farklı davranamaz.

# --task--

1. Under `dealer`, write `phase` with its comment.
2. At the end of `deal`, start your turn; under `deal`, write `hit`.
3. Above `drawCard`, write `press` and the key listener.

# --task-tr--

1. `let dealer` satırının altına yorumuyla `phase` yaz.
2. `deal`'ın sonuna `phase = 'player'` yaz; `deal`'ın altına `hit` fonksiyonunu yaz.
3. `drawCard`'ın üstüne `press` fonksiyonunu ve tuş dinleyicisini yaz.
4. **Çalıştır**, oyuna tıkla ve H'ye bas.

# --tests--

H should give you one more card on your turn only.
tr: H yalnız sıra sendeyken bir kart daha vermeli.

```js
assert.strictEqual(phase, 'player')
$.tap('h')
assert.lengthOf(player, 3)
assert.lengthOf(deck, 47)
phase = 'done'
$.tap('H')
assert.lengthOf(player, 3)
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

function press(button) {
  if (button === 'Hit') hit()
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
